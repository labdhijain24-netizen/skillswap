import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { Input, Textarea } from '../ui/Input';
import { Calendar, RotateCcw } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export default function RescheduleSessionModal({
  isOpen,
  onClose,
  onSubmit,
  session,
  currentUserId,
}) {
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('14:00');
  const [duration, setDuration] = useState('60');
  const [title, setTitle] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const toast = useToast();

  useEffect(() => {
    if (session) {
      setTitle(session.title || '');
      setMeetingLink(session.meeting_link || '');
      if (session.scheduled_start) {
        const s = new Date(session.scheduled_start);
        setDate(s.toISOString().split('T')[0]);
        setStartTime(s.toTimeString().substring(0, 5));
      }
      if (session.scheduled_start && session.scheduled_end) {
        const s = new Date(session.scheduled_start);
        const e = new Date(session.scheduled_end);
        const mins = Math.round((e.getTime() - s.getTime()) / 60000);
        setDuration(String(mins || 60));
      }
    }
  }, [session]);

  if (!isOpen || !session) return null;

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

      await onSubmit(session.id, {
        userId: currentUserId,
        title: title.trim(),
        meetingLink: meetingLink.trim(),
        scheduledStart: startDateTime.toISOString(),
        scheduledEnd: endDateTime.toISOString(),
      });

      toast.success('Session Rescheduled 🔄', 'New session date & time have been saved.');
      onClose();
    } catch (err) {
      toast.warning('Reschedule Failed', err.message || 'Could not update session.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reschedule Session 🔄"
      subtitle="Update the time or link for this skill exchange session."
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
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            {submitting ? 'Updating...' : 'Save New Time'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs text-charcoal">
        <Input
          label="Session Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="New Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />

          <Input
            label="New Start Time"
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
              <option value="60">60 minutes</option>
              <option value="90">90 minutes</option>
              <option value="120">120 minutes</option>
            </select>
          </div>
        </div>

        <Input
          label="Meeting Link"
          value={meetingLink}
          onChange={(e) => setMeetingLink(e.target.value)}
        />
      </form>
    </Modal>
  );
}
