import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSessionFromCookies } from '@/lib/auth';

export async function GET() {
  try {
    // 1. Check Admin Session (Super or Sub)
    let session = await getSessionFromCookies('ADMIN');
    let userData: any = null;

    if (session) {
      // For Sub-Admin, get school name
      let schoolName = null;
      if (session.role === 'SUB_ADMIN' && session.schoolId) {
        const schoolRes = await pool.query('SELECT "schoolName" FROM "School" WHERE id = $1', [session.schoolId]);
        schoolName = schoolRes.rows[0]?.schoolName;
      }

      // Fetch user name from User table (since session only has email/role/userId)
      const userRes = await pool.query('SELECT name FROM "User" WHERE id = $1', [session.userId]);
      const name = userRes.rows[0]?.name || 'Administrator';

      userData = {
        id: session.userId,
        name,
        email: session.email,
        role: session.role,
        schoolName
      };
    } else {
      // 2. Check Alumni Session
      session = await getSessionFromCookies('ALUMNI');
      if (session) {
        // Fetch alumni details from Alumni table
        const alumniRes = await pool.query(`
          SELECT a.name, a."batchYear", a."profilePic", a."currentTitle", s."schoolName"
          FROM "Alumni" a
          LEFT JOIN "School" s ON a."schoolId" = s.id
          WHERE a.id = $1
        `, [session.userId]);
        const alumniData = alumniRes.rows[0] || {};

        userData = {
          id: session.userId,
          name: alumniData.name || 'Alumni',
          email: session.email,
          role: 'ALUMNI',
          batchYear: alumniData.batchYear || null,
          profilePic: alumniData.profilePic || null,
          currentTitle: alumniData.currentTitle || null,
          schoolName: alumniData.schoolName || 'Madni Education Trust'
        };
      }
    }

    if (!userData) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    return NextResponse.json(userData);

  } catch (error) {
    console.error('Session fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
