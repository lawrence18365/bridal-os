import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const seed = mutation({
    args: {},
    handler: async (ctx) => {
        // Use a fixed orgId for testing if we can't easily get the current user's org
        // But since we want to see it in the dashboard, we should try to use the "solo-org" 
        // or whatever the default is if not authenticated.
        // However, mutations usually require auth if we enforce it.
        // Let's assume we are running this via `npx convex run` which might not have user context.
        // We will create data for "solo-org" which is the default fallback in our code.

        const orgId = "solo-org";

        console.log("Seeding analytics test data for org:", orgId);

        // 1. Create a Test Bride
        const brideId = await ctx.db.insert("brides", {
            name: "Analytics Test Bride",
            email: "test-analytics@example.com",
            weddingDate: "2024-12-31",
            status: "In Progress",
            totalPrice: 2000,
            paidAmount: 1000,
            token: Math.random().toString(36).substring(7),
            orgId: orgId,
            measurementsConfirmedAt: Date.now() - (10 * 24 * 60 * 60 * 1000), // 10 days ago
        });

        // 2. Add a Payment (Paid 2 days EARLY)
        // Due: 5 days ago. Paid: 7 days ago.
        const now = Date.now();
        const day = 24 * 60 * 60 * 1000;

        await ctx.db.insert("payments", {
            brideId,
            amount: 500,
            dueDate: new Date(now - 5 * day).toISOString(),
            paidAt: now - 7 * day,
            status: "Paid",
            type: "Deposit",
        });

        // 3. Add a Payment (Paid 1 day LATE)
        // Due: 10 days ago. Paid: 9 days ago.
        await ctx.db.insert("payments", {
            brideId,
            amount: 500,
            dueDate: new Date(now - 10 * day).toISOString(),
            paidAt: now - 9 * day,
            status: "Paid",
            type: "Installment",
        });

        // Net Collection Speed: (-2 days + 1 day) / 2 = -0.5 days (0.5 days early average? No wait.)
        // Early is positive in our logic?
        // Logic: Due - Paid. 
        // Payment 1: Due (T-5) - Paid (T-7) = +2 days (Early)
        // Payment 2: Due (T-10) - Paid (T-9) = -1 day (Late)
        // Avg: (2 - 1) / 2 = +0.5 days early.

        // 4. Add a Completed Pickup Appointment
        // Measurements confirmed 10 days ago.
        // Pickup completed today.
        // Duration: 10 days.
        await ctx.db.insert("appointments", {
            brideId,
            date: new Date().toISOString(),
            type: "Pickup",
            status: "Completed",
        });

        // 5. Add a No-Show Appointment
        await ctx.db.insert("appointments", {
            brideId,
            date: new Date(now - 1 * day).toISOString(),
            type: "Fitting",
            status: "No Show",
        });

        // 6. Add a Completed Fitting Appointment (to dilute the no-show rate)
        await ctx.db.insert("appointments", {
            brideId,
            date: new Date(now - 2 * day).toISOString(),
            type: "Fitting",
            status: "Completed",
        });

        // No Show Rate: 1 No Show / (1 Pickup Completed + 1 Fitting Completed + 1 No Show) = 1/3 = 33%

        console.log("Seeding complete.");
        return "Seeding complete. Expected: Collection ~0.5 days early, Pickup ~10 days, No-Show ~33%";
    },
});
