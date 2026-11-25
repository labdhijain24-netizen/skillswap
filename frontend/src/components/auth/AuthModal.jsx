import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, AtSign, AlertCircle, CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { Input } from '../ui/Input';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { isSupabaseConfigured } from '../../services/supabaseClient';

export default function AuthModal({ isOpen, onClose, initialMode = 'signup' }) {
  const [mode, setMode] = useState(initialMode); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [guestLoading, setGuestLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const { signUp, signIn, signInAsGuest } = useAuth();

  const handleGuestSignIn = async () => {
    setGuestLoading(true);
    setErrorMsg('');
    try {
      await signInAsGuest('guest_explorer');
      toast.success('Welcome! 🚀', 'Exploring SkillSwap in Local Account mode.');
      onClose();
      navigate('/dashboard');
    } catch (err) {
      setErrorMsg(err.message || 'Could not start guest session.');
    } finally {
      setGuestLoading(false);
    }
  };

  const isConfigured = isSupabaseConfigured();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('Please enter both your email and password.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    if (mode === 'signup') {
      if (!fullName.trim() || !username.trim()) {
        setErrorMsg('Please enter your full name and a username.');
        return;
      }

      const cleanUser = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
      if (cleanUser.length < 3) {
        setErrorMsg('Username must be at least 3 characters and contain only letters, numbers, or underscores.');
        return;
      }
    }

    if (!isConfigured) {
      setErrorMsg('Supabase is not configured yet. Please add your credentials to frontend/.env.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'signup') {
        const data = await signUp(email, password, {
          fullName: fullName.trim(),
          username: username.trim(),
        });

        if (!data?.session) {
          toast.info(
            'Verify Your Email',
            'A confirmation link was sent to your inbox. Click it, then sign in.'
          );
          onClose();
          return;
        }

        toast.success('Account Created! 🎉', 'Welcome to SkillSwap — let’s set up your profile!');
        onClose();
        navigate('/onboarding');
      } else {
        const { profile: userProfile } = await signIn(email, password);
        toast.success('Welcome Back!', `Signed in as ${email}`);
        onClose();
        if (!userProfile || !userProfile.onboarding_completed) {
          navigate('/onboarding');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'signup' ? 'Join the SkillSwap Collective' : 'Welcome Back to SkillSwap'}
      subtitle={
        mode === 'signup'
          ? 'Create your free account to trade skills, list your talents, and learn from creators.'
          : 'Sign in to manage your active swap requests, messages, and scheduled sessions.'
      }
      withTape={true}
      tapeColor="bg-butter/85"
    >
      {/* Mode Switcher Tabs */}
      <div className="flex rounded-2xl bg-ivory p-1.5 border border-charcoal/15 mb-4">
        <button
          type="button"
          onClick={() => {
            setMode('signup');
            setErrorMsg('');
          }}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
            mode === 'signup'
              ? 'bg-charcoal text-ivory shadow-sm'
              : 'text-charcoal-muted hover:text-charcoal'
          }`}
        >
          Create Account
        </button>
        <button
          type="button"
          onClick={() => {
            setMode('signin');
            setErrorMsg('');
          }}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
            mode === 'signin'
              ? 'bg-charcoal text-ivory shadow-sm'
              : 'text-charcoal-muted hover:text-charcoal'
          }`}
        >
          Sign In
        </button>
      </div>

      {!isConfigured && (
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-amber-950">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span>Supabase Setup Required</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            Authentication uses Supabase Auth. To enable live user logins, add your real Supabase credentials to <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">frontend/.env</code>.
          </p>
        </div>
      )}

      {errorMsg && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2"
        >
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
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
            />
          </>
        )}

        <Input
          label="Email Address"
          type="email"
          placeholder="your.email@domain.com"
          leftIcon={<Mail className="w-4 h-4" />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Input
          label="Password"
          type="password"
          placeholder="At least 6 characters"
          leftIcon={<Lock className="w-4 h-4" />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <div className="pt-3 space-y-2">
          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full"
            isLoading={loading}
            rightIcon={<Sparkles className="w-4 h-4 text-butter" />}
          >
            {mode === 'signup' ? 'Create SkillSwap Account' : 'Sign In to SkillSwap'}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full bg-white hover:bg-ivory border-dashed text-xs"
            onClick={handleGuestSignIn}
            isLoading={guestLoading}
            leftIcon={<span className="text-butter font-bold">⚡</span>}
          >
            Continue with Instant Local Account (Skip Sign-up)
          </Button>
        </div>

        <p className="text-[11px] text-center text-charcoal-muted pt-2">
          By joining, you agree to exchange skills respectfully and adhere to our community pledge.
        </p>
      </form>
    </Modal>
  );
}
