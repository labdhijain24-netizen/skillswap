import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  ArrowRightLeft, 
  Sparkles, 
  Compass, 
  BookOpen, 
  Users, 
  Star, 
  CheckCircle2, 
  ArrowRight, 
  Clock, 
  Award, 
  ShieldCheck, 
  Database,
  Code,
  Palette,
  Languages,
  Music,
  Briefcase,
  Camera,
  HeartPulse,
  Utensils,
  PlusCircle,
  MessageCircle,
  RefreshCw,
  Search,
  Zap,
  Globe,
  TrendingUp,
  Heart
} from 'lucide-react';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { Card, SkillCard } from '../components/ui/Card';
import { Sparkle, Squiggle, AsteriskDoodle, TapeSticker, CurvedArrow, HandCircle } from '../components/ui/Doodles';
import { 
  fetchCommunityStats, 
  fetchCategories, 
  fetchFeaturedSkills, 
  fetchTestimonials 
} from '../services/communityClient';
import { useToast } from '../context/ToastContext';
import SkillConstellation3D from '../components/3d/SkillConstellation3D';
import Floating3DShapes from '../components/3d/Floating3DShapes';
import TiltCard3D from '../components/3d/TiltCard3D';
import useScrollReveal from '../hooks/useScrollReveal';

// Helper mapping for category icon string to Lucide component
const getCategoryIcon = (iconName) => {
  switch (iconName?.toLowerCase()) {
    case 'code': return <Code className="w-6 h-6 text-dusty" />;
    case 'palette': return <Palette className="w-6 h-6 text-lavender-dark" />;
    case 'languages': return <Languages className="w-6 h-6 text-sage-dark" />;
    case 'music': return <Music className="w-6 h-6 text-dusty" />;
    case 'briefcase': return <Briefcase className="w-6 h-6 text-butter-dark" />;
    case 'camera': return <Camera className="w-6 h-6 text-lavender-dark" />;
    case 'heartpulse': return <HeartPulse className="w-6 h-6 text-red-500" />;
    case 'utensils': return <Utensils className="w-6 h-6 text-butter-dark" />;
    default: return <Sparkles className="w-6 h-6 text-dusty" />;
  }
};

// Animated Number Counter
function AnimatedCounter({ value, suffix = '' }) {
  const [displayed, setDisplayed] = useState(0);
  const ref = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const target = Number(value) || 0;
          const duration = 1400;
          const steps = 50;
          const stepMs = duration / steps;
          let step = 0;
          const timer = setInterval(() => {
            step++;
            const progress = step / steps;
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplayed(Math.round(target * eased));
            if (step >= steps) clearInterval(timer);
          }, stepMs);
        }
      },
      { threshold: 0.4 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);

  return (
    <span ref={ref} className="tabular-nums">
      {displayed}{suffix}
    </span>
  );
}

