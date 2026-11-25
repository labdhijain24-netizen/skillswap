import { supabase } from './supabaseClient';

/**
 * Profile & Skill Management Service
 * Direct relational operations against Supabase PostgreSQL and Storage
 */

// Upload avatar image to Supabase Storage 'avatars' bucket
export const uploadAvatar = async (userId, file) => {
  if (!file) throw new Error('No file selected.');

  const fileExt = file.name.split('.').pop();
  const filePath = `${userId}/${Date.now()}.${fileExt}`;

  // 1. Upload file
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (uploadError) throw uploadError;

  // 2. Get public URL
  const { data: publicUrlData } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
};

// Retrieve a full public profile by username or UUID
export const getPublicProfile = async (identifier) => {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);

  let query = supabase.from('profiles').select('*');
  if (isUuid) {
    query = query.eq('id', identifier);
  } else {
    query = query.eq('username', identifier);
  }

  const { data: profile, error: profileError } = await query.single();
  if (profileError || !profile) return null;

  // Fetch relational data in parallel
  const [teachRes, wantRes, intRes, availRes, reviewsRes] = await Promise.all([
    supabase
      .from('user_skills')
      .select('id, skill_id, proficiency_level, experience_years, description, skills (id, name, slug, category_id, skill_categories (id, name, slug, icon))')
      .eq('user_id', profile.id)
      .eq('is_active', true),
    supabase
      .from('wanted_skills')
      .select('id, skill_id, target_proficiency, priority, notes, skills (id, name, slug, category_id, skill_categories (id, name, slug, icon))')
      .eq('user_id', profile.id),
    supabase
      .from('user_interests')
      .select('id, name')
      .eq('user_id', profile.id),
    supabase
      .from('availability')
      .select('*')
      .eq('user_id', profile.id)
      .eq('is_active', true)
      .order('day_of_week'),
    supabase
      .from('reviews')
      .select('id, rating, comment, created_at, reviewer:reviewer_id (id, full_name, username, avatar_url)')
      .eq('reviewee_id', profile.id)
      .order('created_at', { ascending: false }),
  ]);

  return {
    profile,
    teachingSkills: teachRes.data || [],
    wantedSkills: wantRes.data || [],
    interests: intRes.data || [],
    availability: availRes.data || [],
    reviews: reviewsRes.data || [],
  };
};

// Find or create skill in canonical table
export const findOrCreateSkill = async (skillName, categoryId) => {
  const trimmed = skillName.trim();
  const slug = trimmed.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  // Check if exists
  const { data: existing } = await supabase
    .from('skills')
    .select('id, name, slug, category_id')
    .ilike('name', trimmed)
    .single();

  if (existing) return existing;

  // Create new skill row
  const { data: created, error } = await supabase
    .from('skills')
    .insert({
      name: trimmed,
      slug,
      category_id: categoryId,
      description: `User-defined skill: ${trimmed}`,
    })
    .select('id, name, slug, category_id')
    .single();

  if (error) throw error;
  return created;
};

// Add a skill the user can teach
export const addTeachingSkill = async (userId, { skillId, skillName, categoryId, proficiency, experienceYears, description }) => {
  let finalSkillId = skillId;

  if (!finalSkillId && skillName) {
    const skill = await findOrCreateSkill(skillName, categoryId);
    finalSkillId = skill.id;
  }

  if (!finalSkillId) throw new Error('Skill selection is required.');

  const { data, error } = await supabase
    .from('user_skills')
    .insert({
      user_id: userId,
      skill_id: finalSkillId,
      proficiency_level: proficiency || 'intermediate',
      experience_years: Number(experienceYears) || 1,
      description: description || '',
      is_active: true,
    })
    .select('id, skill_id, proficiency_level, experience_years, description, skills (id, name, slug, skill_categories (name))')
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error('You have already added this skill to your teaching list.');
    }
    throw error;
  }

  return data;
};

// Update an existing teaching skill
export const updateTeachingSkill = async (userSkillId, { proficiency, experienceYears, description }) => {
  const { data, error } = await supabase
    .from('user_skills')
    .update({
      proficiency_level: proficiency,
      experience_years: Number(experienceYears),
      description,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userSkillId)
    .select('id, skill_id, proficiency_level, experience_years, description, skills (id, name, slug)')
    .single();

  if (error) throw error;
  return data;
};

// Remove a teaching skill
export const deleteTeachingSkill = async (userSkillId) => {
  const { error } = await supabase
    .from('user_skills')
    .delete()
    .eq('id', userSkillId);

  if (error) throw error;
  return true;
};

// Add a skill the user wants to learn
export const addWantedSkill = async (userId, { skillId, skillName, categoryId, targetProficiency, priority, notes }) => {
  let finalSkillId = skillId;

  if (!finalSkillId && skillName) {
    const skill = await findOrCreateSkill(skillName, categoryId);
    finalSkillId = skill.id;
  }

  if (!finalSkillId) throw new Error('Skill selection is required.');

  const { data, error } = await supabase
    .from('wanted_skills')
    .insert({
      user_id: userId,
      skill_id: finalSkillId,
      target_proficiency: targetProficiency || 'beginner',
      priority: priority || 'medium',
      notes: notes || '',
    })
    .select('id, skill_id, target_proficiency, priority, notes, skills (id, name, slug, skill_categories (name))')
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error('You have already added this skill to your learning goals.');
    }
    throw error;
  }

  return data;
};

// Update an existing wanted skill
export const updateWantedSkill = async (wantedSkillId, { targetProficiency, priority, notes }) => {
  const { data, error } = await supabase
    .from('wanted_skills')
    .update({
      target_proficiency: targetProficiency,
      priority,
      notes,
      updated_at: new Date().toISOString(),
    })
    .eq('id', wantedSkillId)
    .select('id, skill_id, target_proficiency, priority, notes, skills (id, name, slug)')
    .single();

  if (error) throw error;
  return data;
};

// Remove a wanted skill
export const deleteWantedSkill = async (wantedSkillId) => {
  const { error } = await supabase
    .from('wanted_skills')
    .delete()
    .eq('id', wantedSkillId);

  if (error) throw error;
  return true;
};

// Update user interests
export const updateUserInterests = async (userId, interestNames) => {
  // Delete and re-insert
  await supabase.from('user_interests').delete().eq('user_id', userId);

  if (!interestNames || interestNames.length === 0) return [];

  const rows = interestNames.map((name) => ({
    user_id: userId,
    name: name.trim(),
  }));

  const { data, error } = await supabase
    .from('user_interests')
    .insert(rows)
    .select('id, name');

  if (error) throw error;
  return data || [];
};

// Update availability slots
export const updateAvailabilitySlots = async (userId, slots, timeZone) => {
  await supabase.from('availability').delete().eq('user_id', userId);

  const activeSlots = slots
    .filter((s) => s.active)
    .map((s) => ({
      user_id: userId,
      day_of_week: s.dayOfWeek,
      start_time: s.startTime,
      end_time: s.endTime,
      time_zone: timeZone || 'UTC',
      is_active: true,
    }));

  if (activeSlots.length === 0) return [];

  const { data, error } = await supabase
    .from('availability')
    .insert(activeSlots)
    .select('*')
    .order('day_of_week');

  if (error) throw error;
  return data || [];
};
