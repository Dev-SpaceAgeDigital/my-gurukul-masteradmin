import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { checkRateLimit, rateLimitResponse } from '@/lib/security/rateLimit';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: Request) {
  try {
    const limit = await checkRateLimit(request, 'payment');
    if (!limit.allowed) return rateLimitResponse(limit.retryAfter);

    const { amount, type, referenceId, schoolId } = await request.json();

    if (!amount || !type || !schoolId) {
      return NextResponse.json({ error: 'Missing payment details' }, { status: 400 });
    }

    const options = {
      amount: Math.round(amount * 100), // Razorpay expects paise
      currency: 'INR',
      receipt: `rcpt_${Math.random().toString(36).substring(7)}`,
      notes: {
        type,
        referenceId,
        schoolId
      }
    };

    const order = await razorpay.orders.create(options);
    return NextResponse.json(order);

  } catch (error: any) {
    console.error('Razorpay order error:', error);
    return NextResponse.json({ error: 'Failed to create payment order' }, { status: 500 });
  }
}
