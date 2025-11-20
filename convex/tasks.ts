import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";

const resolveOrgId = (identity: { org_id?: string | null; subject?: string | null } | null) =>
    identity?.org_id ?? identity?.subject ?? "solo-org";

// Get tasks for a bride
export const getTasks = query({
    args: { brideId: v.id("brides") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");
        const orgId = resolveOrgId(identity);

        // Verify ownership
        const bride = await ctx.db.get(args.brideId);
        if (!bride || bride.orgId !== orgId) {
            throw new Error("Not authorized");
        }

        return await ctx.db
            .query("tasks")
            .withIndex("by_bride", (q) => q.eq("brideId", args.brideId))
            .order("asc")
            .collect();
    },
});

// Toggle task completion
export const toggleTask = mutation({
    args: { id: v.id("tasks") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");
        const orgId = resolveOrgId(identity);

        const task = await ctx.db.get(args.id);
        if (!task) throw new Error("Task not found");

        // Verify ownership through bride
        const bride = await ctx.db.get(task.brideId);
        if (!bride || bride.orgId !== orgId) {
            throw new Error("Not authorized");
        }

        await ctx.db.patch(args.id, {
            isCompleted: !task.isCompleted,
        });
    },
});

// Create default tasks for a new bride (internal - called from brides.ts)
export const createDefaultTasks = internalMutation({
    args: { brideId: v.id("brides") },
    handler: async (ctx, args) => {
        const defaultTasks = [
            { title: "Upload Signed Contract", order: 1 },
            { title: "Take Initial Measurements", order: 2 },
            { title: "Send Deposit Invoice", order: 3 },
            { title: "Dress Ordered", order: 4 },
            { title: "First Fitting Scheduled", order: 5 },
            { title: "Final Balance Paid", order: 6 },
        ];

        for (const task of defaultTasks) {
            await ctx.db.insert("tasks", {
                brideId: args.brideId,
                title: task.title,
                isCompleted: false,
                order: task.order,
            });
        }
    },
});

// Add a task to a bride (internal - called from workflows)
export const addTask = internalMutation({
    args: {
        brideId: v.id("brides"),
        title: v.string(),
    },
    handler: async (ctx, args) => {
        // Get the highest order number for this bride
        const existingTasks = await ctx.db
            .query("tasks")
            .withIndex("by_bride", (q) => q.eq("brideId", args.brideId))
            .collect();

        const maxOrder = existingTasks.length > 0
            ? Math.max(...existingTasks.map(t => t.order))
            : 0;

        await ctx.db.insert("tasks", {
            brideId: args.brideId,
            title: args.title,
            isCompleted: false,
            order: maxOrder + 1,
        });
    },
});
