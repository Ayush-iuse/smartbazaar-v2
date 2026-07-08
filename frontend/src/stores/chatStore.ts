import { create } from 'zustand';
import api, { formatError } from '../lib/api';
import { useAuthStore, useOfflineStore } from '../lib/store';

const sortConversations = (convs: ChatConversation[]) => {
  const currentUser = useAuthStore.getState().user;
  return [...convs].sort((a, b) => {
    const isAPinned = currentUser ? (currentUser.id === a.buyer_id ? a.is_pinned_buyer : a.is_pinned_seller) : (a.is_pinned_buyer || a.is_pinned_seller);
    const isBPinned = currentUser ? (currentUser.id === b.buyer_id ? b.is_pinned_buyer : b.is_pinned_seller) : (b.is_pinned_buyer || b.is_pinned_seller);
    if (isAPinned !== isBPinned) return isAPinned ? -1 : 1;
    const timeA = new Date(a.last_message_time || a.updated_at).getTime();
    const timeB = new Date(b.last_message_time || b.updated_at).getTime();
    return timeB - timeA;
  });
};

export interface ChatMessage {
  id: number;
  conversation_id: number;
  sender_id: number;
  content?: string;
  message_type: string;
  media_url?: string;
  is_delivered: boolean;
  is_read: boolean;
  created_at: string;
}

export interface ChatConversation {
  id: number;
  listing_id: number;
  buyer_id: number;
  seller_id: number;
  is_archived_buyer: boolean;
  is_archived_seller: boolean;
  is_pinned_buyer: boolean;
  is_pinned_seller: boolean;
  created_at: string;
  updated_at: string;
  other_party_name?: string;
  listing_title?: string;
  last_message?: string;
  last_message_time?: string;
  unread_count: number;
  other_party_online: boolean;
}

interface ChatState {
  ws: WebSocket | null;
  isConnected: boolean;
  conversations: ChatConversation[];
  activeConv: ChatConversation | null;
  messages: ChatMessage[];
  onlineUsers: Record<number, boolean>;
  typingUsers: Record<string, boolean>; // key is "convId:userId"
  error: string | null;
  loadingConvs: boolean;
  loadingMessages: boolean;

  // Actions
  fetchConversations: (archived?: boolean, pinned?: boolean) => Promise<void>;
  selectConversation: (conv: ChatConversation | null) => Promise<void>;
  sendMessage: (content: string, messageType?: string) => void;
  sendMediaMessage: (type: 'image' | 'voice' | 'document', file: File) => Promise<void>;
  reactToMessage: (messageId: number, emoji: string) => Promise<void>;
  setTypingStatus: (isTyping: boolean) => void;
  togglePin: (conversationId: number, pin: boolean) => Promise<void>;
  toggleArchive: (conversationId: number, archive: boolean) => Promise<void>;
  connectWs: (token: string) => void;
  disconnectWs: () => void;
}

const getWsUrl = (token: string) => {
  const wsUrlEnv = process.env.NEXT_PUBLIC_WS_URL;
  if (wsUrlEnv) {
    const cleanWsUrl = wsUrlEnv.endsWith('/') ? wsUrlEnv.slice(0, -1) : wsUrlEnv;
    if (cleanWsUrl.includes('/ws')) {
      return `${cleanWsUrl}${cleanWsUrl.includes('?') ? '&' : '?'}token=${token}`;
    }
    return `${cleanWsUrl}/api/v2/chat/ws?token=${token}`;
  }

  if (typeof window !== 'undefined') {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return `ws://localhost:8000/api/v2/chat/ws?token=${token}`;
    }
    return `${wsProtocol}//${host}/api/v2/chat/ws?token=${token}`;
  }

  return `ws://localhost:8000/api/v2/chat/ws?token=${token}`;
};


