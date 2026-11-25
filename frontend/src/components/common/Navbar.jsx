import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRightLeft,
  Search,
  Menu,
  X,
  Sparkles,
  Compass,
  BookOpen,
  Users,
  LogIn,
  User,
  LogOut,
  Edit3,
  LayoutDashboard,
} from 'lucide-react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { Sparkle } from '../ui/Doodles';
import NotificationPanel from '../notifications/NotificationPanel';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function Navbar({ onOpenAuthModal }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, profile, signOut, isAuthenticated, isLocalGuest } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.info('Signed Out', 'You have been safely signed out.');
      navigate('/');
    } catch (err) {
      toast.warning('Error', err.message);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-ivory/95 backdrop-blur-md border-b-2 border-charcoal/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* Logo & Brand Identity */}
          <div className="flex items-center space-x-3">
            <Link
              to="/"
              className="flex items-center space-x-2.5 group select-none"
            >
              <div className="w-11 h-11 rounded-2xl bg-dusty text-white flex items-center justify-center border-2 border-charcoal shadow-pop-sm group-hover:shadow-pop transition-all">
                <ArrowRightLeft className="w-5 h-5 text-butter" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold font-serif text-charcoal tracking-tight flex items-center gap-1">
                  <span>SkillSwap</span>
                  <Sparkle className="w-4 h-4 text-butter" size={16} />
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-dusty">
                  Curated Exchange
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2 bg-white/80 px-3 py-1.5 rounded-full border-1.5 border-charcoal/15 shadow-sm">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `px-3.5 py-1.5 text-xs font-bold rounded-full transition flex items-center gap-1.5 ${isActive
                  ? 'bg-charcoal text-ivory shadow-sm'
                  : 'text-charcoal hover:text-dusty hover:bg-lavender/30'
                }`
              }
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Home</span>
            </NavLink>

            <NavLink
              to="/explore"
              className={({ isActive }) =>
                `px-3.5 py-1.5 text-xs font-bold rounded-full transition flex items-center gap-1.5 ${isActive
                  ? 'bg-charcoal text-ivory shadow-sm'
                  : 'text-charcoal hover:text-dusty hover:bg-butter/40'
                }`
              }
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Explore Skills</span>
            </NavLink>

            <NavLink
              to="/how-it-works"
              className={({ isActive }) =>
                `px-3.5 py-1.5 text-xs font-bold rounded-full transition flex items-center gap-1.5 ${isActive
                  ? 'bg-charcoal text-ivory shadow-sm'
                  : 'text-charcoal hover:text-dusty hover:bg-sage/40'
                }`
              }
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>How Swaps Work</span>
            </NavLink>

            {isAuthenticated && (
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `px-3.5 py-1.5 text-xs font-bold rounded-full transition flex items-center gap-1.5 ${isActive
                    ? 'bg-charcoal text-ivory shadow-sm'
                    : 'text-charcoal hover:text-dusty hover:bg-butter/40'
                  }`
                }
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </NavLink>
            )}

            {isAuthenticated && (
              <NavLink
                to="/exchanges"
                className={({ isActive }) =>
                  `px-3.5 py-1.5 text-xs font-bold rounded-full transition flex items-center gap-1.5 ${isActive
                    ? 'bg-charcoal text-ivory shadow-sm'
                    : 'text-charcoal hover:text-dusty hover:bg-lavender/40'
                  }`
                }
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>Exchanges</span>
              </NavLink>
            )}

            {isAuthenticated && (
              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  `px-3.5 py-1.5 text-xs font-bold rounded-full transition flex items-center gap-1.5 ${isActive
                    ? 'bg-charcoal text-ivory shadow-sm'
                    : 'text-charcoal hover:text-dusty hover:bg-dusty/20'
                  }`
                }
              >
                <User className="w-3.5 h-3.5" />
                <span>My Profile</span>
              </NavLink>
            )}
          </nav>

          {/* Desktop Action Buttons */}
          <div className="hidden sm:flex items-center space-x-3">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <NotificationPanel onNavigate={(url) => navigate(url)} />

                <Link
                  to="/profile"
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white border border-charcoal/20 hover:border-charcoal transition shadow-sm"
                >
                  <img
                    src={profile?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                    alt={profile?.full_name || 'Profile'}
                    className="w-6 h-6 rounded-full object-cover border border-charcoal"
                  />
                  <span className="text-xs font-bold text-charcoal max-w-[120px] truncate">
                    {profile?.full_name || user?.email?.split('@')[0]}
                  </span>
                  {isLocalGuest && (
                    <Badge variant="butter" size="xs">Local</Badge>
                  )}
                </Link>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  leftIcon={<LogOut className="w-3.5 h-3.5" />}
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/auth?mode=signin')}
                  leftIcon={<LogIn className="w-3.5 h-3.5 text-charcoal" />}
                >
                  Sign In
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/auth?mode=signup')}
                  rightIcon={<ArrowRightLeft className="w-3.5 h-3.5 text-butter" />}
                >
                  Start Swapping
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="md:hidden flex items-center gap-2">
            {isAuthenticated && (
              <NotificationPanel onNavigate={(url) => navigate(url)} />
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-2xl bg-white border-2 border-charcoal shadow-pop-sm text-charcoal focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b-2 border-charcoal px-6 py-6 space-y-4 shadow-lg overflow-hidden"
          >
            <div className="space-y-2">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2.5 rounded-2xl text-sm font-bold text-charcoal hover:bg-lavender/30 transition"
              >
                Home
              </Link>
              <Link
                to="/explore"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2.5 rounded-2xl text-sm font-bold text-charcoal hover:bg-butter/40 transition"
              >
                Explore Skills
              </Link>
              <Link
                to="/how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2.5 rounded-2xl text-sm font-bold text-charcoal hover:bg-sage/40 transition"
              >
                How Swaps Work
              </Link>
              {isAuthenticated && (
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2.5 rounded-2xl text-sm font-bold text-charcoal hover:bg-butter/40 transition"
                >
                  Dashboard
                </Link>
              )}
              {isAuthenticated && (
                <Link
                  to="/exchanges"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2.5 rounded-2xl text-sm font-bold text-charcoal hover:bg-lavender/40 transition"
                >
                  Skill Exchanges &amp; Sessions
                </Link>
              )}
              {isAuthenticated && (
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2.5 rounded-2xl text-sm font-bold text-charcoal bg-ivory transition"
                >
                  My Profile &amp; Settings
                </Link>
              )}
            </div>

            <div className="pt-4 border-t border-charcoal/10 flex flex-col gap-2.5">
              {isAuthenticated ? (
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleSignOut();
                  }}
                  leftIcon={<LogOut className="w-4 h-4" />}
                >
                  Sign Out
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate('/auth?mode=signin');
                    }}
                  >
                    Sign In
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate('/auth?mode=signup');
                    }}
                  >
                    Start Swapping
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
