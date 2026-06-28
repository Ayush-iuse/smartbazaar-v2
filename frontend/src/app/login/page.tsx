'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../lib/store';
import api from '../../lib/api';
import { Sparkles, LogIn, UserPlus } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuthStore();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // If already logged in, redirect to dashboard automatically
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      if (activeTab === 'login') {
        // OAuth2 Password Request Form requires x-www-form-urlencoded
        const formData = new URLSearchParams();
        formData.append('username', email);
        formData.append('password', password);

        const loginRes = await api.post('/api/auth/login', formData, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        });

        const { access_token } = loginRes.data;

        // Set token in localStorage temporarily so the subsequent request gets it
        localStorage.setItem('sb_auth_token', access_token);

        // Fetch user information
        const userRes = await api.get('/api/auth/me');
        
        // Save to Zustand state store
        login(access_token, userRes.data);
        
        setSuccess('Login successful! Redirecting...');
        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);
      } else {
        // Register API expects JSON UserCreate body
        await api.post('/api/auth/register', {
          email,
          password,
          full_name: fullName || null,
        });

        setSuccess('Registration successful! Please log in with your credentials.');
        setActiveTab('login');
        setPassword('');
      }
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.detail || 
        'An error occurred during authentication. Please check your credentials.'
      );
      // Clean up temp token if failed
      if (activeTab === 'login') {
        localStorage.removeItem('sb_auth_token');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-background text-foreground relative overflow-hidden transition-colors duration-200">
      <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      <Card className="w-full max-w-md p-8 shadow-xl z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-primary/10 text-primary rounded-2xl mb-4">
            <Sparkles className="w-6 h-6 animate-pulse-subtle" />
          </div>
          <h2 className="text-2xl font-black text-foreground">Welcome to SmartBazaar</h2>
          <p className="text-xs text-muted-foreground mt-1 font-semibold">Join the next-generation AI-assisted local trading community</p>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-border/40 mb-6">
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setError(null);
              setSuccess(null);
            }}
            className={`flex-1 pb-3 text-sm font-bold border-b-2 text-center transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'login'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('register');
              setError(null);
              setSuccess(null);
            }}
            className={`flex-1 pb-3 text-sm font-bold border-b-2 text-center transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'register'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Register</span>
          </button>
        </div>

        {/* Form Alerts */}
        {error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-xl font-medium">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-xs rounded-xl font-medium">
            {success}
          </div>
        )}

        {/* Authentication Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {activeTab === 'register' && (
            <>
              {/* Full Name */}
              <Input
                type="text"
                required
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                label="Full Name"
              />

              {/* Phone */}
              <Input
                type="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                label="Phone Number"
              />
            </>
          )}

          {/* Email */}
          <Input
            type="email"
            required
            placeholder="test@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            label="Email Address"
          />

          {/* Password */}
          <Input
            type="password"
            required
            minLength={6}
            placeholder="Min 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            label="Password"
          />

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 uppercase tracking-wider"
          >
            {isLoading ? 'Processing...' : activeTab === 'login' ? 'Sign In' : 'Create Account'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
