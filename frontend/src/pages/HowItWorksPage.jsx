import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  ArrowRightLeft, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  Heart, 
  Compass, 
  Users 
} from 'lucide-react';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { Sparkle, Squiggle, TapeSticker, AsteriskDoodle } from '../components/ui/Doodles';

export default function HowItWorksPage({ onOpenAuthModal }) {
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    {
      q: 'Does SkillSwap cost any money?',
      a: 'No. SkillSwap is 100% free. The platform operates on a pure time-and-skill barter model. You exchange an hour of your skill for an hour of someone else’s skill.',
    },
    {
      q: 'What if I am a beginner and don’t feel like an "expert" in anything?',
      a: 'You do not need to be an elite professional! You can teach conversational English or your native language, intro guitar chords, knitting basics, cooking family recipes, or beginner Python. Everyone has something someone else wants to learn.',
    },
    {
      q: 'How do swap sessions actually take place?',
      a: 'Once a swap proposal is accepted by both parties, you can agree on a meeting link (such as Google Meet, Zoom, or Jitsi) and a calendar time that fits both of your schedules.',
    },
    {
      q: 'What happens if a partner does not show up?',
      a: 'Our verified review and attendance system tracks no-shows. If a user fails to attend without giving notice, their community reliability rating is updated to protect fellow members.',
    },
    {
      q: 'Can I swap multiple skills with the same person?',
      a: 'Absolutely! Many of our most active members form long-term learning partnerships where they alternate weeks or topics.',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      
      {/* Header */}
      <section className="text-center max-w-3xl mx-auto space-y-4">
        <Badge variant="dusty" size="sm" withSparkle={true}>
          The Barter Blueprint
        </Badge>
        <h1 className="text-4xl sm:text-5xl font-bold font-serif text-charcoal tracking-tight">
          How SkillSwap Works
        </h1>
        <p className="text-base sm:text-lg text-charcoal-muted leading-relaxed">
          A transparent, equitable way to learn new craft and share what you know. Here is how our decentralized learning collective works from start to finish.
        </p>
      </section>

      {/* The 4 Core Steps */}
      <section className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-8 border-2 border-charcoal shadow-pop space-y-3 relative">
            <TapeSticker color="bg-butter/85" rotate="-2deg" />
            <span className="text-xs font-mono font-bold px-3 py-1 bg-butter rounded-xl border border-charcoal text-charcoal">
              Step 01
            </span>
            <h3 className="text-xl font-bold font-serif text-charcoal">
              Publish Your Skills (Teach &amp; Learn)
            </h3>
            <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed">
              When creating your profile, declare what you can teach (e.g. Modern React, Sourdough Baking) and what you want to learn (e.g. Conversational French, Guitar). No comma-separated text: every skill is normalized in PostgreSQL.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 border-2 border-charcoal shadow-pop space-y-3 relative">
            <TapeSticker color="bg-lavender/85" rotate="1.5deg" />
            <span className="text-xs font-mono font-bold px-3 py-1 bg-lavender rounded-xl border border-charcoal text-charcoal">
              Step 02
            </span>
            <h3 className="text-xl font-bold font-serif text-charcoal">
              Discover Reciprocal Matches
            </h3>
            <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed">
              Browse the Pinterest-style community catalog or let our bilateral matching system automatically highlight peers where User A teaches what User B wants AND User B teaches what User A wants.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 border-2 border-charcoal shadow-pop space-y-3 relative">
            <TapeSticker color="bg-sage/85" rotate="-1deg" />
            <span className="text-xs font-mono font-bold px-3 py-1 bg-sage rounded-xl border border-charcoal text-charcoal">
              Step 03
            </span>
            <h3 className="text-xl font-bold font-serif text-charcoal">
              Propose an Exchange &amp; Chat
            </h3>
            <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed">
              Send a tailored swap request specifying which of your skills you offer. Chat directly in our encrypted messaging channels to coordinate session goals and schedule times.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 border-2 border-charcoal shadow-pop space-y-3 relative">
            <TapeSticker color="bg-butter/85" rotate="2deg" />
            <span className="text-xs font-mono font-bold px-3 py-1 bg-dusty rounded-xl border border-charcoal text-white">
              Step 04
            </span>
            <h3 className="text-xl font-bold font-serif text-charcoal">
              Conduct the Session &amp; Leave Reviews
            </h3>
            <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed">
              Meet on your agreed video call service. After teaching and learning, both participants submit an honest review with ratings (1 to 5 stars), which recalculates public community standing.
            </p>
          </div>
        </div>
      </section>

      {/* Community Etiquette & Safety */}
      <section className="bg-ivory-warm rounded-4xl p-8 sm:p-10 border-2 border-charcoal/20 space-y-6">
        <div className="flex items-center space-x-3">
          <ShieldCheck className="w-7 h-7 text-dusty" />
          <h2 className="text-2xl font-bold font-serif text-charcoal">
            The SkillSwap Community Pledge
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-charcoal leading-relaxed">
          <div className="p-4 bg-white rounded-2xl border border-charcoal/10 space-y-1.5">
            <div className="font-bold text-sm text-charcoal font-serif">1. Equal Respect</div>
            <p className="text-charcoal-muted">
              Whether you are teaching software architecture or sourdough baking, all skills have equal dignity in our collective.
            </p>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-charcoal/10 space-y-1.5">
            <div className="font-bold text-sm text-charcoal font-serif">2. Punctuality</div>
            <p className="text-charcoal-muted">
              Value each other&apos;s time. If you need to reschedule, notify your barter partner at least 12 hours in advance.
            </p>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-charcoal/10 space-y-1.5">
            <div className="font-bold text-sm text-charcoal font-serif">3. Generous Feedback</div>
            <p className="text-charcoal-muted">
              Constructive, encouraging feedback helps your partner become a better instructor and builds lasting friendships.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold font-serif text-charcoal">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-charcoal-muted">
            Everything you need to know about trading skills.
          </p>
        </div>

        <div className="space-y-3 max-w-3xl mx-auto">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border-2 border-charcoal/15 overflow-hidden shadow-sm transition"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full px-6 py-4 text-left font-bold text-sm text-charcoal flex items-center justify-between hover:bg-ivory/50 transition"
              >
                <span>{faq.q}</span>
                {openFaq === idx ? (
                  <ChevronUp className="w-4 h-4 text-dusty flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-charcoal-subtle flex-shrink-0" />
                )}
              </button>

              <AnimatePresence>
                {openFaq === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-6 pb-4 text-xs text-charcoal-muted leading-relaxed border-t border-charcoal/10 pt-3"
                  >
                    {faq.a}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Bottom Banner */}
      <section className="text-center pt-8 border-t border-charcoal/10 space-y-4">
        <h3 className="text-2xl font-bold font-serif text-charcoal">
          Ready to trade your first skill?
        </h3>
        <div className="flex justify-center gap-3">
          <Button
            variant="primary"
            size="md"
            onClick={() => onOpenAuthModal && onOpenAuthModal('signup')}
            rightIcon={<Sparkles className="w-4 h-4 text-butter" />}
          >
            Create Your Account
          </Button>
          <Link to="/explore">
            <Button variant="outline" size="md">
              Browse All Skills
            </Button>
          </Link>
        </div>
      </section>

    </div>
  );
}
