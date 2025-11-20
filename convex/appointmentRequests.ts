import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const resolveOrgId = (identity: { org_id?: string | null; subject?: string | null } | null) =>
    identity?.org_id ?? identity?.subject ?? "solo-org";

// Create a new appointment request (Public - for Bride Portal)
export const create = mutation({
    args: {
        token: v.string(),
        requestedDate: v.string(),
        requestedTime: v.string(),
        type: v.string(),
    },
    handler: async (ctx, args) => {
        // Find bride by token
        const bride = await ctx.db
            .query("brides")
            .withIndex("by_token", (q) => q.eq("token", args.token))
            .unique();

        if (!bride) throw new Error("Bride not found");
        if (!bride.orgId) throw new Error("Bride has no organization assigned");

        await ctx.db.insert("appointmentRequests", {
            orgId: bride.orgId,
            brideId: bride._id,
            requestedDate: args.requestedDate,
            requestedTime: args.requestedTime,
            type: args.type,
            status: "Pending",
        });
    },
});

// List all pending requests (Internal - for Dashboard)
export const listPending = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];
        const orgId = resolveOrgId(identity);

        const requests = await ctx.db
            .query("appointmentRequests")
            .withIndex("by_org_status", (q) => q.eq("orgId", orgId).eq("status", "Pending"))
            .collect();

        // Enrich with bride details
        const enrichedRequests = await Promise.all(
            requests.map(async (req) => {
                const bride = await ctx.db.get(req.brideId);
                return {
                    ...req,
                    brideName: bride?.name || "Unknown",
                    brideEmail: bride?.email || "",
                };
            })
        );

        return enrichedRequests;
    },
});

// Approve request (Internal - for Dashboard)
export const approve = mutation({
    args: {
        requestId: v.id("appointmentRequests"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authorized");
        const orgId = resolveOrgId(identity);

        const request = await ctx.db.get(args.requestId);
        if (!request) throw new Error("Request not found");

        if (request.orgId !== orgId) throw new Error("Not authorized");

        // Update request status
        await ctx.db.patch(args.requestId, { status: "Approved" });

        // Create actual appointment
        await ctx.db.insert("appointments", {
            brideId: request.brideId,
            date: request.requestedDate,
            type: request.type,
            status: "Scheduled",
            notes: `Requested time: ${request.requestedTime}`,
        });
    },
});

// Reject request (Internal - for Dashboard)
export const reject = mutation({
    args: {
        requestId: v.id("appointmentRequests"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authorized");
        const orgId = resolveOrgId(identity);

        const request = await ctx.db.get(args.requestId);
        if (!request) throw new Error("Request not found");

        if (request.orgId !== orgId) throw new Error("Not authorized");

        await ctx.db.patch(args.requestId, { status: "Rejected" });
    },
});
