import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Run every hour to check for appointments starting in the next 24-25 hours
crons.interval(
    "send-appointment-reminders",
    { hours: 1 }, // Run every hour
    internal.appointments.checkAndSendReminders
);

// WORKFLOW 3: Payment Nudge - Daily at 9:00 AM UTC
crons.daily(
    "payment-reminders",
    { hourUTC: 9, minuteUTC: 0 },
    internal.payments.sendPaymentReminders
);

export default crons;
