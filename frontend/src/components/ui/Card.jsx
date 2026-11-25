import React from 'react';
import { motion } from 'framer-motion';
import { Star, Sparkles, ArrowRightLeft, Clock, Award } from 'lucide-react';
import { TapeSticker, Sparkle } from './Doodles';
import Badge from './Badge';
import Button from './Button';

/**
 * Reusable Tactile Base Card
 */
export function Card({
  children,
  variant = 'white',
  withTape = false,
  tapeColor = 'bg-butter/80',
  tapeRotate = '-2deg',
  interactive = false,
  className = '',
  onClick,
  ...props
}) {
  const variantStyles = {
    white: 'bg-white border-2 border-charcoal/15',
    ivory: 'bg-ivory-warm border-2 border-charcoal/15',
    butter: 'bg-butter-soft border-2 border-charcoal/20',
    lavender: 'bg-lavender-soft border-2 border-charcoal/20',
    sage: 'bg-sage-soft border-2 border-charcoal/20',
    pop: 'bg-white border-2 border-charcoal shadow-pop hover:shadow-pop-lg',
  };

  const Component = interactive ? motion.div : 'div';
  const motionProps = interactive
    ? {
        whileHover: { y: -5, transition: { type: 'spring', stiffness: 380, damping: 18 } },
        whileTap: { y: -1, scale: 0.98 },
      }
    : {};

  return (
    <Component
      onClick={onClick}
      className={`
        relative rounded-3xl p-6 transition-all duration-150
        ${variantStyles[variant]}
        ${interactive ? 'cursor-pointer hover:border-charcoal shimmer overflow-hidden' : ''}
        ${className}
      `}
      {...motionProps}
      {...props}
    >
      {withTape && <TapeSticker color={tapeColor} rotate={tapeRotate} />}
      {children}
    </Component>
  );
}

export function CardHeader({ children, className = '' }) {
  return <div className={`mb-4 space-y-1 ${className}`}>{children}</div>;
}

export function CardTitle({ children, className = '' }) {
  return (
    <h3 className={`text-xl font-bold font-serif text-charcoal tracking-tight ${className}`}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = '' }) {
  return <p className={`text-xs text-charcoal-muted leading-relaxed ${className}`}>{children}</p>;
}

export function CardContent({ children, className = '' }) {
  return <div className={`space-y-4 ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = '' }) {
  return (
    <div className={`mt-6 pt-4 border-t border-charcoal/10 flex items-center justify-between ${className}`}>
      {children}
    </div>
  );
}

/**
 * Pinterest-Style Skill Card
 * Visual pin card for skill listings & trade proposals
 */
export function SkillCard({
  skill,
  onSwapClick,
  onTeacherClick,
  className = '',
  withTape = true,
  tapeColor = 'bg-butter/80',
}) {
  const {
    title = 'Modern React & UI Animation',
    category = 'Programming & Tech',
    teacher = {
      name: 'Maya Lin',
      username: 'maya_design',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      rating: 4.95,
      reviewCount: 28,
    },
    proficiency = 'Advanced',
    experienceYears = 4,
    description = 'I can teach component architecture, custom hooks, and silky Framer Motion transitions.',
    wantsInReturn = ['Acoustic Guitar', 'Conversational Spanish'],
    colorVariant = 'white',
    compatibilityScore = null,
  } = skill || {};

  return (
    <Card
      variant={colorVariant}
      withTape={withTape}
      tapeColor={tapeColor}
      interactive={true}
      className={`flex flex-col justify-between ${className}`}
    >
      <div>
        {/* Category & Proficiency Tag & Optional Match Score */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <Badge variant="lavender" size="xs">
            {category}
          </Badge>
          <div className="flex items-center gap-1.5">
            {compatibilityScore !== null && (
              <Badge variant="butter" size="xs" withSparkle={true}>
                {compatibilityScore}% Match
              </Badge>
            )}
            <Badge variant="outline" size="xs" icon={<Award className="w-3 h-3 text-dusty" />}>
              {proficiency}
            </Badge>
          </div>
        </div>

        {/* Skill Title in Editorial Serif */}
        <h3 className="text-xl font-bold font-serif text-charcoal tracking-tight mb-2 hover:text-dusty transition">
          {title}
        </h3>

        {/* Description */}
        <p className="text-xs text-charcoal-muted leading-relaxed line-clamp-2 mb-4">
          {description}
        </p>

        {/* Wants in Return Pill Stack */}
        {wantsInReturn && wantsInReturn.length > 0 && (
          <div className="bg-ivory/80 rounded-2xl p-2.5 border border-charcoal/10 mb-4">
            <span className="text-[10px] uppercase font-bold tracking-wider text-charcoal-subtle block mb-1.5 flex items-center gap-1">
              <ArrowRightLeft className="w-3 h-3 text-dusty" />
              <span>Looking to learn</span>
            </span>
            <div className="flex flex-wrap gap-1.5">
              {wantsInReturn.map((item, idx) => (
                <Badge key={idx} variant="butter" size="xs">
                  {item}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer: Teacher info and Swap CTA */}
      <div className="pt-3 border-t border-charcoal/10 flex items-center justify-between">
        <div 
          onClick={(e) => {
            if (onTeacherClick) {
              e.stopPropagation();
              onTeacherClick(teacher);
            }
          }}
          className={`flex items-center space-x-2.5 ${onTeacherClick ? 'cursor-pointer group' : ''}`}
        >
          <img
            src={teacher.avatar}
            alt={teacher.name}
            className="w-8 h-8 rounded-full object-cover border-1.5 border-charcoal shadow-sm group-hover:scale-105 transition"
          />
          <div>
            <div className="text-xs font-bold text-charcoal group-hover:text-dusty transition">
              {teacher.name}
            </div>
            <div className="flex items-center space-x-1 text-[11px] text-charcoal-muted">
              <Star className="w-3 h-3 fill-butter text-charcoal" />
              <span className="font-semibold text-charcoal">{teacher.rating}</span>
              <span>({teacher.reviewCount})</span>
            </div>
          </div>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onSwapClick && onSwapClick(skill);
          }}
          rightIcon={<Sparkles className="w-3 h-3" />}
        >
          Swap
        </Button>
      </div>
    </Card>
  );
}
