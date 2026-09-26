import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { schools, trusts, users } from '@/lib/db/schema';
import { eq, desc, sql } from 'drizzle-orm';

async function ensureSchema() {
  try {
    await db.execute(sql`ALTER TABLE "School" ADD COLUMN IF NOT EXISTS "domainPurchaseUrl" text;`);
    await db.execute(sql`ALTER TABLE "School" ADD COLUMN IF NOT EXISTS "brevoApiKey" text;`);
    await db.execute(sql`ALTER TABLE "School" ADD COLUMN IF NOT EXISTS "brevoSenderEmail" varchar(255);`);
    await db.execute(sql`ALTER TABLE "School" ADD COLUMN IF NOT EXISTS "brevoSenderName" varchar(255);`);
  } catch (err) {
    console.error('School schema migration exception:', err);
  }
}

export async function GET() {
  try {
    await ensureSchema();
    const allSchools = await db
      .select({
        id: schools.id,
        schoolName: schools.schoolName,
        schoolDiseNo: schools.schoolDiseNo,
        medium: schools.medium,
        address: schools.address,
        phoneNo: schools.phoneNo,
        email: schools.email,
        establishYear: schools.establishYear,
        totalStandards: schools.totalStandards,
        currentStudentsNo: schools.currentStudentsNo,
        isHaveRTE: schools.isHaveRTE,
        logoUrl: schools.logoUrl,
        subdomain: schools.subdomain,
        customDomain: schools.customDomain,
        domainPurchaseUrl: schools.domainPurchaseUrl,
        domainDescription: schools.domainDescription,
        brevoApiKey: schools.brevoApiKey,
        brevoSenderEmail: schools.brevoSenderEmail,
        brevoSenderName: schools.brevoSenderName,
        razorpayKeyId: schools.razorpayKeyId,
        razorpayKeySecret: schools.razorpayKeySecret,
        sponsorshipMode: schools.sponsorshipMode,
        trustId: schools.trustId,
        trustName: trusts.trustName,
        trustSlug: trusts.slug,
        trustLogoUrl: trusts.logoUrl,
        trustSponsorshipMode: trusts.sponsorshipMode,
        createdAt: schools.createdAt
      })
      .from(schools)
      .leftJoin(trusts, eq(schools.trustId, trusts.id))
      .orderBy(desc(schools.createdAt));

    return NextResponse.json(allSchools);
  } catch (error: any) {
    console.error('Error fetching schools:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch schools' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      trustId,
      schoolName,
      schoolDiseNo,
      medium,
      address,
      phoneNo,
      email,
      establishYear,
      totalStandards,
      currentStudentsNo,
      isHaveRTE,
      logoUrl,
      subdomain,
      customDomain,
      domainPurchaseUrl,
      domainDescription,
      brevoApiKey,
      brevoSenderEmail,
      brevoSenderName,
      razorpayKeyId,
      razorpayKeySecret,
      sponsorshipMode,
      // Optional SubAdmin provision
      subAdminName,
      subAdminEmail,
      subAdminPassword,
      subAdminPhone
    } = body;

    if (!trustId || !schoolName) {
      return NextResponse.json({ error: 'Parent Trust and School Name are required' }, { status: 400 });
    }

    // 0. Quota check for Parent Trust maxSchools
    const parentTrustList = await db.select().from(trusts).where(eq(trusts.id, trustId));
    let defaultSponsorshipMode = 'ZAKAT_LILLAH';
    if (parentTrustList && parentTrustList.length > 0) {
      const parentTrust = parentTrustList[0];
      defaultSponsorshipMode = parentTrust.sponsorshipMode || 'ZAKAT_LILLAH';
      const maxAllowed = parentTrust.maxSchools || 10;
      
      const existingSchools = await db.select().from(schools).where(eq(schools.trustId, trustId));
      if (existingSchools.length >= maxAllowed) {
        return NextResponse.json({
          error: `School Quota Exceeded! Parent Trust "${parentTrust.trustName}" is allowed a maximum limit of ${maxAllowed} school campus(es). You currently have ${existingSchools.length} registered. Please upgrade the Trust subscription plan.`
        }, { status: 403 });
      }
    }

    // 1. Insert School Record
    const [newSchool] = await db.insert(schools).values({
      trustId,
      schoolName,
      schoolDiseNo: schoolDiseNo || `DISE-${Date.now()}`,
      medium: medium || 'English',
      address: address || null,
      phoneNo: phoneNo || null,
      email: email || null,
      establishYear: establishYear ? parseInt(establishYear) : null,
      totalStandards: totalStandards ? parseInt(totalStandards) : 10,
      currentStudentsNo: currentStudentsNo ? parseInt(currentStudentsNo) : 0,
      isHaveRTE: Boolean(isHaveRTE),
      logoUrl: logoUrl || null,
      subdomain: subdomain || null,
      customDomain: customDomain || null,
      domainPurchaseUrl: domainPurchaseUrl || null,
      domainDescription: domainDescription || null,
      brevoApiKey: brevoApiKey || null,
      brevoSenderEmail: brevoSenderEmail || null,
      brevoSenderName: brevoSenderName || null,
      razorpayKeyId: razorpayKeyId || null,
      razorpayKeySecret: razorpayKeySecret || null,
      sponsorshipMode: sponsorshipMode || defaultSponsorshipMode,
    }).returning();

    // 2. Optionally Create SubAdmin user for this school
    let subAdmin = null;
    if (subAdminEmail && subAdminPassword) {
      const [createdAdmin] = await db.insert(users).values({
        name: subAdminName || `${schoolName} SubAdmin`,
        email: subAdminEmail,
        password: subAdminPassword,
        phoneNo: subAdminPhone || null,
        role: 'SUB_ADMIN',
        schoolId: newSchool.id
      }).returning();
      subAdmin = { id: createdAdmin.id, email: createdAdmin.email };
    }

    return NextResponse.json({
      success: true,
      school: newSchool,
      subAdmin
    });
  } catch (error: any) {
    console.error('Error creating school:', error);
    return NextResponse.json({ error: error.message || 'Failed to create school' }, { status: 500 });
  }
}
