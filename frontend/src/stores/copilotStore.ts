import { create } from 'zustand';
import api, { formatError } from '../lib/api';

export interface CopilotMessage {
  id: number;
  session_id: number;
  sender: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface CopilotSession {
  id: number;
  user_id: number;
  title: string | null;
  created_at: string;
}

export interface CopilotAction {
  id: number;
  session_id: number;
  action_type: 'search' | 'compare' | 'fraud_analysis' | 'price_advisor' | 'negotiate';
  action_data: string | null; // JSON details
  created_at: string;
}

interface CopilotState {
  sessions: CopilotSession[];
  activeSessionId: number | null;
  messages: CopilotMessage[];
  actions: CopilotAction[];
  suggestions: string[];
  memory: Record<string, string>;
  loading: boolean;
  sending: boolean;
  error: string | null;

  fetchSessions: () => Promise<void>;
  selectSession: (sessionId: number | null) => Promise<void>;
  fetchActions: (sessionId: number) => Promise<void>;
  sendMessage: (query: string) => Promise<void>;
  fetchSuggestions: () => Promise<void>;
  fetchMemory: () => Promise<void>;
  deleteSession: (sessionId: number) => Promise<void>;
  clearMemory: () => Promise<void>;
  resetStore: () => void;
}

export const useCopilotStore = create<CopilotState>((set, get) => ({
  sessions: [],
  activeSessionId: null,
  messages: [],
  actions: [],
  suggestions: [],
  memory: {},
  loading: false,
  sending: false,
  error: null,

  fetchSessions: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get('/api/copilot/sessions');
      set({ sessions: res.data || [] });
    } catch (err: any) {
      console.error('Failed to fetch copilot sessions:', err);
      set({ error: 'Failed to load chat history sessions.' });
    } finally {
      set({ loading: false });
    }
  },

  selectSession: async (sessionId: number | null) => {
    if (sessionId === null) {
      set({ activeSessionId: null, messages: [], actions: [] });
      return;
    }
    set({ activeSessionId: sessionId, loading: true, error: null });
    try {
      const messagesRes = await api.get(`/api/copilot/history?session_id=${sessionId}`);
      set({ messages: messagesRes.data || [] });
      
      // Fetch actions triggered in this session
      await get().fetchActions(sessionId);
    } catch (err: any) {
      console.error('Failed to select copilot session:', err);
      set({ error: 'Failed to load session details.' });
    } finally {
      set({ loading: false });
    }
  },

  fetchActions: async (sessionId: number) => {
    try {
      const res = await api.get(`/api/copilot/session/${sessionId}/actions`);
      set({ actions: res.data || [] });
    } catch (err) {
      console.error('Failed to fetch session actions:', err);
    }
  },

  sendMessage: async (query: string) => {
    if (!query.trim()) return;
    const { activeSessionId, messages } = get();
    
    // Optimistically add user query to the layout stream
    const tempUserMsg: CopilotMessage = {
      id: Date.now(), // temporary ID
      session_id: activeSessionId || 0,
      sender: 'user',
      content: query,
      created_at: new Date().toISOString()
    };
    
    set({ messages: [...messages, tempUserMsg], sending: true, error: null });
    
    // Check if offline/standalone mode is active
    try {
      const { useOfflineStore } = require('../lib/store');
      if (useOfflineStore.getState().isOffline) {
        throw new Error('Offline mode shortcut');
      }
    } catch (e: any) {
      if (e.message === 'Offline mode shortcut') {
        setTimeout(() => {
          set({ 
            error: 'AI service currently unavailable.',
            sending: false,
            messages: get().messages.filter(m => m.id !== tempUserMsg.id)
          });
        }, 600);
        return;
      }
    }
    
    try {
      const res = await api.post('/api/copilot/chat', {
        session_id: activeSessionId,
        query: query
      });
      
      const assistantMsg = res.data;
      const returnedSessionId = assistantMsg.session_id;

      // If we didn't have an active session before, configure the newly generated session
      if (!activeSessionId) {
        set({ activeSessionId: returnedSessionId });
        await get().fetchSessions();
      }

      // Fetch active message logs to get true IDs and synchronization
      const historyRes = await api.get(`/api/copilot/history?session_id=${returnedSessionId}`);
      set({ messages: historyRes.data || [] });
      
      // Refresh actions list
      await get().fetchActions(returnedSessionId);
      
      // Update memory profile since memory updates might have occurred
      await get().fetchMemory();
    } catch (err: any) {
      console.error('Failed to send message to copilot:', err);
      
      const isNetwork = !err.response || err.code === 'ERR_NETWORK' || err.message === 'Network Error' || err.code === 'ECONNABORTED';
      if (isNetwork) {
        set({ error: 'AI service currently unavailable.' });
      } else {
        set({ error: formatError(err) });
      }
      
      // Remove the optimistic message if send failed
      set({ messages: get().messages.filter(m => m.id !== tempUserMsg.id) });
    } finally {
      set({ sending: false });
    }
  },

  fetchSuggestions: async () => {
    try {
      const res = await api.get('/api/copilot/suggestions');
      set({ suggestions: res.data.suggestions || [] });
    } catch (err) {
      console.error('Failed to load copilot suggestions:', err);
      // Hardcoded fallback list in case endpoint fails
      set({
        suggestions: [
          "Find football shoes under ₹3000",
          "Show trusted sellers near me",
          "Find gaming laptops below ₹50,000",
          "Show safest listings",
          "Explain if listing #1 is overpriced",
          "Check if listing #2 is safe to buy"
        ]
      });
    }
  },

  fetchMemory: async () => {
    try {
      const res = await api.get('/api/copilot/memory');
      set({ memory: res.data || {} });
    } catch (err) {
      console.error('Failed to load copilot memory:', err);
    }
  },

  deleteSession: async (sessionId: number) => {
    try {
      await api.delete(`/api/copilot/session/${sessionId}`);
      set(state => {
        const nextSessions = state.sessions.filter(s => s.id !== sessionId);
        const isActive = state.activeSessionId === sessionId;
        return {
          sessions: nextSessions,
          activeSessionId: isActive ? null : state.activeSessionId,
          messages: isActive ? [] : state.messages,
          actions: isActive ? [] : state.actions
        };
      });
    } catch (err) {
      console.error('Failed to delete session:', err);
      alert('Error deleting copilot session.');
    }
  },

  clearMemory: async () => {
    try {
      await api.delete('/api/copilot/memory');
      set({ memory: {} });
    } catch (err) {
      console.error('Failed to clear copilot memory:', err);
      alert('Error clearing profile preferences.');
    }
  },

  resetStore: () => {
    set({
      sessions: [],
      activeSessionId: null,
      messages: [],
      actions: [],
      suggestions: [],
      memory: {},
      loading: false,
      sending: false,
      error: null
    });
  }
}));
