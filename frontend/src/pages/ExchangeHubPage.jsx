import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  ArrowRightLeft, 
  Calendar, 
  MessageSquare, 
  Plus, 
  Sparkles, 
  CheckCircle, 
  Clock, 
  RefreshCw, 
  Inbox, 
  Send 
} from 'lucide-react';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { Sparkle } from '../components/ui/Doodles';
import SwapRequestCard from '../components/exchanges/SwapRequestCard';
import SessionCard from '../components/exchanges/SessionCard';
import ScheduleSessionModal from '../components/exchanges/ScheduleSessionModal';
import RescheduleSessionModal from '../components/exchanges/RescheduleSessionModal';
import LeaveReviewModal from '../components/exchanges/LeaveReviewModal';
import ChatBox from '../components/chat/ChatBox';

import { 
  getUserSwapRequests, 
  acceptSwapRequest, 
  rejectSwapRequest, 
  cancelSwapRequest 
} from '../services/swapClient';
import { 
  getUserSessions, 
  createSession, 
  updateSession, 
  completeSession, 
  cancelSession 
} from '../services/sessionClient';
import { createReview } from '../services/reviewClient';
import { getUserConversations } from '../services/chatClient';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function ExchangeHubPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'requests';
  const initialConvId = searchParams.get('convId') || null;

  const [activeTab, setActiveTab] = useState(initialTab);
  const [requestSubTab, setRequestSubTab] = useState('incoming'); // incoming | outgoing
  const [sessionSubTab, setSessionSubTab] = useState('upcoming'); // upcoming | completed

  // Data states
  const [requests, setRequests] = useState({ incoming: [], outgoing: [] });
  const [sessions, setSessions] = useState({ upcoming: [], completed: [], cancelled: [] });
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);

  // Modals
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [selectedSwapForSession, setSelectedSwapForSession] = useState(null);
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [sessionToReschedule, setSessionToReschedule] = useState(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [sessionToReview, setSessionToReview] = useState(null);

  // Loading & Processing
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  // Keep query params in sync with tab changes
  const switchTab = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const loadAllData = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const [reqData, sessData, convData] = await Promise.all([
        getUserSwapRequests(user.id),
        getUserSessions(user.id),
        getUserConversations(user.id),
      ]);

      setRequests(reqData || { incoming: [], outgoing: [] });
      setSessions(sessData || { upcoming: [], completed: [], cancelled: [] });
      setConversations(convData || []);

      // If initial convId was passed, find and select it
      if (initialConvId && convData) {
        const found = convData.find((c) => c.id === initialConvId);
        if (found) setSelectedConversation(found);
      } else if (!selectedConversation && convData && convData.length > 0) {
        setSelectedConversation(convData[0]);
      }
    } catch (err) {
      console.error('Failed to load exchange hub data:', err);
      toast.warning('Network Notice', 'Could not refresh some exchange details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [user?.id]);

  // Handle Swap Actions
  const handleAcceptRequest = async (swapId) => {
    try {
      setProcessingId(swapId);
      await acceptSwapRequest(swapId, user.id);
      toast.success(
        'Swap Proposal Accepted! 🤝',
        'Match record activated and a session can now be scheduled.'
      );
      await loadAllData();
    } catch (err) {
      toast.warning('Could Not Accept', err.message || 'Action failed.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectRequest = async (swapId, reason) => {
    try {
      setProcessingId(swapId);
      await rejectSwapRequest(swapId, user.id, reason);
      toast.info('Proposal Declined', 'The requester has been notified.');
      await loadAllData();
    } catch (err) {
      toast.warning('Could Not Decline', err.message || 'Action failed.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleCancelRequest = async (swapId) => {
    try {
      setProcessingId(swapId);
      await cancelSwapRequest(swapId, user.id);
      toast.info('Proposal Cancelled', 'Your pending request has been withdrawn.');
      await loadAllData();
    } catch (err) {
      toast.warning('Could Not Cancel', err.message || 'Action failed.');
    } finally {
      setProcessingId(null);
    }
  };

  // Open Chat from anywhere
  const handleOpenChatFromPartner = (partnerId, convId) => {
    if (convId) {
      const match = conversations.find((c) => c.id === convId);
      if (match) {
        setSelectedConversation(match);
        switchTab('messages');
        return;
      }
    }
    // Fallback search by other_member id
    const matchByMember = conversations.find((c) => c.other_member?.id === partnerId);
    if (matchByMember) {
      setSelectedConversation(matchByMember);
    }
    switchTab('messages');
  };

  // Handle Session Actions
  const handleOpenScheduleModal = (swapRequest = null) => {
    setSelectedSwapForSession(swapRequest);
    setScheduleModalOpen(true);
  };

  const handleScheduleSubmit = async (sessionPayload) => {
    await createSession(sessionPayload);
    await loadAllData();
  };

  const handleOpenRescheduleModal = (session) => {
    setSessionToReschedule(session);
    setRescheduleModalOpen(true);
  };

  const handleRescheduleSubmit = async (sessionId, updates) => {
    await updateSession(sessionId, updates);
    await loadAllData();
  };

  const handleCompleteSession = async (sessionId) => {
    try {
      setProcessingId(sessionId);
      await completeSession(sessionId, user.id);
      toast.celebrate(
        'Session Completed! 🎉',
        'Congratulations on exchanging knowledge! Your profile exchange stats have been updated.'
      );
      await loadAllData();
    } catch (err) {
      toast.warning('Completion Failed', err.message || 'Could not update session.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleCancelSession = async (sessionId) => {
    if (!window.confirm('Are you sure you want to cancel this scheduled session?')) return;
    try {
      setProcessingId(sessionId);
      await cancelSession(sessionId, user.id, 'User cancelled');
      toast.info('Session Cancelled', 'Both swappers have been updated.');
      await loadAllData();
    } catch (err) {
      toast.warning('Cancellation Failed', err.message || 'Could not cancel session.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReviewSubmit = async ({ sessionId, reviewerId, rating, comment }) => {
    await createReview({ sessionId, reviewerId, rating, comment });
    await loadAllData();
  };

  // Badges & Counters
  const pendingIncomingCount = (requests.incoming || []).filter(
    (r) => r.status === 'pending'
  ).length;
  const upcomingSessionsCount = (sessions.upcoming || []).length;
  const unreadMessagesCount = conversations.reduce(
    (acc, c) => acc + (c.unread_count || 0),
    0
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Page Header */}
      <div className="relative mb-8 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-butter/60 border border-charcoal/20 text-xs font-bold text-charcoal mb-2 shadow-sm">
            <Sparkle className="w-3.5 h-3.5 text-dusty" />
            <span>Exchange Hub & Workspace</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-black text-charcoal tracking-tight">
            Skill Exchange Lifecycle
          </h1>
          <p className="text-sm text-charcoal-muted mt-1 max-w-xl">
            Manage your incoming swap requests, coordinate live sessions with peers, and message your learning partners.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={loadAllData}
            disabled={loading}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleOpenScheduleModal()}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Schedule Session
          </Button>
        </div>
      </div>

      {/* Main Tab Bar Navigation */}
      <div className="flex items-center gap-2 border-b-2 border-charcoal/10 pb-3 mb-8 overflow-x-auto">
        <button
          onClick={() => switchTab('requests')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'requests'
              ? 'bg-charcoal text-ivory shadow-pop-sm scale-102'
              : 'bg-white text-charcoal hover:bg-lavender/30 border border-charcoal/15'
          }`}
        >
          <ArrowRightLeft className="w-4 h-4 text-butter" />
          <span>Swap Requests</span>
          {pendingIncomingCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-coral text-white text-[10px] font-black flex items-center justify-center">
              {pendingIncomingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => switchTab('sessions')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'sessions'
              ? 'bg-charcoal text-ivory shadow-pop-sm scale-102'
              : 'bg-white text-charcoal hover:bg-sage/30 border border-charcoal/15'
          }`}
        >
          <Calendar className="w-4 h-4 text-sage" />
          <span>Learning Sessions</span>
          {upcomingSessionsCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-sage-dark text-white text-[10px] font-black flex items-center justify-center">
              {upcomingSessionsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => switchTab('messages')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'messages'
              ? 'bg-charcoal text-ivory shadow-pop-sm scale-102'
              : 'bg-white text-charcoal hover:bg-dusty/20 border border-charcoal/15'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-lavender" />
          <span>Messaging & Chat</span>
          {unreadMessagesCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-dusty text-white text-[10px] font-black flex items-center justify-center">
              {unreadMessagesCount}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: SWAP REQUESTS */}
      {activeTab === 'requests' && (
        <div className="space-y-6">
          {/* Sub-tabs: Incoming vs Outgoing */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="inline-flex p-1 bg-white rounded-2xl border-2 border-charcoal/15 shadow-sm">
              <button
                onClick={() => setRequestSubTab('incoming')}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
                  requestSubTab === 'incoming'
                    ? 'bg-dusty text-white shadow-sm'
                    : 'text-charcoal hover:text-dusty'
                }`}
              >
                Incoming Proposals ({requests.incoming?.length || 0})
              </button>
              <button
                onClick={() => setRequestSubTab('outgoing')}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
                  requestSubTab === 'outgoing'
                    ? 'bg-dusty text-white shadow-sm'
                    : 'text-charcoal hover:text-dusty'
                }`}
              >
                Outgoing Proposals ({requests.outgoing?.length || 0})
              </button>
            </div>

            <span className="text-xs text-charcoal-muted">
              {requestSubTab === 'incoming'
                ? 'Requests other swappers sent to you'
                : 'Proposals you submitted to other community members'}
            </span>
          </div>

          {/* List of Cards */}
          {loading ? (
            <div className="py-16 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-dusty border-t-transparent mx-auto mb-3"></div>
              <p className="text-xs text-charcoal-muted">Loading swap requests...</p>
            </div>
          ) : requestSubTab === 'incoming' ? (
            requests.incoming?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {requests.incoming.map((req) => (
                  <SwapRequestCard
                    key={req.id}
                    request={req}
                    currentUserId={user?.id}
                    onAccept={handleAcceptRequest}
                    onReject={handleRejectRequest}
                    onOpenChat={handleOpenChatFromPartner}
                    onScheduleSession={handleOpenScheduleModal}
                    isProcessing={processingId === req.id}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-4xl p-12 border-2 border-charcoal/15 text-center max-w-lg mx-auto shadow-sm">
                <Inbox className="w-12 h-12 text-dusty mx-auto mb-3 opacity-60" />
                <h3 className="font-serif font-bold text-lg text-charcoal">
                  No Incoming Swap Proposals
                </h3>
                <p className="text-xs text-charcoal-muted mt-1 leading-relaxed">
                  When other community members discover your skills on the Explore page, their proposals will appear here.
                </p>
                <div className="mt-5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/profile')}
                  >
                    Edit Offered Skills
                  </Button>
                </div>
              </div>
            )
          ) : requests.outgoing?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {requests.outgoing.map((req) => (
                <SwapRequestCard
                  key={req.id}
                  request={req}
                  currentUserId={user?.id}
                  onCancel={handleCancelRequest}
                  onOpenChat={handleOpenChatFromPartner}
                  onScheduleSession={handleOpenScheduleModal}
                  isProcessing={processingId === req.id}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-4xl p-12 border-2 border-charcoal/15 text-center max-w-lg mx-auto shadow-sm">
              <Send className="w-12 h-12 text-dusty mx-auto mb-3 opacity-60" />
              <h3 className="font-serif font-bold text-lg text-charcoal">
                No Outgoing Proposals Yet
              </h3>
              <p className="text-xs text-charcoal-muted mt-1 leading-relaxed">
                Explore the skills directory or view AI matches to propose your first skill trade!
              </p>
              <div className="mt-5">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/explore')}
                >
                  Browse Explore Catalog
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SESSIONS */}
      {activeTab === 'sessions' && (
        <div className="space-y-6">
          {/* Sub-tabs: Upcoming vs Completed */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="inline-flex p-1 bg-white rounded-2xl border-2 border-charcoal/15 shadow-sm">
              <button
                onClick={() => setSessionSubTab('upcoming')}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
                  sessionSubTab === 'upcoming'
                    ? 'bg-sage-dark text-white shadow-sm'
                    : 'text-charcoal hover:text-sage-dark'
                }`}
              >
                Upcoming Sessions ({sessions.upcoming?.length || 0})
              </button>
              <button
                onClick={() => setSessionSubTab('completed')}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
                  sessionSubTab === 'completed'
                    ? 'bg-sage-dark text-white shadow-sm'
                    : 'text-charcoal hover:text-sage-dark'
                }`}
              >
                Completed Past Sessions ({sessions.completed?.length || 0})
              </button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleOpenScheduleModal()}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Add New Session
            </Button>
          </div>

          {/* List of Sessions */}
          {loading ? (
            <div className="py-16 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-sage-dark border-t-transparent mx-auto mb-3"></div>
              <p className="text-xs text-charcoal-muted">Loading learning sessions...</p>
            </div>
          ) : sessionSubTab === 'upcoming' ? (
            sessions.upcoming?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sessions.upcoming.map((sess) => (
                  <SessionCard
                    key={sess.id}
                    session={sess}
                    currentUserId={user?.id}
                    onComplete={handleCompleteSession}
                    onReschedule={handleOpenRescheduleModal}
                    onCancel={handleCancelSession}
                    onOpenChat={(pid) => handleOpenChatFromPartner(pid)}
                    isProcessing={processingId === sess.id}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-4xl p-12 border-2 border-charcoal/15 text-center max-w-lg mx-auto shadow-sm">
                <Calendar className="w-12 h-12 text-sage-dark mx-auto mb-3 opacity-60" />
                <h3 className="font-serif font-bold text-lg text-charcoal">
                  No Upcoming Sessions Scheduled
                </h3>
                <p className="text-xs text-charcoal-muted mt-1 leading-relaxed">
                  Once a swap proposal is accepted, schedule a date and time to share your screen and learn together.
                </p>
                <div className="mt-5">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleOpenScheduleModal()}
                  >
                    Schedule Session Now
                  </Button>
                </div>
              </div>
            )
          ) : sessions.completed?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sessions.completed.map((sess) => (
                <SessionCard
                  key={sess.id}
                  session={sess}
                  currentUserId={user?.id}
                  onOpenChat={(pid) => handleOpenChatFromPartner(pid)}
                  onLeaveReview={(s) => {
                    setSessionToReview(s);
                    setReviewModalOpen(true);
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-4xl p-12 border-2 border-charcoal/15 text-center max-w-lg mx-auto shadow-sm">
              <CheckCircle className="w-12 h-12 text-sage-dark mx-auto mb-3 opacity-60" />
              <h3 className="font-serif font-bold text-lg text-charcoal">
                No Completed Sessions Yet
              </h3>
              <p className="text-xs text-charcoal-muted mt-1 leading-relaxed">
                As you conclude video sessions with peers, they will be archived here for record keeping and reviews.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MESSAGING & REALTIME CHAT */}
      {activeTab === 'messages' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Panel: Conversation List (4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-3xl border-2 border-charcoal/20 p-4 shadow-pop-sm h-[650px] flex flex-col">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-charcoal/10">
              <h3 className="font-serif font-bold text-base text-charcoal">
                Conversations
              </h3>
              <span className="text-xs font-bold text-dusty bg-lavender/40 px-2 py-0.5 rounded-full">
                {conversations.length} active
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {conversations.length === 0 ? (
                <div className="py-12 text-center text-xs text-charcoal-muted">
                  <MessageSquare className="w-8 h-8 text-dusty mx-auto mb-2 opacity-50" />
                  <p>No active conversations yet.</p>
                  <p className="text-[11px] mt-1">Accept a swap to initiate chat!</p>
                </div>
              ) : (
                conversations.map((conv) => {
                  const isSelected = selectedConversation?.id === conv.id;
                  const partner = conv.other_member;
                  return (
                    <button
                      key={conv.id}
                      onClick={() => setSelectedConversation(conv)}
                      className={`w-full text-left p-3 rounded-2xl border transition-all flex items-start gap-3 ${
                        isSelected
                          ? 'bg-butter-soft border-charcoal shadow-sm'
                          : 'bg-ivory/50 border-charcoal/10 hover:bg-white hover:border-charcoal/20'
                      }`}
                    >
                      <img
                        src={
                          partner?.avatar_url ||
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
                        }
                        alt={partner?.full_name || 'User'}
                        className="w-10 h-10 rounded-xl object-cover border border-charcoal/20 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <span className="font-bold text-xs text-charcoal truncate">
                            {partner?.full_name || partner?.username || 'Exchange Swapper'}
                          </span>
                          {conv.unread_count > 0 && (
                            <span className="w-4 h-4 rounded-full bg-coral text-white text-[9px] font-black flex items-center justify-center flex-shrink-0">
                              {conv.unread_count}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-charcoal-muted truncate">
                          {conv.last_message?.content || conv.title || 'Start chatting...'}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Panel: Chat Box (8 cols) */}
          <div className="lg:col-span-8">
            <ChatBox
              conversationId={selectedConversation?.id}
              partner={selectedConversation?.other_member}
              currentUserId={user?.id}
              onScheduleSession={() => handleOpenScheduleModal(selectedConversation?.swap_request)}
            />
          </div>
        </div>
      )}

      {/* Schedule Session Modal */}
      <ScheduleSessionModal
        isOpen={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        onSubmit={handleScheduleSubmit}
        initialSwap={selectedSwapForSession}
        currentUserId={user?.id}
      />

      {/* Reschedule Session Modal */}
      <RescheduleSessionModal
        isOpen={rescheduleModalOpen}
        onClose={() => setRescheduleModalOpen(false)}
        onSubmit={handleRescheduleSubmit}
        session={sessionToReschedule}
        currentUserId={user?.id}
      />

      {/* Leave Review Modal */}
      <LeaveReviewModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        onSubmit={handleReviewSubmit}
        session={sessionToReview}
        currentUserId={user?.id}
      />
    </div>
  );
}
