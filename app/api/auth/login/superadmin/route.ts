import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { comparePassword } from '@/lib/auth';
import { startLoginOtp, normalizeLoginEmail, isDemoEmail } from '@/lib/auth/loginOtp';
import { checkRateLimit, rateLimitResponse } from '@/lib/security/rateLimit';

export async function POST(request: Request) {
  try {
    const limit = await checkRateLimit(request, 'login');
    if (!limit.allowed) return rateLimitResponse(limit.retryAfter);

    const { email, password } = await request.json();
    const cleanEmail = normalizeLoginEmail(email);

    const result = await query('SELECT * FROM "User" WHERE LOWER(email) = $1 AND role = $2', [cleanEmail, 'SUPER_ADMIN']);
    const user = result.rows[0];

    const isDemo = isDemoEmail(cleanEmail);
    const passwordMatches = user ? ((await comparePassword(password, user.password)) || (isDemo && (password === '123456' || password === 'Demo@123456' || password.toLowerCase() === 'demosuperadmin123!'))) : false;

    if (!user || !passwordMatches) {
      return NextResponse.json({ error: 'Invalid credentials. For demo superadmin account, use password: DemoSuperAdmin123! or 123456' }, { status: 401 });
    }

    await startLoginOtp({
      role: 'SUPER_ADMIN',
      email: user.email,
      userId: user.id,
      name: user.name,
    });

    return NextResponse.json({
      success: true,
      requiresOtp: true,
      role: 'SUPER_ADMIN',
      email: user.email,
      message: isDemo
        ? 'OTP sent to your registered email. (Demo OTP: 123456)'
        : 'OTP sent to your registered email.',
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
  }
}
