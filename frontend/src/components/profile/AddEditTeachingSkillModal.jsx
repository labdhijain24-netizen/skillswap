import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { Input, Textarea, Select } from '../ui/Input';
import { Sparkle } from '../ui/Doodles';
import { addTeachingSkill, updateTeachingSkill } from '../../services/profileService';
import { useToast } from '../../context/ToastContext';

export default function AddEditTeachingSkillModal({
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
  const [proficiency, setProficiency] = useState('intermediate');
  const [experienceYears, setExperienceYears] = useState(2);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Reset or initialize state
  useEffect(() => {
    if (initialData) {
      setSkillId(initialData.skill_id || '');
      setCustomSkillName(initialData.skills?.name || '');
      setIsCustomSkill(false);
      setProficiency(initialData.proficiency_level || 'intermediate');
      setExperienceYears(initialData.experience_years || 2);
      setDescription(initialData.description || '');
      setSelectedCategory(initialData.skills?.category_id || categories[0]?.id || '');
    } else {
      setSelectedCategory(categories[0]?.id || '');
      setSkillId('');
      setCustomSkillName('');
      setIsCustomSkill(false);
      setProficiency('intermediate');
      setExperienceYears(2);
      setDescription('');
    }
    setErrorMsg('');
  }, [initialData, categories, isOpen]);

  // Filter canonical skills by selected category
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
      setErrorMsg('Please provide a name for your custom skill.');
      return;
    }

    setLoading(true);

    try {
      if (isEditing) {
        await updateTeachingSkill(initialData.id, {
          proficiency,
          experienceYears,
          description,
        });
        toast.success('Skill Updated!', 'Your teaching offering has been modified.');
      } else {
        await addTeachingSkill(userId, {
          skillId: isCustomSkill ? null : skillId,
          skillName: isCustomSkill ? customSkillName.trim() : null,
          categoryId: selectedCategory || categories[0]?.id,
          proficiency,
          experienceYears,
          description,
        });
        toast.swap('Skill Added! 🎓', 'Your new teaching skill is now visible to the community.');
      }

      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save teaching skill.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit Teaching: ${initialData?.skills?.name || 'Skill'}` : 'Add a Skill You Can Teach'}
      subtitle="Share your craft or technical expertise with members of the collective."
      withTape={true}
      tapeColor="bg-lavender/85"
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
            {isEditing ? 'Save Changes' : 'Add to Teaching List'}
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
                placeholder="e.g. Three.js Shaders, Sourdough Scoring..."
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
            label="Your Proficiency Level"
            value={proficiency}
            onChange={(e) => setProficiency(e.target.value)}
            options={[
              { value: 'beginner', label: 'Beginner (Basic fundamentals)' },
              { value: 'intermediate', label: 'Intermediate (Practical experience)' },
              { value: 'advanced', label: 'Advanced (Seasoned practitioner)' },
              { value: 'expert', label: 'Expert / Professional' },
            ]}
          />

          <Input
            label="Years of Experience"
            type="number"
            min="0"
            max="40"
            step="0.5"
            value={experienceYears}
            onChange={(e) => setExperienceYears(e.target.value)}
            required
          />
        </div>

        <Textarea
          label="What will you teach & how do you approach it?"
          rows={3}
          placeholder="e.g. I focus on hands-on project building. We will write code from scratch and review clean architecture..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          helperText="A clear teaching description attracts motivated learners."
        />
      </form>
    </Modal>
  );
}
