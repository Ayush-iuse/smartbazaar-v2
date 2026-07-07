'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore, useOfflineStore } from '@/lib/store';
import api from '@/lib/api';
import { useChatStore, ChatConversation } from '@/stores/chatStore';
import LoadingSpinner from '@/components/LoadingSpinner';
import ConversationInbox from '@/components/ConversationInbox';
import ChatHeader from '@/components/ChatHeader';
import MessageThread from '@/components/MessageThread';
import MessageInput from '@/components/MessageInput';
import NegotiationTimeline from '@/components/NegotiationTimeline';
import { MessageSquare, AlertCircle, Sparkles, ShieldAlert, Tag } from 'lucide-react';
import { Card } from '@/components/ui/Card';

function MessagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, token, isAuthenticated, isLoading: isAuthLoading } = useAuthStore();
  const {
    conversations,
    activeConv,
    loadingConvs,
    error,
    fetchConversations,
    selectConversation,
    sendMessage,
    sendMediaMessage,
    setTypingStatus,
    connectWs,
    disconnectWs,
  } = useChatStore();

  const { isOffline } = useOfflineStore();
  const { messages } = useChatStore();

  const [initialLoaded, setInitialLoaded] = useState(false);
  const [aiAssistantData, setAiAssistantData] = useState<any>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const fetchAiAnalysis = async (convId: number) => {
    try {
      setLoadingAi(true);
      const res = await api.post('/api/ai/chat-assistant', { conversation_id: convId });
      setAiAssistantData(res.data);
    } catch (e) {
      console.error(e);
      setAiAssistantData({
        reply_suggestions: [
          "Yes, the item is clean and available!",
          "Are you available for pickup tomorrow?",
          "Can we meet at the metro station?"
        ],
        translation: "",
        scam_detected: false,
        urgency_level: "Medium",
        intent: "Negotiating purchase terms",
        next_action: "Send pickup coordinates",
        is_fallback: true
      });
    } finally {
      setLoadingAi(false);
    }
  };

  useEffect(() => {
    if (activeConv?.id) {
      fetchAiAnalysis(activeConv.id);
    } else {
      setAiAssistantData(null);
    }
  }, [activeConv?.id, messages.length]);

  // Protected route check
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isAuthLoading, router]);

  // Connect WS and fetch threads
  useEffect(() => {
    if (token && isAuthenticated) {
      connectWs(token);
      fetchConversations().then(() => {
        setInitialLoaded(true);
      });
    }

    return () => {
      disconnectWs();
    };
  }, [token, isAuthenticated, connectWs, disconnectWs, fetchConversations]);

  // Deep-link check for conversation ID in search query parameters
  useEffect(() => {
    if (initialLoaded && conversations.length > 0) {
      const convParam = searchParams?.get('conv');
      if (convParam) {
        const targetId = parseInt(convParam);
        const found = conversations.find((c) => c.id === targetId);
        if (found && activeConv?.id !== targetId) {
          selectConversation(found);
        }
      }
    }
  }, [initialLoaded, conversations, searchParams, activeConv, selectConversation]);

  if (isAuthLoading || (!initialLoaded && loadingConvs)) {
    return (
      <div className="py-20 bg-background text-foreground min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const handleSelectConv = (conv: ChatConversation) => {
    selectConversation(conv);
  };

  const handleBackToInbox = () => {
    selectConversation(null);
  };

  const handleSendMessage = (content: string, type?: string) => {
    sendMessage(content, type);
  };

  const handleSendMedia = async (type: 'image' | 'voice' | 'document', file: File) => {
    await sendMediaMessage(type, file);
  };

  const handleTyping = (isTyping: boolean) => {
    setTypingStatus(isTyping);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col gap-6 bg-background text-foreground min-h-screen">
      <div className="border-b border-border pb-4">
        <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-primary" />
          <span>Real-time Marketplace Inbox</span>
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Chat instantly with buyers and sellers. Upload photos or record audio notes directly in the browser.
        </p>
      </div>

      {isOffline && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/25 rounded-xl text-amber-600 dark:text-amber-400 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <span>Realtime messaging unavailable. Running in Offline Mock Mode.</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-destructive" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid Layout */}
      <Card className="grid grid-cols-1 md:grid-cols-3 h-[650px] transition-colors duration-200 overflow-hidden">
        
        {/* Left pane: Threads list */}
        <div
          className={`col-span-1 border-r border-border flex flex-col ${
            activeConv ? 'hidden md:flex' : 'flex'
          }`}
        >
          <ConversationInbox onSelect={handleSelectConv} />
        </div>

        {/* Right pane: Chat details pane */}
        <div
          className={`col-span-1 md:col-span-2 flex flex-col bg-muted/10 ${
            activeConv ? 'flex' : 'hidden md:flex items-center justify-center p-8 text-center'
          }`}
        >
          {activeConv && user ? (
            <div className="flex flex-1 overflow-hidden h-full">
              {/* Message Feed Left Pane */}
              <div className="flex-1 flex flex-col min-w-0 h-full">
                {/* Header */}
                <ChatHeader conv={activeConv} onBack={handleBackToInbox} />

                {/* Feed Thread */}
                <div className="flex-1 overflow-y-auto min-h-0">
                  <MessageThread currentUserId={user.id} />
                </div>

                {/* AI Reply suggestions pills */}
                {aiAssistantData?.reply_suggestions && (
                  <div className="px-4 py-2 bg-muted/20 border-t border-border/30 flex flex-wrap gap-1.5 shrink-0 max-h-24 overflow-y-auto">
                    {aiAssistantData.reply_suggestions.map((sug: string, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(sug)}
                        className="text-[9px] bg-primary/10 border border-primary/20 hover:bg-primary hover:text-primary-foreground text-primary px-2.5 py-1 rounded-full font-black transition-all duration-200"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                )}

                {/* Input Form Controls */}
                <MessageInput
                  onSendMessage={handleSendMessage}
                  onSendMedia={handleSendMedia}
                  onTyping={handleTyping}
                />
              </div>

              {/* AI Assistant Right Pane */}
              <div className="w-68 hidden lg:flex flex-col bg-slate-50 dark:bg-slate-900 border-l border-border/30 p-4 overflow-y-auto space-y-4 shrink-0 h-full">
                
                {/* AI insights header */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black text-primary uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                    <span>AI Deal Insights</span>
                  </h4>
                  <div className="glass p-3 rounded-2xl border border-border/30 space-y-2.5 text-[10px] font-bold">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Urgency Level:</span>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                        aiAssistantData?.urgency_level === 'High' 
                          ? 'bg-rose-500/10 text-rose-500' 
                          : 'bg-muted-foreground/10 text-muted-foreground'
                      }`}>
                        {aiAssistantData?.urgency_level || 'Low'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Buyer Intent:</span>
                      <span className="text-foreground font-black truncate max-w-[120px]">{aiAssistantData?.intent || 'General Inquiry'}</span>
                    </div>
                    {aiAssistantData?.scam_detected && (
                      <div className="p-2 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-lg flex items-start gap-1 font-bold text-[8px]">
                        <ShieldAlert className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>Security scan: Suspicious phrases flagged.</span>
                      </div>
                    )}
                    <div className="border-t border-border/20 pt-2">
                      <span className="text-muted-foreground uppercase tracking-wider text-[8px] font-black">Next Suggested Step</span>
                      <p className="text-foreground font-black mt-1 text-[9px] leading-relaxed">{aiAssistantData?.next_action || 'Review offer and schedule meeting.'}</p>
                    </div>
                  </div>
                </div>

                {/* Deal closing chance */}
                <div className="glass p-3 rounded-2xl border border-border/30 space-y-2 text-[10px]">
                  <span className="block text-muted-foreground text-[8px] font-black uppercase tracking-wider">Deal Closing Probability</span>
                  <div className="flex items-baseline gap-1 mt-1 font-bold">
                    <span className="text-xl font-black text-foreground font-mono">82%</span>
                    <span className="text-emerald-500 text-[9px] font-bold">+4% Trust</span>
                  </div>
                  <div className="w-full bg-muted/40 h-1 rounded-full overflow-hidden mt-1">
                    <div className="bg-emerald-500 h-full w-[82%]" />
                  </div>
                </div>

                {/* Interactive Offer Center */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black text-foreground uppercase tracking-wider flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-primary" />
                    <span>Offer Negotiation</span>
                  </h4>
                  <div className="glass p-3 rounded-2xl border border-border/30 space-y-3">
                    <div className="space-y-1.5 font-bold">
                      <div className="flex justify-between text-[9px] text-muted-foreground">
                        <span>Original Price</span>
                        <span>₹12,500</span>
                      </div>
                      <div className="flex justify-between text-[9px] text-foreground">
                        <span>Current Offer</span>
                        <span className="text-primary font-black">₹11,000</span>
                      </div>
                    </div>

                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleSendMessage("I accept your price offer of ₹11,000.", "offer")}
                        className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-1.5 px-2 rounded-xl text-[9px] uppercase tracking-wider shadow-sm transition-colors"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleSendMessage("I reject your offer of ₹11,000.", "offer")}
                        className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-bold py-1.5 px-2 rounded-xl text-[9px] uppercase tracking-wider shadow-sm transition-colors"
                      >
                        Reject
                      </button>
                    </div>

                    <button
                      onClick={() => handleSendMessage("Can we negotiate for ₹11,800?", "offer")}
                      className="w-full border border-border hover:bg-muted text-foreground font-black py-1.5 px-2 rounded-xl text-[9px] uppercase tracking-wider transition-colors"
                    >
                      Counter Offer ₹11,800
                    </button>
                  </div>
                </div>

                {/* Offer negotiation timeline history log */}
                <NegotiationTimeline originalPrice={12500} />

              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3">
              <MessageSquare className="w-12 h-12 text-muted-foreground/60" />
              <h3 className="text-xs font-bold text-muted-foreground">No chat selected</h3>
              <p className="text-[10px] text-muted-foreground max-w-xs">
                Select an inquiry thread from the inbox to view chat history and negotiate with users.
              </p>
            </div>
          )}
        </div>

      </Card>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 bg-background min-h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      }
    >
      <MessagesContent />
    </Suspense>
  );
}
