import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  MessageSquare, 
  Calendar, 
  Clock, 
  CheckCheck, 
  User, 
  Sparkles, 
  ExternalLink 
} from 'lucide-react';
import Button from '../ui/Button';
import { supabase } from '../../services/supabaseClient';
import { getConversationMessages, sendMessage, markConversationAsRead } from '../../services/chatClient';
import { useToast } from '../../context/ToastContext';

export default function ChatBox({
  conversationId,
  partner,
  currentUserId,
  onScheduleSession,
}) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);
  const toast = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch initial message history
  useEffect(() => {
    if (!conversationId) return;

    let isMounted = true;
    setLoading(true);

    getConversationMessages(conversationId, currentUserId)
      .then((data) => {
        if (isMounted) {
          setMessages(data || []);
          setTimeout(scrollToBottom, 50);
        }
      })
      .catch((err) => {
        console.error('Failed to load chat messages:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    // Mark conversation as read
    markConversationAsRead(conversationId, currentUserId).catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [conversationId, currentUserId]);

  // Subscribe to Realtime messages via Supabase Client
  useEffect(() => {
    if (!conversationId) return;

    const channelId = `chat:${conversationId}:${Math.random().toString(36).slice(2, 7)}`;
    const channel = supabase.channel(channelId);

    try {
      channel
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${conversationId}`,
          },
          (payload) => {
            const newMsg = payload.new;
            // Avoid duplicate if sent locally
            setMessages((prev) => {
              if (prev.some((m) => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            });
            scrollToBottom();

            // Mark as read if received from partner
            if (newMsg.sender_id !== currentUserId) {
              markConversationAsRead(conversationId, currentUserId).catch(() => {});
            }
          }
        )
        .subscribe();
    } catch (err) {
      console.warn('Realtime chat channel setup note:', err);
    }

    return () => {
      try {
        supabase.removeChannel(channel);
      } catch (e) {}
    };
  }, [conversationId, currentUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e?.preventDefault();
    const content = inputText.trim();
    if (!content || sending) return;

    try {
      setSending(true);
      setInputText('');

      const sentMsg = await sendMessage({
        conversationId,
        senderId: currentUserId,
        content,
      });

      // Optimistically add message
      setMessages((prev) => {
        if (prev.some((m) => m.id === sentMsg.id)) return prev;
        return [...prev, sentMsg];
      });
      scrollToBottom();
    } catch (err) {
      toast.warning('Message Not Sent', err.message || 'Could not deliver message.');
      setInputText(content); // restore on error
    } finally {
      setSending(false);
    }
  };

  const formatMessageTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  if (!conversationId) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-ivory/50 rounded-3xl border-2 border-dashed border-charcoal/20 min-h-[400px]">
        <div className="w-14 h-14 rounded-2xl bg-lavender/40 border-2 border-charcoal flex items-center justify-center mb-3 shadow-pop-sm">
          <MessageSquare className="w-7 h-7 text-dusty" />
        </div>
        <h4 className="font-serif font-bold text-base text-charcoal">
          Select a Conversation
        </h4>
        <p className="text-xs text-charcoal-muted max-w-xs mt-1">
          Pick a swapper from the list on the left to review messages, exchange advice, or coordinate session dates.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[650px] bg-white rounded-3xl border-2 border-charcoal/20 shadow-pop overflow-hidden">
      {/* Chat Header */}
      <div className="px-5 py-3.5 bg-ivory border-b-2 border-charcoal/10 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <img
            src={
              partner?.avatar_url ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120'
            }
            alt={partner?.full_name || 'Partner'}
            className="w-10 h-10 rounded-2xl object-cover border-2 border-charcoal shadow-sm"
          />
          <div>
            <h4 className="font-serif font-bold text-sm text-charcoal leading-tight">
              {partner?.full_name || partner?.username || 'Exchange Partner'}
            </h4>
            <span className="text-[11px] text-charcoal-muted">
              @{partner?.username || 'swapper'}
            </span>
          </div>
        </div>

        {onScheduleSession && (
          <Button
            variant="outline"
            size="sm"
            onClick={onScheduleSession}
            leftIcon={<Calendar className="w-3.5 h-3.5 text-dusty" />}
          >
            Schedule Session
          </Button>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-5 overflow-y-auto space-y-3 bg-[#FAF8F5]">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-dusty border-t-transparent"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
            <Sparkles className="w-8 h-8 text-dusty animate-pulse" />
            <p className="font-serif font-bold text-sm text-charcoal">
              Start the Conversation!
            </p>
            <p className="text-xs text-charcoal-muted max-w-xs">
              Say hello, share what you'd love to learn, and pick a time to meet.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === currentUserId;
            return (
              <div
                key={msg.id}
                className={`flex items-end gap-2 ${
                  isMe ? 'justify-end' : 'justify-start'
                }`}
              >
                {!isMe && (
                  <img
                    src={
                      partner?.avatar_url ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80'
                    }
                    alt=""
                    className="w-7 h-7 rounded-xl object-cover border border-charcoal/20 flex-shrink-0 mb-1"
                  />
                )}

                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-xs shadow-sm ${
                    isMe
                      ? 'bg-lavender text-charcoal border border-charcoal/20 rounded-br-none'
                      : 'bg-white text-charcoal border border-charcoal/15 rounded-bl-none'
                  }`}
                >
                  <p className="leading-relaxed whitespace-pre-wrap break-words">
                    {msg.content}
                  </p>
                  <div
                    className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
                      isMe ? 'text-charcoal/70' : 'text-charcoal-muted'
                    }`}
                  >
                    <span>{formatMessageTime(msg.created_at)}</span>
                    {isMe && (
                      <CheckCheck
                        className={`w-3 h-3 ${
                          msg.is_read ? 'text-sage-dark' : 'text-charcoal/40'
                        }`}
                      />
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Message Area */}
      <form
        onSubmit={handleSend}
        className="p-3 bg-white border-t-2 border-charcoal/10 flex items-center gap-2"
      >
        <input
          type="text"
          placeholder="Type your message..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="flex-1 px-4 py-2.5 text-xs rounded-2xl border-2 border-charcoal/20 focus:outline-none focus:border-charcoal bg-ivory/50"
        />
        <Button
          type="submit"
          variant="primary"
          size="sm"
          disabled={!inputText.trim() || sending}
          leftIcon={<Send className="w-3.5 h-3.5" />}
        >
          Send
        </Button>
      </form>
    </div>
  );
}
