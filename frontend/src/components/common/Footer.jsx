import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRightLeft, 
  Heart, 
  Sparkles, 
  Github, 
  Compass, 
  BookOpen, 
  ShieldCheck 
} from 'lucide-react';
import { Sparkle, AsteriskDoodle } from '../ui/Doodles';

export default function Footer() {
  return (
    <footer className="bg-charcoal text-ivory pt-16 pb-12 mt-24 border-t-4 border-butter relative overflow-hidden">
      {/* Decorative background doodles */}
      <div className="absolute top-8 right-12 opacity-20 pointer-events-none">
        <Sparkle className="w-24 h-24 text-butter" size={96} />
      </div>
      <div className="absolute bottom-6 left-8 opacity-10 pointer-events-none">
        <AsteriskDoodle className="w-32 h-32 text-lavender" size={128} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-ivory/15">
          
          {/* Brand Manifesto Column */}
          <div className="md:col-span-5 space-y-4">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-2xl bg-dusty text-white flex items-center justify-center border-2 border-white shadow-[2px_2px_0px_#F5DE91]">
                <ArrowRightLeft className="w-5 h-5 text-butter" />
              </div>
              <span className="text-2xl font-bold font-serif text-ivory tracking-tight">
                SkillSwap
              </span>
            </Link>

            <p className="text-sm text-ivory/80 leading-relaxed font-sans max-w-sm">
              A peer-to-peer barter collective where curious minds exchange craft, code, languages, and creativity without the currency gate.
            </p>

            {/* Whimsical community quote sticker */}
            <div className="bg-ivory/10 backdrop-blur-sm rounded-2xl p-4 border border-ivory/20 inline-block max-w-xs">
              <div className="flex items-center gap-1.5 text-butter text-xs font-serif italic mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>The SkillSwap Promise</span>
              </div>
              <p className="text-xs text-ivory/90 leading-tight">
                &ldquo;Every expert was once a curious beginner. Trade with generosity and learn with patience.&rdquo;
              </p>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-butter font-sans">
              Skill Categories
            </h4>
            <ul className="space-y-2 text-xs text-ivory/70 font-medium">
              <li>
                <Link to="/explore?category=programming-tech" className="hover:text-butter transition flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-lavender" />
                  <span>Programming &amp; Web Tech</span>
                </Link>
              </li>
              <li>
                <Link to="/explore?category=design-creative" className="hover:text-butter transition flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-butter" />
                  <span>UI/UX &amp; Graphic Arts</span>
                </Link>
              </li>
              <li>
                <Link to="/explore?category=languages" className="hover:text-butter transition flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-sage" />
                  <span>World Languages</span>
                </Link>
              </li>
              <li>
                <Link to="/explore?category=music-audio" className="hover:text-butter transition flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-lavender" />
                  <span>Acoustic Music &amp; Audio</span>
                </Link>
              </li>
              <li>
                <Link to="/explore?category=culinary-arts" className="hover:text-butter transition flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-butter" />
                  <span>Ceramics &amp; Culinary Arts</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform Navigation */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-butter font-sans">
              Platform &amp; Manifesto
            </h4>
            <ul className="space-y-2 text-xs text-ivory/70 font-medium">
              <li>
                <Link to="/explore" className="hover:text-butter transition flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-dusty" />
                  <span>Browse All Community Pins</span>
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-butter transition flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-sage" />
                  <span>How Barter Sessions Work</span>
                </Link>
              </li>
              <li>
                <a href="#health-status" className="hover:text-butter transition flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-butter" />
                  <span>PostgreSQL Database Schema</span>
                </a>
              </li>
            </ul>

            <div className="pt-2">
              <span className="text-[10px] uppercase font-bold text-ivory/50 block mb-1">
                Visual Palette Tokens
              </span>
              <div className="flex flex-wrap gap-1.5">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-[#FAF7F0] text-charcoal font-bold">#FAF7F0</span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-[#C8B6F6] text-charcoal font-bold">#C8B6F6</span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-[#8270B5] text-white font-bold">#8270B5</span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-[#F5DE91] text-charcoal font-bold">#F5DE91</span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-[#B9CBB3] text-charcoal font-bold">#B9CBB3</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ivory/60">
          <div className="flex items-center space-x-1">
            <span>&copy; {new Date().getFullYear()} SkillSwap Collective.</span>
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-butter inline fill-butter mx-0.5" />
            <span>for genuine peer education.</span>
          </div>

          <div className="flex items-center space-x-6 text-xs font-medium text-ivory/70">
            <Link to="/" className="hover:text-butter transition">Home</Link>
            <Link to="/explore" className="hover:text-butter transition">Explore Skills</Link>
            <Link to="/how-it-works" className="hover:text-butter transition">How It Works</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
