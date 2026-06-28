'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { useChatStore, ChatConversation } from '@/stores/chatStore';
import LoadingSpinner from '@/components/LoadingSpinner';
import ConversationInbox from '@/components/ConversationInbox';
import ChatHeader from '@/components/ChatHeader';
import MessageThread from '@/components/MessageThread';
import MessageInput from '@/components/MessageInput';
import { MessageSquare, AlertCircle } from 'lucide-react';
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

  const [initialLoaded, setInitialLoaded] = useState(false);

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

  const handleSendMessage = (content: string) => {
    sendMessage(content);
  };

  const handleSendMedia = async (type: 'image' | 'voice', file: File) => {
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
            <>
              {/* Header */}
              <ChatHeader conv={activeConv} onBack={handleBackToInbox} />

              {/* Feed Thread */}
              <MessageThread currentUserId={user.id} />

              {/* Input Form Controls */}
              <MessageInput
                onSendMessage={handleSendMessage}
                onSendMedia={handleSendMedia}
                onTyping={handleTyping}
              />
            </>
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
