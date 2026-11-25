import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ArrowRightLeft,
  Calendar,
  MessageSquare,
  Star,
  CheckCircle,
  Clock,
  User,
  BookOpen,
  TrendingUp,
  RefreshCw,
  Compass,
  MapPin,
  Award,
  Heart,
  Edit3,
  ExternalLink,
  ChevronRight,
  Inbox,
  Send,
  GraduationCap,
  BarChart3,
  CircleDot,
  Flame,
} from 'lucide-react';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { Sparkle } from '../components/ui/Doodles';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getDashboardData } from '../services/dashboardClient';

/* ─── Helpers ──────────────────────────────────── */

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function starArray(avg) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(i <= Math.round(avg) ? 'full' : 'empty');
  }
  return stars;
}

/* ─── Reusable Small Components ─────────────────── */

function StatCard({ icon, label, value, accent = 'bg-lavender/40' }) {
  return (
    <div className="bg-white rounded-2xl border-2 border-charcoal/15 p-4 flex items-center gap-3 shadow-sm hover:shadow-pop-sm transition-all">
      <div className={`w-10 h-10 rounded-xl ${accent} border border-charcoal/15 flex items-center justify-center flex-shrink-0`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-serif font-black text-charcoal leading-none">{value}</p>
        <p className="text-[11px] text-charcoal-muted font-medium mt-0.5">{label}</p>
      </div>
    </div>
  );
}

function MiniSwapCard({ request, direction, onClick }) {
  const partner = direction === 'incoming' ? request.sender : request.receiver;
  const offered = request.offered_skill?.name || 'Skill';
  const requested = request.requested_skill?.name || 'Skill';
  const statusColors = {
    pending: 'bg-butter/60 text-charcoal border-butter',
    accepted: 'bg-sage/40 text-charcoal border-sage',
    rejected: 'bg-coral-soft/60 text-charcoal border-coral/40',
    cancelled: 'bg-charcoal/10 text-charcoal-muted border-charcoal/20',
    completed: 'bg-lavender/40 text-charcoal border-lavender',
  };
  const statusClass = statusColors[request.status] || statusColors.pending;

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white rounded-2xl border border-charcoal/15 p-3.5 hover:border-charcoal hover:shadow-pop-sm transition-all flex items-center gap-3"
    >
      <img
        src={partner?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
        alt={partner?.full_name || 'User'}
        className="w-10 h-10 rounded-xl object-cover border border-charcoal/20 flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-charcoal truncate">
          {partner?.full_name || partner?.username || 'Fellow Swapper'}
        </p>
        <p className="text-[11px] text-charcoal-muted truncate">
          {direction === 'incoming' ? `Offers ${offered} · Wants ${requested}` : `You offer ${offered} · Want ${requested}`}
        </p>
      </div>
      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${statusClass} flex-shrink-0`}>
        {request.status}
      </span>
    </button>
  );
}

function MiniSessionCard({ session, currentUserId, onClick }) {
  const isTeacher = session.teacher_id === currentUserId;
  const partner = isTeacher ? session.learner : session.teacher;
  const startDate = session.scheduled_start ? new Date(session.scheduled_start) : null;
  const dateStr = startDate
    ? startDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    : 'TBD';
  const timeStr = startDate
    ? startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    : '';

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white rounded-2xl border border-charcoal/15 p-3.5 hover:border-charcoal hover:shadow-pop-sm transition-all flex items-center gap-3"
    >
      <div className={`w-10 h-10 rounded-xl ${isTeacher ? 'bg-sage/40 border-sage' : 'bg-lavender/40 border-lavender'} border flex items-center justify-center flex-shrink-0`}>
        {isTeacher ? <GraduationCap className="w-4.5 h-4.5 text-charcoal" /> : <BookOpen className="w-4.5 h-4.5 text-charcoal" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-charcoal truncate">
          {session.skill?.name || session.title || 'Learning Session'}
        </p>
        <p className="text-[11px] text-charcoal-muted truncate flex items-center gap-1">
          <Clock className="w-2.5 h-2.5" />
          {dateStr} · {timeStr}
          {partner && <span> · with {partner.full_name?.split(' ')[0]}</span>}
        </p>
      </div>
      <ChevronRight className="w-4 h-4 text-charcoal-muted flex-shrink-0" />
    </button>
  );
}

function MiniReviewCard({ review }) {
  const reviewer = review.reviewer || review.reviewee;
  return (
    <div className="bg-white rounded-2xl border border-charcoal/15 p-3.5">
      <div className="flex items-center gap-2 mb-2">
        <img
          src={reviewer?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
          alt=""
          className="w-7 h-7 rounded-lg object-cover border border-charcoal/20"
        />
        <div className="flex-1 min-w-0">
          <span className="text-xs font-bold text-charcoal truncate block">
            {reviewer?.full_name || reviewer?.username || 'Swapper'}
          </span>
          <span className="text-[10px] text-charcoal-muted">{timeAgo(review.created_at)}</span>
        </div>
        <div className="flex items-center gap-0.5">
          {starArray(review.rating).map((s, i) => (
            <Star
              key={i}
              className={`w-3 h-3 ${s === 'full' ? 'text-butter fill-butter' : 'text-charcoal/20'}`}
            />
          ))}
        </div>
      </div>
      {review.comment && (
        <p className="text-[11px] text-charcoal/80 italic leading-relaxed line-clamp-2">
          "{review.comment}"
        </p>
      )}
    </div>
  );
}

/* ─── Empty State ───────────────────────────────── */
function EmptyState({ icon, title, subtitle, action }) {
  return (
    <div className="py-8 text-center">
      <div className="w-12 h-12 rounded-2xl bg-lavender/30 border-2 border-charcoal/15 flex items-center justify-center mx-auto mb-3 opacity-60">
        {icon}
      </div>
      <h4 className="font-serif font-bold text-sm text-charcoal">{title}</h4>
      <p className="text-[11px] text-charcoal-muted mt-1 max-w-xs mx-auto">{subtitle}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/* ─── MAIN DASHBOARD PAGE ──────────────────────── */

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const { user, profile } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const loadDashboard = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const result = await getDashboardData(user.id);
      setData(result);
    } catch (err) {
      console.error('Dashboard load error:', err);
      toast.warning('Dashboard Error', 'Could not load some dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-dusty border-t-transparent mx-auto mb-4" />
        <p className="font-serif font-bold text-lg text-charcoal">Loading your dashboard...</p>
        <p className="text-xs text-charcoal-muted mt-1">Fetching your skill exchange activity from the database</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <p className="font-serif font-bold text-lg text-charcoal">Dashboard unavailable</p>
        <Button variant="outline" size="sm" onClick={loadDashboard} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  const {
    profileCompletion,
    teachingSkills,
    wantedSkills,
    requests,
    matches,
    sessions,
    reviews,
    stats,
    unreadNotifications,
  } = data;

  const displayProfile = data.profile || profile;
  const firstName = displayProfile?.full_name?.split(' ')[0] || 'Swapper';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">

      {/* ═══════════════════════════════════════════
          SECTION 1: Welcome Header + Quick Stats
          ═══════════════════════════════════════════ */}
      <section className="space-y-6">
        {/* Welcome */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={displayProfile?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
              alt={displayProfile?.full_name || 'Avatar'}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-charcoal shadow-pop-sm"
            />
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-butter/50 border border-charcoal/15 text-[10px] font-bold text-charcoal mb-1">
                <Sparkle className="w-3 h-3 text-dusty" />
                Personal Dashboard
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-black text-charcoal tracking-tight">
                {greeting()}, {firstName}! ✨
              </h1>
              <p className="text-xs text-charcoal-muted mt-0.5">
                Here's your skill exchange overview · Last refreshed {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={loadDashboard}
              leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/explore')}
              leftIcon={<Compass className="w-3.5 h-3.5 text-butter" />}
            >
              Explore Skills
            </Button>
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            icon={<GraduationCap className="w-5 h-5 text-dusty" />}
            label="Skills You Teach"
            value={stats.totalTeachingSkills}
            accent="bg-sage/30"
          />
          <StatCard
            icon={<BookOpen className="w-5 h-5 text-dusty" />}
            label="Skills to Learn"
            value={stats.totalWantedSkills}
            accent="bg-lavender/30"
          />
          <StatCard
            icon={<CheckCircle className="w-5 h-5 text-sage-dark" />}
            label="Sessions Completed"
            value={stats.totalCompletedSessions}
            accent="bg-butter/30"
          />
          <StatCard
            icon={<Star className="w-5 h-5 text-butter" />}
            label="Average Rating"
            value={reviews.avgRating > 0 ? reviews.avgRating.toFixed(1) : '—'}
            accent="bg-butter/30"
          />
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 2: Profile Completion Indicator
          ═══════════════════════════════════════════ */}
      {profileCompletion.percentage < 100 && (
        <section className="bg-white rounded-3xl border-2 border-charcoal/15 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-butter/50 border border-charcoal/15 flex items-center justify-center">
                <User className="w-4.5 h-4.5 text-charcoal" />
              </div>
              <div>
                <h2 className="text-base font-serif font-bold text-charcoal">
                  Profile Completion
                </h2>
                <p className="text-[11px] text-charcoal-muted">
                  Complete your profile to get better match recommendations
                </p>
              </div>
            </div>
            <span className="text-xl font-serif font-black text-dusty">
              {profileCompletion.percentage}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-3 bg-ivory rounded-full border border-charcoal/15 overflow-hidden mb-4">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${profileCompletion.percentage}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className={`h-full rounded-full ${
                profileCompletion.percentage >= 80
                  ? 'bg-sage'
                  : profileCompletion.percentage >= 50
                  ? 'bg-butter'
                  : 'bg-lavender'
              }`}
            />
          </div>

          {/* Checklist */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {profileCompletion.checks.map((check, i) => (
              <div
                key={i}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-medium border ${
                  check.done
                    ? 'bg-sage-soft/60 border-sage/40 text-charcoal'
                    : 'bg-ivory border-charcoal/10 text-charcoal-muted'
                }`}
              >
                {check.done ? (
                  <CheckCircle className="w-3 h-3 text-sage-dark flex-shrink-0" />
                ) : (
                  <CircleDot className="w-3 h-3 text-charcoal-muted flex-shrink-0" />
                )}
                <span className="truncate">{check.label}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/profile')}
              leftIcon={<Edit3 className="w-3.5 h-3.5" />}
            >
              Complete Profile
            </Button>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════
          SECTION 3: Two-Column Main Grid
          ═══════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left Column (2/3) ─────────────────── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Incoming Requests */}
          <div className="bg-white rounded-3xl border-2 border-charcoal/15 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-butter/50 border border-charcoal/15 flex items-center justify-center">
                  <Inbox className="w-4.5 h-4.5 text-charcoal" />
                </div>
                <h2 className="text-base font-serif font-bold text-charcoal">
                  Incoming Requests
                </h2>
                {requests.pendingIncoming.length > 0 && (
                  <Badge variant="dusty" size="xs">{requests.pendingIncoming.length} pending</Badge>
                )}
              </div>
              <button
                onClick={() => navigate('/exchanges?tab=requests')}
                className="text-xs font-bold text-dusty hover:text-charcoal transition flex items-center gap-1"
              >
                View All <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {requests.incoming.length > 0 ? (
              <div className="space-y-2">
                {requests.incoming.slice(0, 4).map((req) => (
                  <MiniSwapCard
                    key={req.id}
                    request={req}
                    direction="incoming"
                    onClick={() => navigate('/exchanges?tab=requests')}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Inbox className="w-6 h-6 text-dusty" />}
                title="No Incoming Requests"
                subtitle="When others discover your skills and propose a swap, their requests will appear here."
              />
            )}
          </div>

          {/* Outgoing Requests */}
          <div className="bg-white rounded-3xl border-2 border-charcoal/15 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-lavender/40 border border-charcoal/15 flex items-center justify-center">
                  <Send className="w-4.5 h-4.5 text-charcoal" />
                </div>
                <h2 className="text-base font-serif font-bold text-charcoal">
                  Outgoing Proposals
                </h2>
                {requests.pendingOutgoing.length > 0 && (
                  <Badge variant="butter" size="xs">{requests.pendingOutgoing.length} awaiting</Badge>
                )}
              </div>
              <button
                onClick={() => navigate('/exchanges?tab=requests')}
                className="text-xs font-bold text-dusty hover:text-charcoal transition flex items-center gap-1"
              >
                View All <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {requests.outgoing.length > 0 ? (
              <div className="space-y-2">
                {requests.outgoing.slice(0, 4).map((req) => (
                  <MiniSwapCard
                    key={req.id}
                    request={req}
                    direction="outgoing"
                    onClick={() => navigate('/exchanges?tab=requests')}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Send className="w-6 h-6 text-dusty" />}
                title="No Outgoing Proposals"
                subtitle="Browse the Explore page to find skill matches and send your first swap proposal!"
                action={
                  <Button variant="outline" size="sm" onClick={() => navigate('/explore')}>
                    Explore Skills
                  </Button>
                }
              />
            )}
          </div>

          {/* Upcoming Sessions */}
          <div className="bg-white rounded-3xl border-2 border-charcoal/15 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-sage/30 border border-charcoal/15 flex items-center justify-center">
                  <Calendar className="w-4.5 h-4.5 text-charcoal" />
                </div>
                <h2 className="text-base font-serif font-bold text-charcoal">
                  Upcoming Sessions
                </h2>
                {stats.totalUpcomingSessions > 0 && (
                  <Badge variant="sage" size="xs">{stats.totalUpcomingSessions} scheduled</Badge>
                )}
              </div>
              <button
                onClick={() => navigate('/exchanges?tab=sessions')}
                className="text-xs font-bold text-dusty hover:text-charcoal transition flex items-center gap-1"
              >
                View All <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {sessions.upcoming.length > 0 ? (
              <div className="space-y-2">
                {sessions.upcoming.slice(0, 4).map((sess) => (
                  <MiniSessionCard
                    key={sess.id}
                    session={sess}
                    currentUserId={user?.id}
                    onClick={() => navigate('/exchanges?tab=sessions')}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Calendar className="w-6 h-6 text-sage-dark" />}
                title="No Upcoming Sessions"
                subtitle="Once a swap request is accepted, schedule a live learning session with your exchange partner."
              />
            )}
          </div>

          {/* Active Exchanges */}
          <div className="bg-white rounded-3xl border-2 border-charcoal/15 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-sage/30 border border-charcoal/15 flex items-center justify-center">
                  <ArrowRightLeft className="w-4.5 h-4.5 text-charcoal" />
                </div>
                <h2 className="text-base font-serif font-bold text-charcoal">
                  Active Exchanges
                </h2>
                {requests.activeExchanges.length > 0 && (
                  <Badge variant="sage" size="xs">{requests.activeExchanges.length} active</Badge>
                )}
              </div>
              <button
                onClick={() => navigate('/exchanges?tab=requests')}
                className="text-xs font-bold text-dusty hover:text-charcoal transition flex items-center gap-1"
              >
                View All <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {requests.activeExchanges.length > 0 ? (
              <div className="space-y-2">
                {requests.activeExchanges.slice(0, 4).map((req) => {
                  const isSender = req.sender_id === user?.id || req.sender;
                  return (
                    <MiniSwapCard
                      key={req.id}
                      request={req}
                      direction={req.sender ? 'incoming' : 'outgoing'}
                      onClick={() => navigate('/exchanges?tab=requests')}
                    />
                  );
                })}
              </div>
            ) : (
              <EmptyState
                icon={<ArrowRightLeft className="w-6 h-6 text-dusty" />}
                title="No Active Exchanges"
                subtitle="Once a swap proposal is mutually accepted, it becomes an active exchange."
              />
            )}
          </div>

          {/* Completed Exchanges */}
          <div className="bg-white rounded-3xl border-2 border-charcoal/15 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-butter/40 border border-charcoal/15 flex items-center justify-center">
                  <Award className="w-4.5 h-4.5 text-charcoal" />
                </div>
                <h2 className="text-base font-serif font-bold text-charcoal">
                  Completed Exchanges & Sessions
                </h2>
              </div>
            </div>

            {sessions.completed.length > 0 ? (
              <div className="space-y-2">
                {sessions.completed.slice(0, 4).map((sess) => (
                  <MiniSessionCard
                    key={sess.id}
                    session={sess}
                    currentUserId={user?.id}
                    onClick={() => navigate('/exchanges?tab=sessions')}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Award className="w-6 h-6 text-butter" />}
                title="No Completed Sessions Yet"
                subtitle="Your finished skill exchange sessions and completed swaps will be archived here."
              />
            )}
          </div>
        </div>

        {/* ── Right Column (1/3) ─────────────────── */}
        <div className="space-y-6">

          {/* Recommended Matches */}
          <div className="bg-white rounded-3xl border-2 border-charcoal/15 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-dusty" />
                <h3 className="text-sm font-serif font-bold text-charcoal">
                  Recommended Matches
                </h3>
              </div>
              <button
                onClick={() => navigate('/explore?tab=matches')}
                className="text-[11px] font-bold text-dusty hover:text-charcoal transition"
              >
                See all →
              </button>
            </div>

            {matches.length > 0 ? (
              <div className="space-y-2.5">
                {matches.slice(0, 5).map((match, idx) => {
                  const partner =
                    match.candidate ||
                    (match.user_a?.id === user?.id ? match.user_b : match.user_a);
                  const partnerSkillName =
                    match.forwardMatches?.[0]?.skillName ||
                    match.skill_b?.name ||
                    match.skill_a?.name ||
                    'Skill';
                  const mySkillName =
                    match.reciprocalMatches?.[0]?.skillName ||
                    match.skill_a?.name ||
                    match.skill_b?.name ||
                    'Skill';
                  const score = Math.round(
                    match.compatibilityScore ?? match.compatibility_score ?? 0
                  );

                  return (
                    <button
                      key={match.id || match.candidateId || idx}
                      onClick={() => navigate(`/profile/${partner?.username}`)}
                      className="w-full text-left p-3 bg-ivory/60 rounded-2xl border border-charcoal/10 hover:bg-white hover:border-charcoal/20 transition flex items-center gap-3"
                    >
                      <img
                        src={partner?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                        alt=""
                        className="w-9 h-9 rounded-xl object-cover border border-charcoal/20"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-charcoal truncate">
                          {partner?.full_name || partner?.username}
                        </p>
                        <p className="text-[10px] text-charcoal-muted truncate">
                          Teaches {partnerSkillName} · Wants {mySkillName}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-[10px] font-black text-dusty block">
                          {score}%
                        </span>
                        <span className="text-[9px] text-charcoal-muted">match</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                icon={<Sparkles className="w-6 h-6 text-dusty" />}
                title="No Matches Yet"
                subtitle="Add teaching and wanted skills to get AI-powered match recommendations."
                action={
                  <Button variant="outline" size="sm" onClick={() => navigate('/profile')}>
                    Add Skills
                  </Button>
                }
              />
            )}
          </div>

          {/* Learning Activity */}
          <div className="bg-white rounded-3xl border-2 border-charcoal/15 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-4 h-4 text-dusty" />
              <h3 className="text-sm font-serif font-bold text-charcoal">
                Learning Activity
              </h3>
            </div>

            <div className="space-y-2">
              {Object.entries(stats.activityByMonth).map(([month, count]) => {
                const maxCount = Math.max(1, ...Object.values(stats.activityByMonth));
                const pct = (count / maxCount) * 100;
                return (
                  <div key={month} className="flex items-center gap-3">
                    <span className="text-[11px] font-medium text-charcoal-muted w-16 text-right flex-shrink-0">
                      {month.split(' ')[0]}
                    </span>
                    <div className="flex-1 h-4 bg-ivory rounded-full border border-charcoal/10 overflow-hidden">
                      <div
                        className="h-full bg-lavender rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-bold text-charcoal w-5 text-left flex-shrink-0">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 p-3 bg-ivory rounded-2xl border border-charcoal/10 flex items-center gap-2">
              <Flame className="w-4 h-4 text-coral flex-shrink-0" />
              <div>
                <p className="text-[11px] font-bold text-charcoal">
                  {stats.totalCompletedSessions > 0
                    ? `${stats.totalCompletedSessions} session${stats.totalCompletedSessions > 1 ? 's' : ''} completed total`
                    : 'No sessions completed yet'}
                </p>
                <p className="text-[10px] text-charcoal-muted">
                  {stats.totalUpcomingSessions > 0
                    ? `${stats.totalUpcomingSessions} upcoming`
                    : 'Schedule your first session to start learning'}
                </p>
              </div>
            </div>
          </div>

          {/* Your Skills Overview */}
          <div className="bg-white rounded-3xl border-2 border-charcoal/15 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-coral" />
                <h3 className="text-sm font-serif font-bold text-charcoal">
                  Your Skills
                </h3>
              </div>
              <button
                onClick={() => navigate('/profile')}
                className="text-[11px] font-bold text-dusty hover:text-charcoal transition"
              >
                Edit →
              </button>
            </div>

            {/* Teaching */}
            {teachingSkills.length > 0 && (
              <div className="mb-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-charcoal-muted mb-1.5">
                  Can Teach
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {teachingSkills.map((s) => (
                    <Badge key={s.id} variant="sage" size="xs">
                      {s.skills?.name || 'Skill'}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Wanting */}
            {wantedSkills.length > 0 && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-charcoal-muted mb-1.5">
                  Wants to Learn
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {wantedSkills.map((s) => (
                    <Badge key={s.id} variant="lavender" size="xs">
                      {s.skills?.name || 'Skill'}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {teachingSkills.length === 0 && wantedSkills.length === 0 && (
              <EmptyState
                icon={<Heart className="w-5 h-5 text-coral" />}
                title="No Skills Added"
                subtitle="Add skills to unlock matching."
                action={
                  <Button variant="outline" size="sm" onClick={() => navigate('/profile')}>
                    Add Skills
                  </Button>
                }
              />
            )}
          </div>

          {/* Reviews & Ratings */}
          <div className="bg-white rounded-3xl border-2 border-charcoal/15 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-butter" />
                <h3 className="text-sm font-serif font-bold text-charcoal">
                  Reviews & Ratings
                </h3>
              </div>
              {reviews.totalReceived > 0 && (
                <div className="flex items-center gap-1 text-xs font-bold text-charcoal">
                  <Star className="w-3.5 h-3.5 text-butter fill-butter" />
                  {reviews.avgRating.toFixed(1)}
                  <span className="text-charcoal-muted font-normal">({reviews.totalReceived})</span>
                </div>
              )}
            </div>

            {reviews.received.length > 0 ? (
              <div className="space-y-2.5">
                {reviews.received.slice(0, 4).map((rev) => (
                  <MiniReviewCard key={rev.id} review={rev} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Star className="w-6 h-6 text-butter" />}
                title="No Reviews Yet"
                subtitle="Complete your first skill exchange session to receive reviews from exchange partners."
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
