import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  Compass,
  Sparkles,
  Layers,
  Award,
  ArrowRightLeft,
  PlusCircle,
  BookOpen,
  Calendar,
  Clock,
  Star,
  UserCheck,
  CheckCircle2,
  X,
  SlidersHorizontal,
  RefreshCw,
} from 'lucide-react';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Card, SkillCard } from '../components/ui/Card';
import { Sparkle, TapeSticker, Squiggle } from '../components/ui/Doodles';
import { SkeletonCard } from '../components/ui/Skeleton';
import MatchCard from '../components/matching/MatchCard';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  fetchCategories,
  fetchExploreSkills,
  fetchMatchRecommendations,
} from '../services/communityClient';

export default function ExploreSkillsPage({ onOpenSwapModal, onOpenAuthModal }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { user, profile, isAuthenticated } = useAuth();

  // Active Main View: 'catalog' | 'matches'
  const [activeView, setActiveView] = useState(
    searchParams.get('view') === 'matches' ? 'matches' : 'catalog'
  );

  // Filter & Search states
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get('category') || 'all'
  );
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [proficiencyFilter, setProficiencyFilter] = useState(
    searchParams.get('proficiency') || 'all'
  );
  const [availabilityFilter, setAvailabilityFilter] = useState(
    searchParams.get('availability') || 'all'
  );
  const [sortOption, setSortOption] = useState(
    searchParams.get('sort') || (isAuthenticated ? 'recommended' : 'rating')
  );

  // Data states
  const [skills, setSkills] = useState([]);
  const [totalSkills, setTotalSkills] = useState(0);
  const [loading, setLoading] = useState(true);

  // Matches states
  const [matches, setMatches] = useState([]);
  const [matchesLoading, setMatchesLoading] = useState(false);

  // 1. Fetch categories on mount
  useEffect(() => {
    async function loadCats() {
      try {
        const cats = await fetchCategories();
        setCategories(cats || []);
      } catch (err) {
        console.warn('Could not load categories:', err);
      }
    }
    loadCats();
  }, []);

  // 2. Fetch Explore Skills with filters
  const loadSkills = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchExploreSkills({
        category: selectedCategory,
        search: searchQuery,
        proficiency: proficiencyFilter,
        availability: availabilityFilter,
        sort: sortOption,
        userId: user?.id || null,
      });

      setSkills(res.data || []);
      setTotalSkills(res.total || 0);
    } catch (err) {
      console.warn('Explore skills fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchQuery, proficiencyFilter, availabilityFilter, sortOption, user]);

  useEffect(() => {
    loadSkills();
  }, [loadSkills]);

  // 3. Fetch Matches when view is 'matches' or user is logged in
  const loadMatches = useCallback(async () => {
    if (!user?.id) return;
    setMatchesLoading(true);
    try {
      const recs = await fetchMatchRecommendations(user.id, { limit: 10 });
      setMatches(recs || []);
    } catch (err) {
      console.warn('Matches recommendations fetch error:', err);
    } finally {
      setMatchesLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (activeView === 'matches' && user?.id) {
      loadMatches();
    }
  }, [activeView, user, loadMatches]);

  // URL sync helper
  const handleCategorySelect = (slug) => {
    setSelectedCategory(slug);
    if (slug === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', slug);
    }
    setSearchParams(searchParams);
  };

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setProficiencyFilter('all');
    setAvailabilityFilter('all');
    setSortOption('rating');
    searchParams.delete('category');
    searchParams.delete('q');
    searchParams.delete('proficiency');
    searchParams.delete('availability');
    searchParams.delete('sort');
    setSearchParams(searchParams);
  };

  const handleViewChange = (view) => {
    setActiveView(view);
    if (view === 'matches') {
      searchParams.set('view', 'matches');
    } else {
      searchParams.delete('view');
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Editorial Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <Badge variant="dusty" size="sm" withSparkle={true}>
          Discovery &amp; Intelligent Matching
        </Badge>
        <h1 className="text-4xl sm:text-5xl font-bold font-serif text-charcoal tracking-tight">
          Find Your Next Skill Exchange
        </h1>
        <p className="text-sm sm:text-base text-charcoal-muted max-w-xl mx-auto">
          Explore peer offerings across disciplines, or let our bilateral algorithm calculate your
          highest-compatibility swappers based on skills, schedule, and interests.
        </p>

        {/* View Switcher Pills */}
        <div className="inline-flex p-1.5 rounded-full bg-white border-2 border-charcoal shadow-pop-sm mt-4">
          <button
            type="button"
            onClick={() => handleViewChange('catalog')}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
              activeView === 'catalog'
                ? 'bg-charcoal text-ivory shadow-sm'
                : 'text-charcoal-muted hover:text-charcoal'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Browse Skill Catalog ({totalSkills})</span>
          </button>

          <button
            type="button"
            onClick={() => handleViewChange('matches')}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
              activeView === 'matches'
                ? 'bg-butter text-charcoal shadow-sm'
                : 'text-charcoal-muted hover:text-charcoal'
            }`}
          >
            <Sparkle className="w-3.5 h-3.5 text-dusty" size={14} />
            <span>Intelligent Matches {isAuthenticated && matches.length > 0 ? `(${matches.length})` : ''}</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: CATALOG VIEW */}
      {activeView === 'catalog' && (
        <div className="space-y-6">
          {/* Search, Filter & Sort Control Card */}
          <div className="bg-white rounded-3xl p-6 border-2 border-charcoal shadow-pop space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              {/* Search Bar */}
              <div className="md:col-span-5">
                <Input
                  placeholder="Search by skill, topic, teacher, or keyword..."
                  leftIcon={<Search className="w-4 h-4" />}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  rightIcon={
                    searchQuery ? (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="hover:text-charcoal"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    ) : null
                  }
                />
              </div>

              {/* Proficiency Filter */}
              <div className="md:col-span-2">
                <select
                  value={proficiencyFilter}
                  onChange={(e) => setProficiencyFilter(e.target.value)}
                  className="w-full rounded-2xl bg-white text-charcoal text-xs font-bold border-2 border-charcoal/20 px-3 py-2.5 outline-none focus:border-charcoal focus:shadow-pop-sm transition"
                  aria-label="Filter by proficiency"
                >
                  <option value="all">All Proficiency Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert / Professional</option>
                </select>
              </div>

              {/* Availability Filter */}
              <div className="md:col-span-2">
                <select
                  value={availabilityFilter}
                  onChange={(e) => setAvailabilityFilter(e.target.value)}
                  className="w-full rounded-2xl bg-white text-charcoal text-xs font-bold border-2 border-charcoal/20 px-3 py-2.5 outline-none focus:border-charcoal focus:shadow-pop-sm transition"
                  aria-label="Filter by availability"
                >
                  <option value="all">Any Availability</option>
                  <option value="weekday">Weekdays (Mon - Fri)</option>
                  <option value="weekend">Weekends (Sat - Sun)</option>
                  <option value="monday">Mondays</option>
                  <option value="tuesday">Tuesdays</option>
                  <option value="wednesday">Wednesdays</option>
                  <option value="thursday">Thursdays</option>
                  <option value="friday">Fridays</option>
                  <option value="saturday">Saturdays</option>
                  <option value="sunday">Sundays</option>
                </select>
              </div>

              {/* Sort Dropdown */}
              <div className="md:col-span-3">
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="w-full rounded-2xl bg-white text-charcoal text-xs font-bold border-2 border-charcoal/20 px-3 py-2.5 outline-none focus:border-charcoal focus:shadow-pop-sm transition"
                  aria-label="Sort skills"
                >
                  {isAuthenticated && <option value="recommended">✨ Best Match (Compatibility)</option>}
                  <option value="rating">⭐ Highest Rated Teachers</option>
                  <option value="experience">🎓 Most Experienced</option>
                  <option value="recent">🕒 Recently Added</option>
                  <option value="name">🔤 Skill Name (A - Z)</option>
                </select>
              </div>
            </div>

            {/* Category Pill Filters */}
            <div className="pt-3 border-t border-charcoal/10 flex flex-wrap gap-2 items-center">
              <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-subtle mr-1">
                Discipline:
              </span>
              <button
                type="button"
                onClick={() => handleCategorySelect('all')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition border ${
                  selectedCategory === 'all'
                    ? 'bg-charcoal text-ivory border-charcoal shadow-pop-sm'
                    : 'bg-ivory text-charcoal border-charcoal/20 hover:bg-butter/50'
                }`}
              >
                All Disciplines
              </button>

              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategorySelect(cat.slug)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition border ${
                    selectedCategory === cat.slug
                      ? 'bg-charcoal text-ivory border-charcoal shadow-pop-sm'
                      : 'bg-ivory text-charcoal border-charcoal/20 hover:bg-butter/50'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Active Filter Tags Strip */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-charcoal-muted">
              Showing {skills.length} of {totalSkills} skill offerings
            </span>

            {(selectedCategory !== 'all' ||
              searchQuery ||
              proficiencyFilter !== 'all' ||
              availabilityFilter !== 'all') && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs text-dusty font-bold hover:underline flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset all filters</span>
              </button>
            )}
          </div>

          {/* Skills Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : skills.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {skills.map((skill) => (
                <SkillCard
                  key={skill.id}
                  skill={skill}
                  onSwapClick={(s) => onOpenSwapModal && onOpenSwapModal(s)}
                  onTeacherClick={(t) => navigate(`/profile/${t.username}`)}
                  withTape={true}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-4xl p-12 border-2 border-charcoal/20 text-center space-y-4 max-w-lg mx-auto">
              <Compass className="w-12 h-12 text-dusty mx-auto animate-pulse" />
              <h3 className="text-xl font-bold font-serif text-charcoal">
                No matching skill offerings found
              </h3>
              <p className="text-xs text-charcoal-muted leading-relaxed">
                We couldn't find skills matching your specific filter combinations. Try clearing
                filters or broadening your search keywords.
              </p>
              <Button variant="outline" size="sm" onClick={handleResetFilters}>
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: INTELLIGENT MATCHES VIEW */}
      {activeView === 'matches' && (
        <div className="space-y-6">
          {!isAuthenticated ? (
            /* Unauthenticated Prompt */
            <div className="bg-white rounded-4xl p-8 sm:p-12 border-2 border-charcoal shadow-pop max-w-2xl mx-auto text-center space-y-5">
              <TapeSticker color="bg-butter/85" rotate="-1deg" />
              <div className="w-16 h-16 rounded-3xl bg-lavender flex items-center justify-center mx-auto border-2 border-charcoal shadow-pop-sm">
                <Sparkle className="w-8 h-8 text-dusty" size={32} />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold font-serif text-charcoal">
                Sign In to Unlock Intelligent Matches
              </h3>
              <p className="text-sm text-charcoal-muted leading-relaxed max-w-md mx-auto">
                SkillSwap's backend matching algorithm calculates bilateral trade compatibility
                between what you can teach and what you want to learn, factoring in schedule and
                shared passions.
              </p>
              <div className="flex justify-center gap-3 pt-2">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => onOpenAuthModal && onOpenAuthModal('signin')}
                >
                  Sign In to View Matches
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => onOpenAuthModal && onOpenAuthModal('signup')}
                >
                  Create Account
                </Button>
              </div>
            </div>
          ) : matchesLoading ? (
            /* Loading State */
            <div className="space-y-6">
              <div className="text-center py-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-butter-soft border border-butter-dark text-xs font-bold text-charcoal">
                  <RefreshCw className="w-4 h-4 animate-spin text-dusty" />
                  <span>Computing 4-Factor normalized compatibility scores across database...</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            </div>
          ) : matches.length > 0 ? (
            /* Active Matches Grid */
            <div className="space-y-6">
              {/* Algorithm Explanation Banner */}
              <div className="bg-ivory-warm rounded-3xl p-5 sm:p-6 border-2 border-charcoal/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Sparkle className="w-4 h-4 text-dusty" size={16} />
                    <h3 className="font-serif font-bold text-base text-charcoal">
                      Intelligent Bilateral Match Feed
                    </h3>
                  </div>
                  <p className="text-xs text-charcoal-muted max-w-2xl">
                    Ranked by our 4-factor normalized algorithm: <strong>50% Skill Fit</strong>,{' '}
                    <strong>25% Schedule Overlap</strong>, <strong>15% Shared Interests</strong>, and{' '}
                    <strong>10% Reliability</strong>.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadMatches}
                  leftIcon={<RefreshCw className="w-3 h-3 text-charcoal" />}
                >
                  Recalculate
                </Button>
              </div>

              {/* Matches Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {matches.map((match) => (
                  <MatchCard
                    key={match.candidateId}
                    match={match}
                    onViewProfile={(cand) => navigate(`/profile/${cand.username}`)}
                    onSwapClick={(m) => {
                      // Pre-fill swap modal with candidate's offered skill
                      const firstOffered = m.forwardMatches?.[0]?.skillName || 'Skill';
                      const firstWanted = m.reciprocalMatches?.[0]?.skillName || '';
                      if (onOpenSwapModal) {
                        onOpenSwapModal({
                          title: firstOffered,
                          wantsInReturn: [firstWanted],
                          teacher: m.candidate,
                        });
                      }
                    }}
                  />
                ))}
              </div>
            </div>
          ) : (
            /* No Matches / Incomplete Profile Prompt */
            <div className="bg-white rounded-4xl p-10 border-2 border-charcoal shadow-pop text-center space-y-4 max-w-xl mx-auto">
              <div className="text-4xl">🌱</div>
              <h3 className="text-xl font-bold font-serif text-charcoal">
                Add Skills to Unlock Complementary Matches
              </h3>
              <p className="text-xs text-charcoal-muted leading-relaxed">
                The matching algorithm looks for reciprocal trades (what you teach vs. what they
                want). Head to your profile to list the skills you can offer and what you are
                eager to learn.
              </p>
              <div className="pt-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/profile')}
                  rightIcon={<ArrowRightLeft className="w-3.5 h-3.5" />}
                >
                  Go to My Profile &amp; Skills
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
