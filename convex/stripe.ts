import { v } from "convex/values";
import { httpAction, action } from "./_generated/server";
import { internal } from "./_generated/api";
import Stripe from "stripe";

export const handleWebhook = httpAction(async (ctx, request) => {
    // Fail safe on misconfiguration: never process a webhook without both the
    // API key and the signing secret. Treating "no secret configured" as
    // anything other than a hard server error would let unsigned/forged
    // payloads mark payments as paid.
    const secretKey = process.env.STRIPE_SECRET_KEY;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!secretKey || !webhookSecret) {
        console.error(
            "Stripe webhook rejected: STRIPE_SECRET_KEY and/or STRIPE_WEBHOOK_SECRET is not configured."
        );
        return new Response("Stripe webhook not configured", { status: 500 });
    }

    const signature = request.headers.get("stripe-signature");

    if (!signature) {
        return new Response("Missing signature", { status: 400 });
    }

    const stripe = new Stripe(secretKey, {
        apiVersion: "2023-10-16",
    } as any);

    const payload = await request.text();
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            payload,
            signature,
            webhookSecret
        );
    } catch (err) {
        console.error(`Webhook signature verification failed.`, err);
        return new Response("Webhook signature verification failed", { status: 400 });
    }

    if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;
        const paymentId = session.metadata?.paymentId;

        if (paymentId) {
            await ctx.runMutation(internal.payments.markAsPaid, {
                paymentId: paymentId as any,
                stripePaymentIntentId: session.payment_intent as string,
                stripeSessionId: session.id,
            });
        }
    }

    return new Response(null, { status: 200 });
});

export const createCheckoutSession = action({
    args: {
        paymentId: v.id("payments"),
        amount: v.number(),
        title: v.string(),
        brideEmail: v.string(),
        portalUrl: v.string(),
    },
    handler: async (ctx, args) => {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
            apiVersion: "2023-10-16",
        } as any);

        const session = await stripe.checkout.sessions.create({
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: args.title,
                        },
                        unit_amount: Math.round(args.amount * 100), // cents
                    },
                    quantity: 1,
                },
            ],
            mode: "payment",
            success_url: `${args.portalUrl}?payment_success=true`,
            cancel_url: args.portalUrl,
            customer_email: args.brideEmail,
            metadata: {
                paymentId: args.paymentId,
            },
        });

        return { url: session.url };
    },
});
