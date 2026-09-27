import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { trusts, users, schools } from '@/lib/db/schema';
import { eq, desc, sql } from 'drizzle-orm';

import { ensureMasterAdminSchema } from '@/lib/ensureMasterAdminSchema';

// Rebuild trigger 20260903-133500
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function ensureSchema() {
  await ensureMasterAdminSchema();
  try {
    await db.execute(sql`ALTER TABLE "Trust" ADD COLUMN IF NOT EXISTS "domainPurchaseUrl" text;`);
    await db.execute(sql`ALTER TABLE "Trust" ADD COLUMN IF NOT EXISTS "brevoApiKey" text;`);
    await db.execute(sql`ALTER TABLE "Trust" ADD COLUMN IF NOT EXISTS "brevoSenderEmail" varchar(255);`);
    await db.execute(sql`ALTER TABLE "Trust" ADD COLUMN IF NOT EXISTS "brevoSenderName" varchar(255);`);

    await db.execute(sql`ALTER TABLE "School" ADD COLUMN IF NOT EXISTS "domainPurchaseUrl" text;`);
    await db.execute(sql`ALTER TABLE "School" ADD COLUMN IF NOT EXISTS "brevoApiKey" text;`);
    await db.execute(sql`ALTER TABLE "School" ADD COLUMN IF NOT EXISTS "brevoSenderEmail" varchar(255);`);
    await db.execute(sql`ALTER TABLE "Trust" ADD COLUMN IF NOT EXISTS "status" varchar(50) DEFAULT 'ACTIVE';`);
    await db.execute(sql`ALTER TABLE "School" ADD COLUMN IF NOT EXISTS "status" varchar(50) DEFAULT 'ACTIVE';`);
    await db.execute(sql`ALTER TABLE "Trust" ADD COLUMN IF NOT EXISTS "sponsorshipMode" varchar(50) DEFAULT 'ZAKAT_LILLAH';`);
    await db.execute(sql`ALTER TABLE "School" ADD COLUMN IF NOT EXISTS "sponsorshipMode" varchar(50);`);
  } catch (err) {
    console.error('Schema migration exception:', err);
  }
}

