import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  MapPin,
  Globe,
  Star,
  Calendar,
  Clock,
  Edit3,
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  LogOut,
  ArrowRightLeft,
  Sparkles,
  Camera,
  Heart,
  BookOpen,
  Award,
  AlertCircle,
} from 'lucide-react';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { Input, Textarea, Select } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Sparkle, TapeSticker } from '../components/ui/Doodles';
import { Skeleton, SkeletonAvatar, SkeletonText, SkeletonBadge } from '../components/ui/Skeleton';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { supabase } from '../services/supabaseClient';
import {
  getPublicProfile,
  deleteTeachingSkill,
  deleteWantedSkill,
} from '../services/profileService';
import AddEditTeachingSkillModal from '../components/profile/AddEditTeachingSkillModal';
import AddEditWantedSkillModal from '../components/profile/AddEditWantedSkillModal';
import AvatarUploadModal from '../components/profile/AvatarUploadModal';
import AvailabilityEditor from '../components/profile/AvailabilityEditor';
import InterestsEditor from '../components/profile/InterestsEditor';

// ─── Constants ────────────────────────────────────────────────────────────────

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

const TABS = [
  { id: 'overview',     label: 'Overview',         icon: <User className="w-3.5 h-3.5" /> },
  { id: 'edit',         label: 'Edit Profile',      icon: <Edit3 className="w-3.5 h-3.5" /> },
  { id: 'teaching',     label: 'Teaching Skills',   icon: <Award className="w-3.5 h-3.5" /> },
  { id: 'learning',     label: 'Learning Goals',    icon: <BookOpen className="w-3.5 h-3.5" /> },
  { id: 'availability', label: 'Availability',      icon: <Calendar className="w-3.5 h-3.5" /> },
  { id: 'interests',    label: 'Interests',         icon: <Heart className="w-3.5 h-3.5" /> },
];

const getDayName = (d) =>
  ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d] || '—';

// ─── Loading Skeleton ──────────────────────────────────────────────────────────

function ProfileSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-pulse">
      <div className="bg-white rounded-4xl p-8 border-2 border-charcoal/10 flex items-center gap-6">
        <SkeletonAvatar size="w-20 h-20" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-7 w-48 rounded-xl" />
          <Skeleton className="h-4 w-32 rounded-lg" />
          <div className="flex gap-2">
            <SkeletonBadge width="w-20" />
            <SkeletonBadge width="w-16" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-3xl p-6 border-2 border-charcoal/10 space-y-4">
            <Skeleton className="h-5 w-32 rounded-lg" />
            <SkeletonText lines={3} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Public Profile View ───────────────────────────────────────────────────────

