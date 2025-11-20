import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const resolveOrgId = (identity: { org_id?: string | null; subject?: string | null } | null) =>
    identity?.org_id ?? identity?.subject ?? "solo-org";

// Get settings for authenticated user
export const getSettings = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");
        const orgId = resolveOrgId(identity);

        const settings = await ctx.db
            .query("settings")
            .withIndex("by_org", (q) => q.eq("orgId", orgId))
            .first();

        // Return defaults if no settings exist
        return settings || {
            storeName: "Bridal Shop",
            supportEmail: identity.email || "",
            brandColor: "#000000",
            logoStorageId: undefined,
        };
    },
});

// Get settings by org ID (for portal)
export const getSettingsByOrg = query({
    args: { orgId: v.string() },
    handler: async (ctx, args) => {
        const settings = await ctx.db
            .query("settings")
            .withIndex("by_org", (q) => q.eq("orgId", args.orgId))
            .first();

        // Return defaults if no settings exist
        return settings || {
            storeName: "Bridal Shop",
            supportEmail: "",
            brandColor: "#000000",
            logoStorageId: undefined,
        };
    },
});

// Upsert settings (create or update)
export const upsertSettings = mutation({
    args: {
        storeName: v.optional(v.string()),
        supportEmail: v.optional(v.string()),
        brandColor: v.optional(v.string()),
        logoStorageId: v.optional(v.id("_storage")),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated or no organization");
        const orgId = resolveOrgId(identity);

        const existing = await ctx.db
            .query("settings")
            .withIndex("by_org", (q) => q.eq("orgId", orgId))
            .first();

        const settingsData = {
            orgId,
            storeName: args.storeName,
            supportEmail: args.supportEmail,
            brandColor: args.brandColor,
            logoStorageId: args.logoStorageId,
        };

        if (existing) {
            await ctx.db.patch(existing._id, settingsData);
            return existing._id;
        } else {
            return await ctx.db.insert("settings", settingsData);
        }
    },
});
