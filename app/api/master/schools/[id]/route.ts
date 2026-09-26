import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { schools, trusts, users, alumni } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const schoolList = await db.select().from(schools).where(eq(schools.id, id));
    if (!schoolList || schoolList.length === 0) {
      return NextResponse.json({ success: false, error: 'School institution not found' }, { status: 404 });
    }

    const schoolData = schoolList[0];

    // Fetch parent trust
    let parentTrust = null;
    if (schoolData.trustId) {
      const trustList = await db.select().from(trusts).where(eq(trusts.id, schoolData.trustId));
      if (trustList.length > 0) {
        parentTrust = trustList[0];
      }
    }

    // Fetch campus users (sub-admins & super-admins)
    let campusUsers: any[] = [];
    try {
      campusUsers = await db.select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        phoneNo: users.phoneNo,
        createdAt: users.createdAt
      }).from(users).where(eq(users.schoolId, id));
    } catch (uErr) {
      console.error('Error fetching campus users:', uErr);
    }

    // Estimated data footprint
    const studentCount = schoolData.currentStudentsNo || 0;
    const estBytes = 153600 + (studentCount * 1024);

    return NextResponse.json({
      success: true,
      school: schoolData,
      trust: parentTrust,
      users: campusUsers,
      telemetry: {
        estSizeBytes: estBytes,
        estSizeFormatted: (estBytes / 1024).toFixed(1) + ' KB',
        studentCount
      }
    });
  } catch (error: any) {
    console.error('API /api/master/schools/[id] error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { status } = await req.json();

    if (!id || !status) {
      return NextResponse.json({ error: 'School ID and status are required' }, { status: 400 });
    }

    const [updatedSchool] = await db
      .update(schools)
      .set({ status, updatedAt: new Date() })
      .where(eq(schools.id, id))
      .returning();

    return NextResponse.json({ success: true, school: updatedSchool });
  } catch (error: any) {
    console.error('Error updating school status:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