function PublicProfileView({ data, onSwapClick }) {
  const { profile, teachingSkills, wantedSkills, interests, availability, reviews } = data;

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Hero Card */}
      <div className="bg-white rounded-4xl p-6 sm:p-10 border-2 border-charcoal shadow-pop relative overflow-hidden">
        <TapeSticker color="bg-sage/85" rotate="-1deg" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          {/* Left: identity */}
          <div className="flex items-center gap-5">
            <img
              src={profile.avatar_url || AVATAR_PRESETS[0]}
              alt={profile.full_name}
              className="w-20 h-20 rounded-3xl object-cover border-2 border-charcoal shadow-pop-sm flex-shrink-0"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold font-serif text-charcoal">
                  {profile.full_name || 'SkillSwap Member'}
                </h1>
                <Badge variant="sage" size="xs">
                  <CheckCircle2 className="w-3 h-3 mr-0.5" /> Verified
                </Badge>
              </div>
              <p className="text-xs text-charcoal-subtle font-mono mt-0.5">
                @{profile.username}
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-charcoal-muted">
                {profile.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-dusty" />
                    {profile.location}
                  </span>
                )}
                {avgRating && (
                  <span className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-butter text-charcoal" />
                    <span className="font-bold text-charcoal">{avgRating}</span>
                    <span>({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
                  </span>
                )}
                <span className="flex items-center gap-1 capitalize">
                  <Globe className="w-3.5 h-3.5 text-dusty" />
                  Mode: {profile.preferred_learning_mode || 'Flexible'}
                </span>
              </div>
            </div>
          </div>

          {/* Right: CTA */}
          <Button
            variant="primary"
            size="md"
            onClick={onSwapClick}
            rightIcon={<ArrowRightLeft className="w-4 h-4 text-butter" />}
          >
            Propose a Skill Swap
          </Button>
        </div>

        {profile.bio && (
          <div className="pt-6 mt-6 border-t border-charcoal/10">
            <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-subtle mb-1">About</h4>
            <p className="text-sm text-charcoal-muted leading-relaxed max-w-3xl">{profile.bio}</p>
          </div>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Teaching skills */}
        <div className="bg-white rounded-3xl p-6 border-2 border-charcoal shadow-pop space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-charcoal/10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-dusty flex items-center justify-center text-sm">🎓</div>
              <div>
                <h3 className="text-base font-bold font-serif text-charcoal">Skills They Teach</h3>
                <p className="text-xs text-charcoal-muted">Offered to the community</p>
              </div>
            </div>
            <Badge variant="lavender" size="xs">{teachingSkills.length} Listed</Badge>
          </div>
          <div className="space-y-3">
            {teachingSkills.length > 0 ? (
              teachingSkills.map((item) => (
                <div key={item.id} className="p-3.5 rounded-2xl bg-ivory border border-charcoal/10 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm font-serif text-charcoal">{item.skills?.name}</span>
                    <Badge variant="butter" size="xs">
                      {item.proficiency_level} · {item.experience_years}yr{item.experience_years !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  {item.description && (
                    <p className="text-xs text-charcoal-muted leading-relaxed">{item.description}</p>
                  )}
                  {item.skills?.skill_categories?.name && (
                    <Badge variant="outline" size="xs">{item.skills.skill_categories.name}</Badge>
                  )}
                </div>
              ))
            ) : (
              <p className="text-xs text-charcoal-muted italic py-4 text-center">No teaching skills listed yet.</p>
            )}
          </div>
        </div>

        {/* Learning goals */}
        <div className="bg-white rounded-3xl p-6 border-2 border-charcoal shadow-pop space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-charcoal/10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-sage-dark flex items-center justify-center text-sm">🌱</div>
              <div>
                <h3 className="text-base font-bold font-serif text-charcoal">Skills They Want</h3>
                <p className="text-xs text-charcoal-muted">Learning roadmap</p>
              </div>
            </div>
            <Badge variant="sage" size="xs">{wantedSkills.length} Goals</Badge>
          </div>
          <div className="space-y-3">
            {wantedSkills.length > 0 ? (
              wantedSkills.map((item) => (
                <div key={item.id} className="p-3.5 rounded-2xl bg-ivory border border-charcoal/10 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm font-serif text-charcoal">{item.skills?.name}</span>
                    <div className="flex gap-1.5">
                      <Badge variant="outline" size="xs">→ {item.target_proficiency}</Badge>
                      <Badge variant="dusty" size="xs">{item.priority}</Badge>
                    </div>
                  </div>
                  {item.notes && (
                    <p className="text-xs text-charcoal-muted leading-relaxed">{item.notes}</p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-xs text-charcoal-muted italic py-4 text-center">No learning goals listed yet.</p>
            )}
          </div>
        </div>

        {/* Availability */}
        <div className="bg-white rounded-3xl p-6 border-2 border-charcoal shadow-pop space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-charcoal/10">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-dusty" />
              <div>
                <h3 className="text-base font-bold font-serif text-charcoal">Availability</h3>
                <p className="text-xs text-charcoal-muted">Open weekly slots</p>
              </div>
            </div>
            <Badge variant="butter" size="xs">{availability.length} Slots</Badge>
          </div>
          <div className="space-y-2">
            {availability.length > 0 ? (
              availability.map((slot) => (
                <div key={slot.id} className="px-3.5 py-2.5 rounded-xl bg-ivory border border-charcoal/10 flex items-center justify-between text-xs">
                  <span className="font-bold text-charcoal font-serif">{getDayName(slot.day_of_week)}</span>
                  <div className="flex items-center gap-1.5 font-mono text-charcoal-muted">
                    <Clock className="w-3.5 h-3.5 text-dusty" />
                    {slot.start_time} → {slot.end_time}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-charcoal-muted italic py-4 text-center">No weekly schedule configured.</p>
            )}
          </div>
        </div>

        {/* Interests */}
        <div className="bg-white rounded-3xl p-6 border-2 border-charcoal shadow-pop space-y-4">
          <div className="pb-3 border-b border-charcoal/10 flex items-center gap-2">
            <Heart className="w-5 h-5 text-dusty" />
            <div>
              <h3 className="text-base font-bold font-serif text-charcoal">Interests</h3>
              <p className="text-xs text-charcoal-muted">Community topics</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {interests.length > 0 ? (
              interests.map((int) => (
                <Badge key={int.id} variant="lavender" size="sm">{int.name}</Badge>
              ))
            ) : (
              <p className="text-xs text-charcoal-muted italic py-4 text-center w-full">No interests added yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Reviews */}
      {reviews.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border-2 border-charcoal shadow-pop space-y-4">
          <div className="pb-3 border-b border-charcoal/10">
            <h3 className="text-base font-bold font-serif text-charcoal flex items-center gap-2">
              <Star className="w-4 h-4 fill-butter text-charcoal" /> Community Reviews
            </h3>
          </div>
          <div className="space-y-4">
            {reviews.slice(0, 5).map((review) => (
              <div key={review.id} className="p-4 rounded-2xl bg-ivory border border-charcoal/10 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {review.reviewer?.avatar_url && (
                      <img src={review.reviewer.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover border border-charcoal/20" />
                    )}
                    <span className="text-xs font-bold text-charcoal">
                      {review.reviewer?.full_name || 'Anonymous'}
                    </span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-butter text-charcoal' : 'text-charcoal/20'}`}
                      />
                    ))}
                  </div>
                </div>
                {review.comment && (
                  <p className="text-xs text-charcoal-muted leading-relaxed">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Own Profile: Overview Tab ─────────────────────────────────────────────────

function OverviewTab({ profile, teachingSkills, wantedSkills, interests, availability, onChangeTab }) {
  return (
    <div className="space-y-6">
      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Skills Taught', value: teachingSkills.length, color: 'bg-lavender-soft border-lavender-dark' },
          { label: 'Learning Goals', value: wantedSkills.length, color: 'bg-sage-soft border-sage-dark' },
          { label: 'Open Slots', value: availability.length, color: 'bg-butter-soft border-butter-dark' },
          { label: 'Interests', value: interests.length, color: 'bg-ivory-warm border-charcoal/15' },
        ].map(({ label, value, color }) => (
          <div key={label} className={`rounded-2xl p-4 border-2 text-center ${color}`}>
            <div className="text-2xl font-bold font-serif text-charcoal">{value}</div>
            <div className="text-xs text-charcoal-muted mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Quick skill lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-5 border-2 border-charcoal shadow-pop space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold font-serif text-charcoal flex items-center gap-2">
              🎓 Teaching Skills
            </h4>
            <button
              onClick={() => onChangeTab('teaching')}
              className="text-xs text-dusty hover:underline font-semibold"
            >
              Manage →
            </button>
          </div>
          {teachingSkills.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {teachingSkills.map((s) => (
                <Badge key={s.id} variant="lavender" size="xs">
                  {s.skills?.name}
                </Badge>
              ))}
            </div>
          ) : (
            <button
              onClick={() => onChangeTab('teaching')}
              className="text-xs text-charcoal-muted italic hover:text-dusty transition"
            >
              + Add your first teaching skill
            </button>
          )}
        </div>

        <div className="bg-white rounded-3xl p-5 border-2 border-charcoal shadow-pop space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold font-serif text-charcoal flex items-center gap-2">
              🌱 Learning Goals
            </h4>
            <button
              onClick={() => onChangeTab('learning')}
              className="text-xs text-dusty hover:underline font-semibold"
            >
              Manage →
            </button>
          </div>
          {wantedSkills.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {wantedSkills.map((s) => (
                <Badge key={s.id} variant="butter" size="xs">
                  {s.skills?.name}
                </Badge>
              ))}
            </div>
          ) : (
            <button
              onClick={() => onChangeTab('learning')}
              className="text-xs text-charcoal-muted italic hover:text-dusty transition"
            >
              + Add what you want to learn
            </button>
          )}
        </div>
      </div>

      {/* Availability quick view */}
      <div className="bg-white rounded-3xl p-5 border-2 border-charcoal shadow-pop space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold font-serif text-charcoal flex items-center gap-2">
            <Calendar className="w-4 h-4 text-dusty" /> Weekly Availability
          </h4>
          <button
            onClick={() => onChangeTab('availability')}
            className="text-xs text-dusty hover:underline font-semibold"
          >
            Edit →
          </button>
        </div>
        {availability.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {availability.map((s) => (
              <span key={s.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sage-soft border border-sage-dark text-xs font-semibold text-charcoal">
                <Clock className="w-3 h-3 text-dusty" />
                {getDayName(s.day_of_week)} {s.start_time}–{s.end_time}
              </span>
            ))}
          </div>
        ) : (
          <button
            onClick={() => onChangeTab('availability')}
            className="text-xs text-charcoal-muted italic hover:text-dusty transition"
          >
            + Set your available days and times
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Own Profile: Edit Profile Tab ────────────────────────────────────────────

function EditProfileTab({ profile, user, refreshProfile, toast }) {
  const [fullName, setFullName]       = useState(profile?.full_name || '');
  const [bio, setBio]                 = useState(profile?.bio || '');
  const [location, setLocation]       = useState(profile?.location || '');
  const [learningMode, setLearningMode] = useState(profile?.preferred_learning_mode || 'flexible');
  const [avatarUrl, setAvatarUrl]     = useState(profile?.avatar_url || AVATAR_PRESETS[0]);
  const [saving, setSaving]           = useState(false);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);

  // Sync when profile context refreshes
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setBio(profile.bio || '');
      setLocation(profile.location || '');
      setLearningMode(profile.preferred_learning_mode || 'flexible');
      setAvatarUrl(profile.avatar_url || AVATAR_PRESETS[0]);
    }
  }, [profile]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.warning('Required Field', 'Full name cannot be empty.');
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName.trim(),
          bio: bio.trim(),
          location: location.trim(),
          preferred_learning_mode: learningMode,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);
      if (error) throw error;
      await refreshProfile();
      toast.success('Profile Saved! ✨', 'Your changes have been updated.');
    } catch (err) {
      toast.warning('Update Failed', err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSave} className="space-y-6">
        {/* Avatar section */}
        <div className="flex items-center gap-5 p-5 rounded-3xl bg-ivory border-2 border-charcoal/10">
          <img
            src={avatarUrl}
            alt="Profile"
            className="w-16 h-16 rounded-2xl object-cover border-2 border-charcoal shadow-pop-sm flex-shrink-0"
          />
          <div>
            <p className="text-sm font-bold font-serif text-charcoal">Profile Picture</p>
            <p className="text-xs text-charcoal-muted mb-2">Upload a photo or choose a preset persona.</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setAvatarModalOpen(true)}
              leftIcon={<Camera className="w-3.5 h-3.5 text-charcoal" />}
            >
              Change Picture
            </Button>
          </div>
        </div>

        {/* Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            placeholder="e.g. Elena Rostova"
          />
          <Input
            label="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="City, Country"
          />
        </div>

        <Textarea
          label="Bio"
          rows={4}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell the community about your background, what you love to teach, and what you're passionate about learning..."
          helperText="A compelling bio helps attract the right skill swap partners."
        />

        <Select
          label="Preferred Learning Mode"
          value={learningMode}
          onChange={(e) => setLearningMode(e.target.value)}
          options={[
            { value: 'online', label: 'Online (Video call sessions)' },
            { value: 'in-person', label: 'In-Person (Local meetups)' },
            { value: 'flexible', label: 'Flexible (Either works for me)' },
          ]}
        />

        <div className="pt-2 flex justify-end">
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={saving}
            rightIcon={<Save className="w-3.5 h-3.5 text-butter" />}
          >
            Save Profile
          </Button>
        </div>
      </form>

      <AvatarUploadModal
        isOpen={avatarModalOpen}
        onClose={() => setAvatarModalOpen(false)}
        currentAvatar={avatarUrl}
        onAvatarUpdated={(url) => setAvatarUrl(url)}
      />
    </>
  );
}

// ─── Own Profile: Teaching Skills Tab ─────────────────────────────────────────

function TeachingSkillsTab({ userId, teachingSkills, categories, canonicalSkills, onRefresh, toast }) {
  const [addModalOpen, setAddModalOpen]   = useState(false);
  const [editItem, setEditItem]           = useState(null);
  const [deletingId, setDeletingId]       = useState(null);

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this teaching skill from your profile?')) return;
    setDeletingId(id);
    try {
      await deleteTeachingSkill(id);
      toast.success('Skill Removed', 'The teaching skill has been deleted.');
      onRefresh();
    } catch (err) {
      toast.warning('Delete Failed', err.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold font-serif text-charcoal">Skills You Can Teach</h3>
            <p className="text-xs text-charcoal-muted">These appear on your public profile and in the skill exchange board.</p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => { setEditItem(null); setAddModalOpen(true); }}
            leftIcon={<Plus className="w-3.5 h-3.5 text-butter" />}
          >
            Add Teaching Skill
          </Button>
        </div>

        {teachingSkills.length === 0 ? (
          <div className="text-center py-14 border-2 border-dashed border-charcoal/15 rounded-3xl bg-ivory">
            <div className="text-3xl mb-3">🎓</div>
            <p className="text-sm font-serif text-charcoal-muted mb-4">
              You haven't listed any teaching skills yet.
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => { setEditItem(null); setAddModalOpen(true); }}
              leftIcon={<Plus className="w-3.5 h-3.5 text-charcoal" />}
            >
              Add Your First Skill
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {teachingSkills.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-white border-2 border-charcoal/15 shadow-sm hover:border-charcoal/30 hover:shadow-pop-sm transition group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-bold text-sm font-serif text-charcoal">{item.skills?.name}</span>
                      <Badge variant="butter" size="xs">
                        {item.proficiency_level}
                      </Badge>
                      <Badge variant="outline" size="xs">
                        {item.experience_years} yr{item.experience_years !== 1 ? 's' : ''}
                      </Badge>
                      {item.skills?.skill_categories?.name && (
                        <Badge variant="lavender" size="xs">{item.skills.skill_categories.name}</Badge>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-xs text-charcoal-muted leading-relaxed line-clamp-2">{item.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition flex-shrink-0">
                    <button
                      onClick={() => { setEditItem(item); setAddModalOpen(true); }}
                      className="p-1.5 rounded-xl bg-lavender/50 hover:bg-lavender text-charcoal border border-charcoal/15 transition"
                      title="Edit"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingId === item.id}
                      className="p-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition disabled:opacity-50"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AddEditTeachingSkillModal
        isOpen={addModalOpen}
        onClose={() => { setAddModalOpen(false); setEditItem(null); }}
        userId={userId}
        initialData={editItem}
        categories={categories}
        canonicalSkills={canonicalSkills}
        onSuccess={onRefresh}
      />
    </>
  );
}

// ─── Own Profile: Learning Goals Tab ──────────────────────────────────────────

function LearningGoalsTab({ userId, wantedSkills, categories, canonicalSkills, onRefresh, toast }) {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editItem, setEditItem]         = useState(null);
  const [deletingId, setDeletingId]     = useState(null);

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this learning goal from your profile?')) return;
    setDeletingId(id);
    try {
      await deleteWantedSkill(id);
      toast.success('Goal Removed', 'The learning goal has been deleted.');
      onRefresh();
    } catch (err) {
      toast.warning('Delete Failed', err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const priorityColor = { high: 'dusty', medium: 'butter', low: 'outline' };

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold font-serif text-charcoal">Skills You Want to Learn</h3>
            <p className="text-xs text-charcoal-muted">Your learning wishlist. Matching teachers will find you through these.</p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => { setEditItem(null); setAddModalOpen(true); }}
            leftIcon={<Plus className="w-3.5 h-3.5 text-butter" />}
          >
            Add Learning Goal
          </Button>
        </div>

        {wantedSkills.length === 0 ? (
          <div className="text-center py-14 border-2 border-dashed border-charcoal/15 rounded-3xl bg-ivory">
            <div className="text-3xl mb-3">🌱</div>
            <p className="text-sm font-serif text-charcoal-muted mb-4">
              No learning goals set yet. What would you love to learn?
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => { setEditItem(null); setAddModalOpen(true); }}
              leftIcon={<Plus className="w-3.5 h-3.5 text-charcoal" />}
            >
              Add Your First Goal
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {wantedSkills.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-white border-2 border-charcoal/15 shadow-sm hover:border-charcoal/30 hover:shadow-pop-sm transition group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-bold text-sm font-serif text-charcoal">{item.skills?.name}</span>
                      <Badge variant="outline" size="xs">→ {item.target_proficiency}</Badge>
                      <Badge variant={priorityColor[item.priority] || 'outline'} size="xs">
                        {item.priority} priority
                      </Badge>
                      {item.skills?.skill_categories?.name && (
                        <Badge variant="sage" size="xs">{item.skills.skill_categories.name}</Badge>
                      )}
                    </div>
                    {item.notes && (
                      <p className="text-xs text-charcoal-muted leading-relaxed line-clamp-2">{item.notes}</p>
                    )}
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition flex-shrink-0">
                    <button
                      onClick={() => { setEditItem(item); setAddModalOpen(true); }}
                      className="p-1.5 rounded-xl bg-lavender/50 hover:bg-lavender text-charcoal border border-charcoal/15 transition"
                      title="Edit"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingId === item.id}
                      className="p-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition disabled:opacity-50"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AddEditWantedSkillModal
        isOpen={addModalOpen}
        onClose={() => { setAddModalOpen(false); setEditItem(null); }}
        userId={userId}
        initialData={editItem}
        categories={categories}
        canonicalSkills={canonicalSkills}
        onSuccess={onRefresh}
      />
    </>
  );
}

// ─── Main ProfilePage ──────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { username: paramUsername } = useParams();
  const { user, profile, refreshProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  // Determine if viewing own profile
  const isOwnProfile =
    !paramUsername ||
    (profile && (profile.username === paramUsername || profile.id === paramUsername));

  // Shared data
  const [loading, setLoading]           = useState(true);
  const [publicData, setPublicData]     = useState(null);
  const [notFound, setNotFound]         = useState(false);
  const [activeTab, setActiveTab]       = useState('overview');

  // Own-profile relation data
  const [teachingSkills, setTeachingSkills] = useState([]);
  const [wantedSkills, setWantedSkills]     = useState([]);
  const [interests, setInterests]           = useState([]);
  const [availability, setAvailability]     = useState([]);

  // Skill meta (for modals)
  const [categories, setCategories]         = useState([]);
  const [canonicalSkills, setCanonicalSkills] = useState([]);

  // ── Load meta (categories + canonical skills) once ──
  useEffect(() => {
    if (!supabase) return;
    supabase.from('skill_categories').select('id, name, slug').then(({ data }) => {
      if (data) setCategories(data);
    });
    supabase.from('skills').select('id, name, slug, category_id').then(({ data }) => {
      if (data) setCanonicalSkills(data);
    });
  }, []);

  // ── Load public profile (for /profile/:username) ──
  const loadPublicProfile = useCallback(async () => {
    if (!paramUsername) return;
    setLoading(true);
    setNotFound(false);
    try {
      const data = await getPublicProfile(paramUsername);
      if (!data) {
        setNotFound(true);
      } else {
        setPublicData(data);
      }
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [paramUsername]);

  // ── Load own relations ──
  const loadOwnData = useCallback(async () => {
    if (!user || !supabase) return;
    setLoading(true);
    try {
      const [t, w, i, a] = await Promise.all([
        supabase
          .from('user_skills')
          .select('id, skill_id, proficiency_level, experience_years, description, skills (id, name, slug, category_id, skill_categories (name))')
          .eq('user_id', user.id),
        supabase
          .from('wanted_skills')
          .select('id, skill_id, target_proficiency, priority, notes, skills (id, name, slug, category_id, skill_categories (name))')
          .eq('user_id', user.id),
        supabase.from('user_interests').select('id, name').eq('user_id', user.id),
        supabase.from('availability').select('*').eq('user_id', user.id).order('day_of_week'),
      ]);
      setTeachingSkills(t.data || []);
      setWantedSkills(w.data || []);
      setInterests(i.data || []);
      setAvailability(a.data || []);
    } catch (err) {
      console.warn('Could not load profile relations:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (paramUsername) {
      // Check if it's actually the owner viewing their own profile by username
      if (profile && profile.username === paramUsername) {
        loadOwnData();
      } else {
        loadPublicProfile();
      }
    } else {
      loadOwnData();
    }
  }, [paramUsername, profile, loadPublicProfile, loadOwnData]);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.info('Signed Out', 'You have been safely signed out.');
      navigate('/');
    } catch (err) {
      toast.warning('Sign out error', err.message);
    }
  };

  // ── Render: Loading ──
  if (loading) return <ProfileSkeleton />;

  // ── Render: Not found ──
  if (notFound) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <div className="text-5xl mb-4">🔍</div>
        <h2 className="text-2xl font-bold font-serif text-charcoal mb-2">Profile Not Found</h2>
        <p className="text-sm text-charcoal-muted mb-6">
          No SkillSwap member found with username <strong>@{paramUsername}</strong>.
        </p>
        <Button variant="primary" onClick={() => navigate('/explore')}>
          Explore Skills
        </Button>
      </div>
    );
  }

  // ── Render: Public profile ──
  if (paramUsername && publicData && !(profile && profile.username === paramUsername)) {
    return (
      <PublicProfileView
        data={publicData}
        onSwapClick={() => navigate('/explore')} // placeholder until swap feature is built
      />
    );
  }

  // ── Render: Own profile (tabbed) ──
  const displayProfile = profile;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

      {/* Profile Header Card */}
      <div className="bg-white rounded-4xl p-6 sm:p-10 border-2 border-charcoal shadow-pop relative overflow-hidden">
        <TapeSticker color="bg-butter/85" rotate="-1deg" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative flex-shrink-0">
              <img
                src={displayProfile?.avatar_url || AVATAR_PRESETS[0]}
                alt={displayProfile?.full_name}
                className="w-20 h-20 rounded-3xl object-cover border-2 border-charcoal shadow-pop-sm"
              />
              <button
                onClick={() => setActiveTab('edit')}
                title="Change photo"
                className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-butter border-2 border-charcoal rounded-full flex items-center justify-center shadow-pop-sm hover:bg-butter-dark transition"
              >
                <Camera className="w-3.5 h-3.5 text-charcoal" />
              </button>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold font-serif text-charcoal">
                  {displayProfile?.full_name || 'SkillSwap Member'}
                </h1>
                <Badge variant="sage" size="xs">
                  <CheckCircle2 className="w-3 h-3 mr-0.5" /> Verified Barter
                </Badge>
              </div>
              <p className="text-xs text-charcoal-subtle font-mono mt-0.5">
                @{displayProfile?.username} · Joined the Collective
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-charcoal-muted">
                {displayProfile?.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-dusty" />
                    {displayProfile.location}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-butter text-charcoal" />
                  <span className="font-bold text-charcoal">{displayProfile?.rating_avg || '—'}</span>
                  <span>({displayProfile?.rating_count || 0} reviews)</span>
                </span>
                <span className="flex items-center gap-1 capitalize">
                  <Globe className="w-3.5 h-3.5 text-dusty" />
                  {displayProfile?.preferred_learning_mode || 'Flexible'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTab('edit')}
              leftIcon={<Edit3 className="w-3.5 h-3.5 text-charcoal" />}
            >
              Edit Profile
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              leftIcon={<LogOut className="w-3.5 h-3.5 text-charcoal" />}
            >
              Sign Out
            </Button>
          </div>
        </div>

        {displayProfile?.bio && (
          <div className="pt-5 mt-5 border-t border-charcoal/10">
            <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-subtle mb-1">About Me</h4>
            <p className="text-sm text-charcoal-muted leading-relaxed max-w-3xl">{displayProfile.bio}</p>
          </div>
        )}
      </div>

      {/* Tab Bar */}
      <div className="flex flex-wrap gap-2 bg-white rounded-3xl p-2 border-2 border-charcoal shadow-pop">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all duration-150 ${
              activeTab === tab.id
                ? 'bg-charcoal text-ivory shadow-pop-sm'
                : 'text-charcoal-muted hover:text-charcoal hover:bg-ivory'
            }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Panel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
          className="bg-white rounded-4xl p-6 sm:p-8 border-2 border-charcoal shadow-pop"
        >
          {activeTab === 'overview' && (
            <OverviewTab
              profile={displayProfile}
              teachingSkills={teachingSkills}
              wantedSkills={wantedSkills}
              interests={interests}
              availability={availability}
              onChangeTab={setActiveTab}
            />
          )}

          {activeTab === 'edit' && (
            <EditProfileTab
              profile={displayProfile}
              user={user}
              refreshProfile={refreshProfile}
              toast={toast}
            />
          )}

          {activeTab === 'teaching' && (
            <TeachingSkillsTab
              userId={user?.id}
              teachingSkills={teachingSkills}
              categories={categories}
              canonicalSkills={canonicalSkills}
              onRefresh={loadOwnData}
              toast={toast}
            />
          )}

          {activeTab === 'learning' && (
            <LearningGoalsTab
              userId={user?.id}
              wantedSkills={wantedSkills}
              categories={categories}
              canonicalSkills={canonicalSkills}
              onRefresh={loadOwnData}
              toast={toast}
            />
          )}

          {activeTab === 'availability' && (
            <div>
              <div className="mb-5">
                <h3 className="text-base font-bold font-serif text-charcoal">Weekly Availability</h3>
                <p className="text-xs text-charcoal-muted">
                  Set which days and times you're open for skill swap sessions.
                </p>
              </div>
              <AvailabilityEditor
                userId={user?.id}
                existingSlots={availability}
                onSaved={(saved) => setAvailability(saved)}
              />
            </div>
          )}

          {activeTab === 'interests' && (
            <div>
              <div className="mb-5">
                <h3 className="text-base font-bold font-serif text-charcoal">Topics & Interests</h3>
                <p className="text-xs text-charcoal-muted">
                  Tag topics you care about. These help surface relevant swappers in the community.
                </p>
              </div>
              <InterestsEditor
                userId={user?.id}
                initialInterests={interests}
                onSaved={(saved) => setInterests(saved)}
              />
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
