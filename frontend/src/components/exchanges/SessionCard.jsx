import React from 'react';
import { 
  Calendar, 
  Clock, 
  Video, 
  CheckCircle, 
  RotateCcw, 
  XCircle, 
  ExternalLink, 
  Copy, 
  UserCheck, 
  GraduationCap,
  Star 
} from 'lucide-react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { useToast } from '../../context/ToastContext';

export default function SessionCard({
  session,
  currentUserId,
  onComplete,
  onReschedule,
  onCancel,
  onOpenChat,
  onLeaveReview,
  isProcessing = false,
}) {
  const toast = useToast();

  const isTeacher = session.teacher_id === currentUserId;
  const partner = isTeacher ? session.learner : session.teacher;
  const skillName = session.skill?.name || 'Skill';
  const status = session.status || 'scheduled';

  const startDate = session.scheduled_start ? new Date(session.scheduled_start) : null;
  const endDate = session.scheduled_end ? new Date(session.scheduled_end) : null;

  const dateFormatted = startDate
    ? startDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'TBD';

  const timeFormatted = startDate && endDate
    ? `${startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} - ${endDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
    : 'TBD';

  // Duration in minutes
  const durationMinutes = startDate && endDate
    ? Math.round((endDate.getTime() - startDate.getTime()) / 60000)
    : 60;

  const handleCopyLink = () => {
    if (session.meeting_link) {
      navigator.clipboard.writeText(session.meeting_link);
      toast.success('Copied!', 'Meeting link copied to clipboard.');
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'completed':
        return <Badge variant="sage" size="sm">Completed 🎓</Badge>;
      case 'cancelled':
        return <Badge variant="coral" size="sm">Cancelled</Badge>;
      case 'in_progress':
        return <Badge variant="lavender" size="sm">In Session 🔴</Badge>;
      case 'scheduled':
      default:
        return <Badge variant="butter" size="sm">Upcoming ⏳</Badge>;
    }
  };

  return (
    <div className="bg-white rounded-3xl border-2 border-charcoal/15 p-5 shadow-pop-sm hover:shadow-pop transition-all relative overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          {isTeacher ? (
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-sage/30 text-charcoal border border-sage flex items-center gap-1">
              <GraduationCap className="w-3 h-3 text-dusty" /> You are Teaching
            </span>
          ) : (
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-lavender/40 text-charcoal border border-lavender flex items-center gap-1">
              <UserCheck className="w-3 h-3 text-dusty" /> You are Learning
            </span>
          )}
          <span className="text-xs font-bold text-dusty bg-dusty/10 px-2.5 py-0.5 rounded-full">
            {skillName}
          </span>
        </div>
        {getStatusBadge()}
      </div>

      {/* Session Title & Partner */}
      <div className="mb-4">
        <h3 className="text-base font-serif font-bold text-charcoal mb-1">
          {session.title || `Skill Exchange Session: ${skillName}`}
        </h3>
        {session.description && (
          <p className="text-xs text-charcoal-muted leading-relaxed mb-3">
            {session.description}
          </p>
        )}

        <div className="flex items-center gap-3 p-3 bg-ivory rounded-2xl border border-charcoal/10">
          <img
            src={
              partner?.avatar_url ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120'
            }
            alt={partner?.full_name || 'Partner'}
            className="w-10 h-10 rounded-xl object-cover border border-charcoal/20 shadow-sm"
          />
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-muted block">
              {isTeacher ? 'Learner' : 'Instructor'}
            </span>
            <p className="text-xs font-bold text-charcoal truncate">
              {partner?.full_name || partner?.username || 'Exchange Partner'}
            </p>
          </div>
          <button
            onClick={() => onOpenChat && onOpenChat(partner?.id)}
            className="text-[11px] font-bold text-dusty hover:text-charcoal bg-white px-2.5 py-1 rounded-xl border border-charcoal/15 transition shadow-sm"
          >
            Message
          </button>
        </div>
      </div>

      {/* Schedule Time Banner */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-lavender-soft/60 rounded-xl p-2.5 border border-charcoal/10 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-dusty flex-shrink-0" />
          <div className="min-w-0">
            <span className="text-[10px] text-charcoal-muted block">Date</span>
            <span className="text-xs font-bold text-charcoal truncate block">
              {dateFormatted}
            </span>
          </div>
        </div>

        <div className="bg-lavender-soft/60 rounded-xl p-2.5 border border-charcoal/10 flex items-center gap-2">
          <Clock className="w-4 h-4 text-dusty flex-shrink-0" />
          <div className="min-w-0">
            <span className="text-[10px] text-charcoal-muted block">Time ({durationMinutes}m)</span>
            <span className="text-xs font-bold text-charcoal truncate block">
              {timeFormatted}
            </span>
          </div>
        </div>
      </div>

      {/* Video Call Link */}
      {session.meeting_link && status === 'scheduled' && (
        <div className="bg-butter-soft/80 border border-butter rounded-2xl p-3 mb-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Video className="w-4 h-4 text-charcoal flex-shrink-0" />
            <span className="text-xs font-bold text-charcoal truncate">
              {session.meeting_link}
            </span>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={handleCopyLink}
              title="Copy link"
              className="p-1.5 bg-white rounded-lg border border-charcoal/20 text-charcoal hover:bg-butter transition"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            <a
              href={session.meeting_link}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 bg-charcoal text-white rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-dusty transition"
            >
              <span>Join</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-charcoal/10">
        {status === 'scheduled' && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCancel && onCancel(session.id)}
              disabled={isProcessing}
              leftIcon={<XCircle className="w-3.5 h-3.5 text-coral" />}
            >
              Cancel
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onReschedule && onReschedule(session)}
              disabled={isProcessing}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              Reschedule
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => onComplete && onComplete(session.id)}
              disabled={isProcessing}
              leftIcon={<CheckCircle className="w-3.5 h-3.5 text-charcoal" />}
            >
              Mark Completed
            </Button>
          </>
        )}

        {status === 'completed' && (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-1.5 text-xs font-bold text-sage-dark py-1">
              <CheckCircle className="w-4 h-4 text-sage-dark" />
              <span>Session Completed</span>
            </div>
            {onLeaveReview && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onLeaveReview(session)}
                leftIcon={<Star className="w-3.5 h-3.5 text-butter fill-butter" />}
              >
                Leave Review
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
