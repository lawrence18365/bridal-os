import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";

const resolveOrgId = (identity: { org_id?: string | null; subject?: string | null } | null) =>
  identity?.org_id ?? identity?.subject ?? "solo-org";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return null;
    }

    const orgId = resolveOrgId(identity);

    return await ctx.db
      .query("brides")
      .withIndex("by_org", (q) => q.eq("orgId", orgId))
      .collect();
  },
});

export const listByOrg = query({
  args: { orgId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("brides")
      .withIndex("by_org", (q) => q.eq("orgId", args.orgId))
      .collect();
  },
});

export const get = query({
  args: { id: v.id("brides") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const bride = await ctx.db.get(args.id);
    if (!bride) return null;

    const orgId = resolveOrgId(identity);

    // Verify ownership
    if (bride.orgId !== orgId) {
      throw new Error("Not authorized");
    }

    return bride;
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    weddingDate: v.string(),
    totalPrice: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const orgId = resolveOrgId(identity);
    const token = Math.random().toString(36).substring(2, 15);

    const brideId = await ctx.db.insert("brides", {
      ...args,
      orgId: orgId,
      token: token,
      status: "Onboarding",
      paidAmount: 0,
    });

    // Schedule welcome email
    const siteUrl = process.env.SITE_URL || "http://localhost:3000";
    // await ctx.scheduler.runAfter(0, internal.emails.sendWelcomeEmail, {
    //   brideName: args.name,
    //   to: args.email,
    //   portalUrl: `${siteUrl}/p/${token}`,
    // });

    return brideId;
  },
});

export const getByToken = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const bride = await ctx.db
      .query("brides")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();

    return bride;
  },
});

export const getPortalData = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const bride = await ctx.db
      .query("brides")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();

    if (!bride) return null;

    // Get appointments
    const appointments = await ctx.db
      .query("appointments")
      .withIndex("by_bride", (q) => q.eq("brideId", bride._id))
      .collect();

    // Get visible documents
    const allDocuments = await ctx.db
      .query("documents")
      .withIndex("by_bride", (q) => q.eq("brideId", bride._id))
      .collect();
    const documents = allDocuments.filter(doc => doc.visibleToBride);

    // Get payments
    const payments = await ctx.db
      .query("payments")
      .withIndex("by_bride", (q) => q.eq("brideId", bride._id))
      .collect();

    // Get settings for this org
    const settings = await ctx.db
      .query("settings")
      .withIndex("by_org", (q) => q.eq("orgId", bride.orgId ?? "solo-org"))
      .first();

    // Get cover image URL if exists
    let coverImageUrl = null;
    if (bride.coverImageId) {
      coverImageUrl = await ctx.storage.getUrl(bride.coverImageId);
    }

    // Get logo URL if exists
    let logoUrl = null;
    if (settings?.logoStorageId) {
      logoUrl = await ctx.storage.getUrl(settings.logoStorageId);
    }

    return {
      bride,
      appointments,
      documents,
      payments: payments.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()),
      settings,
      coverImageUrl,
      logoUrl,
    };
  },
});

export const confirmMeasurements = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const bride = await ctx.db
      .query("brides")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();

    if (!bride) throw new Error("Bride not found");

    await ctx.db.patch(bride._id, {
      measurementsConfirmedAt: Date.now(),
      measurementsConfirmedBy: "bride-portal",
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("brides"),
    status: v.optional(v.string()),
    totalPrice: v.optional(v.number()),
    paidAmount: v.optional(v.number()),
    stripeLink: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const { id, ...updates } = args;
    const orgId = resolveOrgId(identity);

    // Verify ownership
    const bride = await ctx.db.get(id);
    if (!bride || bride.orgId !== orgId) {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(id, updates);
  },
});

// TIER 1: Measurements
export const updateMeasurements = mutation({
  args: {
    brideId: v.id("brides"),
    measurements: v.object({
      bust: v.optional(v.number()),
      waist: v.optional(v.number()),
      hips: v.optional(v.number()),
      hem: v.optional(v.number()),
      hollowToHem: v.optional(v.number()),
    }),
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

    await ctx.db.patch(args.brideId, {
      measurements: args.measurements,
    });
  },
});

// TIER 1: Dress Details
export const updateDressDetails = mutation({
  args: {
    brideId: v.id("brides"),
    dressDetails: v.object({
      designer: v.optional(v.string()),
      styleNumber: v.optional(v.string()),
      size: v.optional(v.string()),
      color: v.optional(v.string()),
    }),
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

    await ctx.db.patch(args.brideId, {
      dressDetails: args.dressDetails,
    });
  },
});

