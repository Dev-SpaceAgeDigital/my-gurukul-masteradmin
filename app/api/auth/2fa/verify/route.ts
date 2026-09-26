import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, alumni, masterAdmins } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { verifyTotpToken, verifyBackupCode } from '@/lib/auth/totp2fa';

export async function POST(req: Request) {
  try {
    const { email, role, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json({ error: 'Email and 2FA code / Backup Code required' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = String(code).trim();

    let account: any = null;
    let tableType: 'masterAdmin' | 'alumni' | 'user' = 'user';

    if (role === 'SUPER_MASTER_ADMIN') {
      const [ma] = await db.select().from(masterAdmins).where(eq(masterAdmins.email, cleanEmail)).limit(1);
      account = ma;
      tableType = 'masterAdmin';
    } else if (role === 'ALUMNI') {
      const [al] = await db.select().from(alumni).where(eq(alumni.email, cleanEmail)).limit(1);
      account = al;
      tableType = 'alumni';
    } else {
      const [u] = await db.select().from(users).where(eq(users.email, cleanEmail)).limit(1);
      account = u;
      tableType = 'user';
    }

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    if (!account.twoFactorEnabled || !account.twoFactorSecret) {
      return NextResponse.json({ error: '2FA is not enabled for this account' }, { status: 400 });
    }

    let isValid = verifyTotpToken(account.twoFactorSecret, cleanCode);

    if (!isValid && Array.isArray(account.backupCodes)) {
      const backupResult = verifyBackupCode(account.backupCodes, cleanCode);
      if (backupResult.valid) {
        isValid = true;
        if (tableType === 'masterAdmin') {
          await db.update(masterAdmins).set({ backupCodes: backupResult.remainingCodes }).where(eq(masterAdmins.email, cleanEmail));
        } else if (tableType === 'alumni') {
          await db.update(alumni).set({ backupCodes: backupResult.remainingCodes }).where(eq(alumni.email, cleanEmail));
        } else {
          await db.update(users).set({ backupCodes: backupResult.remainingCodes }).where(eq(users.email, cleanEmail));
        }
      }
    }

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid 6-digit Authenticator code or Backup Code' }, { status: 401 });
    }

    const response = NextResponse.json({
      success: true,
      user: {
        id: account.id,
        name: account.name,
        email: account.email,
        role: account.role,
        schoolId: account.schoolId || null,
      },
    });

    if (role === 'SUPER_MASTER_ADMIN') {
      response.cookies.set('master_token', account.id, {
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
