import React, { useState, useRef, useEffect } from 'react';
import { Send, Image, Mic, Square, Trash2 } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  onSendMedia: (type: 'image' | 'voice', file: File) => Promise<void>;
  onTyping: (isTyping: boolean) => void;
  disabled?: boolean;
}

export default function MessageInput({
  onSendMessage,
  onSendMedia,
  onTyping,
  disabled = false,
}: MessageInputProps) {
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const typingTimeoutRef = useRef<any>(null);
  const isTypingRef = useRef(false);

  // File picker reference
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle typing status triggers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      onTyping(true);
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      onTyping(false);
    }, 2500);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || disabled) return;

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    isTypingRef.current = false;
    onTyping(false);

    onSendMessage(text.trim());
    setText('');
  };

  // Image Upload handler
  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds the 5MB limit.');
      return;
    }

    // Validate mime type
    if (!file.type.startsWith('image/')) {
      alert('Only image attachments are allowed here.');
      return;
    }

    await onSendMedia('image', file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Voice Recording handlers
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      
      const options = { mimeType: 'audio/webm' };
      let recorder: MediaRecorder;
      try {
        recorder = new MediaRecorder(stream, options);
      } catch (err) {
        recorder = new MediaRecorder(stream);
      }
      
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        // Stop all tracks to release mic
        stream.getTracks().forEach((track) => track.stop());

        if (audioChunksRef.current.length > 0) {
          const audioBlob = new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
          const fileExt = recorder.mimeType.includes('mp4') ? 'mp4' : recorder.mimeType.includes('wav') ? 'wav' : 'webm';
          const audioFile = new File([audioBlob], `voice-note.${fileExt}`, {
            type: audioBlob.type,
          });
          await onSendMedia('voice', audioFile);
        }
      };

      recorder.start();
      setIsRecording(true);
      setRecordTime(0);
      timerRef.current = setInterval(() => {
        setRecordTime((t) => t + 1);
      }, 1000);
    } catch (err) {
      console.error('Failed to get mic stream:', err);
      alert('Microphone access denied or not supported.');
    }
  };

  const stopRecording = (shouldSend = true) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      if (!shouldSend) {
        // clear chunks before stopping so recorder onstop sends nothing
        audioChunksRef.current = [];
      }
      mediaRecorderRef.current.stop();
    }
    
    setIsRecording(false);
  };

  // Clean timeouts on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  const formatSeconds = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="p-4 border-t border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors duration-200">
      {isRecording ? (
        <div className="flex items-center justify-between gap-3 bg-rose-50/50 dark:bg-rose-950/20 p-2.5 rounded-xl border border-rose-100 dark:border-rose-900/40 animate-pulse">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping"></span>
            <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
              Recording Voice Note ({formatSeconds(recordTime)})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => stopRecording(false)}
              className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-rose-500 hover:bg-rose-100/50 dark:hover:bg-rose-900/30 rounded-lg transition-colors"
              title="Cancel Recording"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => stopRecording(true)}
              className="px-3.5 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Square className="w-3.5 h-3.5" />
              <span>Stop & Send</span>
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSend} className="flex items-center gap-2">
          {/* Media upload buttons */}
          <button
            type="button"
            onClick={handleImageClick}
            disabled={disabled}
            className="p-2.5 bg-slate-50 hover:bg-slate-105 dark:bg-slate-950 dark:hover:bg-slate-800 text-slate-450 hover:text-slate-655 dark:text-slate-400 rounded-xl border border-slate-200 dark:border-slate-800/80 transition-colors"
            title="Attach Photo"
          >
            <Image className="w-4 h-4" />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/jpeg,image/png"
            className="hidden"
          />

          <button
            type="button"
            onClick={startRecording}
            disabled={disabled}
            className="p-2.5 bg-slate-50 hover:bg-slate-105 dark:bg-slate-950 dark:hover:bg-slate-800 text-slate-450 hover:text-slate-655 dark:text-slate-400 rounded-xl border border-slate-200 dark:border-slate-800/80 transition-colors"
            title="Record Voice Note"
          >
            <Mic className="w-4 h-4" />
          </button>

          {/* Text Input */}
          <input
            type="text"
            required
            disabled={disabled}
            placeholder="Type your message here..."
            value={text}
            onChange={handleInputChange}
            className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-white dark:bg-slate-950 focus:outline-none focus:border-brand-500 text-slate-700 dark:text-slate-200 transition-all duration-200"
          />

          {/* Submit */}
          <button
            type="submit"
            disabled={disabled || !text.trim()}
            className="px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      )}
    </div>
  );
}
