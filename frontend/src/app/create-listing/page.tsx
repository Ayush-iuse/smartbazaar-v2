'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../lib/store';
import api from '../../lib/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import AIBadge from '../../components/AIBadge';
import { Sparkles, ArrowRight, Tag, BadgePercent, ShieldAlert, Plus, X, Wand2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';

const CATEGORIES = ['Electronics', 'Furniture', 'Fashion', 'Books', 'Vehicles', 'Others'];
const CONDITIONS = ['New', 'Like New', 'Good', 'Fair', 'Poor'];

export default function CreateListingPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuthStore();

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [condition, setCondition] = useState('New');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  // AI Assistant states
  const [keywords, setKeywords] = useState('');
  const [aiDescriptionLoading, setAiDescriptionLoading] = useState(false);
  const [aiCategoryLoading, setAiCategoryLoading] = useState(false);
  const [aiPriceLoading, setAiPriceLoading] = useState(false);
  const [priceRecommendation, setPriceRecommendation] = useState<{ min: number; max: number } | null>(null);
  
  // Real-time Safety scan state
  const [aiFraudLoading, setAiFraudLoading] = useState(false);
  const [fraudScanResult, setFraudScanResult] = useState<{ score: number; level: string; flagged: string[] } | null>(null);

  // Seller Copilot state
  const [copilotLoading, setCopilotLoading] = useState(false);
  const [copilotResult, setCopilotResult] = useState<{
    listing_score: number;
    sale_probability: number;
    competition_score: number;
    price_score: number;
    description_score: number;
    trust_impact: number;
    expected_sell_time: string;
    recommendations: string[];
    is_fallback: boolean;
  } | null>(null);

  // General states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Live Auto-Copilot Effect with Debounce
  useEffect(() => {
    if (!title.trim()) return;
    const delayDebounce = setTimeout(() => {
      const runAutoCopilot = async () => {
        try {
          const res = await api.post('/api/ai/copilot', {
            title,
            description: description || '',
            price: parseFloat(price) || 0,
            category: category || 'Others',
            location: location || '',
            condition,
            image_count: imageUrls.length
          });
          setCopilotResult(res.data);
        } catch (err) {
          console.error('Live Copilot recalculate error:', err);
        }
      };
      runAutoCopilot();
    }, 1000);

    return () => clearTimeout(delayDebounce);
  }, [title, description, price, category, location, condition, imageUrls]);

  // Protection Check
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isAuthLoading, router]);

  // Image helpers
  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    if (imageUrls.length >= 4) {
      alert('You can upload a maximum of 4 images.');
      return;
    }
    setImageUrls([...imageUrls, imageUrlInput.trim()]);
    setImageUrlInput('');
  };

  const handleRemoveImageUrl = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  // AI Description Generation
  const handleGenerateDescription = async () => {
    if (!title.trim()) {
      alert('Please fill in the title first before generating a description.');
      return;
    }
    try {
      setAiDescriptionLoading(true);
      const keywordList = keywords ? keywords.split(',').map((k) => k.trim()) : [];
      const res = await api.post('/api/ai/description', {
        title,
        keywords: keywordList,
      });
      setDescription(res.data.description);
    } catch (err) {
      console.error(err);
      alert('Failed to generate description. Fallback template loaded.');
      setDescription(`Beautiful ${title} in good condition. Keywords: ${keywords || 'none'}.`);
    } finally {
      setAiDescriptionLoading(false);
    }
  };

  // AI Category Suggestion
  const handleSuggestCategory = async () => {
    if (!title.trim()) {
      alert('Please enter a title first so AI can suggest a category.');
      return;
    }
    try {
      setAiCategoryLoading(true);
      const res = await api.post('/api/ai/category', { title });
      const predictedCat = res.data.category;
      if (CATEGORIES.includes(predictedCat)) {
        setCategory(predictedCat);
      } else {
        setCategory('Others');
      }
    } catch (err) {
      console.error(err);
      alert('Could not suggest category automatically.');
    } finally {
      setAiCategoryLoading(false);
    }
  };

  // AI Price Recommendation
  const handleRecommendPrice = async () => {
    if (!title.trim()) {
      alert('Please enter a title first.');
      return;
    }
    try {
      setAiPriceLoading(true);
      const res = await api.post('/api/ai/price', {
        title,
        condition,
      });
      setPriceRecommendation({
        min: res.data.suggested_min,
        max: res.data.suggested_max,
      });
    } catch (err) {
      console.error(err);
      alert('Could not retrieve price recommendations.');
    } finally {
      setAiPriceLoading(false);
    }
  };

  // Pre-submit Safety Scan
  const handleRunFraudScan = async () => {
    if (!title.trim() || !description.trim()) {
      alert('Please fill in the title and description to run a safety scan.');
      return;
    }
    try {
      setAiFraudLoading(true);
      const res = await api.post('/api/ai/fraud', {
        title,
        description,
      });
      setFraudScanResult({
        score: res.data.fraud_score,
        level: res.data.fraud_level,
        flagged: res.data.flagged_phrases || [],
      });
    } catch (err) {
      console.error(err);
      alert('Could not execute listing safety check.');
    } finally {
      setAiFraudLoading(false);
    }
  };

  // Listing Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!title || !price || !category || !location) {
      setError('Please fill in all mandatory fields.');
      return;
    }

    try {
      setIsLoading(true);
      const listingPayload = {
        title,
        description,
        price: parseFloat(price),
        category,
        location,
        image_urls: imageUrls,
      };

      const res = await api.post('/api/listings', listingPayload);
      router.push(`/listing/${res.data.id}`);
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.detail || 
        'An error occurred while publishing the listing. Please check input values.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthLoading || !isAuthenticated) {
    return (
      <div className="py-20 bg-background text-foreground transition-colors min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-background text-foreground min-h-screen transition-colors duration-200">
      <div className="border-b border-border pb-6 mb-8">
        <h1 className="text-3xl font-black text-foreground tracking-tight">Create a Listing</h1>
        <p className="text-xs text-muted-foreground mt-1">Fill out the details below to list your item on the P2P marketplace</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-xl font-medium">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Listing Creation Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-2">
          <Card className="p-6 space-y-6">
            {/* Title */}
            <Input
              type="text"
              required
              maxLength={100}
              placeholder="e.g. iPhone 13 Pro Max - 128GB - Sierra Blue"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              label="Product Title *"
            />

            {/* Description */}
            <div className="flex flex-col gap-1.5 w-full">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Description
                </label>
                <span className="text-[10px] text-muted-foreground font-semibold">Max 1000 characters</span>
              </div>
              <textarea
                placeholder="Describe what makes your item special, its condition, and specifications..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                maxLength={1000}
                className="w-full px-4 py-2.5 border border-input rounded-xl text-xs bg-background focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-foreground placeholder:text-muted-foreground/60 leading-relaxed transition-all duration-200"
              />
            </div>

            {/* Category & Condition */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                label="Category *"
              >
                <option value="">Select Category</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </Select>

              <Select
                required
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                label="Item Condition *"
              >
                {CONDITIONS.map((cond) => (
                  <option key={cond} value={cond}>
                    {cond}
                  </option>
                ))}
              </Select>
            </div>

            {/* Price & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                type="number"
                required
                min={0}
                placeholder="₹ Amount"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                label="Price (INR ₹) *"
                className="font-mono font-semibold"
              />

              <Input
                type="text"
                required
                placeholder="e.g. Connaught Place, New Delhi"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                label="Trading Location *"
              />
            </div>

            {/* Image URLs Input */}
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Image URLs (Max 4)
              </label>
              <div className="flex gap-2 items-end">
                <Input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={handleAddImageUrl}
                  variant="secondary"
                  className="h-10"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add</span>
                </Button>
              </div>

              {/* Added Images Preview Chips */}
              {imageUrls.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                  {imageUrls.map((url, index) => (
                    <div key={index} className="relative aspect-video rounded-lg overflow-hidden border border-border bg-muted group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`Listing thumbnail ${index + 1}`} className="object-cover w-full h-full" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImageUrl(index)}
                        className="absolute top-1 right-1 p-1 bg-rose-500 text-white rounded-full opacity-80 hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Action */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 text-xs font-bold uppercase tracking-wider shadow-md"
            >
              {isLoading ? 'Publishing Listing...' : 'Publish Listing'}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Card>
        </form>

        {/* AI Assistant Sidebar Panel */}
        <div className="space-y-6">
          {/* AI Seller Copilot Panel */}
          {copilotResult && (
            <Card className="p-6 space-y-5 transition-colors">
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <div>
                  <h3 className="font-extrabold text-foreground text-sm tracking-tight">AI Seller Copilot</h3>
                  <p className="text-[10px] text-muted-foreground">Holistic Listing Optimizer</p>
                </div>
                <AIBadge label="Live Score" />
              </div>

              <div className="flex justify-around items-center py-2 bg-muted/40 rounded-xl border border-border/40">
                <div className="flex flex-col items-center gap-1.5">
                  <div className="relative flex items-center justify-center">
                    <svg className="w-16 h-16 transform -rotate-90">
                      <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-border" />
                      <circle
                        cx="32" cy="32" r="28"
                        stroke={copilotResult.listing_score >= 80 ? '#10B981' : copilotResult.listing_score >= 50 ? '#F59E0B' : '#EF4444'}
                        strokeWidth="4" fill="transparent"
                        strokeDasharray={2 * Math.PI * 28}
                        strokeDashoffset={2 * Math.PI * 28 * (1 - copilotResult.listing_score / 100)}
                        className="transition-all duration-500 ease-out"
                      />
                    </svg>
                    <span className="absolute text-xs font-black text-foreground font-mono">
                      {copilotResult.listing_score}%
                    </span>
                  </div>
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Listing Health</span>
                </div>

                <div className="flex flex-col items-center gap-1.5">
                  <div className="relative flex items-center justify-center">
                    <svg className="w-16 h-16 transform -rotate-90">
                      <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-border" />
                      <circle
                        cx="32" cy="32" r="28"
                        stroke={copilotResult.sale_probability >= 70 ? '#10B981' : copilotResult.sale_probability >= 40 ? '#F59E0B' : '#EF4444'}
                        strokeWidth="4" fill="transparent"
                        strokeDasharray={2 * Math.PI * 28}
                        strokeDashoffset={2 * Math.PI * 28 * (1 - copilotResult.sale_probability / 100)}
                        className="transition-all duration-500 ease-out"
                      />
                    </svg>
                    <span className="absolute text-xs font-black text-foreground font-mono">
                      {copilotResult.sale_probability}%
                    </span>
                  </div>
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Sale Chance</span>
                </div>
              </div>

              {/* Sub-scores details */}
              <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-muted-foreground bg-muted/40 p-3 rounded-xl border border-border/40">
                <div className="flex justify-between">
                  <span>Price index:</span>
                  <span className="font-mono text-primary">{copilotResult.price_score}/100</span>
                </div>
                <div className="flex justify-between">
                  <span>Details quality:</span>
                  <span className="font-mono text-primary">{copilotResult.description_score}/100</span>
                </div>
                <div className="flex justify-between col-span-2 border-t border-border/40 pt-1.5 mt-0.5">
                  <span>Expected time:</span>
                  <span className="font-bold text-foreground">{copilotResult.expected_sell_time}</span>
                </div>
              </div>

              {/* Improvement Tips Checklist */}
              <div className="space-y-2">
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Actionable suggestions:
                </span>
                <ul className="text-[11px] space-y-1.5 text-muted-foreground">
                  {copilotResult.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-primary mt-0.5">•</span>
                      <span className="leading-tight text-muted-foreground">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          )}

          <div className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-950 dark:to-background text-white p-6 border border-border/40 rounded-2xl shadow-xl flex flex-col gap-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-primary rounded-lg text-white">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="font-extrabold text-md tracking-tight">SmartBazaar AI Panel</h3>
                <p className="text-[10px] text-slate-400">Instantly generate and check parameters</p>
              </div>
            </div>

            <hr className="border-border/40" />

            {/* AI Category Suggester */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                1. Auto-Categorize
              </span>
              <Button
                type="button"
                onClick={handleSuggestCategory}
                disabled={aiCategoryLoading}
                className="w-full h-9 text-xs"
              >
                <Tag className="w-3.5 h-3.5" />
                <span>{aiCategoryLoading ? 'Analyzing Title...' : 'Predict Category'}</span>
              </Button>
            </div>

            {/* AI Price Bounds Suggester */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                2. Market Valuation Check
              </span>
              <Button
                type="button"
                onClick={handleRecommendPrice}
                disabled={aiPriceLoading}
                variant="secondary"
                className="w-full h-9 text-xs text-white border-border"
              >
                <BadgePercent className="w-3.5 h-3.5" />
                <span>{aiPriceLoading ? 'Analyzing prices...' : 'Check Recommended Price'}</span>
              </Button>

              {priceRecommendation && (
                <div className="bg-slate-850/50 dark:bg-muted/20 p-3.5 rounded-xl border border-border/40 flex flex-col gap-1 mt-1 font-mono">
                  <div className="flex justify-between items-center text-xs text-slate-400">
                    <span>Valuation Bounds:</span>
                    <AIBadge className="scale-75 origin-right" />
                  </div>
                  <span className="text-sm font-black text-primary mt-1">
                    ₹{priceRecommendation.min.toLocaleString('en-IN')} - ₹{priceRecommendation.max.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[9px] text-slate-500 font-sans">Suggested values based on item condition ({condition})</span>
                </div>
              )}
            </div>

            {/* AI Auto Description Generator */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                3. Auto Description
              </span>
              <input
                type="text"
                placeholder="Keywords (e.g. 5G, box, charger, scratchless)"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                className="px-3 py-1.5 bg-slate-800 dark:bg-background border border-border/40 text-white dark:text-foreground rounded-lg text-xs placeholder:text-slate-500 focus:outline-none focus:border-primary"
              />
              <Button
                type="button"
                onClick={handleGenerateDescription}
                disabled={aiDescriptionLoading}
                variant="secondary"
                className="w-full h-9 text-xs text-white border-border"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>{aiDescriptionLoading ? 'Writing text...' : 'Generate Description'}</span>
              </Button>
            </div>

            {/* Real-time Listing Fraud Scan Check */}
            <div className="flex flex-col gap-2 pt-2 border-t border-border/40">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                4. Safety Risk Scan Check
              </span>
              <Button
                type="button"
                onClick={handleRunFraudScan}
                disabled={aiFraudLoading}
                variant="secondary"
                className="w-full h-9 text-xs text-white border-border"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>{aiFraudLoading ? 'Scanning...' : 'Pre-check Listing Safety'}</span>
              </Button>

              {fraudScanResult && (
                <div className={`p-3.5 rounded-xl border flex flex-col gap-1 mt-1 font-mono text-xs ${
                  fraudScanResult.level === 'High' 
                    ? 'bg-rose-950/20 border-rose-900 text-rose-300' 
                    : fraudScanResult.level === 'Medium' 
                      ? 'bg-amber-950/20 border-amber-900 text-amber-300'
                      : 'bg-emerald-950/20 border-emerald-900 text-emerald-300'
                }`}>
                  <div className="flex justify-between items-center text-[10px] text-slate-400">
                    <span>Scam Risk Analysis:</span>
                    <span className="font-bold">{fraudScanResult.level} Risk</span>
                  </div>
                  <span className="text-sm font-black mt-1">
                    Risk Score: {fraudScanResult.score.toFixed(0)}%
                  </span>
                  {fraudScanResult.flagged.length > 0 && (
                    <div className="mt-1">
                      <span className="text-[9px] text-slate-400 block mb-0.5">Flagged Phrases:</span>
                      <div className="flex flex-wrap gap-1">
                        {fraudScanResult.flagged.map((ph, i) => (
                          <span key={i} className="px-1.5 py-0.5 rounded bg-slate-800 dark:bg-muted text-[9px] text-slate-350 dark:text-foreground">
                            "{ph}"
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
