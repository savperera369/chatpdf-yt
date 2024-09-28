// stripe is going to send us this webhook regardless if the
// transaction succeeds or fails
// request is going to be made by stripe

import { db } from "@/lib/db";
import { userSubscriptions } from "@/lib/db/schema";
import { stripe } from "@/lib/stripe";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

// A webhook is a way for applications to communicate with each other by automatically sending data between them over HTTP. Webhooks are triggered by specific events, and they can be used to activate workflows.
export async function POST(req: Response) {
    const body = await req.text();
    // make sure webhook is coming from stripe itself
    const signature = headers().get('Stripe-Signature') as string;
    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SIGNING_SECRET as string);
    } catch (error) {
        return new NextResponse('webhook error', { status: 400 });
    }

    const session = event.data.object as Stripe.Checkout.Session;

    // new subscription created
    if (event.type === 'checkout.session.completed') {
        const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
        );
        
        if (!session?.metadata?.userId) {
            return new NextResponse('no user id', { status: 400 });
        }

        await db.insert(userSubscriptions).values({
            userId: session.metadata.userId,
            stripeSubscriptionId: subscription.id,
            stripeCustomerId: subscription.customer as string,
            stripePriceId: subscription.items.data[0].price.id,
            stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000)
        });
    }

    if (event.type === 'invoice.payment_succeeded') {
        const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
        );

        await db.update(userSubscriptions).set({
            stripePriceId: subscription.items.data[0].price.id,
            stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000)
        }).where(eq(userSubscriptions.stripeSubscriptionId, subscription.id));
    }

    // tell stripe the operation was successful
    return new NextResponse(null, { status: 200 });
}