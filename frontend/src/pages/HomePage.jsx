import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  ArrowRightLeft, 
  Search, 
  Star, 
  Palette, 
  Layers, 
  CheckCircle, 
  Heart, 
  MessageSquare, 
  Calendar, 
  Sliders, 
  RefreshCw,
  Compass,
  Code2,
  BookmarkPlus,
  Send,
  Eye,
  Terminal
} from 'lucide-react';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { Input, Textarea, Select } from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, SkillCard } from '../components/ui/Card';
import ProfileCard from '../components/ui/ProfileCard';
import { Skeleton, SkeletonCard, SkeletonText, SkeletonAvatar, SkeletonBadge } from '../components/ui/Skeleton';
import { Sparkle, Squiggle, AsteriskDoodle, TapeSticker, HandCircle } from '../components/ui/Doodles';
import { useToast } from '../context/ToastContext';
import BackendStatusCard from '../components/status/BackendStatusCard';
import ArchitectureOverview from '../components/status/ArchitectureOverview';

export default function HomePage({ onOpenSwapModal }) {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('pins');
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [demoInput, setDemoInput] = useState('');
  const [demoSelect, setDemoSelect] = useState('react');
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  // Palette color tokens for the copyable swatch bar
  const swatches = [
    { name: 'Warm Ivory', hex: '#FAF7F0', text: 'text-charcoal', bg: 'bg-[#FAF7F0]', border: 'border-charcoal/20' },
    { name: 'Lavender', hex: '#C8B6F6', text: 'text-charcoal', bg: 'bg-[#C8B6F6]', border: 'border-charcoal/20' },
    { name: 'Dusty Purple', hex: '#8270B5', text: 'text-white', bg: 'bg-[#8270B5]', border: 'border-charcoal/20' },
    { name: 'Butter Yellow', hex: '#F5DE91', text: 'text-charcoal', bg: 'bg-[#F5DE91]', border: 'border-charcoal/20' },
    { name: 'Sage Green', hex: '#B9CBB3', text: 'text-charcoal', bg: 'bg-[#B9CBB3]', border: 'border-charcoal/20' },
    { name: 'Charcoal', hex: '#34313B', text: 'text-ivory', bg: 'bg-[#34313B]', border: 'border-charcoal' },
  ];

  // Mock skills representing the Pinterest-style board
  const sampleSkills = [
    {
      id: '1',
      title: 'Modern React & Fluid Motion',
      category: 'Programming & Tech',
      teacher: {
        name: 'Maya Lin',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        rating: 4.95,
        reviewCount: 32,
      },
      proficiency: 'Expert',
      experienceYears: 5,
      description: 'I can teach component architecture, custom hooks, and silky Framer Motion animations from scratch.',
      wantsInReturn: ['Acoustic Guitar', 'Sourdough Baking'],
      colorVariant: 'white',
      tapeColor: 'bg-butter/85',
    },
    {
      id: '2',
      title: 'Artisan Wild Yeast Sourdough',
      category: 'Culinary Arts',
      teacher: {
        name: 'Mateo Silva',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        rating: 5.0,
        reviewCount: 19,
      },
      proficiency: 'Advanced',
      experienceYears: 4,
      description: 'Learn starter maintenance, high-hydration bulk fermentation, and decorative razor lame scoring.',
      wantsInReturn: ['Figma UI Design', 'Next.js'],
      colorVariant: 'butter',
      tapeColor: 'bg-lavender/85',
    },
    {
      id: '3',
      title: 'Conversational Spanish & Slang',
      category: 'Languages',
      teacher: {
        name: 'Sofia Ortiz',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        rating: 4.88,
        reviewCount: 45,
      },
      proficiency: 'Native',
      experienceYears: 8,
      description: 'Zero dry textbook grammar. We will roleplay ordering coffee in Madrid, booking train tickets, and everyday idioms.',
      wantsInReturn: ['Python Basics', 'Video Editing'],
      colorVariant: 'lavender',
      tapeColor: 'bg-sage/85',
    },
    {
      id: '4',
      title: 'Ceramic Wheel & Glaze Chemistry',
      category: 'Design & Craft',
      teacher: {
        name: 'Elena Rostova',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
        rating: 4.97,
        reviewCount: 24,
      },
      proficiency: 'Expert',
      experienceYears: 6,
      description: 'Centering 3kg of clay, throwing cylinder vases with even walls, and mixing food-safe cone 6 glazes.',
      wantsInReturn: ['Web Development', 'Digital Marketing'],
      colorVariant: 'sage',
      tapeColor: 'bg-butter/85',
    },
  ];

  const sampleProfile = {
    fullName: 'Lucas Vance',
    username: 'lucasvance',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    bio: 'Jazz guitarist by night, backend engineer by day. Big believer in cross-pollinating artistic intuition with clean code.',
    location: 'Montreal, Canada',
    rating: 4.96,
    reviewCount: 38,
    skillsTeaching: [
      { name: 'Jazz Harmony', level: 'Expert' },
      { name: 'Node.js & PostgreSQL', level: 'Advanced' },
    ],
    skillsLearning: ['Ceramic Pottery', 'Spanish Fluency'],
    availability: 'Tuesday & Thursday evenings',
    isVerified: true,
  };

  const copyHex = (hex, name) => {
    navigator.clipboard?.writeText(hex);
    toast.swap(`Copied ${name}`, `${hex} copied to your clipboard!`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      
      {/* ==================================================================== */}
      {/* HERO SECTION: Pinterest-meets-Creative Learning Community            */}
      {/* ==================================================================== */}
      <section className="relative text-center max-w-4xl mx-auto pt-6 pb-4">
        {/* Playful Floating Doodles */}
        <div className="hidden sm:block absolute -top-2 left-6 animate-bounce duration-1000">
          <Sparkle className="w-8 h-8 text-butter" size={32} />
        </div>
        <div className="hidden sm:block absolute top-10 right-8">
          <AsteriskDoodle className="w-7 h-7 text-lavender" size={28} />
        </div>

        {/* Top Community Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border-2 border-charcoal shadow-pop-sm text-xs font-bold text-charcoal mb-6">
          <Sparkle className="w-4 h-4 text-dusty" size={16} />
          <span>Pinterest Meets Peer Education</span>
          <span className="w-2 h-2 rounded-full bg-sage-dark animate-pulse"></span>
        </div>

        {/* Editorial Heading */}
        <h1 className="text-4xl sm:text-6xl font-bold font-serif text-charcoal tracking-tight leading-[1.15] mb-5">
          Where curious minds trade skills like{' '}
          <span className="relative inline-block px-1">
            <span className="relative z-10 italic text-dusty">vintage books.</span>
            <Squiggle className="absolute -bottom-2 left-0 w-full h-3 text-butter z-0" />
          </span>
        </h1>

        <p className="text-base sm:text-xl text-charcoal-muted max-w-2xl mx-auto leading-relaxed font-sans mb-8">
          Teach what you know. Learn what you want. A human-first skill exchange community built with warm pastel aesthetics, rounded pins, and zero monetary friction.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button
            variant="primary"
            size="lg"
            rightIcon={<ArrowRightLeft className="w-4 h-4 text-butter" />}
            onClick={() => {
              const el = document.getElementById('community-pins');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Explore Skill Pins
          </Button>

          <Button
            variant="secondary"
            size="lg"
            leftIcon={<Palette className="w-4 h-4 text-charcoal" />}
            onClick={() => {
              const el = document.getElementById('design-system');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Visual Design Tokens
          </Button>

          <Button
            variant="outline"
            size="lg"
            leftIcon={<Sparkles className="w-4 h-4 text-dusty" />}
            onClick={() => {
              toast.swap(
                'Skill Swap Matched! ✨',
                'Elena Rostova (Pottery) is eager to trade with your React skills!'
              );
            }}
          >
            Trigger Toast
          </Button>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* COLOR PALETTE & TYPOGRAPHY SWATCHES BAR                              */}
      {/* ==================================================================== */}
      <section className="bg-white rounded-3xl p-6 border-2 border-charcoal shadow-pop">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-3 border-b border-charcoal/10">
          <div>
            <h3 className="text-lg font-bold font-serif text-charcoal flex items-center gap-2">
              <Palette className="w-5 h-5 text-dusty" />
              <span>SkillSwap Core Colour Palette</span>
            </h3>
            <p className="text-xs text-charcoal-muted">
              Click any swatch to copy its exact hex value to your clipboard.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-charcoal">
            <span className="font-serif italic text-sm">Fraunces</span>
            <span className="text-charcoal-subtle">+</span>
            <span className="font-sans">Plus Jakarta Sans</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {swatches.map((item, idx) => (
            <motion.button
              key={idx}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => copyHex(item.hex, item.name)}
              className={`p-3.5 rounded-2xl border-2 ${item.border} ${item.bg} text-left transition shadow-sm flex flex-col justify-between h-24`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[11px] font-bold ${item.text}`}>{item.name}</span>
                <Sparkle className={`w-3 h-3 ${item.text} opacity-60`} size={12} />
              </div>
              <span className={`font-mono text-xs font-bold ${item.text} opacity-90`}>
                {item.hex}
              </span>
            </motion.button>
          ))}
        </div>
      </section>

      {/* ==================================================================== */}
      {/* DESIGN SYSTEM INTERACTIVE SHOWCASE TABS                              */}
      {/* ==================================================================== */}
      <section id="design-system" className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <Badge variant="dusty" size="sm" withSparkle={true}>
              Design System Showcase
            </Badge>
            <h2 className="text-3xl font-bold font-serif text-charcoal mt-2">
              Tactile Component Library
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-muted mt-1">
              Engineered with custom Tailwind tokens, Framer Motion springs, and playful micro-interactions.
            </p>
          </div>

          {/* Tab Navigation Pill Bar */}
          <div className="flex flex-wrap gap-1.5 p-1.5 rounded-2xl bg-white border-2 border-charcoal shadow-pop-sm">
            {[
              { id: 'pins', label: 'Skill Pins', icon: <BookmarkPlus className="w-3.5 h-3.5" /> },
              { id: 'buttons', label: 'Buttons & Badges', icon: <Sliders className="w-3.5 h-3.5" /> },
              { id: 'inputs', label: 'Forms & Inputs', icon: <MessageSquare className="w-3.5 h-3.5" /> },
              { id: 'profiles', label: 'Profile Card', icon: <Heart className="w-3.5 h-3.5" /> },
              { id: 'skeletons', label: 'Skeletons', icon: <Eye className="w-3.5 h-3.5" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition
                  ${
                    activeTab === tab.id
                      ? 'bg-charcoal text-ivory shadow-sm'
                      : 'text-charcoal hover:bg-lavender/30'
                  }
                `}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* TAB 1: PINTEREST SKILL PINS                                        */}
        {/* ------------------------------------------------------------------ */}
        {activeTab === 'pins' && (
          <div id="community-pins" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider text-charcoal-muted">
                  Community Skill Pins (Pinterest Grid)
                </span>
                <Badge variant="butter" size="xs">
                  {sampleSkills.length} Available
                </Badge>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  toast.info(
                    'Filter Skills',
                    'Categories: Programming, Culinary Arts, Languages, Crafts'
                  );
                }}
                leftIcon={<Search className="w-3.5 h-3.5" />}
              >
                Search & Filter
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
              {sampleSkills.map((skill) => (
                <SkillCard
                  key={skill.id}
                  skill={skill}
                  onSwapClick={(s) => onOpenSwapModal && onOpenSwapModal(s)}
                  withTape={true}
                  tapeColor={skill.tapeColor}
                />
              ))}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* TAB 2: BUTTONS & BADGES                                            */}
        {/* ------------------------------------------------------------------ */}
        {activeTab === 'buttons' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Buttons Showcase Card */}
            <Card variant="white" withTape={true} tapeColor="bg-butter/85">
              <CardHeader>
                <CardTitle>Button Variants</CardTitle>
                <CardDescription>
                  Tactile spring pop on tap, subtle hover lift, and accessible focus states.
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <Button variant="primary">Primary Charcoal</Button>
                  <Button variant="secondary">Butter Yellow</Button>
                  <Button variant="lavender">Lavender</Button>
                  <Button variant="sage">Sage Green</Button>
                  <Button variant="dusty">Dusty Purple</Button>
                  <Button variant="outline">Tactile Outline</Button>
                  <Button variant="ghost">Ghost Button</Button>
                </div>

                <div className="pt-4 border-t border-charcoal/10 space-y-2">
                  <span className="text-xs font-bold text-charcoal-muted uppercase tracking-wider block">
                    Sizes & Loading States
                  </span>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button variant="primary" size="sm">Small (sm)</Button>
                    <Button variant="primary" size="md">Medium (md)</Button>
                    <Button variant="primary" size="lg">Large (lg)</Button>
                    <Button variant="primary" isLoading={true}>Loading State</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Badges Showcase Card */}
            <Card variant="white" withTape={true} tapeColor="bg-lavender/85">
              <CardHeader>
                <CardTitle>Whimsical Badges</CardTitle>
                <CardDescription>
                  Sticker-like pastel tags with organic borders and playful icons.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex flex-wrap items-center gap-2.5">
                  <Badge variant="butter" size="sm">Butter Tag</Badge>
                  <Badge variant="lavender" size="sm">Lavender Skill</Badge>
                  <Badge variant="sage" size="sm">Sage Verified</Badge>
                  <Badge variant="dusty" size="sm">Dusty Purple</Badge>
                  <Badge variant="charcoal" size="sm">Charcoal Dark</Badge>
                  <Badge variant="ivory" size="sm">Warm Ivory</Badge>
                  <Badge variant="outline" size="sm">Clean Outline</Badge>
                </div>

                <div className="pt-4 border-t border-charcoal/10 space-y-2">
                  <span className="text-xs font-bold text-charcoal-muted uppercase tracking-wider block">
                    Indicators & Sparkles
                  </span>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <Badge variant="butter" size="md" dot={true}>
                      Active Now
                    </Badge>
                    <Badge variant="lavender" size="md" withSparkle={true}>
                      Featured Barter
                    </Badge>
                    <Badge variant="sage" size="md" icon={<Star className="w-3.5 h-3.5 fill-charcoal text-charcoal" />}>
                      Top Rated 5.0
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* TAB 3: FORMS & INPUTS                                              */}
        {/* ------------------------------------------------------------------ */}
        {activeTab === 'inputs' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card variant="white" withTape={true} tapeColor="bg-sage/85">
              <CardHeader>
                <CardTitle>Editorial Form Controls</CardTitle>
                <CardDescription>
                  Inputs featuring clean labels, icon prefixes, and tactile focus states.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <Input
                  label="Search the skill exchange"
                  placeholder="e.g. Graphic design, Japanese, Pottery..."
                  leftIcon={<Search className="w-4 h-4" />}
                  value={demoInput}
                  onChange={(e) => setDemoInput(e.target.value)}
                  helperText="Search over 40+ canonical craft & tech skills"
                />

                <Select
                  label="Primary Category"
                  value={demoSelect}
                  onChange={(e) => setDemoSelect(e.target.value)}
                  options={[
                    { value: 'react', label: 'Programming & Tech' },
                    { value: 'baking', label: 'Culinary Arts & Baking' },
                    { value: 'languages', label: 'World Languages' },
                    { value: 'music', label: 'Acoustic Music & Audio' },
                  ]}
                />

                <Input
                  label="Input with Error State"
                  defaultValue="invalid_email"
                  error="Please provide a valid email to receive swap notifications"
                />
              </CardContent>
            </Card>

            <Card variant="white" withTape={true} tapeColor="bg-butter/85">
              <CardHeader>
                <CardTitle>Textarea & Micro-Interactions</CardTitle>
                <CardDescription>
                  Generous line height, warm pastel focus rings, and tactile send triggers.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <Textarea
                  label="Skill Description & Teaching Philosophy"
                  rows={4}
                  placeholder="Tell learners about your experience, what projects you will build together, and your pacing..."
                  helperText="Clear expectations lead to 5-star swap sessions."
                />

                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setDemoInput('');
                      toast.info('Form Reset', 'The form input has been cleared.');
                    }}
                  >
                    Clear
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    rightIcon={<Send className="w-3.5 h-3.5 text-butter" />}
                    onClick={() => {
                      toast.success(
                        'Proposal Ready!',
                        'Your swap request draft has been formatted cleanly.'
                      );
                    }}
                  >
                    Save Draft
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* TAB 4: PROFILE CARDS                                               */}
        {/* ------------------------------------------------------------------ */}
        {activeTab === 'profiles' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ProfileCard
              profile={sampleProfile}
              onSwapClick={(p) => {
                onOpenSwapModal && onOpenSwapModal({
                  title: 'Jazz Harmony & Improvisation',
                  wantsInReturn: p.skillsLearning,
                });
              }}
              withTape={true}
              tapeColor="bg-lavender/85"
            />

            <ProfileCard
              profile={{
                fullName: 'Maya Lin',
                username: 'mayalin_code',
                avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
                bio: 'Senior UI engineer who loves mentoring junior developers in exchange for acoustic guitar and sourdough baking lessons.',
                location: 'San Francisco, CA',
                rating: 4.95,
                reviewCount: 32,
                skillsTeaching: [
                  { name: 'React & UI Animation', level: 'Expert' },
                  { name: 'CSS Architecture', level: 'Advanced' },
                ],
                skillsLearning: ['Acoustic Guitar', 'Sourdough Baking'],
                availability: 'Saturday mornings (PST)',
                isVerified: true,
              }}
              onSwapClick={(p) => {
                onOpenSwapModal && onOpenSwapModal({
                  title: 'React & UI Animation',
                  wantsInReturn: p.skillsLearning,
                });
              }}
              withTape={true}
              tapeColor="bg-butter/85"
            />

            <ProfileCard
              profile={{
                fullName: 'Sofia Ortiz',
                username: 'sofia_idiomas',
                avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
                bio: 'Bilingual educator teaching conversational Spanish through cinema, music lyrics, and authentic cultural discussions.',
                location: 'Barcelona, Spain',
                rating: 4.88,
                reviewCount: 45,
                skillsTeaching: [
                  { name: 'Conversational Spanish', level: 'Native' },
                  { name: 'Spanish Literature', level: 'Advanced' },
                ],
                skillsLearning: ['Python Data Analysis', 'Video Editing'],
                availability: 'Weekdays 18:00 - 21:00 CET',
                isVerified: true,
              }}
              onSwapClick={(p) => {
                onOpenSwapModal && onOpenSwapModal({
                  title: 'Conversational Spanish',
                  wantsInReturn: p.skillsLearning,
                });
              }}
              withTape={true}
              tapeColor="bg-sage/85"
            />
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* TAB 5: LOADING SKELETONS                                           */}
        {/* ------------------------------------------------------------------ */}
        {activeTab === 'skeletons' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-white rounded-2xl p-4 border-2 border-charcoal shadow-sm">
              <div>
                <h4 className="text-sm font-bold font-serif text-charcoal">
                  Simulated Loading States
                </h4>
                <p className="text-xs text-charcoal-muted">
                  Pastel pulsing skeleton loaders prevent layout shift and maintain aesthetic harmony.
                </p>
              </div>

              <Button
                variant={showSkeleton ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setShowSkeleton(!showSkeleton)}
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              >
                {showSkeleton ? 'Show Loaded Cards' : 'Show Skeleton Mode'}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {showSkeleton ? (
                <>
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                </>
              ) : (
                <>
                  <SkillCard skill={sampleSkills[0]} onSwapClick={onOpenSwapModal} />
                  <SkillCard skill={sampleSkills[1]} onSwapClick={onOpenSwapModal} />
                  <SkillCard skill={sampleSkills[2]} onSwapClick={onOpenSwapModal} />
                </>
              )}
            </div>
          </div>
        )}
      </section>

      {/* ==================================================================== */}
      {/* SYSTEM ARCHITECTURE & DIAGNOSTICS DRAWER                            */}
      {/* ==================================================================== */}
      <section id="health-status" className="pt-8 border-t-2 border-charcoal/15">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-charcoal shadow-pop space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-dusty flex items-center gap-1.5">
                <Terminal className="w-4 h-4" />
                Backend & Database Diagnostics
              </span>
              <h3 className="text-xl font-bold font-serif text-charcoal mt-1">
                System Status & Verification Hub
              </h3>
              <p className="text-xs text-charcoal-muted">
                Inspect real-time Express communication and Supabase PostgreSQL schema verification.
              </p>
            </div>

            <Button
              variant={showDiagnostics ? 'outline' : 'secondary'}
              size="sm"
              onClick={() => setShowDiagnostics(!showDiagnostics)}
            >
              {showDiagnostics ? 'Hide Diagnostics' : 'View Live Diagnostics'}
            </Button>
          </div>

          {/* Conditional Diagnostics Render */}
          {showDiagnostics && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-8 pt-4 border-t border-charcoal/10"
            >
              <BackendStatusCard />
              <ArchitectureOverview />
            </motion.div>
          )}
        </div>
      </section>

    </div>
  );
}
