import React from 'react';
import { useRouter } from 'next/navigation';
import { ChatConversation } from '../stores/chatStore';
import { useChatStore } from '../stores/chatStore';
import OnlineStatusBadge from './OnlineStatusBadge';
import { ChevronLeft, Pin, Archive, ExternalLink, ShieldCheck } from 'lucide-react';

interface ChatHeaderProps {
  conv: ChatConversation;
  onBack: () => void;
}

export default function ChatHeader({ conv, onBack }: ChatHeaderProps) {
  const router = useRouter();
  const { togglePin, toggleArchive } = useChatStore();

  const isPinned = conv.is_pinned_buyer || conv.is_pinned_seller;
  const isArchived = conv.is_archived_buyer || conv.is_archived_seller;

  const handlePin = async () => {
    await togglePin(conv.id, !isPinned);
  };

  const handleArchive = async () => {
    await toggleArchive(conv.id, !isArchived);
  };

  return (
    <div className="p-4 border-b border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between transition-colors duration-200">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onBack}
          className="md:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl"
          title="Back to inbox"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3
              onClick={() => router.push(`/listing/${conv.listing_id}`)}
              className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-100 hover:underline cursor-pointer truncate flex items-center gap-1"
            >
              <span>{conv.listing_title || 'Listing Details'}</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </h3>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] text-slate-400 dark:text-slate-550 flex items-center gap-1 font-semibold">
              Contact: {conv.other_party_name || 'Inquirer'}
            </span>
            <OnlineStatusBadge isOnline={conv.other_party_online} />
            <span className="text-[9px] text-slate-350 dark:text-slate-600">|</span>
            <span className="text-[9px] bg-slate-50 dark:bg-slate-850 px-1.5 py-0.5 rounded text-slate-500 dark:text-slate-400 font-bold">
              ID #{conv.id}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Toggle Pin button */}
        <button
          onClick={handlePin}
          title={isPinned ? 'Unpin thread' : 'Pin thread'}
          className={`p-2 rounded-xl border transition-all duration-200 ${
            isPinned
              ? 'bg-brand-50 border-brand-200 dark:bg-brand-950/20 dark:border-brand-900/50 text-brand-500'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400'
          }`}
        >
          <Pin className={`w-4 h-4 ${isPinned ? 'fill-brand-500' : ''}`} />
        </button>

        {/* Toggle Archive button */}
        <button
          onClick={handleArchive}
          title={isArchived ? 'Unarchive thread' : 'Archive thread'}
          className={`p-2 rounded-xl border transition-all duration-200 ${
            isArchived
              ? 'bg-slate-100 border-slate-300 dark:bg-slate-800 dark:border-slate-700 text-slate-700 dark:text-slate-300'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400'
          }`}
        >
          <Archive className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