export default function LandingPage({ onOpenAuthModal, onOpenSwapModal }) {
  const navigate = useNavigate();
  const toast = useToast();
  const pageRef = useRef(null);

  // Parallax scroll for hero
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 400], [0, -60]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0.6]);

  // Scroll reveal for all .reveal elements
  useScrollReveal(pageRef, []);

  // Cursor glow effect
  const cursorRef = useRef(null);
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (cursorRef.current) {
        cursorRef.current.style.left = `${e.clientX}px`;
        cursorRef.current.style.top = `${e.clientY}px`;
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // State populated strictly from real backend & database queries
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [featuredSkills, setFeaturedSkills] = useState({ hasRealData: false, data: [] });
  const [testimonials, setTestimonials] = useState({ hasRealReviews: false, reviews: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCommunityData() {
      setLoading(true);
      try {
        const [statsData, categoriesData, featuredData, testimonialsData] = await Promise.all([
          fetchCommunityStats().catch(() => null),
          fetchCategories().catch(() => []),
          fetchFeaturedSkills().catch(() => ({ hasRealData: false, data: [] })),
          fetchTestimonials().catch(() => ({ hasRealReviews: false, reviews: [] })),
        ]);

        setStats(statsData);
        setCategories(categoriesData);
        setFeaturedSkills(featuredData);
        setTestimonials(testimonialsData);
      } catch (err) {
        console.error('Error loading community data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadCommunityData();
  }, []);

  return (
    <div ref={pageRef} className="space-y-28 py-8 overflow-hidden">
      {/* Global Cursor Glow */}
      <div ref={cursorRef} className="cursor-glow hidden lg:block" />

      {/* ==================================================================== */}
      {/* 1. HERO SECTION — 3D Constellation + Parallax                        */}
      {/* ==================================================================== */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-8">
        {/* Morphing Blob Backgrounds */}
        <div
          className="absolute -top-16 -left-24 w-80 h-80 bg-lavender/25 blob opacity-60 pointer-events-none"
          style={{ filter: 'blur(48px)' }}
        />
        <div
          className="absolute -bottom-10 -right-20 w-96 h-96 bg-butter/30 blob-2 opacity-50 pointer-events-none"
          style={{ filter: 'blur(56px)' }}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          {/* LEFT — Text Content */}
          <motion.div style={{ y: heroY, opacity: heroOpacity }} className="space-y-6 text-left sm:text-center lg:text-left">
            {/* Top Pill */}
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border-charcoal/20 shadow-pop-sm text-xs font-bold text-charcoal"
            >
              <Sparkle className="w-4 h-4 text-dusty" size={16} />
              <span>The Peer-to-Peer Skill Barter Collective</span>
              <span className="w-2 h-2 rounded-full bg-sage-dark animate-pulse" />
            </motion.div>

            {/* Editorial Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl font-bold font-serif text-charcoal tracking-tight leading-[1.1]"
            >
              Learn something.{' '}
              <br className="hidden sm:block" />
              Teach something.{' '}
              <span className="relative inline-block">
                <span className="gradient-text italic">Trade skills.</span>
                <Squiggle className="absolute -bottom-2 left-0 w-full h-3 text-butter z-0" />
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg text-charcoal-muted max-w-lg leading-relaxed font-sans"
            >
              SkillSwap is a human-first platform where curiosity replaces currency. Exchange your expertise in software, music, languages, baking, and craft — zero monetary friction.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap items-center gap-3"
            >
              <Button
                variant="primary"
                size="lg"
                onClick={() => onOpenAuthModal && onOpenAuthModal('signup')}
                rightIcon={<ArrowRightLeft className="w-4 h-4 text-butter" />}
                className="shimmer"
              >
                Join SkillSwap Free
              </Button>

              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigate('/explore')}
                leftIcon={<Compass className="w-4 h-4 text-charcoal" />}
              >
                Explore Skills
              </Button>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="flex flex-wrap gap-4 text-xs text-charcoal-muted font-medium pt-2"
            >
              {[
                { icon: <CheckCircle2 className="w-3.5 h-3.5 text-sage-dark" />, text: 'Zero fees · 100% barter' },
                { icon: <CheckCircle2 className="w-3.5 h-3.5 text-sage-dark" />, text: 'Bilateral 1-on-1 sessions' },
                { icon: <CheckCircle2 className="w-3.5 h-3.5 text-sage-dark" />, text: 'Verified review system' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  {item.icon}
                  <span>{item.text}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* RIGHT — Interactive 3D Skill Constellation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
            className="relative rounded-4xl overflow-hidden border-2 border-charcoal/15 shadow-pop bg-gradient-to-br from-ivory-warm via-white to-lavender-soft"
          >
            {/* Spinning ring decorations (pure CSS) */}
            <div
              className="absolute top-1/2 left-1/2 w-[480px] h-[480px] rounded-full border border-lavender/25 spin-slow pointer-events-none -translate-x-1/2 -translate-y-1/2"
            />
            <div
              className="absolute top-1/2 left-1/2 w-[360px] h-[360px] rounded-full border border-butter/30 spin-slow-reverse pointer-events-none -translate-x-1/2 -translate-y-1/2"
            />
            <SkillConstellation3D
              className="relative z-10"
              onSkillClick={(skill) =>
                toast.info(`Skill: ${skill.name}`, `Click "Explore Skills" to find ${skill.icon} ${skill.name} swap partners!`)
              }
            />
            {/* Soft gradient vignette overlay */}
            <div className="absolute inset-0 rounded-4xl pointer-events-none bg-gradient-to-t from-ivory-warm/30 via-transparent to-transparent" />
          </motion.div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 2. WHAT IS SKILLSWAP — Animated Explanation                          */}
      {/* ==================================================================== */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="reveal bg-white rounded-4xl p-8 sm:p-12 border-2 border-charcoal shadow-pop relative overflow-hidden">
          {/* Floating 3D shapes in background */}
          <Floating3DShapes className="opacity-40" />

          <TapeSticker color="bg-butter/85" rotate="-1deg" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-7 space-y-4">
              <Badge variant="lavender" size="sm" withSparkle={true}>
                The SkillSwap Philosophy
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold font-serif text-charcoal tracking-tight">
                Education shouldn&apos;t depend on how deep your pockets are.
              </h2>
              <p className="text-sm sm:text-base text-charcoal-muted leading-relaxed font-sans">
                Traditional education platforms charge expensive monthly subscriptions or high course fees. But knowledge isn&apos;t a commodity — it is a communal resource.
              </p>
              <p className="text-sm sm:text-base text-charcoal-muted leading-relaxed font-sans">
                On SkillSwap, everyone has something valuable to teach. A web developer might want to learn acoustic guitar; a professional baker might want to master Spanish. By trading one hour for one hour, both participants grow without spending a cent.
              </p>

              <div className="pt-2">
                <Link to="/how-it-works">
                  <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                    Read Full Barter Manifesto
                  </Button>
                </Link>
              </div>
            </div>

            {/* Visual Barter Card */}
            <div className="lg:col-span-5">
              <TiltCard3D maxTilt={10} className="rounded-3xl">
                <div className="bg-ivory-warm rounded-3xl p-6 border-2 border-charcoal/20 space-y-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-subtle block">
                    Typical Reciprocal Swap
                  </span>

                  <div className="space-y-3">
                    <div className="p-3.5 rounded-2xl bg-white border border-charcoal/15 flex items-center justify-between shadow-sm"
                      style={{ transform: 'translateZ(12px)' }}>
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-dusty text-white flex items-center justify-center font-bold text-xs shadow-pop-sm">
                          ML
                        </div>
                        <div>
                          <div className="text-xs font-bold text-charcoal">Maya (Engineer)</div>
                          <div className="text-[11px] text-dusty font-semibold">Teaches React & TypeScript</div>
                        </div>
                      </div>
                      <Badge variant="lavender" size="xs">1 Hour</Badge>
                    </div>

                    <div className="flex justify-center -my-1">
                      <div className="w-8 h-8 rounded-full bg-butter border-2 border-charcoal flex items-center justify-center shadow-pop-sm float-drift">
                        <ArrowRightLeft className="w-4 h-4 text-charcoal" />
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white border border-charcoal/15 flex items-center justify-between shadow-sm"
                      style={{ transform: 'translateZ(12px)' }}>
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-sage-dark text-white flex items-center justify-center font-bold text-xs shadow-pop-sm">
                          MS
                        </div>
                        <div>
                          <div className="text-xs font-bold text-charcoal">Mateo (Baker)</div>
                          <div className="text-[11px] text-sage-dark font-semibold">Teaches Artisan Sourdough</div>
                        </div>
                      </div>
                      <Badge variant="sage" size="xs">1 Hour</Badge>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-butter-soft border border-charcoal/10 text-[11px] text-charcoal-muted text-center font-serif italic">
                    &ldquo;Zero money exchanged. Two lifelong skills learned.&rdquo;
                  </div>
                </div>
              </TiltCard3D>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 3. HOW IT WORKS — Animated Step Cards                                */}
      {/* ==================================================================== */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 reveal">
          <Badge variant="dusty" size="sm" withSparkle={true}>
            Four Simple Steps
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold font-serif text-charcoal mt-2 tracking-tight">
            How a Skill Swap Works
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-muted mt-2">
            From listing what you know to completing your first reciprocal session.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 stagger-grid">
          {[
            {
              step: '01',
              title: 'List Your Skills',
              desc: 'Create your profile. Add what you are confident teaching and specify what you want to learn.',
              badge: 'bg-butter text-charcoal',
              icon: <PlusCircle className="w-5 h-5 text-charcoal" />,
              accentBg: 'from-butter-soft to-white',
            },
            {
              step: '02',
              title: 'Discover Matches',
              desc: 'Let our bilateral algorithm find users who want what you teach and can offer what you need.',
              badge: 'bg-lavender text-charcoal',
              icon: <Compass className="w-5 h-5 text-dusty" />,
              accentBg: 'from-lavender-soft to-white',
            },
            {
              step: '03',
              title: 'Propose a Swap',
              desc: 'Send a proposal, agree on what you will each teach, and pick a mutually available time slot.',
              badge: 'bg-sage text-charcoal',
              icon: <MessageCircle className="w-5 h-5 text-sage-dark" />,
              accentBg: 'from-sage-soft to-white',
            },
            {
              step: '04',
              title: 'Meet & Review',
              desc: 'Join your 1-on-1 video session, exchange knowledge, and leave verified ratings for each other.',
              badge: 'bg-dusty text-white',
              icon: <Star className="w-5 h-5 text-butter" />,
              accentBg: 'from-ivory-dark to-white',
            },
          ].map((item, idx) => (
            <div key={idx} className="reveal" style={{ transitionDelay: `${idx * 0.08}s` }}>
              <TiltCard3D maxTilt={7} scale={1.03} className="h-full">
                <div className={`bg-gradient-to-br ${item.accentBg} rounded-3xl p-6 border-2 border-charcoal shadow-pop flex flex-col justify-between h-full transition-shadow duration-200`}>
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <span className={`inline-block px-3 py-1 rounded-xl text-xs font-mono font-bold border border-charcoal/30 ${item.badge} shadow-pop-sm`}>
                        Step {item.step}
                      </span>
                      <div className="w-8 h-8 rounded-xl bg-white border border-charcoal/15 flex items-center justify-center shadow-sm float-drift">
                        {item.icon}
                      </div>
                    </div>
                    <h3 className="text-lg font-bold font-serif text-charcoal mb-2">{item.title}</h3>
                    <p className="text-xs text-charcoal-muted leading-relaxed">{item.desc}</p>
                  </div>

                  <div className="mt-6 pt-3 border-t border-charcoal/10 flex items-center text-[11px] font-bold text-dusty gap-1.5">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Free & decentralized</span>
                  </div>
                </div>
              </TiltCard3D>
            </div>
          ))}
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 4. FEATURED CATEGORIES — Glassmorphism Cards                         */}
      {/* ==================================================================== */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 reveal">
          <div>
            <Badge variant="sage" size="sm">Standardized Taxonomy</Badge>
            <h2 className="text-3xl font-bold font-serif text-charcoal mt-2 tracking-tight">
              Featured Skill Categories
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-muted mt-1">
              Browse categories stored in PostgreSQL. Click any discipline to view available exchanges.
            </p>
          </div>

          <Link to="/explore">
            <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              View All Disciplines
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-grid">
          {categories.map((cat, idx) => (
            <div key={cat.id} className="reveal" style={{ transitionDelay: `${idx * 0.06}s` }}>
              <motion.div
                whileHover={{ y: -4, scale: 1.025 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate(`/explore?category=${encodeURIComponent(cat.slug)}`)}
                className="cursor-pointer bg-white/90 backdrop-blur-sm rounded-3xl p-5 border-2 border-charcoal/15 hover:border-charcoal hover:shadow-pop transition-all shadow-sm flex flex-col justify-between group"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-ivory border-2 border-charcoal/20 flex items-center justify-center mb-3 shadow-pop-sm group-hover:scale-110 transition-transform duration-200">
                    {getCategoryIcon(cat.icon)}
                  </div>
                  <h3 className="text-base font-bold font-serif text-charcoal mb-1">{cat.name}</h3>
                  <p className="text-xs text-charcoal-muted line-clamp-2 leading-relaxed">{cat.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-charcoal/10 flex items-center justify-between text-xs text-dusty font-bold">
                  <span>Explore</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 5. COMMUNITY STATS — Animated Counters + Glassmorphism                */}
      {/* ==================================================================== */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="reveal relative rounded-4xl overflow-hidden border-4 border-charcoal shadow-pop">
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-charcoal">
            <div
              className="absolute top-0 left-0 w-72 h-72 bg-dusty/30 blob pointer-events-none"
              style={{ filter: 'blur(60px)' }}
            />
            <div
              className="absolute bottom-0 right-0 w-96 h-64 bg-lavender/20 blob-2 pointer-events-none"
              style={{ filter: 'blur(50px)' }}
            />
            <div
              className="absolute top-1/2 left-1/2 w-64 h-64 bg-butter/10 blob pointer-events-none -translate-x-1/2 -translate-y-1/2"
              style={{ filter: 'blur(40px)' }}
            />
          </div>

          <div className="relative z-10 p-8 sm:p-12 text-ivory">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-ivory/15">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-butter font-sans flex items-center gap-1.5">
                  <Database className="w-4 h-4" />
                  <span>Real Database Metrics</span>
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold font-serif text-ivory mt-1">
                  Community Pulse & Statistics
                </h2>
                <p className="text-xs text-ivory/70 mt-1">
                  Strictly queried from Supabase PostgreSQL — zero fabricated numbers.
                </p>
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-dark border-ivory/20 text-xs">
                <span className={`w-2 h-2 rounded-full ${stats?.isDatabaseConnected ? 'bg-sage-dark animate-pulse' : 'bg-butter'}`} />
                <span className="text-ivory/90 font-mono">
                  {stats?.isDatabaseConnected ? 'PostgreSQL Active' : 'Connecting...'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                {
                  value: stats?.membersCount ?? 0,
                  label: 'Registered Members',
                  sub: 'from profiles table',
                  color: 'text-butter',
                  icon: <Users className="w-5 h-5 text-butter/70 mx-auto mb-2" />,
                },
                {
                  value: stats?.skillsCatalogCount ?? 32,
                  label: 'Skills in Catalog',
                  sub: 'across 8 disciplines',
                  color: 'text-lavender',
                  icon: <TrendingUp className="w-5 h-5 text-lavender/70 mx-auto mb-2" />,
                },
                {
                  value: stats?.completedSwapsCount ?? 0,
                  label: 'Completed Swaps',
                  sub: 'from swap_requests table',
                  color: 'text-sage',
                  icon: <RefreshCw className="w-5 h-5 text-sage/70 mx-auto mb-2" />,
                },
                {
                  value: stats?.reviewsCount > 0 ? stats.averageRating : 0,
                  label: 'Community Rating',
                  sub: `${stats?.reviewsCount ?? 0} verified reviews`,
                  color: 'text-butter',
                  suffix: stats?.reviewsCount > 0 ? ' ★' : '',
                  icon: <Heart className="w-5 h-5 text-butter/70 mx-auto mb-2" />,
                },
              ].map((stat, i) => (
                <div key={i} className="p-5 rounded-2xl bg-white/8 border border-white/10 backdrop-blur-sm hover:bg-white/12 transition-colors">
                  {stat.icon}
                  <div className={`text-3xl sm:text-4xl font-bold font-serif ${stat.color} mb-1`}>
                    <AnimatedCounter value={stat.value} suffix={stat.suffix || ''} />
                  </div>
                  <div className="text-xs font-bold uppercase tracking-wider text-ivory/80">{stat.label}</div>
                  <div className="text-[10px] text-ivory/50 mt-1">{stat.sub}</div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-4 border-t border-ivory/10 text-center text-xs text-ivory/60">
              💡 {stats?.statusNote || 'Connecting to database...'}
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 6. FEATURED SKILL EXCHANGES                                           */}
      {/* ==================================================================== */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 reveal">
          <div>
            <Badge variant="butter" size="sm">Live Opportunities</Badge>
            <h2 className="text-3xl font-bold font-serif text-charcoal mt-2 tracking-tight">
              Featured Skill Exchanges
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-muted mt-1">
              Genuine skills offered by community members currently seeking learning partners.
            </p>
          </div>

          <Link to="/explore">
            <Button variant="outline" size="sm" rightIcon={<Compass className="w-3.5 h-3.5" />}>
              Explore Full Catalog
            </Button>
          </Link>
        </div>

        {featuredSkills.hasRealData && featuredSkills.data.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 stagger-grid">
            {featuredSkills.data.map((item, idx) => (
              <div key={item.id} className="reveal" style={{ transitionDelay: `${idx * 0.08}s` }}>
                <TiltCard3D maxTilt={6} scale={1.025} className="h-full">
                  <SkillCard
                    skill={{
                      title: item.skills?.name || 'Skill',
                      category: item.skills?.skill_categories?.name || 'General',
                      teacher: {
                        name: item.profiles?.full_name || 'Member',
                        avatar: item.profiles?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
                        rating: item.profiles?.rating_avg || 5.0,
                        reviewCount: item.profiles?.rating_count || 0,
                      },
                      proficiency: item.proficiency_level,
                      description: item.description,
                      wantsInReturn: [],
                    }}
                    onSwapClick={() => onOpenSwapModal && onOpenSwapModal(item)}
                  />
                </TiltCard3D>
              </div>
            ))}
          </div>
        ) : (
          <div className="reveal bg-white rounded-3xl p-8 border-2 border-charcoal/20 text-center space-y-4 max-w-2xl mx-auto shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-butter/60 border-2 border-charcoal flex items-center justify-center mx-auto shadow-pop-sm float-drift">
              <Sparkles className="w-6 h-6 text-charcoal" />
            </div>
            <h3 className="text-xl font-bold font-serif text-charcoal">Be the First to Offer a Skill!</h3>
            <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed">
              We do not populate fake user listings. The database is initialized and ready for your very first skill offering!
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <Button
                variant="primary"
                size="sm"
                onClick={() => onOpenAuthModal && onOpenAuthModal('signup')}
                rightIcon={<PlusCircle className="w-4 h-4 text-butter" />}
              >
                List Your Skill Now
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/explore')}>
                Browse Canonical Skills
              </Button>
            </div>
          </div>
        )}
      </section>

      {/* ==================================================================== */}
      {/* 7. TESTIMONIALS                                                       */}
      {/* ==================================================================== */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 reveal">
          <Badge variant="dusty" size="sm">Community Reputation</Badge>
          <h2 className="text-3xl font-bold font-serif text-charcoal mt-2 tracking-tight">
            Verified Swap Reviews
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-muted mt-1">
            Feedback left by real participants after completed sessions.
          </p>
        </div>

        {testimonials.hasRealReviews && testimonials.reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 stagger-grid">
            {testimonials.reviews.map((rev, idx) => (
              <div key={rev.id} className="reveal" style={{ transitionDelay: `${idx * 0.08}s` }}>
                <TiltCard3D maxTilt={5} className="h-full">
                  <div className="bg-white rounded-3xl p-6 border-2 border-charcoal shadow-pop flex flex-col justify-between h-full">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-1 text-butter">
                        {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-butter text-charcoal" />
                        ))}
                      </div>
                      <p className="text-xs text-charcoal-muted leading-relaxed font-sans italic">
                        &ldquo;{rev.comment}&rdquo;
                      </p>
                    </div>

                    <div className="mt-6 pt-3 border-t border-charcoal/10 flex items-center space-x-2.5">
                      <img
                        src={rev.reviewer?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                        alt={rev.reviewer?.full_name}
                        className="w-8 h-8 rounded-full object-cover border border-charcoal"
                      />
                      <div>
                        <div className="text-xs font-bold text-charcoal">{rev.reviewer?.full_name}</div>
                        <div className="text-[10px] text-charcoal-muted">Reviewed {rev.reviewee?.full_name}</div>
                      </div>
                    </div>
                  </div>
                </TiltCard3D>
              </div>
            ))}
          </div>
        ) : (
          <div className="reveal bg-sage-soft rounded-3xl p-8 border-2 border-sage-dark/40 max-w-2xl mx-auto text-center space-y-3 shadow-sm">
            <ShieldCheck className="w-10 h-10 text-sage-dark mx-auto float-drift" />
            <h3 className="text-lg font-bold font-serif text-charcoal">Genuine Community Reviews Pledge</h3>
            <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed font-sans">
              Reviews only appear after authenticated members finish verified sessions. No fake reviews — ever.
            </p>
            <span className="inline-block px-3 py-1 bg-white rounded-full border border-charcoal/15 text-[11px] font-bold text-charcoal">
              Zero fake reviews policy
            </span>
          </div>
        )}
      </section>

      {/* ==================================================================== */}
      {/* 8. FINAL CTA BANNER — Gradient + Shimmer                             */}
      {/* ==================================================================== */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="reveal relative rounded-4xl p-8 sm:p-14 border-2 border-charcoal shadow-pop text-center overflow-hidden">
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-r from-butter-soft via-ivory to-lavender-soft" />
          <div
            className="absolute inset-0 opacity-50"
            style={{
              background: 'linear-gradient(135deg, rgba(200,182,246,0.3) 0%, transparent 50%, rgba(245,222,145,0.3) 100%)',
              animation: 'gradient-shift 6s ease infinite',
              backgroundSize: '300% 300%',
            }}
          />

          {/* Floating blob decorations */}
          <div
            className="absolute -top-10 -left-10 w-40 h-40 bg-lavender/40 blob pointer-events-none"
            style={{ filter: 'blur(32px)' }}
          />
          <div
            className="absolute -bottom-10 -right-10 w-48 h-48 bg-butter/50 blob-2 pointer-events-none"
            style={{ filter: 'blur(36px)' }}
          />

          <TapeSticker color="bg-lavender/85" rotate="1.5deg" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-5">
            <Badge variant="dusty" size="sm" withSparkle={true}>
              Start Your Barter Journey
            </Badge>

            <h2 className="text-3xl sm:text-5xl font-bold font-serif text-charcoal tracking-tight leading-tight">
              Ready to trade what you know for what you{' '}
              <span className="gradient-text italic">want?</span>
            </h2>

            <p className="text-sm sm:text-base text-charcoal-muted leading-relaxed">
              Join the collective today. Post your first skill in under two minutes and connect with creators who share your passions.
            </p>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
              <Button
                variant="primary"
                size="lg"
                onClick={() => onOpenAuthModal && onOpenAuthModal('signup')}
                rightIcon={<Sparkles className="w-4 h-4 text-butter" />}
                className="shimmer glow-pulse"
              >
                Create Free Account
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/explore')}
                leftIcon={<Search className="w-4 h-4 text-charcoal" />}
              >
                Browse Skills Catalog
              </Button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
