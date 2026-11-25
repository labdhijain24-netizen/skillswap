import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Save, Calendar } from 'lucide-react';
import Button from '../ui/Button';
import { updateAvailabilitySlots } from '../../services/profileService';
import { useToast } from '../../context/ToastContext';

const DEFAULT_SLOTS = [
  { dayOfWeek: 1, dayName: 'Monday',    active: false, startTime: '18:00', endTime: '20:00' },
  { dayOfWeek: 2, dayName: 'Tuesday',   active: false, startTime: '18:00', endTime: '20:00' },
  { dayOfWeek: 3, dayName: 'Wednesday', active: false, startTime: '18:00', endTime: '20:00' },
  { dayOfWeek: 4, dayName: 'Thursday',  active: false, startTime: '18:00', endTime: '20:00' },
  { dayOfWeek: 5, dayName: 'Friday',    active: false, startTime: '18:00', endTime: '20:00' },
  { dayOfWeek: 6, dayName: 'Saturday',  active: false, startTime: '10:00', endTime: '14:00' },
  { dayOfWeek: 0, dayName: 'Sunday',    active: false, startTime: '10:00', endTime: '14:00' },
];

export default function AvailabilityEditor({ userId, existingSlots = [], onSaved }) {
  const toast = useToast();
  const [slots, setSlots] = useState(DEFAULT_SLOTS);
  const [saving, setSaving] = useState(false);
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

  // Merge existing DB slots into the default grid
  useEffect(() => {
    if (!existingSlots || existingSlots.length === 0) return;
    setSlots((prev) =>
      prev.map((slot) => {
        const match = existingSlots.find((s) => s.day_of_week === slot.dayOfWeek);
        if (match) {
          return {
            ...slot,
            active: true,
            startTime: match.start_time || slot.startTime,
            endTime: match.end_time || slot.endTime,
          };
        }
        return slot;
      })
    );
  }, [existingSlots]);

  const toggleDay = (dayOfWeek) => {
    setSlots((prev) =>
      prev.map((s) => (s.dayOfWeek === dayOfWeek ? { ...s, active: !s.active } : s))
    );
  };

  const updateTime = (dayOfWeek, field, value) => {
    setSlots((prev) =>
      prev.map((s) => (s.dayOfWeek === dayOfWeek ? { ...s, [field]: value } : s))
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const saved = await updateAvailabilitySlots(userId, slots, timeZone);
      toast.success('Schedule Saved! 📅', 'Your weekly availability has been updated.');
      onSaved && onSaved(saved);
    } catch (err) {
      toast.warning('Save Failed', err.message || 'Could not update availability.');
    } finally {
      setSaving(false);
    }
  };

  const activeCount = slots.filter((s) => s.active).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-dusty" />
          <span className="text-xs font-bold text-charcoal-muted uppercase tracking-wider">
            Weekly Schedule
          </span>
        </div>
        <span className="text-[11px] font-mono text-charcoal-subtle">
          {activeCount} day{activeCount !== 1 ? 's' : ''} active · {timeZone}
        </span>
      </div>

      <div className="space-y-2">
        {slots.map((slot) => (
          <motion.div
            key={slot.dayOfWeek}
            layout
            animate={{ opacity: 1 }}
            className={`flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-2xl border-2 transition-all duration-150 ${
              slot.active
                ? 'bg-sage-soft border-sage-dark'
                : 'bg-ivory border-charcoal/10 opacity-60'
            }`}
          >
            {/* Day toggle */}
            <button
              type="button"
              onClick={() => toggleDay(slot.dayOfWeek)}
              className={`flex items-center gap-2.5 flex-shrink-0 min-w-[130px] text-left rounded-xl px-3 py-1.5 transition font-bold text-xs border-2 ${
                slot.active
                  ? 'bg-charcoal text-ivory border-charcoal shadow-pop-sm'
                  : 'bg-white text-charcoal border-charcoal/20 hover:bg-butter/40'
              }`}
            >
              <span
                className={`w-3 h-3 rounded-full border-2 flex-shrink-0 transition ${
                  slot.active ? 'bg-butter border-butter-dark' : 'bg-white border-charcoal/30'
                }`}
              />
              {slot.dayName}
            </button>

            {/* Time range – only shown when active */}
            {slot.active && (
              <div className="flex items-center gap-2 text-xs flex-1">
                <Clock className="w-3.5 h-3.5 text-dusty flex-shrink-0" />
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={slot.startTime}
                    onChange={(e) => updateTime(slot.dayOfWeek, 'startTime', e.target.value)}
                    className="rounded-xl bg-white border-2 border-charcoal/20 px-2.5 py-1 text-xs text-charcoal font-mono focus:border-charcoal focus:outline-none focus:shadow-pop-sm transition"
                  />
                  <span className="text-charcoal-subtle font-bold">→</span>
                  <input
                    type="time"
                    value={slot.endTime}
                    onChange={(e) => updateTime(slot.dayOfWeek, 'endTime', e.target.value)}
                    className="rounded-xl bg-white border-2 border-charcoal/20 px-2.5 py-1 text-xs text-charcoal font-mono focus:border-charcoal focus:outline-none focus:shadow-pop-sm transition"
                  />
                </div>
              </div>
            )}

            {!slot.active && (
              <span className="text-xs text-charcoal-subtle italic ml-1">Not available</span>
            )}
          </motion.div>
        ))}
      </div>

      <div className="pt-2 flex justify-end">
        <Button
          variant="primary"
          size="sm"
          onClick={handleSave}
          isLoading={saving}
          leftIcon={<Save className="w-3.5 h-3.5 text-butter" />}
        >
          Save Schedule
        </Button>
      </div>
    </div>
  );
}
