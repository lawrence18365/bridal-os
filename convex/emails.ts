"use node";

import { action, internalAction } from "./_generated/server";
import { v } from "convex/values";
import { Resend } from "resend";

// Lazy initialization to avoid module-load-time errors
function getResend() {
    if (!process.env.RESEND_API_KEY) {
        console.warn("⚠️ RESEND_API_KEY not set. Emails will NOT be sent.");
        return null;
    }
    return new Resend(process.env.RESEND_API_KEY);
}

export const sendAppointmentReminder = internalAction({
    args: {
        to: v.string(),
        brideName: v.string(),
        appointmentDate: v.string(), // ISO string
        appointmentType: v.string(),
    },
    handler: async (ctx, args) => {
        const resend = getResend();
        if (!resend) {
            console.log("📧 Appointment reminder would be sent (Resend not configured):", args);
            return;
        }

        const date = new Date(args.appointmentDate);
        const formattedDate = date.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
        });
        const formattedTime = date.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
        });

        try {
            const { data, error } = await resend.emails.send({
                from: "BridalOS <hello@bridal-os.com>", // Update this with verified domain
                to: [args.to],
                subject: `Reminder: Your ${args.appointmentType} is tomorrow!`,
                html: `
          <div style="font-family: sans-serif; color: #333;">
            <h1>Hi ${args.brideName},</h1>
            <p>We're excited to see you for your <strong>${args.appointmentType}</strong>!</p>
            <p><strong>When:</strong> ${formattedDate} at ${formattedTime}</p>
            <p>Please let us know if you need to reschedule.</p>
            <br/>
            <p>Best,</p>
            <p>The Team</p>
          </div>
        `,
            });

            if (error) {
                console.error("Error sending email:", error);
                throw new Error("Failed to send email");
            }
        } catch (err) {
            console.error("Failed to send email:", err);
            // Don't throw error to avoid retrying infinitely if it's a config issue
        }
    },
});

export const sendWelcomeEmail = internalAction({
    args: {
        to: v.string(),
        brideName: v.string(),
        portalUrl: v.string(),
    },
    handler: async (ctx, args) => {
        const resend = getResend();
        if (!resend) {
            console.log("📧 Welcome email would be sent (Resend not configured):", args);
            return;
        }

        try {
            await resend.emails.send({
                from: "BridalOS <hello@bridal-os.com>",
                to: [args.to],
                subject: "Welcome to your Bridal Portal",
                html: `
          <div style="font-family: sans-serif; color: #333;">
            <h1>Welcome, ${args.brideName}!</h1>
            <p>We've created a personal portal for you to track your dress journey.</p>
            <p><a href="${args.portalUrl}">Click here to access your portal</a></p>
            <br/>
            <p>Best,</p>
            <p>The Team</p>
          </div>
        `,
            });
        } catch (err) {
            console.error("Failed to send welcome email:", err);
        }
    },
});

export const sendPaymentReminder = internalAction({
    args: {
        to: v.string(),
        brideName: v.string(),
        amount: v.number(),
        dueDate: v.string(),
        stripeLink: v.optional(v.string()),
        portalUrl: v.string(),
    },
    handler: async (ctx, args) => {
        const resend = getResend();
        if (!resend) {
            console.log("📧 Payment reminder would be sent (Resend not configured):", args);
            return;
        }

        try {
            await resend.emails.send({
                from: "BridalOS <hello@bridal-os.com>",
                to: [args.to],
                subject: "Payment Reminder",
                html: `
          <div style="font-family: sans-serif; color: #333;">
            <h1>Hi ${args.brideName},</h1>
            <p>This is a friendly reminder that a payment of <strong>$${args.amount.toLocaleString()}</strong> is due on ${new Date(args.dueDate).toLocaleDateString()}.</p>
            ${args.stripeLink ? `<p><a href="${args.stripeLink}">Click here to pay now</a></p>` : ""}
            <p>You can also view your payment schedule in your portal:</p>
            <p><a href="${args.portalUrl}">Access Portal</a></p>
            <br/>
            <p>Best,</p>
            <p>The Team</p>
          </div>
        `,
            });
        } catch (err) {
            console.error("Failed to send payment reminder:", err);
        }
    },
});

export const sendBrideNotification = internalAction({
    args: {
        to: v.string(),
        brideName: v.string(),
        portalUrl: v.string(),
        message: v.string(),
    },
    handler: async (ctx, args) => {
        const resend = getResend();
        if (!resend) {
            console.log("📧 Bride notification would be sent (Resend not configured):", args);
            return;
        }

        try {
            await resend.emails.send({
                from: "BridalOS <hello@bridal-os.com>",
                to: [args.to],
                subject: "Update from BridalOS",
                html: `
          <div style="font-family: sans-serif; color: #333;">
            <h1>Hi ${args.brideName},</h1>
            <p>${args.message}</p>
            <p><a href="${args.portalUrl}">View in Portal</a></p>
            <br/>
            <p>Best,</p>
            <p>The Team</p>
          </div>
        `,
            });
        } catch (err) {
            console.error("Failed to send notification:", err);
        }
    },
});

export const sendReadyForPickupEmail = internalAction({
    args: {
        to: v.string(),
        brideName: v.string(),
        portalUrl: v.string(),
    },
    handler: async (ctx, args) => {
        const resend = getResend();
        if (!resend) {
            console.log("📧 Pickup email would be sent (Resend not configured):", args);
            return;
        }

        try {
            await resend.emails.send({
                from: "BridalOS <hello@bridal-os.com>",
                to: [args.to],
                subject: "Your Dress is Ready!",
                html: `
          <div style="font-family: sans-serif; color: #333;">
            <h1>Exciting News, ${args.brideName}!</h1>
            <p>Your dress is ready for pickup!</p>
            <p>Please schedule a pickup appointment in your portal.</p>
            <p><a href="${args.portalUrl}">Access Portal</a></p>
            <br/>
            <p>Best,</p>
            <p>The Team</p>
          </div>
        `,
            });
        } catch (err) {
            console.error("Failed to send pickup email:", err);
        }
    },
});

export const sendEmail = internalAction({
    args: {
        to: v.string(),
        subject: v.string(),
        html: v.string(),
    },
    handler: async (ctx, args) => {
        const resend = getResend();
        if (!resend) {
            console.log("📧 Email would be sent (Resend not configured):", args);
            return;
        }

        try {
            await resend.emails.send({
                from: "BridalOS <hello@bridal-os.com>",
                to: [args.to],
                subject: args.subject,
                html: args.html,
            });
        } catch (err) {
            console.error("Failed to send email:", err);
        }
    },
});
