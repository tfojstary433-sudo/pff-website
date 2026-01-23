import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json(
        { error: 'Stripe configuration missing' },
        { status: 500 }
      );
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    const body = await request.text();
    const headersList = await headers();
    const sig = headersList.get('stripe-signature');

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, sig!, endpointSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json({ error: 'Webhook error' }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;

        // Extract metadata
        const userId = session.metadata?.userId;
        const productType = session.metadata?.productType;
        const productId = session.metadata?.productId;
        const days = session.metadata?.days;

        console.log('Payment successful:', {
          userId,
          productType,
          productId,
          days,
          amount: session.amount_total,
        });

        // Here you would typically:
        // 1. Update user's VIP status in database
        // 2. Send confirmation email
        // 3. Grant VIP privileges

        if (productType === 'vip' && userId && days) {
          // TODO: Implement VIP activation logic
          console.log(`Activating VIP for user ${userId} for ${days} days`);
        } else if (productType === 'tokens' && userId) {
          // Add tokens to user account
          const amount = session.metadata?.amount || session.metadata?.regularTokens;
          const bonus = session.metadata?.bonusTokens || '0';

          if (amount) {
            try {
              const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/user/tokens`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  userId: userId,
                  action: 'addTokens',
                  amount: {
                    regular: parseInt(amount),
                    bonus: parseInt(bonus)
                  }
                })
              });

              if (response.ok) {
                console.log(`Added ${amount} regular + ${bonus} bonus tokens to user ${userId}`);
              } else {
                console.error('Failed to add tokens to user account');
              }
            } catch (error) {
              console.error('Error adding tokens:', error);
            }
          }
        }

        break;

      case 'payment_intent.payment_failed':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('Payment failed:', paymentIntent.id);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}