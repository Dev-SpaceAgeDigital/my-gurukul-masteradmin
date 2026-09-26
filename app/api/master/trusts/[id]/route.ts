import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { trusts, schools, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Trust ID is required' }, { status: 400 });
    }

    const [trust] = await db.select().from(trusts).where(eq(trusts.id, id));
    if (!trust) {
      return NextResponse.json({ error: 'Trust not found' }, { status: 404 });
    }

    const trustSchools = await db.select().from(schools).where(eq(schools.trustId, trust.id));
    
    // Fetch all users associated with this trust (SuperAdmins & SubAdmins of its schools)
    const schoolIds = trustSchools.map(s => s.id);
    const allUsers = await db.select().from(users);

    const trustUsers = allUsers.filter(u => u.schoolId && schoolIds.includes(u.schoolId));

    return NextResponse.json({
      success: true,
      trust,
      schools: trustSchools,
      users: trustUsers
    });
  } catch (error: any) {
    console.error('Error fetching trust details:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const {
      // Step 1: Trust Identity & Governance
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
      status,

      // SuperAdmin Credentials
      superAdminId,
      superAdminName,
      superAdminEmail,
      superAdminPassword,
      superAdminPhone,

      // Domains & Gateways
      customDomain,
      domainPurchaseUrl,
      razorpayKeyId,
      razorpayKeySecret,
      brevoApiKey,
      brevoSenderEmail,
      brevoSenderName,

      // Step 3: Schools List Array
      schoolsList
    } = body;

    const effectiveSponsorshipMode = (sponsorshipMode === 'DONATION' || sponsorshipMode === 'ZAKAT_LILLAH') ? sponsorshipMode : undefined;

    // 1. Update Trust Record
    const [updatedTrust] = await db
      .update(trusts)
      .set({
        trustName,
        slug,
        registrationNo,
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
        ...(effectiveSponsorshipMode ? { sponsorshipMode: effectiveSponsorshipMode } : {}),
        razorpayKeyId: razorpayKeyId || null,
        razorpayKeySecret: razorpayKeySecret || null,
        brevoApiKey: brevoApiKey || null,
        brevoSenderEmail: brevoSenderEmail || null,
        brevoSenderName: brevoSenderName || null,
        plan: plan || 'PRO',
        maxSchools: maxSchools ? parseInt(maxSchools) : 10,
        maxAlumni: maxAlumni ? parseInt(maxAlumni) : 10000,
        status: status || 'ACTIVE',
        updatedAt: new Date()
      })
      .where(eq(trusts.id, id))
      .returning();

    // 2. Update SuperAdmin User Record if provided
    if (superAdminEmail && superAdminEmail.trim()) {
      if (superAdminId) {
        // Check if email belongs to another user
        const existingEmailUser = await db.select().from(users).where(eq(users.email, superAdminEmail.trim()));
        if (existingEmailUser.length > 0 && existingEmailUser[0].id !== superAdminId) {
          return NextResponse.json({ error: `The email address '${superAdminEmail}' is already registered to another user.` }, { status: 400 });
        }

        const setPayload: any = {
          name: superAdminName || `${trustName} SuperAdmin`,
          email: superAdminEmail.trim(),
          phoneNo: superAdminPhone ? superAdminPhone.trim() : null,
          updatedAt: new Date()
        };
        if (superAdminPassword && superAdminPassword.trim()) {
          setPayload.password = superAdminPassword.trim();
        }
        await db.update(users).set(setPayload).where(eq(users.id, superAdminId));
      } else {
        // Create SuperAdmin if missing
        const existingEmailUser = await db.select().from(users).where(eq(users.email, superAdminEmail.trim()));
        if (existingEmailUser.length > 0) {
          return NextResponse.json({ error: `The email address '${superAdminEmail}' is already registered.` }, { status: 400 });
        }

        await db.insert(users).values({
          name: superAdminName || `${trustName} SuperAdmin`,
          email: superAdminEmail.trim(),
          password: (superAdminPassword && superAdminPassword.trim()) ? superAdminPassword.trim() : 'Admin@123',
          phoneNo: superAdminPhone ? superAdminPhone.trim() : null,
          role: 'SUPER_ADMIN'
        });
      }
    }

    // 3. Process Schools Array Updates / Inserts
    if (Array.isArray(schoolsList) && schoolsList.length > 0) {
      for (const item of schoolsList) {
        if (!item.schoolName || !item.schoolName.trim()) continue;

        let schoolId = item.id;
        if (schoolId) {
          // Update existing school
          await db.update(schools).set({
            schoolName: item.schoolName,
            schoolDiseNo: item.schoolDiseNo || null,
            medium: item.medium || 'English',
            address: item.address || item.schoolAddress || null,
            phoneNo: item.phoneNo || item.schoolPhone || null,
            email: item.email || item.schoolEmail || null,
            establishYear: item.establishYear ? parseInt(item.establishYear) : null,
            totalStandards: item.totalStandards ? parseInt(item.totalStandards) : 10,
            currentStudentsNo: item.currentStudentsNo ? parseInt(item.currentStudentsNo) : 0,
            isHaveRTE: Boolean(item.isHaveRTE),
            logoUrl: item.logoUrl || item.schoolLogoUrl || logoUrl || null,
            subdomain: item.subdomain || item.schoolSubdomain || slug,
            customDomain: item.customDomain || item.schoolCustomDomain || null,
            domainPurchaseUrl: item.domainPurchaseUrl || item.schoolDomainPurchaseUrl || null,
            domainDescription: item.domainDescription || item.schoolDomainDescription || null,
            razorpayKeyId: item.razorpayKeyId || item.schoolRazorpayKeyId || razorpayKeyId || null,
            razorpayKeySecret: item.razorpayKeySecret || item.schoolRazorpayKeySecret || razorpayKeySecret || null,
            brevoApiKey: item.brevoApiKey || item.schoolBrevoApiKey || null,
            brevoSenderEmail: item.brevoSenderEmail || item.schoolBrevoSenderEmail || null,
            brevoSenderName: item.brevoSenderName || item.schoolBrevoSenderName || null,
            updatedAt: new Date()
          }).where(eq(schools.id, schoolId));
        } else {
          // Insert new school under this trust
          const [newSchool] = await db.insert(schools).values({
            schoolName: item.schoolName,
            schoolDiseNo: item.schoolDiseNo || `DISE-${Date.now()}`,
            medium: item.medium || 'English',
            address: item.address || item.schoolAddress || null,
            phoneNo: item.phoneNo || item.schoolPhone || null,
            email: item.email || item.schoolEmail || null,
            establishYear: item.establishYear ? parseInt(item.establishYear) : null,
            totalStandards: item.totalStandards ? parseInt(item.totalStandards) : 10,
            currentStudentsNo: item.currentStudentsNo ? parseInt(item.currentStudentsNo) : 0,
            isHaveRTE: Boolean(item.isHaveRTE),
            logoUrl: item.logoUrl || item.schoolLogoUrl || logoUrl || null,
            subdomain: item.subdomain || item.schoolSubdomain || slug,
            customDomain: item.customDomain || item.schoolCustomDomain || null,
            domainPurchaseUrl: item.domainPurchaseUrl || item.schoolDomainPurchaseUrl || null,
            domainDescription: item.domainDescription || item.schoolDomainDescription || null,
            razorpayKeyId: item.razorpayKeyId || item.schoolRazorpayKeyId || razorpayKeyId || null,
            razorpayKeySecret: item.razorpayKeySecret || item.schoolRazorpayKeySecret || razorpayKeySecret || null,
            brevoApiKey: item.brevoApiKey || item.schoolBrevoApiKey || null,
            brevoSenderEmail: item.brevoSenderEmail || item.schoolBrevoSenderEmail || null,
            brevoSenderName: item.brevoSenderName || item.schoolBrevoSenderName || null,
            trustId: id
          }).returning();
          schoolId = newSchool.id;
        }

        // SubAdmin Officer creation/update if credentials provided
        if (item.subAdminEmail && item.subAdminEmail.trim()) {
          const existingSubAdmin = await db.select().from(users).where(eq(users.email, item.subAdminEmail.trim()));
          if (existingSubAdmin.length > 0) {
            const setPayload: any = {
              name: item.subAdminName || `${item.schoolName} Officer`,
              phoneNo: item.subAdminPhone ? item.subAdminPhone.trim() : null,
              schoolId: schoolId,
              role: 'SUB_ADMIN',
              updatedAt: new Date()
            };
            if (item.subAdminPassword && item.subAdminPassword.trim()) {
              setPayload.password = item.subAdminPassword.trim();
            }
            await db.update(users).set(setPayload).where(eq(users.id, existingSubAdmin[0].id));
          } else if (item.subAdminPassword && item.subAdminPassword.trim()) {
            await db.insert(users).values({
              name: item.subAdminName || `${item.schoolName} Officer`,
              email: item.subAdminEmail.trim(),
              password: item.subAdminPassword.trim(),
              phoneNo: item.subAdminPhone ? item.subAdminPhone.trim() : null,
              role: 'SUB_ADMIN',
              schoolId: schoolId
            });
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      trust: updatedTrust
    });
  } catch (error: any) {
    console.error('Error updating trust:', error);
    if (error.code === '23505' || error.message?.includes('unique constraint')) {
      return NextResponse.json({ error: 'A user with this email address already exists. Please use a unique email address.' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Failed to update trust' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Trust ID is required' }, { status: 400 });
    }

    // 1. Fetch schools for this trust
    const trustSchools = await db.select().from(schools).where(eq(schools.trustId, id));
    const schoolIds = trustSchools.map(s => s.id);

    // 2. Delete linked users
    for (const sId of schoolIds) {
      await db.delete(users).where(eq(users.schoolId, sId));
    }

    // 3. Delete schools
    await db.delete(schools).where(eq(schools.trustId, id));

    // 4. Delete trust record
    const [deletedTrust] = await db.delete(trusts).where(eq(trusts.id, id)).returning();

    return NextResponse.json({
      success: true,
      message: 'Trust and associated schools deleted successfully',
      trust: deletedTrust
    });
  } catch (error: any) {
    console.error('Error deleting trust:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete trust' }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status } = await req.json();

    if (!id || !status) {
      return NextResponse.json({ error: 'Trust ID and status are required' }, { status: 400 });
    }

    const [updatedTrust] = await db
      .update(trusts)
      .set({ status, updatedAt: new Date() })
      .where(eq(trusts.id, id))
      .returning();

    return NextResponse.json({ success: true, trust: updatedTrust });
  } catch (error: any) {
    console.error('Error updating trust status:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
