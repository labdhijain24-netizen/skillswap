import React, { useState } from 'react';
import { Plus, X, Save } from 'lucide-react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { updateUserInterests } from '../../services/profileService';
import { useToast } from '../../context/ToastContext';

const SUGGESTED_INTERESTS = [
  'Artificial Intelligence', 'Creative Coding', 'Ceramic Glazing',
  'Sourdough Fermentation', 'Jazz Harmony', 'Film Photography',
  'UI Design Systems', 'World Languages', 'Philosophy & Ethics',
  'Indie Game Dev', 'Urban Gardening', 'Sound Synthesis',
  'Illustration', 'Fermentation', 'Yoga & Mindfulness',
  '3D Printing', 'Calligraphy', 'Digital Marketing',
];

export default function InterestsEditor({ userId, initialInterests = [], onSaved }) {
  const toast = useToast();
  const [selected, setSelected] = useState(initialInterests.map((i) => i.name || i));
  const [inputValue, setInputValue] = useState('');
  const [saving, setSaving] = useState(false);

  const addInterest = (name) => {
    const trimmed = name.trim();
    if (!trimmed || selected.includes(trimmed)) return;
    setSelected((prev) => [...prev, trimmed]);
    setInputValue('');
  };

  const removeInterest = (name) => {
    setSelected((prev) => prev.filter((i) => i !== name));
  };

  const handleKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && inputValue.trim()) {
      e.preventDefault();
      addInterest(inputValue);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const saved = await updateUserInterests(userId, selected);
      toast.success('Interests Updated! ✨', 'Your community tags have been saved.');
      onSaved && onSaved(saved);
    } catch (err) {
      toast.warning('Save Failed', err.message || 'Could not update interests.');
    } finally {
      setSaving(false);
    }
  };

  const unselectedSuggestions = SUGGESTED_INTERESTS.filter((s) => !selected.includes(s));

  return (
    <div className="space-y-4">
      {/* Selected tags */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-muted mb-2">
          Your Interests ({selected.length})
        </label>
        <div className="min-h-[48px] flex flex-wrap gap-2 p-3 rounded-2xl bg-ivory border-2 border-charcoal/15">
          {selected.length === 0 && (
            <span className="text-xs text-charcoal-subtle italic self-center">
              No interests selected yet. Add some below.
            </span>
          )}
          {selected.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-lavender text-charcoal text-xs font-semibold border border-charcoal/20 shadow-[1px_1px_0px_#34313B]"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeInterest(tag)}
                className="ml-0.5 w-3.5 h-3.5 rounded-full hover:bg-charcoal/10 flex items-center justify-center transition"
                aria-label={`Remove ${tag}`}
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Custom input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a custom interest and press Enter..."
          className="flex-1 rounded-2xl bg-white text-charcoal text-sm border-2 border-charcoal/20 focus:border-charcoal focus:shadow-pop-sm focus:outline-none transition px-4 py-2.5 placeholder:text-charcoal-subtle/70"
        />
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => addInterest(inputValue)}
          disabled={!inputValue.trim()}
          leftIcon={<Plus className="w-3.5 h-3.5 text-charcoal" />}
        >
          Add
        </Button>
      </div>

      {/* Suggestions */}
      {unselectedSuggestions.length > 0 && (
        <div>
          <p className="text-[11px] uppercase font-bold tracking-wider text-charcoal-subtle mb-2">
            Suggested
          </p>
          <div className="flex flex-wrap gap-1.5">
            {unselectedSuggestions.slice(0, 12).map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => addInterest(tag)}
                className="px-2.5 py-1 rounded-full bg-white text-charcoal text-xs font-semibold border-2 border-charcoal/15 hover:bg-butter/50 hover:border-charcoal/30 transition"
              >
                + {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="pt-1 flex justify-end">
        <Button
          variant="primary"
          size="sm"
          onClick={handleSave}
          isLoading={saving}
          leftIcon={<Save className="w-3.5 h-3.5 text-butter" />}
        >
          Save Interests
        </Button>
      </div>
    </div>
  );
}
