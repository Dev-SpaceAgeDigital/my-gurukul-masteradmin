import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSessionFromCookies } from '@/lib/auth';
import { ensureAlumniFeedInteractions } from '@/lib/ensureAlumniFeedInteractions';

export const dynamic = 'force-dynamic';

async function enrichItemsWithInteractions(items: any[], currentAlumniId: string) {
  if (!Array.isArray(items) || items.length === 0) return items;

  const itemIds = items.map((i) => i.id).filter(Boolean);
  if (itemIds.length === 0) return items;

  try {
    const [likesRes, viewsRes] = await Promise.all([
      pool.query(
        `SELECT 
          "feedItemId",
          COUNT(*)::int as "likeCount",
          BOOL_OR("alumniId" = $1) as "userLiked"
        FROM "AlumniFeedLike"
        WHERE "feedItemId" = ANY($2::uuid[])
        GROUP BY "feedItemId"`,
        [currentAlumniId, itemIds]
      ),
      pool.query(
        `SELECT 
          "feedItemId",
          COUNT(*)::int as "viewCount"
        FROM "AlumniFeedView"
        WHERE "feedItemId" = ANY($1::uuid[])
        GROUP BY "feedItemId"`,
        [itemIds]
      ),
    ]);

    const likesMap = new Map<string, { likeCount: number; userLiked: boolean }>();
    likesRes.rows.forEach((row) => {
      likesMap.set(row.feedItemId, {
        likeCount: row.likeCount || 0,
        userLiked: Boolean(row.userLiked),
      });
    });

    const viewsMap = new Map<string, number>();
    viewsRes.rows.forEach((row) => {
      viewsMap.set(row.feedItemId, row.viewCount || 0);
    });

    return items.map((item) => {
      const likeInfo = likesMap.get(item.id) || { likeCount: 0, userLiked: false };
      const viewCount = viewsMap.get(item.id) || 0;
      return {
        ...item,
        likeCount: likeInfo.likeCount,
        userLiked: likeInfo.userLiked,
        viewCount,
      };
    });
  } catch (err) {
    console.error('Error enriching items with interactions:', err);
    return items.map((item) => ({
      ...item,
      likeCount: item.likeCount || 0,
      userLiked: item.userLiked || false,
      viewCount: item.viewCount || 0,
    }));
  }
}

