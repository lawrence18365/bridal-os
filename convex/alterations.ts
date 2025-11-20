import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const resolveOrgId = (identity: { org_id?: string | null; subject?: string | null } | null) =>
    identity?.org_id ?? identity?.subject ?? "solo-org";

// Get all alterations for a bride
export const getAlterations = query({
    args: { brideId: v.id("brides") },
    handler: async (ctx, args) => {
        const alterations = await ctx.db
            .query("alterations")
            .withIndex("by_bride", (q) => q.eq("brideId", args.brideId))
            .collect();

        return alterations.sort((a, b) => b.createdAt - a.createdAt);
    },
});

// Add a new alteration
export const addAlteration = mutation({
    args: {
        brideId: v.id("brides"),
        description: v.string(),
        cost: v.optional(v.number()),
        status: v.optional(v.string()),
        scheduledDate: v.optional(v.string()),
        notes: v.optional(v.string()),
        seamstress: v.optional(v.string()),
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

        return await ctx.db.insert("alterations", {
            brideId: args.brideId,
            description: args.description,
            cost: args.cost,
            status: args.status || "Scheduled",
            scheduledDate: args.scheduledDate,
            notes: args.notes,
            seamstress: args.seamstress,
            createdAt: Date.now(),
        });
    },
});

// Update alteration
export const updateAlteration = mutation({
    args: {
        id: v.id("alterations"),
        description: v.optional(v.string()),
        cost: v.optional(v.number()),
        status: v.optional(v.string()),
        scheduledDate: v.optional(v.string()),
        completedDate: v.optional(v.string()),
        notes: v.optional(v.string()),
        seamstress: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");
        const orgId = resolveOrgId(identity);

        const { id, ...updates } = args;

        // Verify ownership through bride
        const alteration = await ctx.db.get(id);
        if (!alteration) throw new Error("Alteration not found");

        const bride = await ctx.db.get(alteration.brideId);
        if (!bride || bride.orgId !== orgId) {
            throw new Error("Not authorized");
        }

        await ctx.db.patch(id, updates);
    },
});

// Delete alteration
export const deleteAlteration = mutation({
    args: { id: v.id("alterations") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");
        const orgId = resolveOrgId(identity);

        // Verify ownership through bride
        const alteration = await ctx.db.get(args.id);
        if (!alteration) throw new Error("Alteration not found");

        const bride = await ctx.db.get(alteration.brideId);
        if (!bride || bride.orgId !== orgId) {
            throw new Error("Not authorized");
        }

        await ctx.db.delete(args.id);
    },
});