export const useChatStore = create<ChatState>((set, get) => {
  let pingInterval: any = null;
  let reconnectTimeout: any = null;
  let currentToken: string | null = null;

  const startPing = (socket: WebSocket) => {
    if (pingInterval) clearInterval(pingInterval);
    pingInterval = setInterval(() => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000);
  };

  const stopPing = () => {
    if (pingInterval) {
      clearInterval(pingInterval);
      pingInterval = null;
    }
  };

  return {
    ws: null,
    isConnected: false,
    conversations: [],
    activeConv: null,
    messages: [],
    onlineUsers: {},
    typingUsers: {},
    error: null,
    loadingConvs: false,
    loadingMessages: false,

    fetchConversations: async (archived?: boolean, pinned?: boolean) => {
      set({ loadingConvs: true, error: null });
      try {
        const queryParams: string[] = [];
        if (archived !== undefined) queryParams.push(`archived=${archived}`);
        if (pinned !== undefined) queryParams.push(`pinned=${pinned}`);
        const queryString = queryParams.length ? `?${queryParams.join('&')}` : '';
        const res = await api.get(`/api/v2/chat/conversations${queryString}`);
        
        const sortedConvs = sortConversations(res.data || []);

        set({ conversations: sortedConvs });
      } catch (err: any) {
        console.error('Failed to fetch conversations:', err);
        set({ error: 'Failed to fetch conversations.' });
      } finally {
        set({ loadingConvs: false });
      }
    },

    selectConversation: async (conv: ChatConversation | null) => {
      if (!conv) {
        set({ activeConv: null, messages: [] });
        return;
      }
      set({ activeConv: conv, loadingMessages: true, error: null });
      try {
        const res = await api.get(`/api/v2/chat/conversations/${conv.id}/messages`);
        set({ messages: res.data || [] });
        
        // Reset unread count locally and send mark_read via WS if connected
        const ws = get().ws;
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'mark_read', conversation_id: conv.id }));
        }

        // Update list unread count locally
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === conv.id ? { ...c, unread_count: 0 } : c
          ),
        }));
      } catch (err: any) {
        console.error('Failed to fetch messages:', err);
        set({ error: 'Failed to fetch messages.' });
      } finally {
        set({ loadingMessages: false });
      }
    },

    sendMessage: (content: string, messageType: string = 'text') => {
      const { ws, activeConv } = get();
      if (!activeConv) return;

      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'send_message',
          conversation_id: activeConv.id,
          content,
          message_type: messageType
        }));
      } else {
        // Fallback to HTTP POST
        api.post(`/api/v2/chat/conversations/${activeConv.id}/messages`, {
          content,
          message_type: messageType
        }).then((res) => {
          set((state) => ({
            messages: [...state.messages, res.data],
          }));
        }).catch((err) => {
          console.error('HTTP Send fallback failed:', err);
          alert(formatError(err));
        });
      }
    },

    sendMediaMessage: async (type: 'image' | 'voice' | 'document', file: File) => {
      const { activeConv } = get();
      if (!activeConv) return;

      const formData = new FormData();
      formData.append('message_type', type);
      formData.append('file', file);

      try {
        const res = await api.post(
          `/api/v2/chat/conversations/${activeConv.id}/media`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
        // Note: The websocket might also broadcast this, but we append locally for instant feedback if not broadcasted
        // Or if the websocket broadcasts it, we check for duplicates by ID
        set((state) => {
          if (state.messages.some((m) => m.id === res.data.id)) return state;
          return { messages: [...state.messages, res.data] };
        });
      } catch (err: any) {
        console.error('Media upload failed:', err);
        alert(formatError(err));
      }
    },

    reactToMessage: async (messageId: number, emoji: string) => {
      try {
        const res = await api.post(`/api/v2/chat/messages/${messageId}/react`, { emoji });
        const updatedReactions = res.data.reactions;
        
        // Update reactions locally in message stream
        set((state) => ({
          messages: state.messages.map((m) =>
            m.id === messageId ? { ...m, reactions: updatedReactions } : m
          ),
        }));
      } catch (err: any) {
        console.error('Failed to react to message:', err);
      }
    },

    setTypingStatus: (isTyping: boolean) => {
      const { ws, activeConv } = get();
      if (!activeConv || !ws || ws.readyState !== WebSocket.OPEN) return;

      ws.send(JSON.stringify({
        type: 'typing_status',
        conversation_id: activeConv.id,
        is_typing: isTyping,
      }));
    },

    togglePin: async (conversationId: number, pin: boolean) => {
      try {
        const res = await api.post(`/api/v2/chat/conversations/${conversationId}/pin`, { pin });
        set((state) => {
          const updatedConvs = state.conversations.map((c) =>
            c.id === conversationId ? { ...c, ...res.data } : c
          );
          return {
            conversations: sortConversations(updatedConvs),
            activeConv: state.activeConv?.id === conversationId ? { ...state.activeConv, ...res.data } : state.activeConv
          };
        });
      } catch (err: any) {
        console.error('Failed to toggle pin:', err);
      }
    },

    toggleArchive: async (conversationId: number, archive: boolean) => {
      try {
        const res = await api.post(`/api/v2/chat/conversations/${conversationId}/archive`, { archive });
        set((state) => {
          // If we archive, we might want to remove it from the main list view depending on current view context
          const updatedConvs = state.conversations.map((c) =>
            c.id === conversationId ? { ...c, ...res.data } : c
          );
          return {
            conversations: updatedConvs,
            activeConv: state.activeConv?.id === conversationId ? { ...state.activeConv, ...res.data } : state.activeConv
          };
        });
      } catch (err: any) {
        console.error('Failed to toggle archive:', err);
      }
    },

    connectWs: (token: string) => {
      if (typeof window !== 'undefined' && ((window as any).__OFFLINE_MODE__ || useOfflineStore.getState().isOffline)) {
        console.warn('Chat WebSocket connection skipped: running in offline/demo mode.');
        set({ isConnected: false });
        return;
      }
      currentToken = token;
      const { ws } = get();
      if (ws) {
        if (ws.readyState === WebSocket.CONNECTING || ws.readyState === WebSocket.OPEN) {
          return;
        }
      }

      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
        reconnectTimeout = null;
      }

      try {
        const socket = new WebSocket(getWsUrl(token));
        set({ ws: socket });

        socket.onopen = () => {
          console.log('Chat WebSocket connected.');
          set({ isConnected: true, error: null });
          startPing(socket);
        };

        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            const { type } = data;

            if (type === 'new_message') {
              const newMessage: ChatMessage = {
                id: data.message_id,
                conversation_id: data.conversation_id,
                sender_id: data.sender_id,
                content: data.content,
                message_type: data.message_type,
                media_url: data.media_url,
                is_delivered: true,
                is_read: false,
                created_at: data.created_at,
              };

              set((state) => {
                const isCurrentConv = state.activeConv?.id === data.conversation_id;
                
                // Append message locally if it belongs to active chat and is not duplicate
                const alreadyExists = state.messages.some((m) => m.id === data.message_id);
                const nextMessages = isCurrentConv && !alreadyExists
                  ? [...state.messages, newMessage]
                  : state.messages;

                // Send read receipt if active chat
                if (isCurrentConv && socket.readyState === WebSocket.OPEN) {
                  socket.send(JSON.stringify({ type: 'mark_read', conversation_id: data.conversation_id }));
                }

                // Update conversations summary list
                const nextConversations = state.conversations.map((c) => {
                  if (c.id === data.conversation_id) {
                    return {
                      ...c,
                      last_message: data.content || `[${data.message_type}]`,
                      last_message_time: data.created_at,
                      unread_count: isCurrentConv ? 0 : c.unread_count + 1,
                    };
                  }
                  return c;
                });

                return {
                  messages: nextMessages,
                  conversations: sortConversations(nextConversations),
                };
              });

            } else if (type === 'presence_update') {
              set((state) => ({
                onlineUsers: {
                  ...state.onlineUsers,
                  [data.user_id]: data.is_online,
                },
                conversations: state.conversations.map((c) => {
                  const isBuyer = c.buyer_id === data.user_id;
                  const isSeller = c.seller_id === data.user_id;
                  if (isBuyer || isSeller) {
                    return { ...c, other_party_online: data.is_online };
                  }
                  return c;
                })
              }));

            } else if (type === 'typing_indicator') {
              const key = `${data.conversation_id}:${data.user_id}`;
              set((state) => ({
                typingUsers: {
                  ...state.typingUsers,
                  [key]: data.is_typing,
                },
              }));

            } else if (type === 'delivery_receipt') {
              set((state) => ({
                messages: state.messages.map((m) =>
                  m.id === data.message_id ? { ...m, is_delivered: true } : m
                ),
              }));

            } else if (type === 'read_receipt') {
              set((state) => ({
                messages: state.messages.map((m) =>
                  m.id === data.message_id || m.created_at <= data.timestamp ? { ...m, is_read: true } : m
                ),
              }));

            } else if (type === 'error') {
              console.error('Chat error event received:', data.message);
              // Handle specific error codes if needed, e.g. 429 for spam rate-limiting
              alert(`Chat error: ${data.message}`);
            }

          } catch (err) {
            console.error('Error parsing WS message:', err);
          }
        };

        socket.onerror = (err) => {
          console.error('Chat WebSocket error:', err);
        };

        socket.onclose = (event) => {
          console.log('Chat WebSocket closed:', event.code, event.reason);
          set({ isConnected: false });
          stopPing();

          // Auto-reconnect if it wasn't a clean close, auth failure, or intentional disconnect
          if (event.code !== 1000 && event.code !== 4008 && currentToken) {
            reconnectTimeout = setTimeout(() => {
              console.log('Reconnecting chat WebSocket...');
              get().connectWs(currentToken!);
            }, 5000);
          }
        };

      } catch (err: any) {
        console.error('Failed to create WebSocket:', err);
        set({ error: 'Failed to connect to chat gateway.' });
      }
    },

    disconnectWs: () => {
      currentToken = null;
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
        reconnectTimeout = null;
      }
      stopPing();
      const { ws } = get();
      if (ws) {
        ws.close(1000, 'Intentional disconnect');
        set({ ws: null, isConnected: false });
      }
    },
  };
});
