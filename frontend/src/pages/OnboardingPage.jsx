import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Award, 
  BookOpen, 
  Calendar, 
  Clock, 
  Plus, 
  Trash2, 
  Compass, 
  Heart,
  Globe,
  MapPin,
  Camera,
  Layers,
  ArrowRightLeft
} from 'lucide-react';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { Input, Textarea, Select } from '../components/ui/Input';
import { Sparkle, TapeSticker, Squiggle } from '../components/ui/Doodles';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { supabase } from '../services/supabaseClient';

// Curated avatar presets with diverse creative personas
const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
];

const DEFAULT_INTEREST_TAGS = [
  'Artificial Intelligence',
  'Creative Coding',
  'Ceramic Glazing',
  'Sourdough Fermentation',
  'Jazz Harmony',
  'Film Photography',
  'UI Design Systems',
  'World Languages',
  'Philosophy & Ethics',
  'Indie Game Dev',
  'Urban Gardening',
  'Sound Synthesis',
];

export default function OnboardingPage() {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [canonicalSkills, setCanonicalSkills] = useState([]);
  const [categories, setCategories] = useState([]);

  // Step 1: Profile & Identity
  const [fullName, setFullName] = useState(profile?.full_name || user?.user_metadata?.full_name || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || AVATAR_PRESETS[0]);
  const [bio, setBio] = useState(profile?.bio || '');
  const [location, setLocation] = useState(profile?.location || '');
  const [timeZone, setTimeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC');
  const [learningMode, setLearningMode] = useState(profile?.preferred_learning_mode || 'flexible');

  // Step 2: Skills User Teaches (Array of items)
  const [teachingSkills, setTeachingSkills] = useState([
    {
      skillId: '',
      skillName: 'React.js',
      proficiency: 'advanced',
      experienceYears: 3,
      description: 'I can teach component architecture, state management, and modern hooks.',
    },
  ]);

  // Step 3: Skills User Wants to Learn (Array of items)
  const [wantedSkills, setWantedSkills] = useState([
    {
      skillId: '',
      skillName: 'Acoustic Guitar',
      targetProficiency: 'beginner',
      priority: 'high',
      notes: 'Want to learn open chords, strumming rhythms, and basic fingerpicking.',
    },
  ]);

  // Step 4: Interests
  const [selectedInterests, setSelectedInterests] = useState(['Creative Coding', 'World Languages']);
  const [customInterestInput, setCustomInterestInput] = useState('');

  // Step 5: Availability (Days of week 0-6: 0=Sun, 1=Mon, ..., 6=Sat)
  const [availabilitySlots, setAvailabilitySlots] = useState([
    { dayOfWeek: 1, dayName: 'Monday', active: true, startTime: '18:00', endTime: '20:00' },
    { dayOfWeek: 2, dayName: 'Tuesday', active: false, startTime: '18:00', endTime: '20:00' },
    { dayOfWeek: 3, dayName: 'Wednesday', active: true, startTime: '18:00', endTime: '20:00' },
    { dayOfWeek: 4, dayName: 'Thursday', active: false, startTime: '18:00', endTime: '20:00' },
    { dayOfWeek: 5, dayName: 'Friday', active: false, startTime: '18:00', endTime: '20:00' },
    { dayOfWeek: 6, dayName: 'Saturday', active: true, startTime: '10:00', endTime: '14:00' },
    { dayOfWeek: 0, dayName: 'Sunday', active: false, startTime: '10:00', endTime: '14:00' },
  ]);

  // Fetch canonical skills and categories from Supabase on mount
  useEffect(() => {
    async function loadSkillsAndCategories() {
      try {
        const [skillsRes, catsRes] = await Promise.all([
          supabase.from('skills').select('id, name, slug, category_id'),
          supabase.from('skill_categories').select('id, name, slug'),
        ]);

        if (skillsRes.data) {
          setCanonicalSkills(skillsRes.data);
          // Set initial skillId if available
          const reactSkill = skillsRes.data.find((s) => s.name.includes('React'));
          const guitarSkill = skillsRes.data.find((s) => s.name.includes('Guitar'));
          if (reactSkill) {
            setTeachingSkills((prev) => [{ ...prev[0], skillId: reactSkill.id, skillName: reactSkill.name }]);
          }
          if (guitarSkill) {
            setWantedSkills((prev) => [{ ...prev[0], skillId: guitarSkill.id, skillName: guitarSkill.name }]);
          }
        }
        if (catsRes.data) {
          setCategories(catsRes.data);
        }
      } catch (err) {
        console.warn('Could not load canonical skills:', err);
      }
    }
    loadSkillsAndCategories();
  }, []);

  // Update profile fields if loaded from context or user metadata
  useEffect(() => {
    if (profile) {
      if (profile.full_name && !fullName) setFullName(profile.full_name);
      if (profile.avatar_url) setAvatarUrl(profile.avatar_url);
      if (profile.bio && !bio) setBio(profile.bio);
      if (profile.location && !location) setLocation(profile.location);
    } else if (user?.user_metadata) {
      if (user.user_metadata.full_name && !fullName) {
        setFullName(user.user_metadata.full_name);
      }
    }
  }, [profile, user]);

  // Handler for adding another teaching skill
  const handleAddTeachingSkill = () => {
    const nextSkill = canonicalSkills[teachingSkills.length % canonicalSkills.length];
    setTeachingSkills((prev) => [
      ...prev,
      {
        skillId: nextSkill?.id || '',
        skillName: nextSkill?.name || '',
        proficiency: 'intermediate',
        experienceYears: 1,
        description: '',
      },
    ]);
  };

  const handleRemoveTeachingSkill = (idx) => {
    if (teachingSkills.length === 1) return;
    setTeachingSkills((prev) => prev.filter((_, i) => i !== idx));
  };

  // Handler for adding another wanted skill
  const handleAddWantedSkill = () => {
    const nextSkill = canonicalSkills[(wantedSkills.length + 3) % canonicalSkills.length];
    setWantedSkills((prev) => [
      ...prev,
      {
        skillId: nextSkill?.id || '',
        skillName: nextSkill?.name || '',
        targetProficiency: 'beginner',
        priority: 'medium',
        notes: '',
      },
    ]);
  };

  const handleRemoveWantedSkill = (idx) => {
    if (wantedSkills.length === 1) return;
    setWantedSkills((prev) => prev.filter((_, i) => i !== idx));
  };

  // Toggle interest tags
  const toggleInterest = (tag) => {
    setSelectedInterests((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleAddCustomInterest = (e) => {
    e.preventDefault();
    if (customInterestInput.trim() && !selectedInterests.includes(customInterestInput.trim())) {
      setSelectedInterests((prev) => [...prev, customInterestInput.trim()]);
      setCustomInterestInput('');
    }
  };

  // Toggle availability slot
  const toggleDayActive = (idx) => {
    setAvailabilitySlots((prev) =>
      prev.map((slot, i) => (i === idx ? { ...slot, active: !slot.active } : slot))
    );
  };

  const updateSlotTime = (idx, field, value) => {
    setAvailabilitySlots((prev) =>
      prev.map((slot, i) => (i === idx ? { ...slot, [field]: value } : slot))
    );
  };

  // Final Complete Onboarding Submission
  const handleFinalSubmit = async () => {
    if (!user) {
      toast.warning('Session Required', 'Please sign in to save your profile.');
      navigate('/auth?mode=signin');
      return;
    }

    setSubmitting(true);

    try {
      // Ensure canonical skills are available
      let availableSkills = canonicalSkills;
      if (!availableSkills || availableSkills.length === 0) {
        const { data: fetchedSkills } = await supabase.from('skills').select('id, name, slug');
        if (fetchedSkills && fetchedSkills.length > 0) {
          availableSkills = fetchedSkills;
          setCanonicalSkills(fetchedSkills);
        }
      }

      // 1. Upsert public.profiles with core info & onboarding_completed = true
      const fallbackUsername = profile?.username || user?.user_metadata?.username || `user_${user.id.slice(0, 6)}`;
      const profileData = {
        id: user.id,
        username: fallbackUsername,
        full_name: fullName.trim() || user?.user_metadata?.full_name || 'SkillSwap Member',
        avatar_url: avatarUrl,
        bio: bio.trim() || 'Excited to trade skills and learn with the community!',
        location: location.trim() || 'Global',
        time_zone: timeZone,
        preferred_learning_mode: learningMode,
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      };

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(profileData, { onConflict: 'id' });

      if (profileError) throw profileError;

      // 2. Save User Teaching Skills to public.user_skills
      // Delete existing to allow clean idempotent replace
      await supabase.from('user_skills').delete().eq('user_id', user.id);

      const teachingRows = [];
      for (const t of teachingSkills) {
        let matchedSkillId = t.skillId;
        // If skillId is missing, lookup or find in canonical
        if (!matchedSkillId) {
          const match = availableSkills.find((s) => s.name.toLowerCase() === (t.skillName || '').toLowerCase());
          matchedSkillId = match ? match.id : availableSkills[0]?.id;
        }

        if (matchedSkillId) {
          teachingRows.push({
            user_id: user.id,
            skill_id: matchedSkillId,
            proficiency_level: t.proficiency,
            experience_years: Number(t.experienceYears) || 1,
            description: t.description,
          });
        }
      }

      if (teachingRows.length > 0) {
        const { error: teachError } = await supabase.from('user_skills').insert(teachingRows);
        if (teachError) console.warn('User skills insert note:', teachError.message);
      }

      // 3. Save Wanted Skills to public.wanted_skills
      await supabase.from('wanted_skills').delete().eq('user_id', user.id);

      const wantedRows = [];
      for (const w of wantedSkills) {
        let matchedSkillId = w.skillId;
        if (!matchedSkillId) {
          const match = availableSkills.find((s) => s.name.toLowerCase() === (w.skillName || '').toLowerCase());
          matchedSkillId = match ? match.id : availableSkills[1]?.id || availableSkills[0]?.id;
        }

        if (matchedSkillId) {
          wantedRows.push({
            user_id: user.id,
            skill_id: matchedSkillId,
            target_proficiency: w.targetProficiency,
            priority: w.priority,
            notes: w.notes,
          });
        }
      }

      if (wantedRows.length > 0) {
        const { error: wantError } = await supabase.from('wanted_skills').insert(wantedRows);
        if (wantError) console.warn('Wanted skills insert note:', wantError.message);
      }

      // 4. Save User Interests to public.user_interests
      await supabase.from('user_interests').delete().eq('user_id', user.id);

      const interestRows = selectedInterests.map((interestName) => ({
        user_id: user.id,
        name: interestName,
      }));

      if (interestRows.length > 0) {
        const { error: intError } = await supabase.from('user_interests').insert(interestRows);
        if (intError) console.warn('Interests insert note:', intError.message);
      }

      // 5. Save Availability Slots to public.availability
      await supabase.from('availability').delete().eq('user_id', user.id);

      const activeSlots = availabilitySlots
        .filter((s) => s.active)
        .map((s) => ({
          user_id: user.id,
          day_of_week: s.dayOfWeek,
          start_time: s.startTime,
          end_time: s.endTime,
          time_zone: timeZone,
          is_active: true,
        }));

      if (activeSlots.length > 0) {
        const { error: availError } = await supabase.from('availability').insert(activeSlots);
        if (availError) console.warn('Availability insert note:', availError.message);
      }

      // Refresh cached profile in AuthContext
      await refreshProfile();

      toast.swap('Profile Published! 🎉', 'Your skills and availability are now live in the community!');
      navigate('/dashboard');
    } catch (err) {
      console.error('Onboarding save error:', err);
      toast.warning('Save Error', err.message || 'Could not complete onboarding.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      
      {/* Header Banner */}
      <div className="text-center mb-10 space-y-2">
        <Badge variant="dusty" size="sm" withSparkle={true}>
          Step {step} of 5 &bull; Personalize Your Barter Persona
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-bold font-serif text-charcoal tracking-tight">
          Welcome to the SkillSwap Collective
        </h1>
        <p className="text-xs sm:text-sm text-charcoal-muted max-w-lg mx-auto">
          Tell fellow learners what you teach, what you desire to learn, and when you are open for sessions.
        </p>

        {/* Step Progress Tracker */}
        <div className="flex items-center justify-center gap-2 pt-4">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                s === step
                  ? 'w-10 bg-dusty border border-charcoal shadow-sm'
                  : s < step
                  ? 'w-6 bg-sage border border-charcoal/20'
                  : 'w-6 bg-charcoal/15'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Main Multi-Step Form Card */}
      <div className="bg-white rounded-4xl p-6 sm:p-10 border-2 border-charcoal shadow-pop relative">
        <TapeSticker color="bg-butter/85" rotate={step % 2 === 0 ? '1.5deg' : '-1.5deg'} />

        <AnimatePresence mode="wait">
          
          {/* ---------------------------------------------------------------- */}
          {/* STEP 1: PROFILE & PERSONA                                        */}
          {/* ---------------------------------------------------------------- */}
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold font-serif text-charcoal">
                  1. Identity &amp; Profile
                </h2>
                <p className="text-xs text-charcoal-muted mt-1">
                  How other creators will discover and recognize you.
                </p>
              </div>

              {/* Avatar Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-muted">
                  Choose an Avatar Persona
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
                  {AVATAR_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAvatarUrl(preset)}
                      className={`relative rounded-2xl overflow-hidden border-2 transition p-0.5 ${
                        avatarUrl === preset
                          ? 'border-charcoal ring-2 ring-dusty shadow-pop-sm scale-105'
                          : 'border-charcoal/20 hover:border-charcoal opacity-75 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={preset}
                        alt={`Avatar ${idx + 1}`}
                        className="w-full h-12 sm:h-14 object-cover rounded-xl"
                      />
                      {avatarUrl === preset && (
                        <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-butter rounded-full border border-charcoal flex items-center justify-center text-[8px] font-bold">
                          ✓
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                <div className="pt-2">
                  <Input
                    label="Or paste a custom image URL"
                    placeholder="https://your-domain.com/avatar.jpg"
                    leftIcon={<Camera className="w-4 h-4" />}
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  placeholder="e.g. Maya Lin"
                  leftIcon={<User className="w-4 h-4" />}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />

                <Input
                  label="Location"
                  placeholder="e.g. San Francisco, CA or London, UK"
                  leftIcon={<MapPin className="w-4 h-4" />}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <Textarea
                label="Short Bio & Background"
                rows={3}
                placeholder="Share your creative background, hobbies, or what inspires you to teach and learn..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                helperText="A warm bio encourages more swap partners to connect with you."
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Preferred Learning Mode"
                  value={learningMode}
                  onChange={(e) => setLearningMode(e.target.value)}
                  options={[
                    { value: 'online', label: 'Online (Video Call Sessions)' },
                    { value: 'in-person', label: 'In-Person (Local Coffee / Studio)' },
                    { value: 'flexible', label: 'Flexible (Open to Both)' },
                  ]}
                />

                <Input
                  label="Time Zone"
                  leftIcon={<Globe className="w-4 h-4" />}
                  value={timeZone}
                  onChange={(e) => setTimeZone(e.target.value)}
                  helperText="Used to synchronize session calendars"
                />
              </div>
            </motion.div>
          )}

          {/* ---------------------------------------------------------------- */}
          {/* STEP 2: SKILLS YOU CAN TEACH                                     */}
          {/* ---------------------------------------------------------------- */}
          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold font-serif text-charcoal">
                    2. Skills You Can Teach
                  </h2>
                  <p className="text-xs text-charcoal-muted mt-1">
                    What expertise or craft can you share with fellow barter partners?
                  </p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddTeachingSkill}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                >
                  Add Another Skill
                </Button>
              </div>

              <div className="space-y-4">
                {teachingSkills.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-3xl bg-ivory border-2 border-charcoal/20 space-y-4 relative"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-dusty font-mono">
                        Teaching Offering #{idx + 1}
                      </span>
                      {teachingSkills.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveTeachingSkill(idx)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {canonicalSkills.length > 0 ? (
                        <Select
                          label="Select Canonical Skill"
                          value={item.skillId}
                          onChange={(e) => {
                            const found = canonicalSkills.find((s) => s.id === e.target.value);
                            setTeachingSkills((prev) =>
                              prev.map((s, i) =>
                                i === idx
                                  ? { ...s, skillId: e.target.value, skillName: found?.name || s.skillName }
                                  : s
                              )
                            );
                          }}
                        >
                          <option value="">Select from canonical catalog...</option>
                          {canonicalSkills.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name}
                            </option>
                          ))}
                        </Select>
                      ) : (
                        <Input
                          label="Skill Name"
                          placeholder="e.g. Modern React.js"
                          value={item.skillName}
                          onChange={(e) =>
                            setTeachingSkills((prev) =>
                              prev.map((s, i) => (i === idx ? { ...s, skillName: e.target.value } : s))
                            )
                          }
                        />
                      )}

                      <Select
                        label="Your Proficiency"
                        value={item.proficiency}
                        onChange={(e) =>
                          setTeachingSkills((prev) =>
                            prev.map((s, i) => (i === idx ? { ...s, proficiency: e.target.value } : s))
                          )
                        }
                        options={[
                          { value: 'beginner', label: 'Beginner (Basic fundamentals)' },
                          { value: 'intermediate', label: 'Intermediate (Practical experience)' },
                          { value: 'advanced', label: 'Advanced (Experienced practitioner)' },
                          { value: 'expert', label: 'Expert / Native Fluency' },
                        ]}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <Input
                        label="Experience (Years)"
                        type="number"
                        min="0"
                        max="40"
                        value={item.experienceYears}
                        onChange={(e) =>
                          setTeachingSkills((prev) =>
                            prev.map((s, i) => (i === idx ? { ...s, experienceYears: e.target.value } : s))
                          )
                        }
                      />

                      <div className="sm:col-span-2">
                        <Input
                          label="Brief note on what you can cover"
                          placeholder="e.g. Hook composition, state management, CSS transitions..."
                          value={item.description}
                          onChange={(e) =>
                            setTeachingSkills((prev) =>
                              prev.map((s, i) => (i === idx ? { ...s, description: e.target.value } : s))
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ---------------------------------------------------------------- */}
          {/* STEP 3: SKILLS YOU WANT TO LEARN                                 */}
          {/* ---------------------------------------------------------------- */}
          {step === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold font-serif text-charcoal">
                    3. Skills You Want to Learn
                  </h2>
                  <p className="text-xs text-charcoal-muted mt-1">
                    What crafts, languages, or skills are you passionate about mastering?
                  </p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddWantedSkill}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                >
                  Add Learning Goal
                </Button>
              </div>

              <div className="space-y-4">
                {wantedSkills.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-3xl bg-ivory border-2 border-charcoal/20 space-y-4 relative"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-sage-dark font-mono">
                        Learning Desire #{idx + 1}
                      </span>
                      {wantedSkills.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveWantedSkill(idx)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {canonicalSkills.length > 0 ? (
                        <Select
                          label="Select Desired Skill"
                          value={item.skillId}
                          onChange={(e) => {
                            const found = canonicalSkills.find((s) => s.id === e.target.value);
                            setWantedSkills((prev) =>
                              prev.map((s, i) =>
                                i === idx
                                  ? { ...s, skillId: e.target.value, skillName: found?.name || s.skillName }
                                  : s
                              )
                            );
                          }}
                        >
                          <option value="">Select skill...</option>
                          {canonicalSkills.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name}
                            </option>
                          ))}
                        </Select>
                      ) : (
                        <Input
                          label="Skill Name"
                          placeholder="e.g. Acoustic Guitar"
                          value={item.skillName}
                          onChange={(e) =>
                            setWantedSkills((prev) =>
                              prev.map((s, i) => (i === idx ? { ...s, skillName: e.target.value } : s))
                            )
                          }
                        />
                      )}

                      <Select
                        label="Target Level"
                        value={item.targetProficiency}
                        onChange={(e) =>
                          setWantedSkills((prev) =>
                            prev.map((s, i) => (i === idx ? { ...s, targetProficiency: e.target.value } : s))
                          )
                        }
                        options={[
                          { value: 'beginner', label: 'Beginner (Get started)' },
                          { value: 'intermediate', label: 'Intermediate (Build projects)' },
                          { value: 'advanced', label: 'Advanced (Mastery)' },
                        ]}
                      />

                      <Select
                        label="Priority"
                        value={item.priority}
                        onChange={(e) =>
                          setWantedSkills((prev) =>
                            prev.map((s, i) => (i === idx ? { ...s, priority: e.target.value } : s))
                          )
                        }
                        options={[
                          { value: 'high', label: 'High Priority' },
                          { value: 'medium', label: 'Medium Priority' },
                          { value: 'low', label: 'Casual / Low' },
                        ]}
                      />
                    </div>

                    <Input
                      label="Learning Notes & Objectives"
                      placeholder="e.g. Want to learn chords, rhythm, and song accompaniment..."
                      value={item.notes}
                      onChange={(e) =>
                        setWantedSkills((prev) =>
                          prev.map((s, i) => (i === idx ? { ...s, notes: e.target.value } : s))
                        )
                      }
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ---------------------------------------------------------------- */}
          {/* STEP 4: PASSIONS & TOPICS OF INTEREST                            */}
          {/* ---------------------------------------------------------------- */}
          {step === 4 && (
            <motion.div
              key="step-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold font-serif text-charcoal">
                  4. Passions &amp; Topics of Interest
                </h2>
                <p className="text-xs text-charcoal-muted mt-1">
                  Tag general domains you enjoy discussing. These help find like-minded community peers.
                </p>
              </div>

              {/* Tag Cloud */}
              <div className="flex flex-wrap gap-2.5">
                {DEFAULT_INTEREST_TAGS.map((tag) => {
                  const isSelected = selectedInterests.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleInterest(tag)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition border-2 ${
                        isSelected
                          ? 'bg-butter text-charcoal border-charcoal shadow-pop-sm scale-105'
                          : 'bg-white text-charcoal border-charcoal/20 hover:border-charcoal'
                      }`}
                    >
                      {isSelected ? `✓ ${tag}` : `+ ${tag}`}
                    </button>
                  );
                })}
              </div>

              {/* Add Custom Tag Form */}
              <form onSubmit={handleAddCustomInterest} className="flex gap-2 pt-2">
                <Input
                  placeholder="Type a custom interest and press Enter..."
                  value={customInterestInput}
                  onChange={(e) => setCustomInterestInput(e.target.value)}
                />
                <Button
                  type="submit"
                  variant="outline"
                  size="sm"
                  disabled={!customInterestInput.trim()}
                >
                  Add Tag
                </Button>
              </form>

              <div className="p-4 rounded-2xl bg-lavender-soft border border-charcoal/15 text-xs text-charcoal">
                <span className="font-bold">Selected Topics: </span>
                {selectedInterests.length > 0 ? (
                  <span>{selectedInterests.join(', ')}</span>
                ) : (
                  <span className="italic text-charcoal-muted">None selected yet.</span>
                )}
              </div>
            </motion.div>
          )}

          {/* ---------------------------------------------------------------- */}
          {/* STEP 5: SCHEDULE & AVAILABILITY                                  */}
          {/* ---------------------------------------------------------------- */}
          {step === 5 && (
            <motion.div
              key="step-5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold font-serif text-charcoal">
                  5. Weekly Availability
                </h2>
                <p className="text-xs text-charcoal-muted mt-1">
                  Specify days and time windows you are open for reciprocal swap sessions.
                </p>
              </div>

              <div className="space-y-3">
                {availabilitySlots.map((slot, idx) => (
                  <div
                    key={slot.dayOfWeek}
                    className={`p-3.5 rounded-2xl border-2 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      slot.active
                        ? 'bg-white border-charcoal shadow-sm'
                        : 'bg-ivory/60 border-charcoal/10 opacity-70'
                    }`}
                  >
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={slot.active}
                        onChange={() => toggleDayActive(idx)}
                        className="w-4 h-4 rounded text-dusty focus:ring-dusty border-charcoal"
                      />
                      <span className="font-bold text-sm text-charcoal font-serif">
                        {slot.dayName}
                      </span>
                    </label>

                    {slot.active ? (
                      <div className="flex items-center space-x-2 text-xs">
                        <span className="text-charcoal-muted">From</span>
                        <input
                          type="time"
                          value={slot.startTime}
                          onChange={(e) => updateSlotTime(idx, 'startTime', e.target.value)}
                          className="px-2.5 py-1 rounded-xl bg-ivory border border-charcoal/20 font-mono text-xs"
                        />
                        <span className="text-charcoal-muted">to</span>
                        <input
                          type="time"
                          value={slot.endTime}
                          onChange={(e) => updateSlotTime(idx, 'endTime', e.target.value)}
                          className="px-2.5 py-1 rounded-xl bg-ivory border border-charcoal/20 font-mono text-xs"
                        />
                      </div>
                    ) : (
                      <span className="text-xs text-charcoal-subtle italic">Unavailable</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Review Summary Box */}
              <div className="p-5 rounded-3xl bg-sage-soft border-2 border-sage-dark/40 space-y-2 text-xs">
                <h4 className="font-bold font-serif text-charcoal text-sm flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-sage-dark" />
                  <span>Ready to publish your SkillSwap profile!</span>
                </h4>
                <p className="text-charcoal-muted leading-relaxed">
                  You are listing <strong className="text-charcoal">{teachingSkills.length} teaching skills</strong> and <strong className="text-charcoal">{wantedSkills.length} learning goals</strong> across <strong className="text-charcoal">{availabilitySlots.filter((s) => s.active).length} weekly availability slots</strong>.
                </p>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

        {/* Navigation Actions Footer */}
        <div className="mt-8 pt-6 border-t border-charcoal/10 flex items-center justify-between">
          {step > 1 ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStep(step - 1)}
              leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
            >
              Previous
            </Button>
          ) : (
            <span />
          )}

          {step < 5 ? (
            <Button
              variant="primary"
              size="md"
              onClick={() => setStep(step + 1)}
              rightIcon={<ArrowRight className="w-3.5 h-3.5 text-butter" />}
            >
              Continue to Step {step + 1}
            </Button>
          ) : (
            <Button
              variant="primary"
              size="md"
              onClick={handleFinalSubmit}
              isLoading={submitting}
              rightIcon={<Sparkles className="w-4 h-4 text-butter" />}
            >
              Complete Onboarding &amp; Enter SkillSwap
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
