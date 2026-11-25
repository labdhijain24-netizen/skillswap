import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { Input, Textarea, Select } from '../ui/Input';
import { Sparkle } from '../ui/Doodles';
import { addWantedSkill, updateWantedSkill } from '../../services/profileService';
import { useToast } from '../../context/ToastContext';

export default function AddEditWantedSkillModal({
  isOpen,
  onClose,
  userId,
  initialData = null, // null for Add, existing object for Edit
  categories = [],
  canonicalSkills = [],
  onSuccess,
}) {
  const isEditing = Boolean(initialData);
  const toast = useToast();

  const [selectedCategory, setSelectedCategory] = useState('');
  const [skillId, setSkillId] = useState('');
  const [customSkillName, setCustomSkillName] = useState('');
  const [isCustomSkill, setIsCustomSkill] = useState(false);
  const [targetProficiency, setTargetProficiency] = useState('beginner');
  const [priority, setPriority] = useState('medium');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (initialData) {
      setSkillId(initialData.skill_id || '');
      setCustomSkillName(initialData.skills?.name || '');
      setIsCustomSkill(false);
      setTargetProficiency(initialData.target_proficiency || 'beginner');
      setPriority(initialData.priority || 'medium');
      setNotes(initialData.notes || '');
      setSelectedCategory(initialData.skills?.category_id || categories[0]?.id || '');
    } else {
      setSelectedCategory(categories[0]?.id || '');
      setSkillId('');
      setCustomSkillName('');
      setIsCustomSkill(false);
      setTargetProficiency('beginner');
      setPriority('medium');
      setNotes('');
    }
    setErrorMsg('');
  }, [initialData, categories, isOpen]);

  const filteredSkills = canonicalSkills.filter(
    (s) => !selectedCategory || s.category_id === selectedCategory
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!isEditing && !isCustomSkill && !skillId) {
      setErrorMsg('Please select a skill from the list or choose to enter a custom skill.');
      return;
    }

    if (isCustomSkill && !customSkillName.trim()) {
      setErrorMsg('Please provide a name for your custom skill goal.');
      return;
    }

    setLoading(true);

    try {
      if (isEditing) {
        await updateWantedSkill(initialData.id, {
          targetProficiency,
          priority,
          notes,
        });
        toast.success('Learning Goal Updated!', 'Your desired skill has been modified.');
      } else {
        await addWantedSkill(userId, {
          skillId: isCustomSkill ? null : skillId,
          skillName: isCustomSkill ? customSkillName.trim() : null,
          categoryId: selectedCategory || categories[0]?.id,
          targetProficiency,
          priority,
          notes,
        });
        toast.swap('Goal Added! 🌱', 'Your learning desire is now saved and active for match suggestions.');
      }

      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save learning goal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit Learning Goal: ${initialData?.skills?.name || 'Skill'}` : 'Add a Skill You Want to Learn'}
      subtitle="Specify what you want to learn so other members can barter with you."
      withTape={true}
      tapeColor="bg-sage/85"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            isLoading={loading}
          >
            {isEditing ? 'Save Changes' : 'Add to Learning Goals'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs text-charcoal">
        {errorMsg && (
          <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-800">
            {errorMsg}
          </div>
        )}

        {!isEditing && (
          <>
            <Select
              label="Skill Category"
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setSkillId('');
              }}
              options={categories.map((c) => ({ value: c.id, label: c.name }))}
            />

            <div className="flex items-center justify-between text-[11px] font-bold text-charcoal-muted pt-1">
              <span>Skill Selection</span>
              <button
                type="button"
                onClick={() => {
                  setIsCustomSkill(!isCustomSkill);
                  setSkillId('');
                  setCustomSkillName('');
                }}
                className="text-dusty hover:underline"
              >
                {isCustomSkill ? '← Pick from canonical list' : '+ Enter custom skill name'}
              </button>
            </div>

            {isCustomSkill ? (
              <Input
                label="Custom Skill Name"
                placeholder="e.g. Acoustic Fingerstyle, Sourdough Fermentation..."
                value={customSkillName}
                onChange={(e) => setCustomSkillName(e.target.value)}
                required
              />
            ) : (
              <Select
                label="Select Skill"
                value={skillId}
                onChange={(e) => setSkillId(e.target.value)}
              >
                <option value="">Choose a skill...</option>
                {filteredSkills.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </Select>
            )}
          </>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Target Proficiency Level"
            value={targetProficiency}
            onChange={(e) => setTargetProficiency(e.target.value)}
            options={[
              { value: 'beginner', label: 'Beginner (Learn fundamentals)' },
              { value: 'intermediate', label: 'Intermediate (Practical projects)' },
              { value: 'advanced', label: 'Advanced (Mastery)' },
            ]}
          />

          <Select
            label="Priority Level"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            options={[
              { value: 'high', label: 'High Priority (Actively seeking)' },
              { value: 'medium', label: 'Medium Priority' },
              { value: 'low', label: 'Low / Casual Interest' },
            ]}
          />
        </div>

        <Textarea
          label="Learning Goals & Notes"
          rows={3}
          placeholder="e.g. I want to be able to accompany songs around a campfire, understand chord progressions..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          helperText="Sharing your goals helps your partner tailor their teaching."
        />
      </form>
    </Modal>
  );
}
