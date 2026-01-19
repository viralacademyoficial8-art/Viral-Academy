import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { stripe, PLANS } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { subscription: true, profile: true },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Check if user already has an active subscription
    if (user.subscription?.status === "ACTIVE") {
      return new NextResponse("Ya tienes una membresía activa", { status: 400 });
    }

    // Create or get Stripe customer
    let customerId = user.subscription?.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.profile?.displayName || user.profile?.firstName || undefined,
        metadata: {
          userId: user.id,
        },
      });
      customerId = customer.id;

      // Create subscription record with customer ID (status will be updated by webhook)
      await prisma.subscription.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          stripeCustomerId: customerId,
          status: "INCOMPLETE",
        },
        update: {
          stripeCustomerId: customerId,
        },
      });
    }

    // Create checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: PLANS.MONTHLY.priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://viral-academy.vercel.app"}/app/membresia?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://viral-academy.vercel.app"}/app/membresia?canceled=true`,
      metadata: {
        userId: user.id,
      },
      subscription_data: {
        metadata: {
          userId: user.id,
        },
      },
      allow_promotion_codes: true,
      billing_address_collection: "required",
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return new NextResponse("Error creating checkout session", { status: 500 });
  }
}
