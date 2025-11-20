import { internalAction, internalMutation } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { v } from "convex/values";

export const setupTestData = internalMutation({
    args: {},
    handler: async (ctx) => {
        const orgId = "solo-org";
        console.log("Setting up test data...");

        // 1. Create a test bride
        const brideId = await ctx.db.insert("brides", {
            name: "Test Bride",
            email: "test@example.com",
            weddingDate: "2024-12-31",
            totalPrice: 1000,
            orgId,
            token: "test-token-" + Date.now(),
            status: "Active",
            paidAmount: 0,
        });
        console.log("Created bride:", brideId);

        // 2. Create an appointment
        const date = new Date().toISOString();
        await ctx.db.insert("appointments", {
            brideId,
            date,
            type: "Fitting",
            status: "Scheduled",
            notes: "Test Appointment",
        });
        console.log("Created appointment at:", date);

        // 3. Add inventory item
        const inventoryId = await ctx.db.insert("inventory", {
            name: "Test Dress",
            status: "Sample",
            styleNumber: "123",
            orgId,
        });
        console.log("Created inventory item:", inventoryId);

        // 4. Record tried on (Bypassing auth by inserting directly)
        await ctx.db.insert("tried_on", {
            brideId,
            inventoryId,
            notes: "Loved it!",
            rating: 5,
            date: Date.now(),
        });
        console.log("Recorded tried on item");

        return { brideId, date };
    },
});

export const verify = internalAction({
    args: {},
    handler: async (ctx) => {
        console.log("Starting verification...");

        // 1. Setup data
        const { brideId, date } = await ctx.runMutation(internal.verify_saturday_savior.setupTestData);

        // 2. Check availability (should conflict)
        const availability = await ctx.runQuery(api.appointments.checkAvailability, {
            date,
            duration: 90,
        });
        console.log("Availability check (expect false):", availability.available);

        if (availability.available) {
            console.error("FAIL: Conflict detection failed");
        } else {
            console.log("PASS: Conflict detected");
        }

        // 3. Fetch tried on
        const triedOn = await ctx.runQuery(api.inventory.getTriedOnForBride, {
            brideId,
        });
        console.log("Fetched tried on items:", triedOn.length);

        if (triedOn.length === 1 && triedOn[0].inventory?.name === "Test Dress") {
            console.log("PASS: Tried on item verified");
        } else {
            console.error("FAIL: Tried on verification failed");
        }

        console.log("Verification complete.");
    },
});