// TIER 1: Appointments
export const addAppointment = mutation({
  args: {
    brideId: v.id("brides"),
    date: v.string(),
    type: v.string(),
    notes: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const orgId = resolveOrgId(identity);

    // Verify ownership of bride
    const bride = await ctx.db.get(args.brideId);
    if (!bride || bride.orgId !== orgId) {
      throw new Error("Not authorized");
    }

    await ctx.db.insert("appointments", {
      brideId: args.brideId,
      date: args.date,
      type: args.type,
      notes: args.notes,
      status: args.status || "Scheduled",
    });
  },
});

export const getAppointments = query({
  args: {
    brideId: v.id("brides"),
  },
  handler: async (ctx, args) => {
    const appointments = await ctx.db
      .query("appointments")
      .withIndex("by_bride", (q) => q.eq("brideId", args.brideId))
      .collect();

    return appointments;
  },
});

export const getAppointmentsByToken = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    // Find bride by token
    const bride = await ctx.db
      .query("brides")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();

    if (!bride) return [];

    // Get appointments for this bride
    const appointments = await ctx.db
      .query("appointments")
      .withIndex("by_bride", (q) => q.eq("brideId", bride._id))
      .collect();

    return appointments;
  },
});

export const updateAppointment = mutation({
  args: {
    id: v.id("appointments"),
    date: v.optional(v.string()),
    type: v.optional(v.string()),
    notes: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const { id, ...updates } = args;
    const orgId = resolveOrgId(identity);

    // Verify ownership through bride
    const appointment = await ctx.db.get(id);
    if (!appointment) throw new Error("Appointment not found");

    const bride = await ctx.db.get(appointment.brideId);
    if (!bride || bride.orgId !== orgId) {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(id, updates);
  },
});

export const deleteAppointment = mutation({
  args: {
    id: v.id("appointments"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const orgId = resolveOrgId(identity);

    // Verify ownership through bride
    const appointment = await ctx.db.get(args.id);
    if (!appointment) throw new Error("Appointment not found");

    const bride = await ctx.db.get(appointment.brideId);
    if (!bride || bride.orgId !== orgId) {
      throw new Error("Not authorized");
    }

    await ctx.db.delete(args.id);
  },
});

// TIER 1: Documents
export const addDocument = mutation({
  args: {
    brideId: v.id("brides"),
    title: v.string(),
    url: v.optional(v.string()),
    storageId: v.optional(v.id("_storage")),
    type: v.string(),
    visibleToBride: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const orgId = resolveOrgId(identity);

    // Verify ownership of bride
    const bride = await ctx.db.get(args.brideId);
    if (!bride || bride.orgId !== orgId) {
      throw new Error("Not authorized");
    }

    await ctx.db.insert("documents", {
      brideId: args.brideId,
      title: args.title,
      url: args.url,
      storageId: args.storageId,
      type: args.type,
      uploadedAt: Date.now(),
      visibleToBride: args.visibleToBride ?? false,
    });
  },
});

export const updateDocument = mutation({
  args: {
    id: v.id("documents"),
    title: v.optional(v.string()),
    visibleToBride: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const { id, ...updates } = args;
    const orgId = resolveOrgId(identity);

    // Verify ownership through bride
    const document = await ctx.db.get(id);
    if (!document) throw new Error("Document not found");

    const bride = await ctx.db.get(document.brideId);
    if (!bride || bride.orgId !== orgId) {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(id, updates);
  },
});

export const getDocuments = query({
  args: {
    brideId: v.id("brides"),
  },
  handler: async (ctx, args) => {
    const documents = await ctx.db
      .query("documents")
      .withIndex("by_bride", (q) => q.eq("brideId", args.brideId))
      .collect();

    return documents;
  },
});

export const getDocumentsByToken = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    // Find bride by token
    const bride = await ctx.db
      .query("brides")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();

    if (!bride) return [];

    // Get ONLY visible documents for this bride
    const allDocuments = await ctx.db
      .query("documents")
      .withIndex("by_bride", (q) => q.eq("brideId", bride._id))
      .collect();

    // Filter to only visible documents
    return allDocuments.filter(doc => doc.visibleToBride);
  },
});

export const deleteDocument = mutation({
  args: {
    id: v.id("documents"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const orgId = resolveOrgId(identity);

    // Verify ownership through bride
    const document = await ctx.db.get(args.id);
    if (!document) throw new Error("Document not found");

    const bride = await ctx.db.get(document.brideId);
    if (!bride || bride.orgId !== orgId) {
      throw new Error("Not authorized");
    }

    await ctx.db.delete(args.id);
  },
});
