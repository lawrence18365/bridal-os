import { mutation } from "./_generated/server";

const resolveOrgId = (identity: { org_id?: string | null; subject?: string | null } | null) =>
    identity?.org_id ?? identity?.subject ?? "solo-org";

export const migrateLegacyData = mutation({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("You must be logged in to an organization to migrate data.");
        }

        const orgId = resolveOrgId(identity);
        const userId = identity.tokenIdentifier;

        // 1. Migrate Brides
        const brides = await ctx.db
            .query("brides")
            .filter((q) => q.eq(q.field("ownerId"), userId))
            .collect();

        let migratedCount = 0;
        for (const bride of brides) {
            if (!bride.orgId) {
                await ctx.db.patch(bride._id, { orgId: orgId as string });
                migratedCount++;
            }
        }

        // 2. Migrate Settings
        const settings = await ctx.db
            .query("settings")
            .filter((q) => q.eq(q.field("ownerId"), userId)) // Assuming settings had ownerId
            .collect();

        for (const setting of settings) {
            // Check if setting already has orgId or if we need to create a new one
            // If settings table has ownerId, we update it. 
            // Note: Schema might not have ownerId on settings anymore if I removed it, 
            // but I added it back as optional in schema.ts, so it's fine.
            if (!setting.orgId) {
                await ctx.db.patch(setting._id, { orgId: orgId as string });
            }
        }

        return { success: true, migratedCount };
    },
});
