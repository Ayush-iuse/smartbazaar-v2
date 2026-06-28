import React from 'react';
import { ChatConversation } from '../stores/chatStore';
import OnlineStatusBadge from './OnlineStatusBadge';
import { Pin, Archive, MessageSquare } from 'lucide-react';

interface ConversationItemProps {
  conv: ChatConversation;
  isActive: boolean;
  onClick: () => void;
  onPinToggle: (e: React.MouseEvent) => void;
  onArchiveToggle: (e: React.MouseEvent) => void;
}

export default function ConversationItem({
  conv,
  isActive,
  onClick,
  onPinToggle,
  onArchiveToggle,
}: ConversationItemProps) {
  const formatTime = (timeStr?: string) => {
    if (!timeStr) return '';
    const date = new Date(timeStr);
    const now = new Date();
    
    // If today, return 2-digit hour:minute
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    }
    
    // If yesterday, return "Yesterday"
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    // Otherwise, return MMM DD (e.g., Jun 23)
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  };

  const isPinned = conv.is_pinned_buyer || conv.is_pinned_seller;
  const isArchived = conv.is_archived_buyer || conv.is_archived_seller;

  return (
    <div
      onClick={onClick}
      className={`p-4 cursor-pointer transition-all duration-200 border-l-4 relative group ${
        isActive
          ? 'bg-brand-50/60 dark:bg-brand-950/20 border-brand-500'
          : 'hover:bg-slate-50 dark:hover:bg-slate-800/20 border-transparent'
      }`}
    >
      <div className="flex justify-between items-start gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-xs font-black text-slate-800 dark:text-slate-200 truncate max-w-[150px]">
              {conv.other_party_name || 'Inquirer'}
            </span>
            <OnlineStatusBadge isOnline={conv.other_party_online} />
          </div>
          <h4 className="text-[11px] font-bold text-slate-500 dark:text-slate-400 truncate max-w-[190px]">
            {conv.listing_title || 'Listing Details'}
          </h4>
        </div>
        <div className="flex flex-col items-end shrink-0 gap-1">
          <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold">
            {formatTime(conv.last_message_time || conv.updated_at)}
          </span>
          <div className="flex items-center gap-1">
            {isPinned && <Pin className="w-3 h-3 text-brand-500 fill-brand-500" />}
            {isArchived && <Archive className="w-3 h-3 text-slate-400" />}
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center gap-2 mt-2">
        <p className="text-[11px] text-slate-450 dark:text-slate-500 truncate flex-1 pr-4">
          {conv.last_message ? (
            `"${conv.last_message}"`
          ) : (
            <span className="italic text-slate-400">No messages yet</span>
          )}
        </p>

        <div className="flex items-center gap-1.5 shrink-0">
          {conv.unread_count > 0 && (
            <span className="bg-brand-500 text-white text-[9px] font-extrabold h-4.5 min-w-4.5 px-1.5 rounded-full flex items-center justify-center animate-pulse">
              {conv.unread_count}
            </span>
          )}
          
          {/* Quick pin/archive actions displayed on hover */}
          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1.5 transition-opacity duration-150 bg-slate-50 dark:bg-slate-800/80 px-1.5 py-0.5 rounded-md shadow-sm">
            <button
              onClick={onPinToggle}
              title={isPinned ? "Unpin Chat" : "Pin Chat"}
              className="p-0.5 hover:text-brand-500 text-slate-400 rounded transition-colors"
            >
              <Pin className={`w-3.5 h-3.5 ${isPinned ? 'fill-brand-500 text-brand-500' : ''}`} />
            </button>
            <button
              onClick={onArchiveToggle}
              title={isArchived ? "Unarchive Chat" : "Archive Chat"}
              className="p-0.5 hover:text-brand-500 text-slate-400 rounded transition-colors"
            >
              <Archive className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
