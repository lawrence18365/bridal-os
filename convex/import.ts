import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { internal } from "./_generated/api";

const resolveOrgId = (identity: { org_id?: string | null; subject?: string | null } | null) =>
    identity?.org_id ?? identity?.subject ?? "solo-org";

// Bulk import brides from CSV data
export const bulkImportBrides = mutation({
    args: {
        brides: v.array(
            v.object({
                name: v.string(),
                email: v.string(),
                weddingDate: v.string(),
                totalPrice: v.number(),
            })
        ),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");
        const orgId = resolveOrgId(identity);

        const results = [];

        for (const brideData of args.brides) {
            try {
                // Generate unique token
                const token = Math.random().toString(36).substring(2, 15);

                // Insert bride
                const brideId = await ctx.db.insert("brides", {
                    orgId,
                    token,
                    name: brideData.name,
                    email: brideData.email,
                    weddingDate: brideData.weddingDate,
                    status: "Initial Contact",
                    totalPrice: brideData.totalPrice,
                    paidAmount: 0,
                });

                // Auto-create default tasks for this bride
                await ctx.scheduler.runAfter(0, internal.tasks.createDefaultTasks, {
                    brideId,
                });

                results.push({ success: true, name: brideData.name });
            } catch (error) {
                results.push({
                    success: false,
                    name: brideData.name,
                    error: String(error),
                });
            }
        }

        return results;
    },
});
