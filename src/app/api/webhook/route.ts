import { NextResponse } from 'next/server';
import Stripe from 'stripe';

import { createBooking, updateHotelRoom } from '@/libs/apis';

const checkoutSessionCompleted = 'checkout.session.completed';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-11-20.acacia',
});

export async function POST(req: Request) {
  const reqBody = await req.text();
  const sig = req.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  try {
    if (!sig || !webhookSecret) return;
    event = stripe.webhooks.constructEvent(reqBody, sig, webhookSecret);
  } catch (error) {
    const err =
      error instanceof Error
        ? error
        : new Error('Unknown error during Stripe webhook parsing');
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 500 });
  }

  switch (event.type) {
    case checkoutSessionCompleted: {
      // Session and its metadata will be "any", but we can typecast it more safely
      const session = event.data.object as Stripe.Checkout.Session;

      // Stripe's metadata is always a Record<string, string|undefined>
      const {
        adults,
        checkinDate,
        checkoutDate,
        children,
        hotelRoom,
        numberOfDays,
        user,
        discount,
        totalPrice,
      } = (session.metadata ?? {}) as Record<string, string | undefined>;

      if (
        !adults ||
        !checkinDate ||
        !checkoutDate ||
        !children ||
        !hotelRoom ||
        !numberOfDays ||
        !user ||
        !discount ||
        !totalPrice
      ) {
        return new NextResponse('Missing metadata in Stripe session', {
          status: 400,
        });
      }

      await createBooking({
        adults: Number(adults),
        checkinDate,
        checkoutDate,
        children: Number(children),
        hotelRoom,
        numberOfDays: Number(numberOfDays),
        discount: Number(discount),
        totalPrice: Number(totalPrice),
        user,
      });

      // Update HotelRoom
      await updateHotelRoom(hotelRoom);

      return NextResponse.json('Booking successful', {
        status: 200,
        statusText: 'Booking Successful',
      });
    }

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json('Event Received', {
    status: 200,
    statusText: 'Event Received',
  });
}