export async function GET() {
  try {
    const allTrusts = await db.select().from(trusts);
    const allSchools = await db.select().from(schools);
    
    let allUsers: any[] = [];
    try {
      allUsers = await db.select({
        id: users.id,
        email: users.email,
        role: users.role
      }).from(users);
    } catch (uErr) {
      console.error('Safe user query catch:', uErr);
    }

    const enrichedTrusts = allTrusts.map(t => {
      const trustSchools = allSchools.filter(s => s.trustId === t.id);
      const superAdmin = allUsers.find(u => u.role === 'SUPER_ADMIN');
      return {
        ...t,
        schoolCount: trustSchools.length,
        superAdminEmail: superAdmin?.email || 'admin@mygurukul.org'
      };
    });

    return NextResponse.json({ success: true, trusts: enrichedTrusts });
  } catch (error: any) {
    console.error('API /api/master/trusts GET error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      // Trust Identity & Governance
      trustName, 
      slug, 
      registrationNo, 
      establishmentYear,
      presidentName,
      presidentNo,
      trusteesName,
      trusteesNo,
      logoUrl,
      primaryColor,
      bankAccountDetails,
      taxExemptionNo,
      sponsorshipMode,
      plan,
      maxSchools,
      maxAlumni,

      // Trust Gateways & Domains
      customDomain,
      domainPurchaseUrl,
      razorpayKeyId, 
      razorpayKeySecret, 
      brevoApiKey,
      brevoSenderEmail,
      brevoSenderName,

      // SuperAdmin User Credentials
      superAdminName, 
      superAdminEmail, 
      superAdminPassword,
      superAdminPhone,

      // Multiple Schools Provisioning Array
      schoolsList,

      // Fallback single school fields
      schoolName,
      schoolDiseNo,
      medium,
      schoolAddress,
      schoolPhone,
      schoolEmail,
      establishYear,
      totalStandards,
      currentStudentsNo,
      isHaveRTE,
      schoolLogoUrl,
      schoolSubdomain,
      schoolCustomDomain,
      schoolDomainDescription,
      schoolRazorpayKeyId,
      schoolRazorpayKeySecret,
      schoolSponsorshipMode
    } = body;

    if (!trustName || !slug || !superAdminEmail || !superAdminPassword) {
      return NextResponse.json({ error: 'Trust Name, Subdomain Slug, SuperAdmin Email & Password are required' }, { status: 400 });
    }

    const effectiveSponsorshipMode = (sponsorshipMode === 'DONATION' || sponsorshipMode === 'ZAKAT_LILLAH') ? sponsorshipMode : 'ZAKAT_LILLAH';

    // 1. Insert Trust Record
    const [newTrust] = await db.insert(trusts).values({
      trustName,
      slug,
      registrationNo: registrationNo || `REG-${Date.now()}`,
      establishmentYear: establishmentYear ? parseInt(establishmentYear) : null,
      presidentName: presidentName || null,
      presidentNo: presidentNo || null,
      trusteesName: trusteesName ? (Array.isArray(trusteesName) ? trusteesName : [trusteesName]) : [],
      trusteesNo: trusteesNo ? (Array.isArray(trusteesNo) ? trusteesNo : [trusteesNo]) : [],
      customDomain: customDomain || null,
      domainPurchaseUrl: domainPurchaseUrl || null,
      logoUrl: logoUrl || null,
      primaryColor: primaryColor || '#0f172a',
      bankAccountDetails: bankAccountDetails || null,
      taxExemptionNo: taxExemptionNo || null,
      sponsorshipMode: effectiveSponsorshipMode,
      razorpayKeyId: razorpayKeyId || null,
      razorpayKeySecret: razorpayKeySecret || null,
      brevoApiKey: brevoApiKey || null,
      brevoSenderEmail: brevoSenderEmail || null,
      brevoSenderName: brevoSenderName || null,
      plan: plan || 'PRO',
      maxSchools: maxSchools ? parseInt(maxSchools) : 10,
      maxAlumni: maxAlumni ? parseInt(maxAlumni) : 10000,
      status: 'ACTIVE'
    }).returning();

    // 2. Build Schools Array to insert
    const schoolsToCreate: any[] = [];
    if (Array.isArray(schoolsList) && schoolsList.length > 0) {
      schoolsList.forEach(s => {
        if (s.schoolName && s.schoolName.trim()) {
          schoolsToCreate.push(s);
        }
      });
    } else if (schoolName && schoolName.trim()) {
      schoolsToCreate.push({
        schoolName,
        schoolDiseNo,
        medium,
        address: schoolAddress,
        phoneNo: schoolPhone,
        email: schoolEmail,
        establishYear,
        totalStandards,
        currentStudentsNo,
        isHaveRTE,
        logoUrl: schoolLogoUrl,
        subdomain: schoolSubdomain,
        customDomain: schoolCustomDomain,
        domainDescription: schoolDomainDescription,
        razorpayKeyId: schoolRazorpayKeyId,
        razorpayKeySecret: schoolRazorpayKeySecret
      });
    }

    const createdSchools: any[] = [];
    let firstSchoolId: string | null = null;

    for (const item of schoolsToCreate) {
      const [createdSchool] = await db.insert(schools).values({
        schoolName: item.schoolName,
        schoolDiseNo: item.schoolDiseNo || `DISE-${Date.now()}-${Math.floor(Math.random()*1000)}`,
        medium: item.medium || 'English',
        address: item.address || item.schoolAddress || null,
        phoneNo: item.phoneNo || item.schoolPhone || null,
        email: item.email || item.schoolEmail || null,
        establishYear: item.establishYear ? parseInt(item.establishYear) : null,
        totalStandards: item.totalStandards ? parseInt(item.totalStandards) : 10,
        currentStudentsNo: item.currentStudentsNo ? parseInt(item.currentStudentsNo) : 0,
        isHaveRTE: Boolean(item.isHaveRTE),
        logoUrl: item.logoUrl || item.schoolLogoUrl || logoUrl || null,
        subdomain: item.subdomain || item.schoolSubdomain || `${slug}-${createdSchools.length + 1}`,
        customDomain: item.customDomain || item.schoolCustomDomain || null,
        domainPurchaseUrl: item.domainPurchaseUrl || item.schoolDomainPurchaseUrl || null,
        domainDescription: item.domainDescription || item.schoolDomainDescription || null,
        razorpayKeyId: item.razorpayKeyId || item.schoolRazorpayKeyId || razorpayKeyId || null,
        razorpayKeySecret: item.razorpayKeySecret || item.schoolRazorpayKeySecret || razorpayKeySecret || null,
        brevoApiKey: item.brevoApiKey || item.schoolBrevoApiKey || null,
        brevoSenderEmail: item.brevoSenderEmail || item.schoolBrevoSenderEmail || null,
        brevoSenderName: item.brevoSenderName || item.schoolBrevoSenderName || null,
        sponsorshipMode: item.sponsorshipMode || item.schoolSponsorshipMode || effectiveSponsorshipMode,
        trustId: newTrust.id
      }).returning();

      if (!firstSchoolId) firstSchoolId = createdSchool.id;
      createdSchools.push(createdSchool);

      // Provision SubAdmin for this school if credentials provided
      if (item.subAdminEmail && item.subAdminPassword) {
        await db.insert(users).values({
          name: item.subAdminName || `${item.schoolName} Officer`,
          email: item.subAdminEmail,
          password: item.subAdminPassword,
          phoneNo: item.subAdminPhone || null,
          role: 'SUB_ADMIN',
          schoolId: createdSchool.id
        });
      }
    }

    // 3. Create Primary SuperAdmin User
    const [newAdmin] = await db.insert(users).values({
      name: superAdminName || `${trustName} SuperAdmin`,
      email: superAdminEmail,
      password: superAdminPassword,
      phoneNo: superAdminPhone || null,
      role: 'SUPER_ADMIN',
      schoolId: firstSchoolId
    }).returning();

    return NextResponse.json({
      success: true,
      trust: newTrust,
      schools: createdSchools,
      superAdmin: { id: newAdmin.id, email: newAdmin.email }
    });
  } catch (error: any) {
    console.error('Error creating trust:', error);
    return NextResponse.json({ error: error.message || 'Failed to create trust' }, { status: 500 });
  }
}
