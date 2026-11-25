import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { Textarea } from '../ui/Input';
import { Star, Sparkles } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export default function LeaveReviewModal({
  isOpen,
  onClose,
  onSubmit,
  session,
  currentUserId,
}) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const toast = useToast();

  if (!isOpen || !session) return null;

  const isTeacher = session.teacher_id === currentUserId;
  const partner = isTeacher ? session.learner : session.teacher;
  const partnerName = partner?.full_name || partner?.username || 'Exchange Partner';
  const skillName = session.skill?.name || 'Skill';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating || rating < 1 || rating > 5) {
      toast.warning('Rating Required', 'Please choose a rating between 1 and 5 stars.');
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit({
        sessionId: session.id,
        reviewerId: currentUserId,
        rating,
        comment: comment.trim(),
      });
      toast.celebrate('Review Submitted! ⭐', `Thank you for leaving feedback for ${partnerName}!`);
      onClose();
    } catch (err) {
      toast.warning('Review Error', err.message || 'Could not submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Leave a Review ⭐"
      subtitle={`Share your experience learning and exchanging skills with ${partnerName}.`}
      withTape={true}
      tapeColor="bg-butter/85"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            disabled={submitting}
            leftIcon={<Star className="w-3.5 h-3.5 text-butter" />}
          >
            {submitting ? 'Submitting...' : 'Post Review'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5 text-xs text-charcoal">
        {/* Partner & Skill banner */}
        <div className="flex items-center gap-3 p-3 bg-ivory rounded-2xl border border-charcoal/10">
          <img
            src={
              partner?.avatar_url ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120'
            }
            alt={partnerName}
            className="w-12 h-12 rounded-2xl object-cover border-2 border-charcoal shadow-sm"
          />
          <div>
            <h4 className="font-serif font-bold text-sm text-charcoal">{partnerName}</h4>
            <p className="text-[11px] text-charcoal-muted">
              {isTeacher ? `Learned ${skillName} from you` : `Taught you ${skillName}`}
            </p>
          </div>
        </div>

        {/* Star Rating Picker */}
        <div className="space-y-1.5 text-center py-2">
          <label className="block text-xs font-bold text-charcoal">
            Overall Rating
          </label>
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map((starVal) => {
              const active = (hoverRating || rating) >= starVal;
              return (
                <button
                  type="button"
                  key={starVal}
                  onMouseEnter={() => setHoverRating(starVal)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(starVal)}
                  className="p-1 hover:scale-115 transition-transform focus:outline-none"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      active
                        ? 'text-butter fill-butter drop-shadow-sm'
                        : 'text-charcoal/20 hover:text-butter/50'
                    }`}
                  />
                </button>
              );
            })}
          </div>
          <span className="text-[11px] font-bold text-dusty block mt-1">
            {rating === 5 && 'Outstanding experience! 🌟'}
            {rating === 4 && 'Great session! 👍'}
            {rating === 3 && 'Good exchange 🙂'}
            {rating === 2 && 'Needs improvement 😐'}
            {rating === 1 && 'Disappointing 😞'}
          </span>
        </div>

        {/* Testimonial / Feedback Comment */}
        <Textarea
          label="Your Feedback / Testimonial"
          rows={3}
          placeholder="Share what went well, how clear the instruction was, or what you built together..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        <div className="bg-lavender-soft/60 rounded-2xl p-3 border border-charcoal/10 flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-dusty flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-charcoal-muted leading-relaxed">
            Public reviews help fellow swappers find trusted partners and boost your peer reliability score.
          </p>
        </div>
      </form>
    </Modal>
  );
}
