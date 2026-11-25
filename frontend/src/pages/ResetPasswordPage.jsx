import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import Button from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { TapeSticker, Sparkle } from '../components/ui/Doodles';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const { updatePassword } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const isLengthValid = newPassword.length >= 6;
  const isMatch = newPassword === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!isLengthValid) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    if (!isMatch) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await updatePassword(newPassword);
      setIsSuccess(true);
      toast.success('Password Updated! 🔒', 'Your new password is now active.');
    } catch (err) {
      setErrorMessage(err.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white rounded-4xl p-8 border-2 border-charcoal shadow-pop relative">
        <TapeSticker color="bg-butter/85" rotate="-1deg" />

        <div className="mb-6">
          <h2 className="text-2xl font-bold font-serif text-charcoal">
            Choose a New Password
          </h2>
          <p className="text-xs text-charcoal-muted mt-1 leading-relaxed">
            Enter your new secure password below to regain access to your account.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {isSuccess ? (
          <div className="p-4 rounded-2xl bg-sage-soft border border-sage-dark/40 text-center space-y-3">
            <CheckCircle2 className="w-8 h-8 text-sage-dark mx-auto" />
            <h4 className="text-sm font-bold font-serif text-charcoal">Password Reset Complete</h4>
            <p className="text-xs text-charcoal-muted">
              You can now sign in using your new credentials.
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/auth?mode=signin')}
            >
              Sign In to SkillSwap
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="New Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="At least 6 characters"
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
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />

            <Input
              label="Confirm New Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Re-enter your new password"
              leftIcon={<Lock className="w-4 h-4" />}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full"
                isLoading={loading}
                rightIcon={<ArrowRight className="w-4 h-4 text-butter" />}
              >
                Update Password
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
