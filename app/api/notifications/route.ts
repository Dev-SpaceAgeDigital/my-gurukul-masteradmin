import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSessionFromCookies } from '@/lib/auth';
import { ensureNotificationTable } from '@/lib/notifications';

async function getCurrentSession() {
  const adminSession = await getSessionFromCookies('ADMIN');
  if (adminSession) return adminSession;
  return getSessionFromCookies('ALUMNI');
}

export async function GET() {
  try {
    const session = await getCurrentSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await ensureNotificationTable();

    const [notifications, unread] = await Promise.all([
      pool.query(
        `SELECT *
         FROM "Notification"
         WHERE "recipientRole" = $1 AND "recipientId" = $2
         ORDER BY "createdAt" DESC
         LIMIT 40`,
        [session.role, session.userId]
      ),
      pool.query(
        `SELECT COUNT(*)::int AS count
         FROM "Notification"
         WHERE "recipientRole" = $1 AND "recipientId" = $2 AND "isRead" = false`,
        [session.role, session.userId]
      ),
    ]);

    return NextResponse.json({
      notifications: notifications.rows,
      unreadCount: unread.rows[0]?.count || 0,
    });
  } catch (error) {
    console.error('Notifications fetch error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getCurrentSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id, action } = await request.json();
    await ensureNotificationTable();

    if (action === 'read-all') {
      await pool.query(
        `UPDATE "Notification"
         SET "isRead" = true, "readAt" = NOW()
         WHERE "recipientRole" = $1 AND "recipientId" = $2 AND "isRead" = false`,
        [session.role, session.userId]
      );
      return NextResponse.json({ success: true });
    }

    if (!id) {
      return NextResponse.json({ error: 'Notification id is required' }, { status: 400 });
    }

    await pool.query(
      `UPDATE "Notification"
       SET "isRead" = true, "readAt" = NOW()
       WHERE id = $1 AND "recipientRole" = $2 AND "recipientId" = $3`,
      [id, session.role, session.userId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Notification update error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
