import { NextResponse } from 'next/server';
import Stripe from 'stripe';
// import { metadata } from '@/app/api/stripe/route';

import { createBooking, updateHotelRoom } from '@/libs/apis';
import { metadata } from 'next-sanity/studio';

const checkout_session_completed = 'checkout.session.completed';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-11-20.acacia',
});

export async function POST(req: Request, res: Response) {
  const reqBody = await req.text();
  const sig = req.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  try {
    if (!sig || !webhookSecret) return;
    event = stripe.webhooks.constructEvent(reqBody, sig, webhookSecret);
  } catch (error: any) {
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 500 });
  }

  // load our event
  switch (event.type) {
    case checkout_session_completed:
      const session = event.data.object;

      const {
        metadata: {
          //@ts-ignore
          adults,
          //@ts-ignore
          checkinDate,
          //@ts-ignore
          checkoutDate,
          //@ts-ignore
          children,
          //@ts-ignore
          hotelRoom,
          //@ts-ignore
          numberOfDays,
          //@ts-ignore
          user,
          //@ts-ignore
          discount,
          //@ts-ignore
          totalPrice
        },
      } = session;

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

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json('Event Recevied', {
    status: 200,
    statusText: 'Event Recevied',
  });

}
