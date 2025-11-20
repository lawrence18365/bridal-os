import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Generate an upload URL for file storage
export const generateUploadUrl = mutation({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
        }

        return await ctx.storage.generateUploadUrl();
    },
});

// Get a file URL from storage
export const getFileUrl = query({
    args: { storageId: v.id("_storage") },
    handler: async (ctx, { storageId }) => {
        return await ctx.storage.getUrl(storageId);
    },
});
