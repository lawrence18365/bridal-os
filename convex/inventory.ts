import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const resolveOrgId = (identity: { org_id?: string | null; subject?: string | null } | null) =>
    identity?.org_id ?? identity?.subject ?? "solo-org";

// Inventory Management
export const addInventoryItem = mutation({
    args: {
        name: v.string(),
        image: v.optional(v.string()),
        styleNumber: v.optional(v.string()),
        size: v.optional(v.string()),
        status: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const orgId = resolveOrgId(identity);

        const itemId = await ctx.db.insert("inventory", {
            ...args,
            orgId,
        });

        return itemId;
    },
});

export const listInventory = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const orgId = resolveOrgId(identity);

        return await ctx.db
            .query("inventory")
            .withIndex("by_org", (q) => q.eq("orgId", orgId))
            .collect();
    },
});

// Tried On Tracking
export const recordTriedOn = mutation({
    args: {
        brideId: v.id("brides"),
        inventoryId: v.id("inventory"),
        notes: v.optional(v.string()),
        rating: v.optional(v.number()),
        photoUrl: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const orgId = resolveOrgId(identity);

        // Verify bride ownership
        const bride = await ctx.db.get(args.brideId);
        if (!bride || bride.orgId !== orgId) {
            throw new Error("Not authorized");
        }

        await ctx.db.insert("tried_on", {
            ...args,
            date: Date.now(),
        });
    },
});

export const getTriedOnForBride = query({
    args: { brideId: v.id("brides") },
    handler: async (ctx, args) => {
        const items = await ctx.db
            .query("tried_on")
            .withIndex("by_bride", (q) => q.eq("brideId", args.brideId))
            .collect();

        // Join with inventory details
        const triedOnWithDetails = await Promise.all(
            items.map(async (item) => {
                const inventoryItem = await ctx.db.get(item.inventoryId);
                return {
                    ...item,
                    inventory: inventoryItem,
                };
            })
        );

        return triedOnWithDetails;
    },
});

// Public query for Portal
export const getTriedOnByToken = query({
    args: { token: v.string() },
    handler: async (ctx, args) => {
        const bride = await ctx.db
            .query("brides")
            .withIndex("by_token", (q) => q.eq("token", args.token))
            .unique();

        if (!bride) return [];

        const items = await ctx.db
            .query("tried_on")
            .withIndex("by_bride", (q) => q.eq("brideId", bride._id))
            .collect();

        const triedOnWithDetails = await Promise.all(
            items.map(async (item) => {
                const inventoryItem = await ctx.db.get(item.inventoryId);
                return {
                    ...item,
                    inventory: inventoryItem,
                };
            })
        );

        return triedOnWithDetails;
    },
});
