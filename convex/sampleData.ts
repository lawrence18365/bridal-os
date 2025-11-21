import { mutation } from "./_generated/server";
import { v } from "convex/values";

const resolveOrgId = (identity: { org_id?: string | null; subject?: string | null } | null) =>
  identity?.org_id ?? identity?.subject ?? "solo-org";

// Create sample bride with appointments, payments, and tasks
export const createSampleData = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const orgId = resolveOrgId(identity);

    // Check if user already has data
    const existingBrides = await ctx.db
      .query("brides")
      .withIndex("by_org", (q) => q.eq("orgId", orgId))
      .collect();

    if (existingBrides.length > 0) {
      // User already has data, don't create sample
      return null;
    }

    // Create sample bride
    const token = Math.random().toString(36).substring(2, 15);
    const weddingDate = new Date();
    weddingDate.setMonth(weddingDate.getMonth() + 6); // 6 months from now

    const brideId = await ctx.db.insert("brides", {
      orgId,
      token,
      name: "Emma Johnson (Sample)",
      email: "sample@example.com",
      phoneNumber: "(555) 123-4567",
      weddingDate: weddingDate.toISOString().split("T")[0],
      totalPrice: 3500,
      paidAmount: 1500,
      status: "In Progress",
      designer: "Vera Wang",
      style: "Ball Gown",
      notes: "This is a sample bride to help you explore Bridal OS. Feel free to edit or delete!",
    });

    // Add sample appointments
    const firstFitting = new Date();
    firstFitting.setDate(firstFitting.getDate() + 7);

    await ctx.db.insert("appointments", {
      brideId,
      date: firstFitting.toISOString(),
      type: "First Fitting",
      status: "Scheduled",
      duration: 60,
      notes: "Initial measurements and fitting",
    });

    const finalFitting = new Date();
    finalFitting.setDate(finalFitting.getDate() + 30);

    await ctx.db.insert("appointments", {
      brideId,
      date: finalFitting.toISOString(),
      type: "Final Fitting",
      status: "Scheduled",
      duration: 45,
      notes: "Final adjustments before pickup",
    });

    // Add sample payments
    const depositDate = new Date();
    depositDate.setMonth(depositDate.getMonth() - 1);

    await ctx.db.insert("payments", {
      brideId,
      amount: 1500,
      dueDate: depositDate.toISOString().split("T")[0],
      type: "Deposit",
      status: "Paid",
      paidAt: depositDate.getTime(),
    });

    const nextPayment = new Date();
    nextPayment.setMonth(nextPayment.getMonth() + 1);

    await ctx.db.insert("payments", {
      brideId,
      amount: 1000,
      dueDate: nextPayment.toISOString().split("T")[0],
      type: "Second Payment",
      status: "Pending",
    });

    const finalPayment = new Date();
    finalPayment.setMonth(finalPayment.getMonth() + 3);

    await ctx.db.insert("payments", {
      brideId,
      amount: 1000,
      dueDate: finalPayment.toISOString().split("T")[0],
      type: "Final Payment",
      status: "Pending",
    });

    // Add sample alterations
    await ctx.db.insert("alterations", {
      brideId,
      description: "Hem length adjustment",
      cost: 150,
      status: "Scheduled",
      scheduledDate: firstFitting.toISOString().split("T")[0],
      seamstress: "Maria",
      notes: "Bride is 5'4\", needs 2 inches off the hem",
    });

    await ctx.db.insert("alterations", {
      brideId,
      description: "Bodice fitting",
      cost: 200,
      status: "Pending",
      notes: "Take in at waist, minor bust adjustment",
    });

    // Add sample tasks
    await ctx.db.insert("tasks", {
      brideId,
      title: "Order veil accessories",
      status: "Pending",
      dueDate: nextPayment.toISOString().split("T")[0],
      priority: "Medium",
    });

    await ctx.db.insert("tasks", {
      brideId,
      title: "Send care instructions",
      status: "Pending",
      dueDate: finalPayment.toISOString().split("T")[0],
      priority: "Low",
    });

    return brideId;
  },
});
