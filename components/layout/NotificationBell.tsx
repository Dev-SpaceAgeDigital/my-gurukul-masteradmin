'use client';

import { useEffect, useRef, useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';

type NotificationBellProps = {
  role: 'SUPER_ADMIN' | 'SUB_ADMIN' | 'ALUMNI';
  variant?: 'subadmin' | 'default';
};

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  type: string;
  priority: string;
  link?: string | null;
  isRead: boolean;
  createdAt: string;
};

function formatTime(value: string) {
  const date = new Date(value);
  const diff = Date.now() - date.getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) return 'Now';
  if (diff < hour) return `${Math.floor(diff / minute)}m`;
  if (diff < day) return `${Math.floor(diff / hour)}h`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function NotificationBell({ role, variant = 'default' }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const loadNotifications = async () => {
    try {
      const response = await fetch('/api/notifications', { cache: 'no-store' });
      if (!response.ok) return;
      const data = await response.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch {}
  };

  useEffect(() => {
    loadNotifications();
    const timer = window.setInterval(loadNotifications, 15000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  const markRead = async (id: string, link?: string | null) => {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action: 'read' }),
    }).catch(() => {});
    await loadNotifications();
    if (link) window.location.href = link;
  };

  const markAllRead = async () => {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'read-all' }),
    }).catch(() => {});
    await loadNotifications();
  };

  const isSubadminTopbar = variant === 'subadmin';
  const buttonClass = isSubadminTopbar
    ? 'relative p-2.5 bg-white/80 hover:bg-white border border-[#E6DFD3] rounded-xl text-slate-600 hover:text-slate-900 transition-all flex items-center justify-center shadow-sm cursor-pointer group'
    : `relative p-2 transition-colors ${role === 'ALUMNI' ? 'text-slate-600 hover:text-blue-600' : 'text-slate-400 hover:text-[#3f72af]'}`;

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button className={buttonClass} onClick={() => setOpen((value) => !value)} title="Notifications">
        <Bell size={isSubadminTopbar ? 17 : 20} className="transition-transform group-hover:scale-105" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white shadow-sm animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-[min(22rem,calc(100vw-2rem))] bg-white border border-slate-200/70 rounded-2xl shadow-2xl z-[80] overflow-hidden">
          <div className="px-4 py-3 flex items-center justify-between border-b border-slate-100">
            <div>
              <p className="text-sm font-bold text-slate-900">Notifications</p>
              <p className="text-[11px] text-slate-500">{unreadCount} unread</p>
            </div>
            <button
              onClick={markAllRead}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              title="Mark all as read"
            >
              <CheckCheck size={16} />
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm text-slate-500">No notifications yet</div>
            ) : (
              notifications.map((item) => (
                <button
                  key={item.id}
                  onClick={() => markRead(item.id, item.link)}
                  className={`w-full text-left px-4 py-3 border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors ${item.isRead ? 'bg-white' : 'bg-blue-50/60'}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-900 leading-snug">{item.title}</p>
                    <span className="text-[10px] font-semibold text-slate-400 shrink-0">{formatTime(item.createdAt)}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed line-clamp-2">{item.message}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{item.type}</span>
                    {!item.isRead && <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
