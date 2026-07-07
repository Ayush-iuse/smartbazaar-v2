import React, { useState } from 'react';
import { ChatMessage } from '../stores/chatStore';
import { Check, CheckCheck, Smile, MapPin, FileText, Calendar, User, Phone, CheckCircle2, ShieldAlert, Tag, Package, Download } from 'lucide-react';

interface MessageBubbleProps {
  msg: ChatMessage;
  isSelf: boolean;
  onReact: (messageId: number, emoji: string) => void;
}

export default function MessageBubble({ msg, isSelf, onReact }: MessageBubbleProps) {
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const validEmojis = ["👍", "❤️", "🔥", "😂", "👀"];

  const getMediaUrl = (url?: string | null) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    return `${cleanBase}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  // Parse reactions if stored as JSON string or array of strings
  let parsedReactions: string[] = [];
  try {
    if (typeof (msg as any).reactions === 'string') {
      parsedReactions = JSON.parse((msg as any).reactions || '[]');
    } else if (Array.isArray((msg as any).reactions)) {
      parsedReactions = (msg as any).reactions;
    }
  } catch (err) {
    console.error('Failed to parse reactions:', err);
  }

  // Count occurrences of each emoji
  const emojiCounts = parsedReactions.reduce<Record<string, number>>((acc, emoji) => {
    acc[emoji] = (acc[emoji] || 0) + 1;
    return acc;
  }, {});

  const renderStatus = () => {
    if (!isSelf) return null;
    if (msg.is_read) {
      return <CheckCheck className="w-3.5 h-3.5 text-blue-400 dark:text-blue-400" />;
    }
    if (msg.is_delivered) {
      return <CheckCheck className="w-3.5 h-3.5 text-slate-300 dark:text-slate-500" />;
    }
    return <Check className="w-3.5 h-3.5 text-slate-300 dark:text-slate-500" />;
  };

  const formatTime = (timeStr: string) => {
    const d = new Date(timeStr);
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      className={`flex flex-col max-w-[70%] relative group ${
        isSelf ? 'ml-auto items-end' : 'mr-auto items-start'
      }`}
    >
      <div className="flex items-center gap-1">
        {/* Quick Reaction trigger on hover (for non-self, or both) */}
        {!isSelf && (
          <button
            onClick={() => setShowReactionPicker(!showReactionPicker)}
            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-full transition-all duration-150 order-2"
          >
            <Smile className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Message Bubble Body */}
        <div
          className={`p-3 rounded-2xl text-xs leading-relaxed relative ${
            isSelf
              ? 'bg-brand-500 text-white rounded-tr-none shadow-sm shadow-brand-100/10 order-1'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 rounded-tl-none shadow-sm order-2'
          }`}
        >
          {msg.message_type === 'text' && (
            <p className="whitespace-pre-wrap break-words">{msg.content}</p>
          )}

          {msg.message_type === 'image' && msg.media_url && (
            <div className="rounded-lg overflow-hidden border border-slate-100 dark:border-slate-800 max-w-xs cursor-pointer">
              {/* Note: Absolute paths from backend upload mount /uploads */}
              <img
                src={getMediaUrl(msg.media_url)}
                alt="Attachment image"
                className="max-h-48 object-cover w-full hover:scale-[1.02] transition-transform duration-200"
                onClick={() => window.open(getMediaUrl(msg.media_url), '_blank')}
              />
            </div>
          )}

          {msg.message_type === 'voice' && msg.media_url && (
            <div className="flex items-center gap-2 p-1 max-w-xs">
              <audio
                controls
                src={getMediaUrl(msg.media_url)}
                className="w-48 h-8 rounded text-slate-800"
              />
            </div>
          )}

          {msg.message_type === 'location' && (
            <div className="space-y-2 p-1 min-w-[180px]">
              <div className="flex items-center gap-1.5 font-bold text-foreground">
                <MapPin className="w-4 h-4 text-primary" />
                <span>Location Shared</span>
              </div>
              <p className="text-[10px] text-muted-foreground leading-normal">{msg.content}</p>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(msg.content || '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-[10px] text-primary hover:underline font-bold mt-1"
              >
                View on Google Maps
              </a>
            </div>
          )}

          {msg.message_type === 'document' && (
            <div className="flex items-center justify-between gap-3 p-1 min-w-[200px]">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 text-primary rounded-lg">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold truncate max-w-[120px]">{msg.content || 'Document attachment'}</p>
                  <p className="text-[9px] text-muted-foreground">PDF / Document File</p>
                </div>
              </div>
              <a
                href={getMediaUrl(msg.media_url)}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors shrink-0"
              >
                <Download className="w-4 h-4" />
              </a>
            </div>
          )}

          {msg.message_type === 'offer' && (
            <div className="space-y-3 p-1.5 border border-primary/20 bg-primary/5 rounded-xl min-w-[180px]">
              <div className="flex items-center gap-1.5 font-bold text-foreground">
                <Tag className="w-4 h-4 text-primary" />
                <span>Interactive Price Offer</span>
              </div>
              <div className="flex items-baseline gap-1 font-mono">
                <span className="text-lg font-black">₹{Number(msg.content || 0).toLocaleString('en-IN')}</span>
                <span className="text-[9px] text-muted-foreground">INR</span>
              </div>
              <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                <span>Status: Pending review</span>
              </div>
            </div>
          )}

          {msg.message_type === 'delivery' && (
            <div className="space-y-2 p-1 min-w-[180px]">
              <div className="flex items-center gap-1.5 font-bold text-foreground">
                <Package className="w-4 h-4 text-primary" />
                <span>Logistics Details</span>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed whitespace-pre-wrap">{msg.content}</p>
            </div>
          )}

          {msg.message_type === 'contact' && (
            <div className="space-y-2.5 p-1 min-w-[180px]">
              <div className="flex items-center gap-1.5 font-bold text-foreground">
                <User className="w-4 h-4 text-primary" />
                <span>Contact Card</span>
              </div>
              <div className="space-y-1 text-[10px] text-muted-foreground">
                <p className="font-bold text-foreground">Name: {msg.content?.split(',')[0] || 'Unknown'}</p>
                <p className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {msg.content?.split(',')[1] || ''}</p>
              </div>
            </div>
          )}

          {msg.message_type === 'system' && (
            <p className="italic text-slate-400 dark:text-slate-500 text-[11px] text-center w-full">
              {msg.content}
            </p>
          )}
        </div>

        {isSelf && (
          <button
            onClick={() => setShowReactionPicker(!showReactionPicker)}
            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-full transition-all duration-150 order-1"
          >
            <Smile className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Floating Reaction Picker popover */}
      {showReactionPicker && (
        <div
          className={`absolute z-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full py-1 px-2 flex gap-1 shadow-md -top-9 ${
            isSelf ? 'right-0' : 'left-0'
          }`}
        >
          {validEmojis.map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                onReact(msg.id, emoji);
                setShowReactionPicker(false);
              }}
              className="text-xs hover:scale-125 transition-transform duration-100 p-0.5"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Appended reactions indicators list */}
      {Object.keys(emojiCounts).length > 0 && (
        <div className={`flex gap-1 mt-1 ${isSelf ? 'justify-end' : 'justify-start'}`}>
          {Object.entries(emojiCounts).map(([emoji, count]) => (
            <span
              key={emoji}
              onClick={() => onReact(msg.id, emoji)}
              className="bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 dark:hover:bg-slate-800 text-[10px] py-0.5 px-2 rounded-full cursor-pointer transition-colors flex items-center gap-1 border border-slate-150 dark:border-slate-800/80 text-slate-600 dark:text-slate-300 font-bold"
            >
              <span>{emoji}</span>
              {count > 1 && <span>{count}</span>}
            </span>
          ))}
        </div>
      )}

      {/* Metadata (timestamp & status) */}
      <div className="flex items-center gap-1 mt-1 px-1">
        <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold">
          {formatTime(msg.created_at)}
        </span>
        {renderStatus()}
      </div>
    </div>
  );
}
