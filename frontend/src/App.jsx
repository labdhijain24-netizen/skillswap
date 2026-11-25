import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import LandingPage from './pages/LandingPage';
import ExploreSkillsPage from './pages/ExploreSkillsPage';
import HowItWorksPage from './pages/HowItWorksPage';
import AuthPage from './pages/AuthPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import OnboardingPage from './pages/OnboardingPage';
import ProfilePage from './pages/ProfilePage';
import ExchangeHubPage from './pages/ExchangeHubPage';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { ToastContainer } from './components/ui/Toast';
import Modal from './components/ui/Modal';
import Button from './components/ui/Button';
import { Input, Textarea } from './components/ui/Input';
import AuthModal from './components/auth/AuthModal';
import { Sparkle } from './components/ui/Doodles';
import { createSwapRequest } from './services/swapClient';
import { fireSkillSwapConfetti } from './utils/confettiHelper';
import ErrorBoundary from './components/common/ErrorBoundary';

// Scroll to top helper on route navigation
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function MainAppRoutes() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('signup');

  const [swapModalOpen, setSwapModalOpen] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [offeredSkillInput, setOfferedSkillInput] = useState('');
  const [proposalMessage, setProposalMessage] = useState('');
  const [sendingSwap, setSendingSwap] = useState(false);

  const toast = useToast();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const handleOpenAuth = (mode = 'signup') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleOpenSwapModal = (skill) => {
    if (!isAuthenticated) {
      toast.info('Sign In Required', 'Please join or sign in to propose a skill exchange.');
      handleOpenAuth('signin');
      return;
    }

    setSelectedSkill(skill);
    setOfferedSkillInput(skill?.wantsInReturn?.[0] || '');
    setProposalMessage('');
    setSwapModalOpen(true);
  };

  const handleSendSwapProposal = async (e) => {
    if (e) e.preventDefault();
    if (!offeredSkillInput.trim()) {
      toast.warning('Skill Required', 'Please specify what skill you can offer in return.');
      return;
    }

    const receiverId =
      selectedSkill?.teacher?.id ||
      selectedSkill?.teacherId ||
      selectedSkill?.userId ||
      selectedSkill?.user_id;
    const requestedSkill =
      selectedSkill?.title || selectedSkill?.name || 'Skill';

    if (!receiverId) {
      toast.warning(
        'User Unavailable',
        'Could not determine the recipient profile for this proposal.'
      );
      return;
    }

    if (receiverId === user?.id) {
      toast.warning(
        'Self Swap Not Allowed',
        'You cannot propose a skill swap to yourself.'
      );
      return;
    }

    try {
      setSendingSwap(true);
      await createSwapRequest({
        senderId: user.id,
        receiverId,
        offeredSkill: offeredSkillInput.trim(),
        requestedSkill,
        message: proposalMessage.trim(),
      });

      setSwapModalOpen(false);
      fireSkillSwapConfetti();
      toast.swap(
        'Proposal Sent! 🚀',
        `Your swap request for "${requestedSkill}" has been submitted.`
      );
      navigate('/exchanges?tab=requests');
    } catch (err) {
      toast.warning('Proposal Failed', err.message || 'Could not send swap proposal.');
    } finally {
      setSendingSwap(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-ivory font-sans selection:bg-lavender selection:text-charcoal paper-pattern">
      <ScrollToTop />

      {/* Navigation */}
      <Navbar onOpenAuthModal={handleOpenAuth} />

      {/* Routed Pages */}
      <main className="flex-1">
        <Routes>
          <Route
            path="/"
            element={
              <LandingPage
                onOpenAuthModal={handleOpenAuth}
                onOpenSwapModal={handleOpenSwapModal}
              />
            }
          />
          <Route
            path="/explore"
            element={
              <ExploreSkillsPage
                onOpenAuthModal={handleOpenAuth}
                onOpenSwapModal={handleOpenSwapModal}
              />
            }
          />
          <Route
            path="/how-it-works"
            element={<HowItWorksPage onOpenAuthModal={handleOpenAuth} />}
          />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requireOnboarding={true}>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <OnboardingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute requireOnboarding={true}>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/exchanges"
            element={
              <ProtectedRoute requireOnboarding={true}>
                <ExchangeHubPage />
              </ProtectedRoute>
            }
          />

          {/* Public profile route — no login required */}
          <Route
            path="/profile/:username"
            element={<ProfilePage />}
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Footer */}
      <Footer />

      {/* Global Toast Container */}
      <ToastContainer />

      {/* Quick Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
      />

      {/* Swap Request Proposal Modal */}
      <Modal
        isOpen={swapModalOpen}
        onClose={() => setSwapModalOpen(false)}
        title={selectedSkill ? `Propose Swap: ${selectedSkill.title}` : 'Propose a Skill Swap'}
        subtitle="Propose a reciprocal skill exchange. You teach what you know, they teach what you need."
        withTape={true}
        tapeColor="bg-butter/85"
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSwapModalOpen(false)}
              disabled={sendingSwap}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSendSwapProposal}
              disabled={sendingSwap}
            >
              {sendingSwap ? 'Sending Proposal...' : 'Send Swap Proposal'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSendSwapProposal} className="space-y-4 text-xs text-charcoal">
          <Input
            label="What skill do you offer to teach in return?"
            placeholder="e.g. Conversational Italian, UI/UX in Figma, Python..."
            value={offeredSkillInput}
            onChange={(e) => setOfferedSkillInput(e.target.value)}
            required
            helperText="Offer something from your skills catalog or personal experience"
          />

          <Textarea
            label="Introductory Proposal Message"
            rows={3}
            placeholder="Hi! I'd love to swap sessions with you. Here is what I can teach and my general weekly availability..."
            value={proposalMessage}
            onChange={(e) => setProposalMessage(e.target.value)}
            required
          />

          <div className="bg-lavender-soft rounded-2xl p-3.5 border-1.5 border-charcoal/15 flex items-start gap-2.5">
            <Sparkle className="w-4 h-4 text-dusty flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-charcoal-muted leading-relaxed">
              SkillSwap operates on pure community goodwill. Neither party pays any fees. You both mutually agree on the session time and video link.
            </p>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AuthProvider>
          <ToastProvider>
            <MainAppRoutes />
          </ToastProvider>
        </AuthProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
