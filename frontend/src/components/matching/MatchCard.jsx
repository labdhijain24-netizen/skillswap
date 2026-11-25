import React from 'react';
import { motion } from 'framer-motion';
import {
  Star,
  MapPin,
  Calendar,
  Clock,
  ArrowRightLeft,
  Sparkles,
  CheckCircle2,
  Heart,
  Award,
  Layers,
  Info
} from 'lucide-react';
import { Card } from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { TapeSticker, Sparkle } from '../ui/Doodles';

export default function MatchCard({
  match,
  onSwapClick,
  onViewProfile,
  className = '',
}) {
  const {
    candidate,
    compatibilityScore,
    matchType,
    breakdown,
    forwardMatches = [],
    reciprocalMatches = [],
    overlappingDays = [],
    totalOverlapHours = 0,
    sharedInterests = [],
    explanation,
  } = match || {};

  const typeConfig = {
    perfect_reciprocal: {
      label: '✨ Perfect 2-Way Match',
      variant: 'butter',
      tape: 'bg-butter/85',
    },
    one_way_offering: {
      label: '🎯 Direct Skill Teacher',
      variant: 'lavender',
      tape: 'bg-lavender/85',
    },
    one_way_seeking: {
      label: '🌱 Eager Learner Match',
      variant: 'sage',
      tape: 'bg-sage/85',
    },
    category_affinity: {
      label: '🤝 Category Affinity',
      variant: 'outline',
      tape: 'bg-ivory-warm',
    },
    none: {
      label: '🌟 Network Match',
      variant: 'outline',
      tape: 'bg-butter/60',
    },
  };

  const currentType = typeConfig[matchType] || typeConfig.none;

  return (
    <Card
      variant="white"
      withTape={true}
      tapeColor={currentType.tape}
      tapeRotate="-1deg"
      interactive={true}
      className={`border-2 border-charcoal shadow-pop flex flex-col justify-between ${className}`}
    >
      <div className="space-y-4">
        {/* Top Match Badge Strip */}
        <div className="flex items-center justify-between gap-2">
          <Badge variant={currentType.variant} size="xs">
            {currentType.label}
          </Badge>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-butter text-charcoal font-serif font-bold text-xs border border-charcoal/20 shadow-pop-sm">
            <Sparkle className="w-3.5 h-3.5 text-dusty" size={14} />
            <span>{compatibilityScore}% Compatible</span>
          </div>
        </div>

        {/* Candidate Identity Header */}
        <div className="flex items-start gap-3.5 pt-1">
          <div
            onClick={() => onViewProfile && onViewProfile(candidate)}
            className="cursor-pointer group flex-shrink-0"
          >
            <img
              src={candidate?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={candidate?.full_name}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-charcoal shadow-pop-sm group-hover:scale-105 transition"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h4
                onClick={() => onViewProfile && onViewProfile(candidate)}
                className="text-lg font-bold font-serif text-charcoal truncate cursor-pointer hover:text-dusty transition"
              >
                {candidate?.full_name}
              </h4>
              <Badge variant="sage" size="xs">
                Verified
              </Badge>
            </div>

            <p className="text-xs text-charcoal-subtle font-mono">@{candidate?.username}</p>

            <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-charcoal-muted">
              {candidate?.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-dusty" />
                  <span>{candidate.location}</span>
                </span>
              )}
              <span className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-butter text-charcoal" />
                <span className="font-bold text-charcoal">{Number(candidate?.rating_avg || 5.0).toFixed(1)}</span>
                <span>({candidate?.rating_count || 0})</span>
              </span>
            </div>
          </div>
        </div>

        {/* Bilateral Skill Exchange Box */}
        <div className="bg-ivory rounded-2xl p-3.5 border-2 border-charcoal/15 space-y-2.5">
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-charcoal-muted">
            <ArrowRightLeft className="w-3.5 h-3.5 text-dusty" />
            <span>Bilateral Exchange Opportunity</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {/* They offer what you want */}
            <div className="p-2.5 rounded-xl bg-white border border-charcoal/10 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-dusty block">
                They Teach You
              </span>
              {forwardMatches.length > 0 ? (
                forwardMatches.map((m, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="font-serif font-bold text-charcoal truncate">{m.skillName}</span>
                    <Badge variant="butter" size="xs">{m.teacherLevel}</Badge>
                  </div>
                ))
              ) : (
                <span className="text-charcoal-subtle italic text-[11px]">Explore complementary topics</span>
              )}
            </div>

            {/* You offer what they want */}
            <div className="p-2.5 rounded-xl bg-white border border-charcoal/10 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-sage-dark block">
                You Teach Them
              </span>
              {reciprocalMatches.length > 0 ? (
                reciprocalMatches.map((m, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="font-serif font-bold text-charcoal truncate">{m.skillName}</span>
                    <Badge variant="sage" size="xs">Goal: {m.targetLevel}</Badge>
                  </div>
                ))
              ) : (
                <span className="text-charcoal-subtle italic text-[11px]">Open to new skills</span>
              )}
            </div>
          </div>
        </div>

        {/* Natural Language Explanation Box */}
        {explanation && (
          <div className="p-3 rounded-2xl bg-lavender-soft/80 border border-lavender-dark text-xs text-charcoal space-y-1">
            <div className="flex items-center gap-1 font-bold text-[11px] text-dusty uppercase tracking-wide">
              <Info className="w-3.5 h-3.5" />
              <span>Why Recommended For You</span>
            </div>
            <p className="leading-relaxed text-[11.5px] text-charcoal-muted font-sans">
              {explanation}
            </p>
          </div>
        )}

        {/* 4-Factor Breakdown Progress Meters */}
        {breakdown && (
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-subtle block">
              Compatibility Breakdown
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              {/* Skill 50% */}
              <div className="bg-white p-2 rounded-xl border border-charcoal/10 space-y-1">
                <div className="flex justify-between font-semibold">
                  <span>Skill Fit (50%)</span>
                  <span className="font-mono font-bold text-dusty">{breakdown.skillScore}%</span>
                </div>
                <div className="w-full bg-ivory rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-dusty h-full rounded-full transition-all duration-300"
                    style={{ width: `${breakdown.skillScore}%` }}
                  />
                </div>
              </div>

              {/* Availability 25% */}
              <div className="bg-white p-2 rounded-xl border border-charcoal/10 space-y-1">
                <div className="flex justify-between font-semibold">
                  <span>Schedule (25%)</span>
                  <span className="font-mono font-bold text-butter-dark">{breakdown.availabilityScore}%</span>
                </div>
                <div className="w-full bg-ivory rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-butter-dark h-full rounded-full transition-all duration-300"
                    style={{ width: `${breakdown.availabilityScore}%` }}
                  />
                </div>
              </div>

              {/* Interests 15% */}
              <div className="bg-white p-2 rounded-xl border border-charcoal/10 space-y-1">
                <div className="flex justify-between font-semibold">
                  <span>Interests (15%)</span>
                  <span className="font-mono font-bold text-lavender-dark">{breakdown.interestScore}%</span>
                </div>
                <div className="w-full bg-ivory rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-lavender-dark h-full rounded-full transition-all duration-300"
                    style={{ width: `${breakdown.interestScore}%` }}
                  />
                </div>
              </div>

              {/* Reliability 10% */}
              <div className="bg-white p-2 rounded-xl border border-charcoal/10 space-y-1">
                <div className="flex justify-between font-semibold">
                  <span>Reliability (10%)</span>
                  <span className="font-mono font-bold text-sage-dark">{breakdown.reliabilityScore}%</span>
                </div>
                <div className="w-full bg-ivory rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-sage-dark h-full rounded-full transition-all duration-300"
                    style={{ width: `${breakdown.reliabilityScore}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="mt-5 pt-3.5 border-t border-charcoal/10 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => onViewProfile && onViewProfile(candidate)}
          className="text-xs font-bold text-charcoal hover:text-dusty underline underline-offset-2 transition"
        >
          View Profile →
        </button>

        <Button
          variant="primary"
          size="sm"
          onClick={() => onSwapClick && onSwapClick(match)}
          rightIcon={<Sparkles className="w-3.5 h-3.5 text-butter" />}
        >
          Propose Skill Swap
        </Button>
      </div>
    </Card>
  );
}
