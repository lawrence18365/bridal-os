import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";
import { createEvents, EventAttributes } from "ics";

const http = httpRouter();

// Calendar ICS Feed Endpoint
http.route({
    path: "/calendar/:ownerId",
    method: "GET",
    handler: httpAction(async (ctx, request) => {
        // Extract ownerId from URL
        const url = new URL(request.url);
        const pathParts = url.pathname.split("/");
        const ownerId = pathParts[pathParts.length - 1];

        if (!ownerId) {
            return new Response("Missing ownerId", { status: 400 });
        }

        try {
            // Fetch all brides for this owner (now org)
            const brides = await ctx.runQuery(api.brides.listByOrg, { orgId: ownerId });

            if (!brides || brides.length === 0) {
                // Return empty calendar if no brides
                const { error, value } = createEvents([]);
                if (error) {
                    return new Response("Error generating calendar", { status: 500 });
                }
                return new Response(value, {
                    status: 200,
                    headers: {
                        "Content-Type": "text/calendar; charset=utf-8",
                        "Content-Disposition": 'attachment; filename="bridal-appointments.ics"',
                    },
                });
            }

            // Fetch all appointments across all brides
            const allAppointments: Array<{
                _id: any;
                _creationTime: number;
                brideId: any;
                date: string;
                type: string;
                notes?: string;
                status: string;
                brideName: string;
            }> = [];
            for (const bride of brides) {
                const appointments = await ctx.runQuery(api.brides.getAppointments, {
                    brideId: bride._id,
                });
                appointments.forEach((apt) => {
                    allAppointments.push({
                        ...apt,
                        brideName: bride.name,
                    });
                });
            }

            // Convert appointments to ICS events
            const events: EventAttributes[] = allAppointments.map((apt) => {
                const appointmentDate = new Date(apt.date);

                // Create start and end times (1 hour appointment)
                const start: [number, number, number, number, number] = [
                    appointmentDate.getFullYear(),
                    appointmentDate.getMonth() + 1, // ICS months are 1-indexed
                    appointmentDate.getDate(),
                    appointmentDate.getHours(),
                    appointmentDate.getMinutes(),
                ];

                const endDate = new Date(appointmentDate);
                endDate.setHours(endDate.getHours() + 1);

                const end: [number, number, number, number, number] = [
                    endDate.getFullYear(),
                    endDate.getMonth() + 1,
                    endDate.getDate(),
                    endDate.getHours(),
                    endDate.getMinutes(),
                ];

                return {
                    start,
                    end,
                    title: `${apt.type}: ${apt.brideName}`,
                    description: apt.notes || `${apt.type} appointment with ${apt.brideName}`,
                    location: "Bridal Shop",
                    status: "CONFIRMED",
                    busyStatus: "BUSY",
                    productId: "BridalOS",
                };
            });

            // Generate ICS file
            const { error, value } = createEvents(events);

            if (error) {
                console.error("ICS generation error:", error);
                return new Response("Error generating calendar", { status: 500 });
            }

            return new Response(value, {
                status: 200,
                headers: {
                    "Content-Type": "text/calendar; charset=utf-8",
                    "Content-Disposition": 'attachment; filename="bridal-appointments.ics"',
                    "Cache-Control": "no-cache",
                },
            });
        } catch (error) {
            console.error("Calendar endpoint error:", error);
            return new Response("Internal server error", { status: 500 });
        }
    }),
});

import { handleWebhook } from "./stripe";

http.route({
    path: "/stripe-webhook",
    method: "POST",
    handler: handleWebhook,
});

export default http;
