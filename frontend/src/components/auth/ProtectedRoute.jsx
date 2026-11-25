import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sparkle } from '../ui/Doodles';

/**
 * Protected Route Component
 * Restricts access to authenticated users and handles onboarding redirection.
 */
export default function ProtectedRoute({ children, requireOnboarding = false }) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-dusty text-white flex items-center justify-center border-2 border-charcoal shadow-pop-sm animate-pulse">
          <Sparkle className="w-6 h-6 text-butter" size={24} />
        </div>
        <p className="text-sm font-serif italic text-charcoal-muted">
          Hydrating your SkillSwap session...
        </p>
      </div>
    );
  }

  // Not logged in -> send to auth page
  if (!user) {
    return <Navigate to={`/auth?mode=signin&redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  // Logged in, but route requires completed onboarding
  // If profile is missing or onboarding is not completed, send to onboarding
  if (requireOnboarding && (!profile || !profile.onboarding_completed) && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
}
