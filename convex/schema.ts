import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    tokenIdentifier: v.string(),
    name: v.string(),
    email: v.string(),
  }).index("by_token", ["tokenIdentifier"]),

  brides: defineTable({
    ownerId: v.string(),
    token: v.string(),
    name: v.string(),
    email: v.string(),
    weddingDate: v.string(),
    status: v.string(),
    totalPrice: v.number(),
    paidAmount: v.number(),
    stripeLink: v.optional(v.string()),

    // Tier 1: Measurements
    measurements: v.optional(
      v.object({
        bust: v.optional(v.number()),
        waist: v.optional(v.number()),
        hips: v.optional(v.number()),
        hem: v.optional(v.number()),
        hollowToHem: v.optional(v.number()),
      })
    ),

    // Tier 1: Dress Details
    dressDetails: v.optional(
      v.object({
        designer: v.optional(v.string()),
        styleNumber: v.optional(v.string()),
        size: v.optional(v.string()),
        color: v.optional(v.string()),
      })
    ),
  })
    .index("by_owner", ["ownerId"])
    .index("by_token", ["token"]),

  // Tier 1: Appointments Table
  appointments: defineTable({
    brideId: v.id("brides"),
    date: v.string(), // ISO date string
    type: v.string(), // e.g., "Fitting", "Pickup", "Consultation"
    notes: v.optional(v.string()),
    status: v.string(), // e.g., "Scheduled", "Completed", "Cancelled"
  }).index("by_bride", ["brideId"]),

  // Tier 1: Documents Table
  documents: defineTable({
    brideId: v.id("brides"),
    title: v.string(),
    url: v.string(), // Convex storage URL or external URL
    type: v.string(), // e.g., "Contract", "Invoice", "Photo"
    uploadedAt: v.optional(v.number()), // timestamp
    visibleToBride: v.boolean(), // Control what bride can see
  }).index("by_bride", ["brideId"]),
});
