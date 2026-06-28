'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../lib/store';
import { useCopilotStore, CopilotMessage, CopilotAction } from '../../stores/copilotStore';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { Input } from '../../components/ui/Input';
import { 
  Bot, Send, MessageSquarePlus, Trash2, Brain, Sparkles,
  GitCompare, ShieldAlert, ShieldCheck, Tag, Handshake, AlertTriangle
} from 'lucide-react';

export default function CopilotPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuthStore();
  const { 
    sessions, activeSessionId, messages, actions, suggestions, memory, 
    loading, sending, error, fetchSessions, selectSession, fetchSuggestions, 
    fetchMemory, sendMessage, deleteSession, clearMemory 
  } = useCopilotStore();

  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Authenticate user & load baseline data
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (isAuthenticated) {
      fetchSessions();
      fetchSuggestions();
      fetchMemory();
    }
  }, [isAuthenticated, isAuthLoading, router]);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending) return;
    const query = input;
    setInput('');
    await sendMessage(query);
  };

  const handleSuggestionClick = async (promptText: string) => {
    if (sending) return;
    await sendMessage(promptText);
  };

  const parseActionData = (action: CopilotAction): any => {
    try {
      return action.action_data ? JSON.parse(action.action_data) : {};
    } catch (e) {
      console.error("Failed to parse action JSON:", e);
      return {};
    }
  };

  if (isAuthLoading || !isAuthenticated) {
    return (
      <div className="py-20 bg-background text-foreground transition-colors min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Get active session details
  const activeSessionObj = sessions.find(s => s.id === activeSessionId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 bg-background min-h-screen text-foreground flex flex-col md:grid md:grid-cols-4 gap-6 transition-colors duration-200">
      
      {/* COLUMN 1: Session Sidebar & Profile Memory */}
      <aside className="md:col-span-1 flex flex-col gap-6">
        
        {/* New Session Button */}
        <Button
          onClick={() => selectSession(null)}
          variant="primary"
          className="w-full py-4 text-xs font-bold shadow-md uppercase tracking-wider"
        >
          <MessageSquarePlus className="w-4 h-4" />
          <span>New Chat Session</span>
        </Button>

        {/* Sessions list */}
        <Card className="p-4 flex flex-col gap-3 max-h-[300px] overflow-y-auto">
          <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest border-b border-border/40 pb-2">
            Conversations
          </h2>
          {loading && sessions.length === 0 ? (
            <div className="py-4 flex justify-center">
              <LoadingSpinner size="sm" />
            </div>
          ) : sessions.length === 0 ? (
            <p className="text-[11px] text-muted-foreground italic">No chat sessions yet.</p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {sessions.map((sess) => (
                <div 
                  key={sess.id}
                  className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-bold cursor-pointer group transition-all ${
                    activeSessionId === sess.id 
                      ? 'bg-primary/10 text-primary border border-primary/20' 
                      : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                  onClick={() => selectSession(sess.id)}
                >
                  <span className="truncate pr-2">{sess.title || `Chat Session #${sess.id}`}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Delete this chat session?')) {
                        deleteSession(sess.id);
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 hover:text-rose-500 p-1 rounded transition-opacity"
                    title="Delete session"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Memory Profile Card */}
        <Card className="p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5 text-primary" />
              <span>Memory Profile</span>
            </h2>
            {Object.keys(memory).length > 0 && (
              <button 
                onClick={clearMemory}
                className="text-[10px] font-bold text-rose-500 hover:underline"
              >
                Clear
              </button>
            )}
          </div>
          {Object.keys(memory).length === 0 ? (
            <p className="text-[11px] text-muted-foreground italic">No preferences saved. Ask Copilot about items, locations, or pricing to personalize your experience!</p>
          ) : (
            <div className="flex flex-col gap-2">
              {Object.entries(memory).map(([key, val]) => (
                <div key={key} className="flex justify-between items-center text-xs border-b border-border/20 pb-1.5">
                  <span className="font-bold text-muted-foreground capitalize">{key}:</span>
                  <span className="font-semibold text-foreground/90">
                    {key === 'budget' ? `₹${Number(val).toLocaleString('en-IN')}` : val}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

      </aside>

      {/* COLUMN 2 & 3: Chat Workspace */}
      <main className="md:col-span-2 bg-card text-card-foreground border border-border rounded-3xl shadow-sm flex flex-col h-[650px] overflow-hidden">
        
        {/* Workspace Header */}
        <header className="border-b border-border/40 px-6 py-4 bg-muted/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 text-primary rounded-xl">
              <Bot className="w-5 h-5 animate-pulse-subtle" />
            </div>
            <div>
              <h1 className="text-xs font-bold text-foreground">
                {activeSessionId ? activeSessionObj?.title || `Chat Session #${activeSessionId}` : 'AI Copilot Assistant'}
              </h1>
              <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-black mt-0.5">Read-Only Advisor Mode</p>
            </div>
          </div>
        </header>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <AnimatePresence>
            {messages.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-6"
              >
                <div className="p-4 bg-primary/10 rounded-full text-primary">
                  <Sparkles className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-black uppercase tracking-wider">SmartBazaar AI Copilot</h3>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Interact with the marketplace in natural language. Ask to find listings, compare deals, analyze safety, or draft negotiation counters.
                  </p>
                </div>
                
                {/* Suggested Tags Grid */}
                <div className="grid grid-cols-2 gap-2.5 w-full pt-4">
                  {suggestions.map((sug, idx) => (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      key={idx}
                      onClick={() => handleSuggestionClick(sug)}
                      className="p-3.5 text-left text-[11px] font-bold border border-border hover:border-primary rounded-2xl hover:bg-primary/5 transition-all text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      {sug}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={msg.id} 
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                        msg.sender === 'user' 
                          ? 'bg-primary text-primary-foreground rounded-br-none shadow-sm font-semibold' 
                          : 'bg-muted/80 text-foreground rounded-bl-none border border-border/40 whitespace-pre-wrap font-medium'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </motion.div>
                ))}
                
                {sending && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-muted/80 rounded-2xl px-4 py-3 rounded-bl-none flex items-center gap-2">
                      <LoadingSpinner size="sm" />
                      <span className="text-[10px] text-muted-foreground font-semibold italic">Copilot is running sub-agents...</span>
                    </div>
                  </motion.div>
                )}
                
                {error && (
                  <div className="p-3 bg-destructive/10 text-destructive rounded-xl text-xs flex items-center gap-2 border border-destructive/20 font-bold">
                    <AlertTriangle className="w-4 h-4" />
                    <span>{error}</span>
                  </div>
                )}
                
                <div ref={chatEndRef} />
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSend} className="p-4 border-t border-border bg-muted/10 flex gap-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Copilot (e.g. 'Compare listings 1 and 2', 'Find cycles in Pune')..."
            disabled={sending}
            className="flex-1 rounded-2xl"
          />
          <Button
            type="submit"
            disabled={sending || !input.trim()}
            className="h-10 rounded-2xl"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>

      </main>

      {/* COLUMN 4: Context Sidebar (Sub-agent Data Panels) */}
      <aside className="md:col-span-1 flex flex-col gap-6">
        
        <Card className="p-4 flex flex-col gap-4 min-h-[400px] max-h-[650px] overflow-y-auto">
          <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest border-b border-border pb-2">
            Context Cards
          </h2>

          <AnimatePresence>
            {actions.length === 0 ? (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-muted-foreground italic text-center py-10"
              >
                Run commands like 'compare', 'safe', or 'price' to load widgets.
              </motion.p>
            ) : (
              <div className="space-y-4">
                {actions.map((act) => {
                  const data = parseActionData(act);
                  
                  // --- 1. SEARCH ACTION ---
                  if (act.action_type === 'search') {
                    const results = data.results || [];
                    const filters = data.filters || {};
                    return (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        key={act.id} 
                        className="p-3 bg-muted/30 rounded-xl border border-border/60 flex flex-col gap-2.5"
                      >
                        <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                          <Tag className="w-3.5 h-3.5 text-primary" />
                          <span>Search Filter Details</span>
                        </div>
                        <div className="text-[10px] text-muted-foreground space-y-0.5 font-semibold uppercase tracking-wider">
                          {filters.category && <p>• Category: {filters.category}</p>}
                          {filters.location && <p>• Location: {filters.location}</p>}
                          {filters.max_price && <p>• Max Price: ₹{filters.max_price}</p>}
                        </div>
                        <div className="space-y-1">
                          {results.length === 0 ? (
                            <p className="text-[11px] text-muted-foreground italic">No listings returned.</p>
                          ) : (
                            results.map((item: any) => (
                              <div key={item.id} className="p-1.5 bg-card rounded-xl border border-border text-[11px] flex justify-between items-center font-bold">
                                <span className="truncate max-w-[100px]">{item.title}</span>
                                <span className="font-mono text-primary">₹{item.price}</span>
                              </div>
                            ))
                          )}
                        </div>
                      </motion.div>
                    );
                  }

                  // --- 2. COMPARE ACTION ---
                  if (act.action_type === 'compare') {
                    const comp = (data.comparison || {}) as any;
                    const listings = (comp.listings || []) as any[];
                    return (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        key={act.id} 
                        className="p-3 bg-muted/30 rounded-xl border border-border/60 flex flex-col gap-2"
                      >
                        <div className="flex items-center gap-1.5 text-xs font-bold text-foreground border-b border-border pb-1.5">
                          <GitCompare className="w-3.5 h-3.5 text-blue-500" />
                          <span>Listing Comparison</span>
                        </div>
                        {listings.length === 0 ? (
                          <p className="text-[11px] text-muted-foreground italic">No comparison items.</p>
                        ) : (
                          <div className="space-y-3">
                            {listings.map((item: any) => (
                              <div key={item.id} className="space-y-1 text-[11px]">
                                <p className="font-black text-foreground">
                                  #{item.id}: {item.title} (₹{item.price})
                                </p>
                                {item.pros && item.pros.length > 0 && (
                                  <div className="text-[10px] text-green-600 dark:text-green-400 font-semibold pl-1">
                                    • Pros:
                                    {item.pros.map((p: string, i: number) => (
                                      <p key={i} className="pl-2 font-medium text-muted-foreground">- {p}</p>
                                    ))}
                                  </div>
                                )}
                                {item.cons && item.cons.length > 0 && (
                                  <div className="text-[10px] text-rose-500 dark:text-rose-455 font-semibold pl-1">
                                    • Cons:
                                    {item.cons.map((c: string, i: number) => (
                                      <p key={i} className="pl-2 font-medium text-muted-foreground">- {c}</p>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                            <div className="pt-2 border-t border-border text-[9px] text-muted-foreground font-semibold italic">
                              {comp.recommendation}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    );
                  }

                  // --- 3. FRAUD ANALYSIS ACTION ---
                  if (act.action_type === 'fraud_analysis') {
                    const eval_res = data.evaluation || {};
                    const isSafe = eval_res.risk_rating === 'Safe';
                    const ratingColor = eval_res.risk_rating === 'High Risk' 
                      ? 'bg-rose-500/10 text-rose-600' 
                      : eval_res.risk_rating === 'Moderate Risk'
                        ? 'bg-amber-500/10 text-amber-600'
                        : 'bg-emerald-500/10 text-emerald-600';
                        
                    return (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        key={act.id} 
                        className="p-3 bg-muted/30 rounded-xl border border-border/60 flex flex-col gap-2"
                      >
                        <div className="flex items-center gap-1.5 text-xs font-bold text-foreground border-b border-border pb-1.5">
                          {isSafe ? <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> : <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />}
                          <span>Safety Risk Report</span>
                        </div>
                        <div className="space-y-1.5 text-[11px]">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Risk Rating:</span>
                            <span className={`px-2 py-0.5 rounded-full font-black text-[9px] uppercase tracking-wider ${ratingColor}`}>
                              {eval_res.risk_rating}
                            </span>
                          </div>
                          <p className="text-muted-foreground font-semibold">Advice: <span className="font-medium text-foreground">{eval_res.advice}</span></p>
                          {eval_res.reasons && eval_res.reasons.length > 0 && (
                            <div className="space-y-1 pt-1.5 border-t border-border">
                              {eval_res.reasons.map((r: string, i: number) => (
                                <p key={i} className="text-[10px] pl-1.5 border-l-2 border-primary text-muted-foreground font-medium">
                                  {r}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  }

                  // --- 4. PRICE ADVISOR ACTION ---
                  if (act.action_type === 'price_advisor') {
                    const analysis = data.analysis || {};
                    return (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        key={act.id} 
                        className="p-3 bg-muted/30 rounded-xl border border-border/60 flex flex-col gap-2"
                      >
                        <div className="flex items-center gap-1.5 text-xs font-bold text-foreground border-b border-border pb-1.5">
                          <Tag className="w-3.5 h-3.5 text-teal-500" />
                          <span>Price Valuation</span>
                        </div>
                        <div className="space-y-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                          <div className="flex justify-between">
                            <span>Status:</span>
                            <span className="font-black text-teal-500">{analysis.price_status}</span>
                          </div>
                          {analysis.item_price && (
                            <div className="flex justify-between">
                              <span>Item Price:</span>
                              <span className="font-mono text-foreground font-bold">₹{analysis.item_price.toLocaleString('en-IN')}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span>Category Avg:</span>
                            <span className="font-mono text-foreground font-bold">₹{analysis.category_average?.toLocaleString('en-IN')}</span>
                          </div>
                          <div className="flex justify-between text-[10px]">
                            <span>Difference:</span>
                            <span className={analysis.difference_pct > 0 ? 'text-rose-500' : 'text-emerald-500'}>
                              {analysis.difference_pct > 0 ? '+' : ''}{analysis.difference_pct}%
                            </span>
                          </div>
                          <p className="text-[10px] text-muted-foreground pt-1.5 border-t border-border leading-normal normal-case font-medium">
                            {analysis.advice}
                          </p>
                        </div>
                      </motion.div>
                    );
                  }

                  // --- 5. NEGOTIATION ACTION ---
                  if (act.action_type === 'negotiate') {
                    return (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        key={act.id} 
                        className="p-3 bg-muted/30 rounded-xl border border-border/60 flex flex-col gap-2"
                      >
                        <div className="flex items-center gap-1.5 text-xs font-bold text-foreground border-b border-border pb-1.5">
                          <Handshake className="w-3.5 h-3.5 text-amber-500" />
                          <span>Negotiation Strategy</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                          {data.strategy}
                        </p>
                      </motion.div>
                    );
                  }

                  return null;
                })}
              </div>
            )}
          </AnimatePresence>
        </Card>

      </aside>

    </div>
  );
}
