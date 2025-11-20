import { v } from "convex/values";
import { query } from "./_generated/server";

const resolveOrgId = (identity: { org_id?: string | null; subject?: string | null } | null) =>
    identity?.org_id ?? identity?.subject ?? "solo-org";

// Industry benchmarks (these would ideally come from aggregated data)
const INDUSTRY_BENCHMARKS = {
    collectionRate: 75, // 75% collection rate
    avgDaysToPickup: 120, // 4 months average
    noShowRate: 15, // 15% no-show rate
    avgPaymentSpeedDays: 0, // Pay on time (0 days early/late)
};

export const getDashboardMetrics = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        const orgId = resolveOrgId(identity);

        // Fetch all brides for this org
        const brides = await ctx.db
            .query("brides")
            .withIndex("by_org", (q) => q.eq("orgId", orgId))
            .collect();

        if (brides.length === 0) {
            return {
                // Return zeros if no brides yet
                collectionRate: 0,
                collectionRateVsIndustry: 0,
                avgPickupDays: 0,
                avgPickupDaysVsIndustry: 0,
                noShowRate: 0,
                noShowRateVsIndustry: 0,
                totalRevenue: 0,
                totalCollected: 0,
                avgPaymentSpeedDays: 0,
                avgPaymentSpeedVsIndustry: 0,
                totalBrides: 0,
                activeBrides: 0,
                completedBrides: 0,
                upcomingAppointments: 0,
                overduePayments: 0,
                totalOverdue: 0,
            };
        }

        // === REVENUE METRICS ===
        const totalRevenue = brides.reduce((sum, b) => sum + b.totalPrice, 0);
        const totalCollected = brides.reduce((sum, b) => sum + b.paidAmount, 0);
        const collectionRate = totalRevenue > 0 ? (totalCollected / totalRevenue) * 100 : 0;
        const collectionRateVsIndustry = collectionRate - INDUSTRY_BENCHMARKS.collectionRate;

        // === PAYMENT SPEED (How early/late do they pay?) ===
        let totalDaysDiff = 0;
        let paidPaymentCount = 0;
        let overduePayments = 0;
        let totalOverdue = 0;

        const now = Date.now();

        for (const bride of brides) {
            const payments = await ctx.db
                .query("payments")
                .withIndex("by_bride", (q) => q.eq("brideId", bride._id))
                .collect();

            for (const payment of payments) {
                if (payment.status === "Paid" && payment.paidAt && payment.dueDate) {
                    const paidDate = new Date(payment.paidAt);
                    const dueDate = new Date(payment.dueDate);
                    // Positive = paid early, Negative = paid late
                    const diffTime = dueDate.getTime() - paidDate.getTime();
                    const diffDays = diffTime / (1000 * 60 * 60 * 24);
                    totalDaysDiff += diffDays;
                    paidPaymentCount++;
                }

                // Count overdue payments
                if (payment.status === "Pending") {
                    const dueDate = new Date(payment.dueDate).getTime();
                    if (dueDate < now) {
                        overduePayments++;
                        totalOverdue += payment.amount;
                    }
                }
            }
        }

        const avgPaymentSpeedDays = paidPaymentCount > 0 ? totalDaysDiff / paidPaymentCount : 0;
        const avgPaymentSpeedVsIndustry = avgPaymentSpeedDays - INDUSTRY_BENCHMARKS.avgPaymentSpeedDays;

        // === PICKUP TIME METRICS ===
        let totalPickupDays = 0;
        let pickupCount = 0;

        for (const bride of brides) {
            if (!bride.measurementsConfirmedAt) continue;

            const appointments = await ctx.db
                .query("appointments")
                .withIndex("by_bride", (q) => q.eq("brideId", bride._id))
                .collect();

            const pickupAppt = appointments.find(a => a.type === "Pickup" && a.status === "Completed");

            if (pickupAppt) {
                const pickupDate = new Date(pickupAppt.date);
                const measurementsDate = new Date(bride.measurementsConfirmedAt);
                const diffTime = pickupDate.getTime() - measurementsDate.getTime();
                const diffDays = diffTime / (1000 * 60 * 60 * 24);

                if (diffDays > 0) {
                    totalPickupDays += diffDays;
                    pickupCount++;
                }
            }
        }

        const avgPickupDays = pickupCount > 0 ? Math.round(totalPickupDays / pickupCount) : 0;
        const avgPickupDaysVsIndustry = avgPickupDays - INDUSTRY_BENCHMARKS.avgDaysToPickup;

        // === NO-SHOW RATE ===
        let noShowCount = 0;
        let completedCount = 0;
        let upcomingAppointments = 0;
        const sevenDaysFromNow = now + 7 * 24 * 60 * 60 * 1000;

        for (const bride of brides) {
            const appointments = await ctx.db
                .query("appointments")
                .withIndex("by_bride", (q) => q.eq("brideId", bride._id))
                .collect();

            for (const appt of appointments) {
                const apptDate = new Date(appt.date).getTime();

                // Count upcoming appointments (next 7 days)
                if (apptDate >= now && apptDate <= sevenDaysFromNow && appt.status === "Scheduled") {
                    upcomingAppointments++;
                }

                // Count no-shows and completed (for past appointments)
                if (apptDate < now) {
                    if (appt.status === "Cancelled") {
                        noShowCount++;
                    } else if (appt.status === "Completed") {
                        completedCount++;
                    }
                }
            }
        }

        const totalRelevantAppts = noShowCount + completedCount;
        const noShowRate = totalRelevantAppts > 0 ? (noShowCount / totalRelevantAppts) * 100 : 0;
        const noShowRateVsIndustry = noShowRate - INDUSTRY_BENCHMARKS.noShowRate;

        // === BRIDE COUNTS ===
        const activeBrides = brides.filter(b => b.status !== "Completed").length;
        const completedBrides = brides.filter(b => b.status === "Completed").length;

        return {
            // Collection metrics
            collectionRate: Math.round(collectionRate * 10) / 10,
            collectionRateVsIndustry: Math.round(collectionRateVsIndustry * 10) / 10,
            totalRevenue,
            totalCollected,

            // Payment speed metrics
            avgPaymentSpeedDays: Math.round(avgPaymentSpeedDays * 10) / 10,
            avgPaymentSpeedVsIndustry: Math.round(avgPaymentSpeedVsIndustry * 10) / 10,

            // Pickup time metrics
            avgPickupDays,
            avgPickupDaysVsIndustry,

            // No-show metrics
            noShowRate: Math.round(noShowRate * 10) / 10,
            noShowRateVsIndustry: Math.round(noShowRateVsIndustry * 10) / 10,

            // Counts
            totalBrides: brides.length,
            activeBrides,
            completedBrides,
            upcomingAppointments,
            overduePayments,
            totalOverdue,
        };
    },
});
