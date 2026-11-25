import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Mail,
  Lock,
  User,
  AtSign,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  Eye,
  EyeOff,
  ArrowLeft
} from 'lucide-react';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Sparkle, TapeSticker, Squiggle } from '../components/ui/Doodles';
import { useAuth, LOCAL_DEMO_PERSONAS } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function AuthPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, profile, loading: authLoading, signIn, signUp, resetPassword, signInAsGuest } = useAuth();
  const toast = useToast();

  const modeParam = searchParams.get('mode') || 'signup';
  const redirectParam = searchParams.get('redirect') || '/dashboard';

  const [mode, setMode] = useState(modeParam); // 'signin' | 'signup' | 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const handleGuestSignIn = async (personaIdentifier = 'guest_explorer') => {
    setGuestLoading(true);
    setErrorMessage('');
    try {
      await signInAsGuest(personaIdentifier);
      toast.success('Welcome! 🚀', 'You are now exploring SkillSwap in Local Account mode.');
      navigate(redirectParam || '/dashboard');
    } catch (err) {
      toast.warning('Guest mode error', err.message || 'Could not start guest session.');
    } finally {
      setGuestLoading(false);
    }
  };

  // Sync mode with query params
  useEffect(() => {
    if (['signin', 'signup', 'forgot'].includes(modeParam)) {
      setMode(modeParam);
    }
  }, [modeParam]);

  // If already authenticated, redirect appropriately
  useEffect(() => {
    if (!authLoading && user) {
      if (!profile || !profile.onboarding_completed) {
        navigate('/onboarding', { replace: true });
      } else {
        navigate(redirectParam, { replace: true });
      }
    }
  }, [user, profile, authLoading, navigate, redirectParam]);

  // Real-time password validation metrics
  const isPasswordLengthValid = password.length >= 6;
  const hasLetters = /[a-zA-Z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const isPasswordValid = isPasswordLengthValid && hasLetters && hasNumbers;

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setErrorMessage('');
    setForgotSuccess(false);
    searchParams.set('mode', newMode);
    setSearchParams(searchParams);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (mode === 'signup') {
      if (!fullName.trim() || !username.trim()) {
        setErrorMessage('Please enter your full name and a username.');
        return;
      }

      const cleanUser = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
      if (cleanUser.length < 3) {
        setErrorMessage('Username must be at least 3 characters and contain only letters, numbers, or underscores.');
        return;
      }

      if (!isPasswordValid) {
        setErrorMessage('Password must be at least 6 characters and contain both letters and numbers.');
        return;
      }

      setLoading(true);
      try {
        const signUpData = await signUp(email, password, { fullName: fullName.trim(), username: cleanUser });
        if (!signUpData?.session) {
          toast.info('Verify Your Email 📬', 'A confirmation link was sent to your inbox. Click it to activate your account, then sign in.');
          setLoading(false);
          return;
        }
        toast.success('Welcome to SkillSwap! 🎉', 'Your account is ready. Let’s set up your profile!');
        navigate('/onboarding', { replace: true });
      } catch (err) {
        setErrorMessage(err.message || 'Registration failed. Please check your details.');
      } finally {
        setLoading(false);
      }
    } else if (mode === 'signin') {
      setLoading(true);
      try {
        const { profile: userProfile } = await signIn(email, password);
        toast.success('Welcome back!', 'Signed in successfully.');
        if (!userProfile || !userProfile.onboarding_completed) {
          navigate('/onboarding', { replace: true });
        } else {
          navigate(redirectParam, { replace: true });
        }
      } catch (err) {
        setErrorMessage(err.message || 'Invalid email or password.');
      } finally {
        setLoading(false);
      }
    } else if (mode === 'forgot') {
      setLoading(true);
      try {
        await resetPassword(email);
        setForgotSuccess(true);
        toast.info('Password Reset Sent', 'Check your email for instructions to reset your password.');
      } catch (err) {
        setErrorMessage(err.message || 'Could not send reset email. Please verify your address.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
  <div className="max-w-md mx-auto px-4 py-12">
    {/* Decorative Branding */}
    <div className="text-center mb-8 space-y-2">
      <Link to="/" className="inline-flex items-center gap-2 mb-2 group">
        <div className="w-10 h-10 rounded-2xl bg-dusty text-white flex items-center justify-center border-2 border-charcoal shadow-pop-sm group-hover:shadow-pop transition">
          <Sparkle className="w-5 h-5 text-butter" size={20} />
        </div>
        <span className="text-2xl font-bold font-serif text-charcoal">SkillSwap</span>
      </Link>
      <p className="text-xs text-charcoal-muted">
        Peer-to-peer knowledge exchange without the currency gate.
      </p>
    </div>

    {/* Auth Card */}
    <div className="bg-white rounded-4xl p-8 border-2 border-charcoal shadow-pop relative">
      <TapeSticker color="bg-butter/85" rotate="-1deg" />

      {/* Mode Switcher */}
      {mode !== 'forgot' ? (
        <div className="flex rounded-2xl bg-ivory p-1.5 border border-charcoal/15 mb-6">
          <button
            type="button"
            onClick={() => handleModeChange('signup')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${mode === 'signup'
              ? 'bg-charcoal text-ivory shadow-sm'
              : 'text-charcoal-muted hover:text-charcoal'
              }`}
          >
            Create Account
          </button>
          <button
            type="button"
            onClick={() => handleModeChange('signin')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${mode === 'signin'
              ? 'bg-charcoal text-ivory shadow-sm'
              : 'text-charcoal-muted hover:text-charcoal'
              }`}
          >
            Sign In
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => handleModeChange('signin')}
          className="flex items-center gap-1.5 text-xs text-charcoal-muted hover:text-charcoal font-bold mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Sign In</span>
        </button>
      )}

      {/* Card Title */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold font-serif text-charcoal">
          {mode === 'signup'
            ? 'Join the Collective'
            : mode === 'signin'
              ? 'Welcome Back'
              : 'Reset Your Password'}
        </h2>
        <p className="text-xs text-charcoal-muted mt-1 leading-relaxed">
          {mode === 'signup'
            ? 'Sign up in seconds to start offering what you teach and learning what you want.'
            : mode === 'signin'
              ? 'Enter your credentials to access your swaps and sessions.'
              : 'Enter your email address and we will send you a secure link to update your password.'}
        </p>
      </div>

      {/* Error Alert Box */}
      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2.5"
        >
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <span className="leading-relaxed">{errorMessage}</span>
        </motion.div>
      )}

      {/* Forgot Password Success Message */}
      {forgotSuccess ? (
        <div className="p-4 rounded-2xl bg-sage-soft border border-sage-dark/40 text-center space-y-3">
          <CheckCircle2 className="w-8 h-8 text-sage-dark mx-auto" />
          <h4 className="text-sm font-bold font-serif text-charcoal">Check your email</h4>
          <p className="text-xs text-charcoal-muted leading-relaxed">
            We sent a password reset link to <strong className="text-charcoal">{email}</strong>. Follow the link to choose a new password.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleModeChange('signin')}
          >
            Return to Sign In
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <>
              <Input
                label="Full Name"
                placeholder="e.g. Maya Lin"
                leftIcon={<User className="w-4 h-4" />}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />

              <Input
                label="Username"
                placeholder="e.g. mayalin"
                leftIcon={<AtSign className="w-4 h-4" />}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                helperText="Unique community handle"
              />
            </>
          )}

          <Input
            label="Email Address"
            type="email"
            placeholder="you@domain.com"
            leftIcon={<Mail className="w-4 h-4" />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {mode !== 'forgot' && (
            <div className="space-y-2">
              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  leftIcon={<Lock className="w-4 h-4" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-charcoal-subtle hover:text-charcoal"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {/* Password Validation Checklist (visible during signup) */}
              {mode === 'signup' && password.length > 0 && (
                <div className="p-3 bg-ivory rounded-2xl border border-charcoal/10 space-y-1.5 text-[11px]">
                  <span className="font-bold uppercase tracking-wider text-charcoal-subtle block text-[10px]">
                    Password strength
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-3 h-3 rounded-full flex items-center justify-center text-[9px] font-bold ${isPasswordLengthValid ? 'bg-sage text-charcoal' : 'bg-charcoal/15 text-charcoal-subtle'}`}>
                      {isPasswordLengthValid ? '✓' : '•'}
                    </span>
                    <span className={isPasswordLengthValid ? 'text-charcoal font-semibold' : 'text-charcoal-subtle'}>
                      At least 6 characters
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-3 h-3 rounded-full flex items-center justify-center text-[9px] font-bold ${hasLetters && hasNumbers ? 'bg-sage text-charcoal' : 'bg-charcoal/15 text-charcoal-subtle'}`}>
                      {hasLetters && hasNumbers ? '✓' : '•'}
                    </span>
                    <span className={hasLetters && hasNumbers ? 'text-charcoal font-semibold' : 'text-charcoal-subtle'}>
                      Contains letters and numbers
                    </span>
                  </div>
                </div>
              )}

              {mode === 'signin' && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleModeChange('forgot')}
                    className="text-xs text-dusty font-bold hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full"
              isLoading={loading}
              rightIcon={<ArrowRight className="w-4 h-4 text-butter" />}
            >
              {mode === 'signup'
                ? 'Create SkillSwap Account'
                : mode === 'signin'
                  ? 'Sign In'
                  : 'Send Reset Instructions'}
            </Button>
          </div>
        </form>
      )}

      {/* Local Account / Instant Guest Mode Card */}
      <div className="mt-6 p-4 rounded-3xl bg-lavender/30 border-2 border-charcoal/15 space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-butter text-charcoal flex items-center justify-center font-bold text-xs border border-charcoal shadow-sm">
            ⚡
          </div>
          <div>
            <h4 className="text-xs font-bold text-charcoal font-serif">Local Account / Guest Mode</h4>
            <p className="text-[11px] text-charcoal-muted">Explore and use SkillSwap instantly without creating an account.</p>
          </div>
        </div>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="w-full bg-white hover:bg-ivory border-2 border-charcoal shadow-pop-sm text-xs font-bold"
          onClick={() => handleGuestSignIn('guest_explorer')}
          isLoading={guestLoading}
          leftIcon={<Sparkles className="w-3.5 h-3.5 text-dusty" />}
        >
          Continue as Instant Guest (Zero Setup)
        </Button>

        <div className="pt-1 border-t border-charcoal/10">
          <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-subtle block mb-1.5 text-center">
            Or test with a community persona
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            {LOCAL_DEMO_PERSONAS.slice(1, 4).map((p) => (
              <button
                key={p.username}
                type="button"
                onClick={() => handleGuestSignIn(p.username)}
                disabled={guestLoading}
                className="p-2 rounded-xl bg-white border border-charcoal/20 hover:border-charcoal hover:bg-butter/25 text-center transition flex flex-col items-center gap-1 group shadow-sm disabled:opacity-50"
              >
                <img src={p.avatarUrl} alt="" className="w-6 h-6 rounded-full object-cover border border-charcoal/30" />
                <span className="text-[10px] font-bold text-charcoal truncate max-w-full">
                  {p.fullName.split(' ')[0]}
                </span>
                <span className="text-[9px] text-charcoal-muted truncate max-w-full">
                  {p.username.split('_')[1] || 'demo'}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="mt-6 pt-4 border-t border-charcoal/10 text-center text-[11px] text-charcoal-muted">
        <span>Protected by Supabase Auth with Row Level Security.</span>
      </div>
    </div>
  </div>
);
}

