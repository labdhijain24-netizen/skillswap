import React from 'react';
import { Star, MapPin, Calendar, ArrowRightLeft, Sparkles, CheckCircle2 } from 'lucide-react';
import { Card } from './Card';
import Badge from './Badge';
import Button from './Button';
import { TapeSticker, Sparkle } from './Doodles';

/**
 * Creative Community Profile Card
 * Showcases a SkillSwap teacher & learner in a Pinterest-style editorial pin
 */
export default function ProfileCard({
  profile,
  onSwapClick,
  className = '',
  withTape = true,
  tapeColor = 'bg-sage/75',
}) {
  const {
    fullName = 'Elena Rostova',
    username = 'elenacrafts',
    avatar = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    bio = 'Ceramics artisan & frontend hobbyist. I believe teaching hands-on skills is the purest way to build community.',
    location = 'Portland, OR',
    rating = 5.0,
    reviewCount = 14,
    skillsTeaching = [
      { name: 'Ceramic Pottery', level: 'Expert' },
      { name: 'Glaze Chemistry', level: 'Advanced' },
    ],
    skillsLearning = ['Next.js', 'Spanish Fluency'],
    availability = 'Weekends & Evenings',
    isVerified = true,
  } = profile || {};

  return (
    <Card
      variant="white"
      withTape={withTape}
      tapeColor={tapeColor}
      tapeRotate="1deg"
      interactive={true}
      className={`flex flex-col justify-between ${className}`}
    >
      <div>
        {/* Header: Avatar, Name & Location */}
        <div className="flex items-start space-x-3.5 mb-4">
          <div className="relative">
            <img
              src={avatar}
              alt={fullName}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-charcoal shadow-pop-sm"
            />
            {isVerified && (
              <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-butter rounded-full border-1.5 border-charcoal flex items-center justify-center text-charcoal">
                <CheckCircle2 className="w-3.5 h-3.5 fill-butter text-charcoal" />
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h4 className="text-lg font-bold font-serif text-charcoal truncate">
                {fullName}
              </h4>
            </div>
            <p className="text-xs text-charcoal-subtle font-mono">@{username}</p>

            <div className="flex items-center gap-2 mt-1 text-[11px] text-charcoal-muted">
              {location && (
                <span className="flex items-center gap-0.5">
                  <MapPin className="w-3 h-3 text-dusty" />
                  <span>{location}</span>
                </span>
              )}
              <span className="flex items-center gap-0.5">
                <Star className="w-3 h-3 fill-butter text-charcoal" />
                <span className="font-bold text-charcoal">{rating.toFixed(1)}</span>
                <span>({reviewCount})</span>
              </span>
            </div>
          </div>
        </div>

        {/* Bio */}
        <p className="text-xs text-charcoal-muted leading-relaxed line-clamp-3 mb-4">
          {bio}
        </p>

        {/* Skills Taught */}
        <div className="space-y-2 mb-3">
          <span className="text-[10px] uppercase font-bold tracking-wider text-charcoal-subtle block">
            Teaches
          </span>
          <div className="flex flex-wrap gap-1.5">
            {skillsTeaching.map((skill, idx) => (
              <Badge key={idx} variant="lavender" size="xs">
                {typeof skill === 'string' ? skill : `${skill.name} (${skill.level})`}
              </Badge>
            ))}
          </div>
        </div>

        {/* Skills Wanted */}
        <div className="space-y-2 mb-4">
          <span className="text-[10px] uppercase font-bold tracking-wider text-charcoal-subtle block">
            Wants to learn
          </span>
          <div className="flex flex-wrap gap-1.5">
            {skillsLearning.map((skill, idx) => (
              <Badge key={idx} variant="butter" size="xs">
                {skill}
              </Badge>
            ))}
          </div>
        </div>

        {/* Availability snippet */}
        {availability && (
          <div className="flex items-center gap-1.5 text-[11px] text-charcoal-muted bg-ivory rounded-xl px-2.5 py-1.5 border border-charcoal/10">
            <Calendar className="w-3.5 h-3.5 text-dusty flex-shrink-0" />
            <span>{availability}</span>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="mt-5 pt-3 border-t border-charcoal/10 flex items-center justify-between">
        <span className="text-xs font-serif italic text-charcoal-muted">
          Active exchanger
        </span>
        <Button
          variant="primary"
          size="sm"
          onClick={() => onSwapClick && onSwapClick(profile)}
          rightIcon={<ArrowRightLeft className="w-3 h-3" />}
        >
          Request Swap
        </Button>
      </div>
    </Card>
  );
}
