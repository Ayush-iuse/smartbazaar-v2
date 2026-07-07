import React, { useState } from 'react';
import { Cpu, Send, Sparkles, ShieldAlert, BadgeInfo, BarChart2 } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

export default function AIConcierge() {
  const [chatPrompt, setChatPrompt] = useState('');
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    { sender: 'ai', text: "Hello! I am your AI Commerce Concierge. Try asking: 'I need a DSLR under ₹2000 for 3 days' or 'Find me a wildlife camera.'" }
  ]);

  const handleSendPrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatPrompt.trim()) return;

    const userText = chatPrompt;
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setChatPrompt('');

    setTimeout(() => {
      let response = "I found 2 DSLR listings matching your criteria. Canon DSLR Camera is available for Rent at ₹1,500/day, with a ₹5,000 security deposit.";
      if (userText.toLowerCase().includes('wildlife')) {
        response = "For wildlife photography, I recommend listings under the Photography category: Sony Alpha 7 with zoom lens is available nearby.";
      }
      setMessages((prev) => [...prev, { sender: 'ai', text: response }]);
    }, 800);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 select-none">
      
      {/* Concierge Chat Assistant (Left 2 Columns) */}
      <Card className="lg:col-span-2 p-6 flex flex-col h-[400px] border border-border/40 bg-card">
        
        {/* Header */}
        <div className="flex items-center gap-2 border-b border-border/20 pb-3 mb-4 shrink-0">
          <Cpu className="w-5 h-5 text-primary" />
          <div>
            <h3 className="text-xs font-black uppercase tracking-tight text-foreground">AI Concierge Assistant</h3>
            <span className="text-[8px] text-muted-foreground font-bold uppercase tracking-wider">Semantic Rental Intelligence</span>
          </div>
        </div>

        {/* Messaging Area */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-2 mb-4 text-[10px] leading-relaxed font-medium scrollbar-thin">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-2xl max-w-[85%] border ${
                msg.sender === 'user'
                  ? 'bg-primary text-primary-foreground border-primary/20 ml-auto'
                  : 'bg-muted/15 text-foreground border-border/30 mr-auto'
              }`}
            >
              {msg.text}
            </div>
          ))}
        </div>

        {/* Prompt Input Form */}
        <form onSubmit={handleSendPrompt} className="flex gap-2 shrink-0">
          <input
            type="text"
            placeholder="Type your search query..."
            value={chatPrompt}
            onChange={(e) => setChatPrompt(e.target.value)}
            className="flex-1 px-3 py-2 border border-border/40 bg-muted/20 rounded-xl text-[10px] text-foreground font-bold outline-none"
          />
          <Button type="submit" size="sm" className="h-9 px-3">
            <Send className="w-4 h-4" />
          </Button>
        </form>

      </Card>

      {/* Side Widgets (Right 1 Column) */}
      <div className="space-y-4">
        
        {/* Fraud Banner */}
        <Card className="p-5 border border-rose-500/20 bg-rose-500/5 space-y-2">
          <h4 className="text-[9px] font-black uppercase tracking-wider text-rose-500 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4" />
            <span>AI Risk Guard</span>
          </h4>
          <p className="text-[9px] font-bold text-foreground leading-relaxed">
            Scam Detection score: <strong>0.05 (Low Risk)</strong>. Listing profiles matches standard verify models. Safe to proceed with checkout.
          </p>
        </Card>

        {/* Price Predictor */}
        <Card className="p-5 space-y-4 border border-border/40 bg-card">
          <h4 className="text-[9px] font-black uppercase tracking-wider text-foreground flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>AI Pricing Optimizer</span>
          </h4>
          <div className="space-y-2.5 text-[10px] font-bold text-foreground">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Suggested Rent Price:</span>
              <span className="font-mono">₹1,500/day</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Suggested Deposit:</span>
              <span className="font-mono">₹5,000</span>
            </div>
            <div className="flex justify-between border-t border-border/10 pt-2 text-primary">
              <span>Confidence Score:</span>
              <span className="font-mono font-black">92%</span>
            </div>
          </div>
        </Card>

        {/* Business Insights */}
        <Card className="p-5 space-y-4 border border-border/40 bg-card">
          <h4 className="text-[9px] font-black uppercase tracking-wider text-foreground flex items-center gap-1.5">
            <BarChart2 className="w-4 h-4 text-primary" />
            <span>AI Market Forecast</span>
          </h4>
          <div className="flex items-start gap-2 text-[9px] font-bold text-muted-foreground leading-relaxed">
            <BadgeInfo className="w-4 h-4 text-primary shrink-0" />
            <p>High category growth detected: DSLR rentals are up 24% this month due to seasonal events schedules.</p>
          </div>
        </Card>

      </div>

    </div>
  );
}
