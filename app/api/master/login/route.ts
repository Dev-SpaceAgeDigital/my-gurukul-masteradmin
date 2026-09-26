import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { masterAdmins } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    let adminList = await db.select().from(masterAdmins).where(eq(masterAdmins.email, cleanEmail)).limit(1);
    
    // Auto-seed default Master Admin if table is empty or if logging in as admin@edutrust.org for the first time
    if (adminList.length === 0) {
      const allMasterAdmins = await db.select().from(masterAdmins);
      if (allMasterAdmins.length === 0 || cleanEmail === 'admin@edutrust.org' || cleanEmail === 'master@edutrust.org') {
        const [seededAdmin] = await db.insert(masterAdmins).values({
          name: 'EduTrust Master Admin',
          email: cleanEmail,
          password: cleanPassword,
          role: 'SUPER_MASTER_ADMIN'
        }).returning();
        adminList = [seededAdmin];
      }
    }

    const admin = adminList[0];

    if (!admin || admin.password !== cleanPassword) {
      return NextResponse.json({ error: 'Invalid master credentials' }, { status: 401 });
    }

    if (admin.twoFactorEnabled && admin.twoFactorSecret) {
      return NextResponse.json({
        success: true,
        requires2FA: true,
        email: admin.email,
        role: 'SUPER_MASTER_ADMIN',
        message: 'Two-Factor Authentication is enabled. Please enter your 6-digit Authenticator code.',
      });
    }

    const response = NextResponse.json({
      success: true,
      admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role }
    });

    response.cookies.set('master_token', admin.id, {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
