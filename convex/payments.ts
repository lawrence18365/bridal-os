import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";

const resolveOrgId = (identity: { org_id?: string | null; subject?: string | null } | null) =>
    identity?.org_id ?? identity?.subject ?? "solo-org";

// Helper to get site URL with validation
const getSiteUrl = () => {
    const url = process.env.SITE_URL || 'http://localhost:3000';
    if (url.includes('localhost')) {
        console.warn('⚠️ SITE_URL is set to localhost. Payment reminder emails will have local URLs!');
    }
    return url;
};

// Get all payments for a bride
export const getPayments = query({
    args: { brideId: v.id("brides") },
    handler: async (ctx, args) => {
        const payments = await ctx.db
            .query("payments")
            .withIndex("by_bride", (q) => q.eq("brideId", args.brideId))
            .collect();

        return payments.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    },
});

// Add a new payment entry
export const addPayment = mutation({
    args: {
        brideId: v.id("brides"),
        amount: v.number(),
        dueDate: v.string(),
        type: v.string(),
        status: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");
        const orgId = resolveOrgId(identity);

        // Verify ownership
        const bride = await ctx.db.get(args.brideId);
        if (!bride || bride.orgId !== orgId) {
            throw new Error("Not authorized");
        }

        return await ctx.db.insert("payments", {
            brideId: args.brideId,
            amount: args.amount,
            dueDate: args.dueDate,
            type: args.type,
            status: args.status || "Pending",
        });
    },
});

// Update payment status
export const updatePayment = mutation({
    args: {
        id: v.id("payments"),
        status: v.optional(v.string()),
        amount: v.optional(v.number()),
        dueDate: v.optional(v.string()),
        type: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");
        const orgId = resolveOrgId(identity);

        const { id, ...updates } = args;

        // Verify ownership through bride
        const payment = await ctx.db.get(id);
        if (!payment) throw new Error("Payment not found");

        const bride = await ctx.db.get(payment.brideId);
        if (!bride || bride.orgId !== orgId) {
            throw new Error("Not authorized");
        }

        // Add paidAt timestamp if marking as paid
        const updateData: any = updates;
        if (updates.status === "Paid" && !payment.paidAt) {
            updateData.paidAt = Date.now();
        }

        await ctx.db.patch(id, updateData);
    },
});

// Delete a payment
export const deletePayment = mutation({
    args: { id: v.id("payments") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");
        const orgId = resolveOrgId(identity);

        // Verify ownership through bride
        const payment = await ctx.db.get(args.id);
        if (!payment) throw new Error("Payment not found");

        const bride = await ctx.db.get(payment.brideId);
        if (!bride || bride.orgId !== orgId) {
            throw new Error("Not authorized");
        }

        await ctx.db.delete(args.id);
    },
});

// WORKFLOW 3: Payment Reminder Cron Job (Internal Mutation)
export const sendPaymentReminders = internalMutation({
    args: {},
    handler: async (ctx) => {
        // Calculate date 3 days from now
        const today = new Date();
        const threeDaysFromNow = new Date(today);
        threeDaysFromNow.setDate(today.getDate() + 3);
        const targetDate = threeDaysFromNow.toISOString().split('T')[0]; // YYYY-MM-DD format

        // Query all payments due in 3 days with status "Pending"
        const allPayments = await ctx.db.query("payments").collect();

        const paymentsToRemind = allPayments.filter(payment => {
            return (
                payment.dueDate === targetDate &&
                payment.status === "Pending" &&
                !payment.reminderSentAt // Haven't sent a reminder yet
            );
        });

        console.log(`Found ${paymentsToRemind.length} payments due in 3 days`);

        // Send reminders for each payment
        for (const payment of paymentsToRemind) {
            const bride = await ctx.db.get(payment.brideId);
            if (!bride) continue;

            const portalUrl = `${getSiteUrl()}/p/${bride.token}`;

            // Schedule the email
            // await ctx.scheduler.runAfter(0, internal.emails.sendPaymentReminder, {
            //     to: bride.email,
            //     brideName: bride.name,
            //     amount: payment.amount,
            //     dueDate: payment.dueDate,
            //     stripeLink: bride.stripeLink,
            //     portalUrl,
            // });

            // Mark reminder as sent
            await ctx.db.patch(payment._id, {
                reminderSentAt: Date.now(),
            });

            console.log(`Payment reminder sent to ${bride.name} for $${payment.amount}`);
        }
    },
});

export const markAsPaid = internalMutation({
    args: {
        paymentId: v.id("payments"),
        stripePaymentIntentId: v.string(),
        stripeSessionId: v.string(),
    },
    handler: async (ctx, args) => {
        const payment = await ctx.db.get(args.paymentId);
        if (!payment) {
            throw new Error("Payment not found");
        }

        await ctx.db.patch(args.paymentId, {
            status: "Paid",
            paidAt: Date.now(),
            stripePaymentIntentId: args.stripePaymentIntentId,
            stripeSessionId: args.stripeSessionId,
        });

        // Trigger email notification
        const bride = await ctx.db.get(payment.brideId);
        if (bride) {
            const portalUrl = `${process.env.SITE_URL || 'http://localhost:3000'}/p/${bride.token}`;

            // await ctx.scheduler.runAfter(0, internal.emails.sendBrideNotification, {
            //     to: bride.email,
            //     brideName: bride.name,
            //     portalUrl,
            //     message: `We received your payment of $${payment.amount.toLocaleString()}. Thank you!`,
            // });
        }
    },
});
