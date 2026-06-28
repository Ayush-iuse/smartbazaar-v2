import React, { useRef, useEffect } from 'react';
import { useChatStore, ChatMessage } from '../stores/chatStore';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import { MessageSquare } from 'lucide-react';

interface MessageThreadProps {
  currentUserId: number;
}

export default function MessageThread({ currentUserId }: MessageThreadProps) {
  const { messages, activeConv, typingUsers, reactToMessage } = useChatStore();
  const threadEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeConv]);

  if (!activeConv) return null;

  // Determine if other party is typing
  const otherUserId = activeConv.buyer_id === currentUserId ? activeConv.seller_id : activeConv.buyer_id;
  const typingKey = `${activeConv.id}:${otherUserId}`;
  const isOtherTyping = typingUsers[typingKey] || false;

  // Group messages by date
  const groupMessagesByDate = (msgList: ChatMessage[]) => {
    const groups: Record<string, ChatMessage[]> = {};
    msgList.forEach((m) => {
      const dateStr = new Date(m.created_at).toDateString();
      if (!groups[dateStr]) groups[dateStr] = [];
      groups[dateStr].push(m);
    });
    return groups;
  };

  const grouped = groupMessagesByDate(messages);

  const formatDateHeader = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) return 'Today';
    
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    
    return d.toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };

  const handleReact = async (messageId: number, emoji: string) => {
    await reactToMessage(messageId, emoji);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50/20 dark:bg-slate-950/10">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-500 gap-2">
          <MessageSquare className="w-10 h-10 text-slate-350 dark:text-slate-705" />
          <p className="text-xs font-bold">No message history</p>
          <p className="text-[10px] text-slate-400 dark:text-slate-600 max-w-xs text-center">
            Send a message below to start your conversation regarding "{activeConv.listing_title}".
          </p>
        </div>
      ) : (
        Object.entries(grouped).map(([dateStr, msgs]) => (
          <div key={dateStr} className="space-y-4">
            {/* Date Header */}
            <div className="flex justify-center my-4">
              <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-450 dark:text-slate-500 font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm border border-slate-150/40 dark:border-slate-800/40">
                {formatDateHeader(dateStr)}
              </span>
            </div>

            {/* Messages in Group */}
            {msgs.map((m) => (
              <MessageBubble
                key={m.id}
                msg={m}
                isSelf={m.sender_id === currentUserId}
                onReact={handleReact}
              />
            ))}
          </div>
        ))
      )}

      {/* Typing indicator */}
      {isOtherTyping && (
        <div className="flex justify-start pl-1 animate-pulse">
          <TypingIndicator />
        </div>
      )}

      <div ref={threadEndRef} />
    </div>
  );
}
