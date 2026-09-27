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
      schoolSponsorshipMode,
      subAdminEmail,
      subAdminPassword,
      subAdminName,
      subAdminPhone
    } = body;

    if (!trustName || !slug || !superAdminEmail || !superAdminPassword) {
      return NextResponse.json({ error: 'Trust Name, Subdomain Slug, SuperAdmin Email & Password are required' }, { status: 400 });
    }

    const cleanInt = (v: any, defaultVal: number | null = null): number | null => {
      if (v === null || v === undefined || v === '') return defaultVal;
      const parsed = parseInt(String(v), 10);
      return isNaN(parsed) ? defaultVal : parsed;
    };

    const cleanStr = (v: any, defaultVal: string | null = null): string | null => {
      if (v === null || v === undefined) return defaultVal;
      const s = String(v).trim();
      return s.length > 0 ? s : defaultVal;
    };

    const effectiveSponsorshipMode = (sponsorshipMode === 'DONATION' || sponsorshipMode === 'ZAKAT_LILLAH') ? sponsorshipMode : 'ZAKAT_LILLAH';

    // 1. Insert Trust Record
    const [newTrust] = await db.insert(trusts).values({
      trustName: cleanStr(trustName)!,
      slug: cleanStr(slug)!,
      registrationNo: cleanStr(registrationNo) || `REG-${Date.now()}`,
      establishmentYear: cleanInt(establishmentYear),
      presidentName: cleanStr(presidentName),
      presidentNo: cleanStr(presidentNo),
      trusteesName: trusteesName ? (Array.isArray(trusteesName) ? trusteesName : [trusteesName]) : [],
      trusteesNo: trusteesNo ? (Array.isArray(trusteesNo) ? trusteesNo : [trusteesNo]) : [],
      customDomain: cleanStr(customDomain),
      domainPurchaseUrl: cleanStr(domainPurchaseUrl),
      logoUrl: cleanStr(logoUrl),
      primaryColor: cleanStr(primaryColor, '#0f172a')!,
      bankAccountDetails: cleanStr(bankAccountDetails),
      taxExemptionNo: cleanStr(taxExemptionNo),
      sponsorshipMode: effectiveSponsorshipMode,
      razorpayKeyId: cleanStr(razorpayKeyId),
      razorpayKeySecret: cleanStr(razorpayKeySecret),
      brevoApiKey: cleanStr(brevoApiKey),
      brevoSenderEmail: cleanStr(brevoSenderEmail),
      brevoSenderName: cleanStr(brevoSenderName),
      plan: cleanStr(plan, 'PRO')!,
      maxSchools: cleanInt(maxSchools, 10)!,
      maxAlumni: cleanInt(maxAlumni, 10000)!,
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
        razorpayKeySecret: schoolRazorpayKeySecret,
        subAdminEmail,
        subAdminPassword,
        subAdminName,
        subAdminPhone
      });
    }

    const createdSchools: any[] = [];
    let firstSchoolId: string | null = null;

    for (const item of schoolsToCreate) {
      const [createdSchool] = await db.insert(schools).values({
        schoolName: cleanStr(item.schoolName)!,
        schoolDiseNo: cleanStr(item.schoolDiseNo) || `DISE-${Date.now()}-${Math.floor(Math.random()*1000)}`,
        medium: cleanStr(item.medium, 'English')!,
        address: cleanStr(item.address) || cleanStr(item.schoolAddress),
        phoneNo: cleanStr(item.phoneNo) || cleanStr(item.schoolPhone),
        email: cleanStr(item.email) || cleanStr(item.schoolEmail),
        establishYear: cleanInt(item.establishYear),
        totalStandards: cleanInt(item.totalStandards, 10)!,
        currentStudentsNo: cleanInt(item.currentStudentsNo, 0)!,
        isHaveRTE: Boolean(item.isHaveRTE),
        logoUrl: cleanStr(item.logoUrl) || cleanStr(item.schoolLogoUrl) || cleanStr(logoUrl),
        subdomain: cleanStr(item.subdomain) || cleanStr(item.schoolSubdomain) || `${slug}-${createdSchools.length + 1}`,
        customDomain: cleanStr(item.customDomain) || cleanStr(item.schoolCustomDomain),
        domainPurchaseUrl: cleanStr(item.domainPurchaseUrl) || cleanStr(item.schoolDomainPurchaseUrl),
        domainDescription: cleanStr(item.domainDescription) || cleanStr(item.schoolDomainDescription),
        razorpayKeyId: cleanStr(item.razorpayKeyId) || cleanStr(item.schoolRazorpayKeyId) || cleanStr(razorpayKeyId),
        razorpayKeySecret: cleanStr(item.razorpayKeySecret) || cleanStr(item.schoolRazorpayKeySecret) || cleanStr(razorpayKeySecret),
        brevoApiKey: cleanStr(item.brevoApiKey) || cleanStr(item.schoolBrevoApiKey),
        brevoSenderEmail: cleanStr(item.brevoSenderEmail) || cleanStr(item.schoolBrevoSenderEmail),
        brevoSenderName: cleanStr(item.brevoSenderName) || cleanStr(item.schoolBrevoSenderName),
        sponsorshipMode: cleanStr(item.sponsorshipMode) || cleanStr(item.schoolSponsorshipMode) || effectiveSponsorshipMode,
        trustId: newTrust.id
      }).returning();

      if (!firstSchoolId) firstSchoolId = createdSchool.id;
      createdSchools.push(createdSchool);

      // Provision SubAdmin for this school if credentials provided
      const subAdminEmailToUse = cleanStr(item.subAdminEmail);
      const subAdminPasswordToUse = cleanStr(item.subAdminPassword);
      if (subAdminEmailToUse && subAdminPasswordToUse) {
        await db.insert(users).values({
          name: cleanStr(item.subAdminName) || `${item.schoolName} Officer`,
          email: subAdminEmailToUse,
          password: subAdminPasswordToUse,
          phoneNo: cleanStr(item.subAdminPhone),
          role: 'SUB_ADMIN',
          schoolId: createdSchool.id
        });
      }
    }

    // 3. Create Primary SuperAdmin User
    const [newAdmin] = await db.insert(users).values({
      name: cleanStr(superAdminName) || `${trustName} SuperAdmin`,
      email: cleanStr(superAdminEmail)!,
      password: cleanStr(superAdminPassword)!,
      phoneNo: cleanStr(superAdminPhone),
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
