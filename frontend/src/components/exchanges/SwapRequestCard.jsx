import React, { useState } from 'react';
import { 
  ArrowRightLeft, 
  Check, 
  X, 
  MessageSquare, 
  Calendar, 
  Clock, 
  MapPin, 
  Star, 
  User, 
  AlertCircle 
} from 'lucide-react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

export default function SwapRequestCard({
  request,
  currentUserId,
  onAccept,
  onReject,
  onCancel,
  onOpenChat,
  onScheduleSession,
  isProcessing = false,
}) {
  const [rejecting, setRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const isIncoming = request.receiver_id === currentUserId;
  const partner = isIncoming ? request.sender : request.receiver;
  const offeredSkillName = request.offered_skill?.name || 'Skill';
  const requestedSkillName = request.requested_skill?.name || 'Skill';
  const status = request.status || 'pending';

  const formattedDate = request.created_at
    ? new Date(request.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  const getStatusBadge = () => {
    switch (status) {
      case 'accepted':
        return <Badge variant="sage" size="sm">Accepted ✨</Badge>;
      case 'rejected':
        return <Badge variant="coral" size="sm">Declined</Badge>;
      case 'cancelled':
        return <Badge variant="neutral" size="sm">Cancelled</Badge>;
      case 'completed':
        return <Badge variant="lavender" size="sm">Completed 🎓</Badge>;
      case 'pending':
      default:
        return <Badge variant="butter" size="sm">Awaiting Response</Badge>;
    }
  };

  const handleConfirmReject = () => {
    onReject && onReject(request.id, rejectReason);
    setRejecting(false);
    setRejectReason('');
  };

  return (
    <div className="bg-white rounded-3xl border-2 border-charcoal/15 p-5 shadow-pop-sm hover:shadow-pop transition-all relative overflow-hidden group">
      {/* Top Banner Indicator */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <span
            className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${
              isIncoming
                ? 'bg-butter/40 border-butter text-charcoal'
                : 'bg-lavender/40 border-lavender text-charcoal'
            }`}
          >
            {isIncoming ? '📥 Incoming Request' : '📤 Outgoing Proposal'}
          </span>
          <span className="text-[11px] text-charcoal-muted flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formattedDate}
          </span>
        </div>
        {getStatusBadge()}
      </div>

      {/* Partner Info */}
      <div className="flex items-start justify-between gap-4 mb-4 pb-4 border-b border-charcoal/10">
        <div className="flex items-center gap-3">
          <img
            src={
              partner?.avatar_url ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120'
            }
            alt={partner?.full_name || 'Swapper'}
            className="w-12 h-12 rounded-2xl object-cover border-2 border-charcoal shadow-sm"
          />
          <div>
            <h4 className="font-serif font-bold text-sm text-charcoal">
              {partner?.full_name || partner?.username || 'Fellow Swapper'}
            </h4>
            <div className="flex items-center gap-2 text-[11px] text-charcoal-muted mt-0.5">
              <span>@{partner?.username || 'user'}</span>
              {partner?.location && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-0.5">
                    <MapPin className="w-2.5 h-2.5" />
                    {partner.location}
                  </span>
                </>
              )}
              {partner?.rating_avg > 0 && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-0.5 font-bold text-charcoal">
                    <Star className="w-2.5 h-2.5 text-butter fill-butter" />
                    {Number(partner.rating_avg).toFixed(1)}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Quick Chat Shortcut */}
        <button
          onClick={() => onOpenChat && onOpenChat(partner?.id, request.conversations?.[0]?.id || request.conversation_id)}
          className="p-2 rounded-xl bg-ivory border border-charcoal/20 text-charcoal hover:bg-lavender/30 hover:border-charcoal transition shadow-sm"
          title="Chat with swapper"
        >
          <MessageSquare className="w-4 h-4 text-dusty" />
        </button>
      </div>

      {/* Skill Exchange Trade Visualization */}
      <div className="bg-ivory rounded-2xl p-3.5 border-1.5 border-charcoal/15 mb-4">
        <p className="text-[10px] font-bold uppercase tracking-wider text-charcoal-muted mb-2">
          Skill Exchange Trade
        </p>
        <div className="flex items-center justify-between gap-2">
          {/* Left: What Swapper Offers / What You Offer */}
          <div className="flex-1 bg-white p-2.5 rounded-xl border border-charcoal/10 text-center">
            <span className="text-[10px] text-charcoal-muted block">
              {isIncoming ? "They'll Teach" : "You'll Teach"}
            </span>
            <span className="text-xs font-bold text-charcoal block truncate">
              {isIncoming ? offeredSkillName : requestedSkillName}
            </span>
          </div>

          <div className="w-7 h-7 rounded-full bg-butter/80 flex items-center justify-center border border-charcoal/20 flex-shrink-0">
            <ArrowRightLeft className="w-3.5 h-3.5 text-charcoal" />
          </div>

          {/* Right: What Swapper Wants / What You Get */}
          <div className="flex-1 bg-white p-2.5 rounded-xl border border-charcoal/10 text-center">
            <span className="text-[10px] text-charcoal-muted block">
              {isIncoming ? "You'll Teach" : "They'll Teach"}
            </span>
            <span className="text-xs font-bold text-charcoal block truncate">
              {isIncoming ? requestedSkillName : offeredSkillName}
            </span>
          </div>
        </div>
      </div>

      {/* Intro Message / Proposal Note */}
      {request.message && (
        <div className="bg-lavender-soft/60 rounded-2xl p-3 border border-charcoal/10 mb-4 text-xs text-charcoal leading-relaxed relative">
          <span className="font-bold text-dusty text-[10px] uppercase tracking-wider block mb-1">
            Personal Note:
          </span>
          <p className="italic text-charcoal/90">"{request.message}"</p>
        </div>
      )}

      {/* Reject Reason Accordion / Input Form */}
      {rejecting && (
        <div className="bg-coral-soft/50 rounded-2xl p-3.5 border-1.5 border-coral/30 mb-4 space-y-2">
          <label className="text-xs font-bold text-charcoal block">
            Reason for declining (optional):
          </label>
          <input
            type="text"
            placeholder="e.g. Busy this month, skills don't match right now..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="w-full px-3 py-1.5 text-xs rounded-xl border border-charcoal/20 bg-white focus:outline-none focus:border-charcoal"
          />
          <div className="flex justify-end gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRejecting(false)}
            >
              Back
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleConfirmReject}
              disabled={isProcessing}
            >
              Confirm Decline
            </Button>
          </div>
        </div>
      )}

      {/* Card Action Controls */}
      <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
        {status === 'pending' && isIncoming && !rejecting && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRejecting(true)}
              disabled={isProcessing}
              leftIcon={<X className="w-3.5 h-3.5 text-coral" />}
            >
              Decline
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => onAccept && onAccept(request.id)}
              disabled={isProcessing}
              leftIcon={<Check className="w-3.5 h-3.5" />}
            >
              Accept Swap
            </Button>
          </>
        )}

        {status === 'pending' && !isIncoming && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onCancel && onCancel(request.id)}
            disabled={isProcessing}
            leftIcon={<X className="w-3.5 h-3.5" />}
          >
            Cancel Proposal
          </Button>
        )}

        {status === 'accepted' && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChat && onOpenChat(partner?.id, request.conversations?.[0]?.id || request.conversation_id)}
              leftIcon={<MessageSquare className="w-3.5 h-3.5" />}
            >
              Chat
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => onScheduleSession && onScheduleSession(request)}
              leftIcon={<Calendar className="w-3.5 h-3.5" />}
            >
              Schedule Session
            </Button>
          </>
        )}

        {status === 'completed' && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onScheduleSession && onScheduleSession(request)}
            leftIcon={<Calendar className="w-3.5 h-3.5" />}
          >
            Schedule Another
          </Button>
        )}
      </div>
    </div>
  );
}
