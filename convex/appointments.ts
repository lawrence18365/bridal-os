import { internalMutation, mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

export const getAllAppointments = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("appointments").collect();
    },
});

export const checkAvailability = query({
    args: {
        date: v.string(), // ISO string
        duration: v.number(), // Minutes
    },
    handler: async (ctx, args) => {
        const start = new Date(args.date).getTime();
        const end = start + args.duration * 60 * 1000;

        // Fetch all appointments for the day (optimization: could filter by range if indexed)
        // For MVP, we'll fetch all and filter in memory or use a range query if we had an index.
        // Let's try to be slightly efficient and at least filter by "future" or something if possible,
        // but without an index on 'date', we have to scan.
        // TODO: Add index on 'date' in schema.ts for production.

        const appointments = await ctx.db.query("appointments").collect();

        const conflicts = appointments.filter((appt) => {
            if (appt.status === "Cancelled") return false;

            // Parse existing appointment date
            // If it's just YYYY-MM-DD, it will be treated as UTC midnight or local midnight depending on parsing.
            // We assume we are moving to full ISO strings.
            const apptStart = new Date(appt.date).getTime();

            // Assuming default 90 mins if not stored, or we should store duration.
            // For now, let's assume 90 mins for existing appts.
            const apptDuration = 90;
            const apptEnd = apptStart + apptDuration * 60 * 1000;

            // Check overlap
            return (start < apptEnd && end > apptStart);
        });

        return {
            available: conflicts.length === 0,
            conflicts: conflicts,
        };
    },
});

// Check for appointments in the next 24 hours and send reminders
export const checkAndSendReminders = internalMutation({
    args: {},
    handler: async (ctx) => {
        const now = Date.now();
        const twentyFourHoursFromNow = now + 24 * 60 * 60 * 1000;
        const twentyFiveHoursFromNow = now + 25 * 60 * 60 * 1000;

        // We want appointments scheduled for tomorrow (roughly 24h from now)
        // Since we run hourly, we check a 1-hour window 24h in the future

        // Note: This is a simplified query. In a real app with many appointments,
        // you'd want a dedicated index on `date` and `reminderSent`.
        // For v0, iterating is fine as volume is low.

        const appointments = await ctx.db.query("appointments").collect();

        const upcomingAppointments = appointments.filter((appt) => {
            const apptTime = new Date(appt.date).getTime();
            return (
                apptTime >= twentyFourHoursFromNow &&
                apptTime < twentyFiveHoursFromNow &&
                !appt.reminderSent &&
                appt.status !== "Cancelled" &&
                appt.status !== "Completed"
            );
        });

        if (upcomingAppointments.length === 0) {
            console.log("No reminders to send this hour.");
            return;
        }

        console.log(`Found ${upcomingAppointments.length} appointments to remind.`);

        for (const appt of upcomingAppointments) {
            const bride = await ctx.db.get(appt.brideId);
            if (!bride || !bride.email) continue;

            // Send email
            // await ctx.scheduler.runAfter(0, internal.emails.sendAppointmentReminder, {
            //   to: bride.email,
            //   brideName: bride.name,
            //   appointmentDate: appt.date,
            //   appointmentType: appt.type,
            // });

            await ctx.db.patch(appt._id, {
                reminderSent: true,
            });
        }
    },
});
