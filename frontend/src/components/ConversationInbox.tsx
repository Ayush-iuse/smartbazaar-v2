import React, { useState } from 'react';
import { useChatStore, ChatConversation } from '../stores/chatStore';
import ConversationItem from './ConversationItem';
import { Search, Inbox, Archive } from 'lucide-react';

interface ConversationInboxProps {
  onSelect: (conv: ChatConversation) => void;
}

export default function ConversationInbox({ onSelect }: ConversationInboxProps) {
  const { conversations, activeConv, togglePin, toggleArchive } = useChatStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTab, setCurrentTab] = useState<'active' | 'archived'>('active');

  const filteredConversations = conversations.filter((c) => {
    // Determine tab filtering
    const isArchived = c.is_archived_buyer || c.is_archived_seller;
    if (currentTab === 'active' && isArchived) return false;
    if (currentTab === 'archived' && !isArchived) return false;

    // Search query matching
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.other_party_name?.toLowerCase().includes(q) ||
      c.listing_title?.toLowerCase().includes(q) ||
      c.last_message?.toLowerCase().includes(q)
    );
  });

  const handlePin = async (e: React.MouseEvent, conv: ChatConversation) => {
    e.stopPropagation();
    const isPinned = conv.is_pinned_buyer || conv.is_pinned_seller;
    await togglePin(conv.id, !isPinned);
  };

  const handleArchive = async (e: React.MouseEvent, conv: ChatConversation) => {
    e.stopPropagation();
    const isArchived = conv.is_archived_buyer || conv.is_archived_seller;
    await toggleArchive(conv.id, !isArchived);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900">
      {/* Tabs */}
      <div className="flex border-b border-slate-100 dark:border-slate-800">
        <button
          onClick={() => setCurrentTab('active')}
          className={`flex-1 py-3 text-xs font-bold transition-all duration-200 border-b-2 flex items-center justify-center gap-1.5 ${
            currentTab === 'active'
              ? 'border-brand-500 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400'
          }`}
        >
          <Inbox className="w-3.5 h-3.5" />
          <span>Active</span>
        </button>
        <button
          onClick={() => setCurrentTab('archived')}
          className={`flex-1 py-3 text-xs font-bold transition-all duration-200 border-b-2 flex items-center justify-center gap-1.5 ${
            currentTab === 'archived'
              ? 'border-brand-500 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400'
          }`}
        >
          <Archive className="w-3.5 h-3.5" />
          <span>Archived</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="p-3 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/30 dark:bg-slate-900/40">
        <div className="relative">
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8.5 pr-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-white dark:bg-slate-950 focus:outline-none focus:border-brand-500 text-slate-700 dark:text-slate-200"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Inbox Thread List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-850">
        {filteredConversations.length === 0 ? (
          <div className="text-center py-16 px-4">
            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              No conversations found
            </p>
            <p className="text-[10px] text-slate-400 dark:text-slate-600 mt-1">
              {searchQuery ? 'Try clearing or modifying search query.' : 'You have no threads in this section.'}
            </p>
          </div>
        ) : (
          filteredConversations.map((conv) => (
            <ConversationItem
              key={conv.id}
              conv={conv}
              isActive={activeConv?.id === conv.id}
              onClick={() => onSelect(conv)}
              onPinToggle={(e) => handlePin(e, conv)}
              onArchiveToggle={(e) => handleArchive(e, conv)}
            />
          ))
        )}
      </div>
    </div>
  );
}