export async function GET(req: Request) {
  try {
    const session = await getSessionFromCookies('ALUMNI');
    if (!session || session.role !== 'ALUMNI') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await ensureAlumniFeedInteractions();

    const { searchParams } = new URL(req.url);
    const tab = searchParams.get('tab') || 'feed';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const offset = (page - 1) * limit;

    const currentAlumniId = (session as any).alumniId || session.userId;

    if (tab === 'feed' || tab === 'all') {
      const fetchLimit = limit * page + 1; // Fetch 1 extra to check hasMore

      const achievementsRes = await pool.query(`
        SELECT 
          'achievement' as "itemType", ac.id, ac.title, ac.description as "content", ac.category as "badge", ac."mediaUrl", ac."createdAt",
          a.name as "alumniName", a."currentTitle", a."batchYear", a."profilePic", a.id as "alumniId", a.email as "alumniEmail",
          s."schoolName"
        FROM "Achievement" ac
        JOIN "Alumni" a ON ac."alumniId" = a.id
        JOIN "School" s ON ac."schoolId" = s.id
        WHERE ac.status = 'APPROVED'
        ORDER BY ac."createdAt" DESC
        LIMIT ${fetchLimit}
      `).catch(() => ({ rows: [] }));

      const storiesRes = await pool.query(`
        SELECT 
          'story' as "itemType", b.id, b.title, b.content, 'Story / Blog' as "badge", b."mediaUrl", b."createdAt",
          a.name as "alumniName", a."currentTitle", a."batchYear", a."profilePic", a.id as "alumniId", a.email as "alumniEmail",
          s."schoolName"
        FROM "Blog" b
        JOIN "Alumni" a ON b."alumniId" = a.id
        JOIN "School" s ON b."schoolId" = s.id
        WHERE b.status = 'APPROVED'
        ORDER BY b."createdAt" DESC
        LIMIT ${fetchLimit}
      `).catch(() => ({ rows: [] }));

      const careersRes = await pool.query(`
        SELECT 
          LOWER(co.type) as "itemType", co.id, co.role as "title", co.description as "content", 
          CONCAT(co."companyName", ' (', co.type, ')') as "badge", NULL as "mediaUrl", co."createdAt",
          a.name as "alumniName", a."currentTitle", a."batchYear", a."profilePic", a.id as "alumniId", a.email as "alumniEmail",
          s."schoolName"
        FROM "CareerOpportunity" co
        JOIN "Alumni" a ON co."alumniId" = a.id
        JOIN "School" s ON co."schoolId" = s.id
        WHERE co.status = 'APPROVED'
        ORDER BY co."createdAt" DESC
        LIMIT ${fetchLimit}
      `).catch(() => ({ rows: [] }));

      const mentorshipsRes = await pool.query(`
        SELECT 
          'mentorship' as "itemType", mo.id, mo.title, mo.description as "content", 
          CONCAT('Mentorship · ', mo."targetStudent") as "badge", NULL as "mediaUrl", mo."createdAt",
          a.name as "alumniName", a."currentTitle", a."batchYear", a."profilePic", a.id as "alumniId", a.email as "alumniEmail",
          s."schoolName"
        FROM "MentorshipOffer" mo
        JOIN "Alumni" a ON mo."alumniId" = a.id
        JOIN "School" s ON mo."schoolId" = s.id
        WHERE mo.status = 'APPROVED'
        ORDER BY mo."createdAt" DESC
        LIMIT ${fetchLimit}
      `).catch(() => ({ rows: [] }));

      const allMerged = [
        ...achievementsRes.rows,
        ...storiesRes.rows,
        ...careersRes.rows,
        ...mentorshipsRes.rows,
      ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      const slicedItems = allMerged.slice(offset, offset + limit);
      const hasMore = allMerged.length > offset + limit;

      const [enrichedItems, [jobsCountRes, achievementsCountRes, mentorshipsCountRes, storiesCountRes]] = await Promise.all([
        enrichItemsWithInteractions(slicedItems, currentAlumniId),
        Promise.all([
          pool.query(`SELECT COUNT(*)::int as count FROM "CareerOpportunity" WHERE status = 'APPROVED'`).catch(() => ({ rows: [{ count: 0 }] })),
          pool.query(`SELECT COUNT(*)::int as count FROM "Achievement" WHERE status = 'APPROVED'`).catch(() => ({ rows: [{ count: 0 }] })),
          pool.query(`SELECT COUNT(*)::int as count FROM "MentorshipOffer" WHERE status = 'APPROVED'`).catch(() => ({ rows: [{ count: 0 }] })),
          pool.query(`SELECT COUNT(*)::int as count FROM "Blog" WHERE status = 'APPROVED'`).catch(() => ({ rows: [{ count: 0 }] })),
        ])
      ]);

      const trending = [
        { tag: '#TechCareerReferrals', category: 'Jobs & Internships', count: jobsCountRes.rows[0]?.count || 0, filterId: 'jobs' },
        { tag: '#SuccessWall', category: 'Achievements', count: achievementsCountRes.rows[0]?.count || 0, filterId: 'achievements' },
        { tag: '#Mentorship2026', category: 'Mentorship', count: mentorshipsCountRes.rows[0]?.count || 0, filterId: 'mentorships' },
        { tag: '#AlumniVoices', category: 'Stories & Blogs', count: storiesCountRes.rows[0]?.count || 0, filterId: 'stories' },
      ];

      return NextResponse.json({ items: enrichedItems, page, hasMore, trending });
    }

    if (tab === 'stories') {
      const res = await pool.query(`
        SELECT 
          'story' as "itemType", b.id, b.title, b.content, b."mediaUrl", b."createdAt",
          a.name as "alumniName", a."currentTitle", a."batchYear", a."profilePic", a.id as "alumniId", a.email as "alumniEmail",
          s."schoolName"
        FROM "Blog" b
        JOIN "Alumni" a ON b."alumniId" = a.id
        JOIN "School" s ON b."schoolId" = s.id
        WHERE b.status = 'APPROVED'
        ORDER BY b."isTopFeatured" DESC, b."isFeatured" DESC, b."createdAt" DESC
        LIMIT 30
      `);
      const enriched = await enrichItemsWithInteractions(res.rows, currentAlumniId);
      return NextResponse.json({ items: enriched });
    }

    if (tab === 'achievements') {
      const res = await pool.query(`
        SELECT 
          'achievement' as "itemType", ac.id, ac.title, ac.description as "content", ac.category as "badge", ac."mediaUrl", ac."createdAt",
          a.name as "alumniName", a."currentTitle", a."batchYear", a."profilePic", a.id as "alumniId", a.email as "alumniEmail",
          s."schoolName"
        FROM "Achievement" ac
        JOIN "Alumni" a ON ac."alumniId" = a.id
        JOIN "School" s ON ac."schoolId" = s.id
        WHERE ac.status = 'APPROVED'
        ORDER BY ac."isFeatured" DESC, ac."createdAt" DESC
        LIMIT 30
      `);
      const enriched = await enrichItemsWithInteractions(res.rows, currentAlumniId);
      return NextResponse.json({ items: enriched });
    }

    if (tab === 'jobs') {
      let rows: any[] = [];
      try {
        const res = await pool.query(`
          SELECT 
            'job' as "itemType", co.id, co.role as "title", co.description as "content", 
            CONCAT(co."companyName", ' (', co.type, ')') as "badge", NULL as "mediaUrl", co."createdAt",
            a.name as "alumniName", a."currentTitle", a."batchYear", a."profilePic", a.id as "alumniId", a.email as "alumniEmail",
            s."schoolName"
          FROM "CareerOpportunity" co
          JOIN "Alumni" a ON co."alumniId" = a.id
          JOIN "School" s ON co."schoolId" = s.id
          WHERE co.status = 'APPROVED' AND co.type = 'JOB'
          ORDER BY co."createdAt" DESC
          LIMIT 30
        `);
        rows = res.rows;
      } catch (_) {}
      const enriched = await enrichItemsWithInteractions(rows, currentAlumniId);
      return NextResponse.json({ items: enriched });
    }

    if (tab === 'internships') {
      let rows: any[] = [];
      try {
        const res = await pool.query(`
          SELECT 
            'internship' as "itemType", co.id, co.role as "title", co.description as "content", 
            CONCAT(co."companyName", ' (', co.type, ')') as "badge", NULL as "mediaUrl", co."createdAt",
            a.name as "alumniName", a."currentTitle", a."batchYear", a."profilePic", a.id as "alumniId", a.email as "alumniEmail",
            s."schoolName"
          FROM "CareerOpportunity" co
          JOIN "Alumni" a ON co."alumniId" = a.id
          JOIN "School" s ON co."schoolId" = s.id
          WHERE co.status = 'APPROVED' AND co.type = 'INTERNSHIP'
          ORDER BY co."createdAt" DESC
          LIMIT 30
        `);
        rows = res.rows;
      } catch (_) {}
      const enriched = await enrichItemsWithInteractions(rows, currentAlumniId);
      return NextResponse.json({ items: enriched });
    }

    if (tab === 'mentorships') {
      let rows: any[] = [];
      try {
        const res = await pool.query(`
          SELECT 
            'mentorship' as "itemType", mo.id, mo.title, mo.description as "content", 
            CONCAT('Mentorship · ', mo."targetStudent") as "badge", NULL as "mediaUrl", mo."createdAt",
            a.name as "alumniName", a."currentTitle", a."batchYear", a."profilePic", a.id as "alumniId", a.email as "alumniEmail",
            s."schoolName"
          FROM "MentorshipOffer" mo
          JOIN "Alumni" a ON mo."alumniId" = a.id
          JOIN "School" s ON mo."schoolId" = s.id
          WHERE mo.status = 'APPROVED'
          ORDER BY mo."createdAt" DESC
          LIMIT 30
        `);
        rows = res.rows;
      } catch (_) {}
      const enriched = await enrichItemsWithInteractions(rows, currentAlumniId);
      return NextResponse.json({ items: enriched });
    }

    if (tab === 'toppers') {
      const res = await pool.query(`
        SELECT 
          se.id,
          se."studentName",
          se."percentage",
          se."rank",
          se."marks",
          se."totalMarks",
          se."academicYear",
          std."standardName",
          std.stream,
          s."schoolName"
        FROM "StudentEnrollment" se
        JOIN "Standard" std ON se."standardId" = std.id
        JOIN "School" s ON se."schoolId" = s.id
        WHERE se."isTopper" = true
        ORDER BY s."schoolName" ASC, std."standardName" ASC, se."percentage" DESC NULLS LAST
        LIMIT 100
      `);
      return NextResponse.json({ items: res.rows });
    }

    return NextResponse.json({ items: [] });
  } catch (err: any) {
    console.error('Alumni community route error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
