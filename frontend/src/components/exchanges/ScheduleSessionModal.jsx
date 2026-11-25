import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { Input, Textarea } from '../ui/Input';
import { Calendar, Clock, Video, Sparkles } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export default function ScheduleSessionModal({
  isOpen,
  onClose,
  onSubmit,
  initialSwap = null,
  currentUserId,
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(() => {
    // Default tomorrow at 14:00
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [startTime, setStartTime] = useState('14:00');
  const [duration, setDuration] = useState('60'); // in minutes
  const [meetingLink, setMeetingLink] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const toast = useToast();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!date || !startTime) {
      toast.warning('Date & Time Required', 'Please choose a session date and time.');
      return;
    }

    try {
      setSubmitting(true);

      const startDateTime = new Date(`${date}T${startTime}`);
      const durationMs = parseInt(duration, 10) * 60 * 1000;
      const endDateTime = new Date(startDateTime.getTime() + durationMs);

      // Auto-generate meeting link if none provided
      const finalMeetingLink =
        meetingLink.trim() ||
        `https://meet.skillswap.org/swap-${Math.random().toString(36).substring(2, 9)}`;

      // Resolve teacher, learner, and skill
      let teacherId = initialSwap?.sender_id;
      let learnerId = initialSwap?.receiver_id;
      let skillId = initialSwap?.offered_skill_id || initialSwap?.offered_skill?.id;

      // If current user is receiver, swap IDs appropriately
      if (initialSwap?.receiver_id === currentUserId) {
        teacherId = initialSwap?.receiver_id;
        learnerId = initialSwap?.sender_id;
        skillId = initialSwap?.requested_skill_id || initialSwap?.requested_skill?.id || skillId;
      }

      await onSubmit({
        swapRequestId: initialSwap?.id,
        teacherId,
        learnerId,
        skillId,
        title: title.trim() || `Skill Exchange Session: ${initialSwap?.offered_skill?.name || 'Skill'}`,
        description: description.trim(),
        scheduledStart: startDateTime.toISOString(),
        scheduledEnd: endDateTime.toISOString(),
        meetingLink: finalMeetingLink,
        scheduledByUserId: currentUserId,
      });

      toast.success('Session Scheduled! 🎉', 'Your learning session has been added to the calendar.');
      onClose();
    } catch (err) {
      toast.warning('Scheduling Failed', err.message || 'Could not schedule session.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Schedule Learning Session 📅"
      subtitle="Agree on a time to meet, share screen, and exchange knowledge."
      withTape={true}
      tapeColor="bg-lavender/85"
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
            leftIcon={<Calendar className="w-3.5 h-3.5" />}
          >
            {submitting ? 'Scheduling...' : 'Confirm Session'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs text-charcoal">
        <Input
          label="Session Title"
          placeholder="e.g. Introductory Python & Data Structures"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          helperText="Give this learning session a friendly topic name"
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />

          <Input
            label="Start Time"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-charcoal">Duration</label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-charcoal/20 bg-white font-medium text-xs text-charcoal focus:outline-none focus:border-charcoal focus:shadow-pop-sm"
            >
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">60 minutes (1 hour)</option>
              <option value="90">90 minutes (1.5 hrs)</option>
              <option value="120">120 minutes (2 hrs)</option>
            </select>
          </div>
        </div>

        <Input
          label="Meeting Link (Google Meet / Zoom / SkillSwap Room)"
          placeholder="https://meet.google.com/abc-defg-hij (Leave blank to auto-generate)"
          value={meetingLink}
          onChange={(e) => setMeetingLink(e.target.value)}
          helperText="Leave empty to automatically assign a SkillSwap virtual room link"
        />

        <Textarea
          label="Agenda & Discussion Topics"
          rows={3}
          placeholder="What would you like to cover during this session? Any materials or software to install beforehand?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="bg-sage-soft/70 rounded-2xl p-3 border border-sage/40 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-dusty flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-charcoal-muted leading-relaxed">
            Both swappers will receive a notification and calendar details. You can reschedule or cancel at any time before the session begins.
          </p>
        </div>
      </form>
    </Modal>
  );
}
