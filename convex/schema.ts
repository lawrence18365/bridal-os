import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    tokenIdentifier: v.string(),
    name: v.string(),
    email: v.string(),
  }).index("by_token", ["tokenIdentifier"]),

  brides: defineTable({
    orgId: v.optional(v.string()),
    ownerId: v.optional(v.string()),
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

    // Portal cover photo
    coverImageId: v.optional(v.id("_storage")),

    // Digital measurement sign-off
    measurementsConfirmedAt: v.optional(v.number()), // timestamp
    measurementsConfirmedBy: v.optional(v.string()), // IP or identifier
  })
    .index("by_org", ["orgId"])
    .index("by_token", ["token"]),

  // Tier 1: Appointments Table
  appointments: defineTable({
    brideId: v.id("brides"),
    date: v.string(), // ISO date string
    type: v.string(), // e.g., "Fitting", "Pickup", "Consultation"
    notes: v.optional(v.string()),
    status: v.string(), // e.g., "Scheduled", "Completed", "Cancelled"
    reminderSent: v.optional(v.boolean()), // Track if 24h reminder was sent
  }).index("by_bride", ["brideId"]),

  // Tier 1: Documents Table
  documents: defineTable({
    brideId: v.id("brides"),
    title: v.string(),
    url: v.optional(v.string()), // External URL (legacy/optional)
    storageId: v.optional(v.id("_storage")), // Convex storage ID
    type: v.string(), // e.g., "Contract", "Invoice", "Photo"
    uploadedAt: v.optional(v.number()), // timestamp
    visibleToBride: v.boolean(), // Control what bride can see
  }).index("by_bride", ["brideId"]),

  settings: defineTable({
    orgId: v.string(),
    ownerId: v.optional(v.string()),
    storeName: v.optional(v.string()),
    supportEmail: v.optional(v.string()),
    brandColor: v.optional(v.string()), // hex color
    logoStorageId: v.optional(v.id("_storage")),
  }).index("by_org", ["orgId"]),

  // Payment Schedule System
  payments: defineTable({
    brideId: v.id("brides"),
    amount: v.number(),
    dueDate: v.string(), // ISO date string
    status: v.string(), // "Paid", "Pending", "Overdue"
    type: v.string(), // "Deposit", "Installment", "Balance"
    paidAt: v.optional(v.number()), // timestamp when marked paid
    reminderSentAt: v.optional(v.number()), // timestamp when reminder email was sent
    stripePaymentIntentId: v.optional(v.string()),
    stripeSessionId: v.optional(v.string()),
  }).index("by_bride", ["brideId"]),

  tasks: defineTable({
    brideId: v.id("brides"),
    title: v.string(),
    isCompleted: v.boolean(),
    order: v.number(), // for sorting
  }).index("by_bride", ["brideId"]),

  appointmentRequests: defineTable({
    orgId: v.string(),
    brideId: v.id("brides"),
    requestedDate: v.string(), // ISO date string
    requestedTime: v.string(), // "Morning" or "Afternoon" or specific time
    type: v.string(), // "Fitting", "Consultation", etc.
    status: v.string(), // "Pending", "Approved", "Rejected"
  })
    .index("by_bride", ["brideId"])
    .index("by_org_status", ["orgId", "status"]),

  // Tier 2: Inventory (Lightweight)
  inventory: defineTable({
    orgId: v.string(),
    name: v.string(), // e.g. "Willowby Galatea"
    image: v.optional(v.string()), // URL or storage ID
    styleNumber: v.optional(v.string()),
    size: v.optional(v.string()),
    status: v.string(), // "In Stock", "Sample", "Sold"
  }).index("by_org", ["orgId"]),

  // Tier 2: Tried On Tracking
  tried_on: defineTable({
    brideId: v.id("brides"),
    inventoryId: v.id("inventory"),
    notes: v.optional(v.string()),
    rating: v.optional(v.number()), // 1-5
    photoUrl: v.optional(v.string()), // Photo of bride in dress
    date: v.number(), // timestamp
  }).index("by_bride", ["brideId"]),
});
