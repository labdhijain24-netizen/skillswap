import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Bell,
  BellOff,
  CheckCheck,
  ArrowRightLeft,
  MessageSquare,
  Calendar,
  Star,
  Sparkles,
  X,
  ExternalLink,
} from 'lucide-react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../../services/notificationClient';
import { supabase } from '../../services/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const ICON_MAP = {
  swap_request_received: <ArrowRightLeft className="w-4 h-4 text-butter" />,
  swap_request_accepted: <Sparkles className="w-4 h-4 text-sage-dark" />,
  swap_request_rejected: <X className="w-4 h-4 text-coral" />,
  new_message: <MessageSquare className="w-4 h-4 text-lavender" />,
  session_scheduled: <Calendar className="w-4 h-4 text-sage-dark" />,
  session_rescheduled: <Calendar className="w-4 h-4 text-butter" />,
  session_cancelled: <Calendar className="w-4 h-4 text-coral" />,
  session_completed: <Star className="w-4 h-4 text-butter" />,
  review_received: <Star className="w-4 h-4 text-butter" />,
  system: <Bell className="w-4 h-4 text-dusty" />,
};

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function NotificationPanel({ onNavigate }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef(null);
  const { user } = useAuth();
  const toast = useToast();

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const fetchNotifications = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const data = await getUserNotifications(user.id);
      setNotifications(data || []);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user?.id]);

  // Realtime subscription for new notifications
  useEffect(() => {
    if (!user?.id || !supabase) return;

    const channelId = `notifications:${user.id}:${Math.random().toString(36).slice(2, 7)}`;
    const channel = supabase.channel(channelId);

    try {
      channel
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            const newNotif = payload.new;
            setNotifications((prev) => {
              if (prev.some((n) => n.id === newNotif.id)) return prev;
              return [newNotif, ...prev];
            });
            // Show toast for new notifications
            toast.info(newNotif.title || 'New Notification', newNotif.body || '');
          }
        )
        .subscribe();
    } catch (err) {
      console.warn('Realtime notifications channel setup note:', err);
    }

    return () => {
      try {
        supabase.removeChannel(channel);
      } catch (e) {}
    };
  }, [user?.id]);

  // Close panel on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const handleMarkAsRead = async (notifId) => {
    try {
      await markNotificationAsRead(notifId, user.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notifId ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead(user.id);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      toast.success('All Clear ✨', 'All notifications marked as read.');
    } catch (err) {
      toast.warning('Error', 'Could not mark all as read.');
    }
  };

  const handleNotifClick = (notif) => {
    if (!notif.is_read) handleMarkAsRead(notif.id);
    if (notif.action_url && onNavigate) {
      onNavigate(notif.action_url);
    }
    setOpen(false);
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Trigger */}
      <button
        onClick={() => {
          setOpen(!open);
          if (!open) fetchNotifications();
        }}
        className="relative p-2 rounded-xl bg-white border border-charcoal/20 hover:border-charcoal transition shadow-sm"
        title="Notifications"
      >
        <Bell className="w-4.5 h-4.5 text-charcoal" />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-coral text-white text-[10px] font-black flex items-center justify-center border-2 border-ivory animate-bounce">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="absolute right-0 top-full mt-2 w-96 max-h-[520px] bg-white rounded-3xl border-2 border-charcoal/20 shadow-pop overflow-hidden z-50"
          >
            {/* Header */}
            <div className="px-5 py-3.5 bg-ivory border-b-2 border-charcoal/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-dusty" />
                <h3 className="font-serif font-bold text-sm text-charcoal">
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <Badge variant="dusty" size="xs">{unreadCount} new</Badge>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-[11px] font-bold text-dusty hover:text-charcoal transition flex items-center gap-1"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Mark all read
                </button>
              )}
            </div>

            {/* Notification List */}
            <div className="overflow-y-auto max-h-[420px] divide-y divide-charcoal/5">
              {loading ? (
                <div className="py-12 text-center">
                  <div className="animate-spin rounded-full h-7 w-7 border-2 border-dusty border-t-transparent mx-auto mb-2" />
                  <p className="text-xs text-charcoal-muted">Loading...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="py-12 text-center px-6">
                  <BellOff className="w-10 h-10 text-dusty mx-auto mb-2 opacity-40" />
                  <p className="font-serif font-bold text-sm text-charcoal">
                    All Caught Up!
                  </p>
                  <p className="text-[11px] text-charcoal-muted mt-1">
                    When swappers interact with you, their updates will appear here.
                  </p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <button
                    key={notif.id}
                    onClick={() => handleNotifClick(notif)}
                    className={`w-full text-left px-5 py-3.5 flex items-start gap-3 transition hover:bg-ivory/80 ${
                      notif.is_read ? 'opacity-70' : 'bg-butter-soft/30'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-ivory border border-charcoal/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                      {ICON_MAP[notif.type] || ICON_MAP.system}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="text-xs font-bold text-charcoal truncate">
                          {notif.title}
                        </span>
                        {!notif.is_read && (
                          <span className="w-2 h-2 rounded-full bg-coral flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-charcoal-muted leading-relaxed line-clamp-2">
                        {notif.body}
                      </p>
                      <span className="text-[10px] text-charcoal-muted/60 mt-1 block">
                        {timeAgo(notif.created_at)}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
