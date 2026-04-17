"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:4000/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      router.push('/dashboard');
    } catch (err: unknown) {
      const axErr = err as { response?: { data?: { error?: string } } };
      setError(axErr.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-panel p-10 w-full max-w-md border border-slate-700 rounded-2xl">
        <h1 className="text-3xl font-extrabold text-center mb-2 heading-gradient">Welcome Back</h1>
        <p className="text-slate-400 text-center text-sm mb-8">Sign in to your AgroTech AI dashboard</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm p-3 rounded-lg mb-4">{error}</div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs text-slate-400 font-semibold mb-1 uppercase tracking-wider">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-agrigreen-500 transition" placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-xs text-slate-400 font-semibold mb-1 uppercase tracking-wider">Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-agrigreen-500 transition" placeholder="••••••••" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-agrigreen-600 to-blue-600 font-bold text-white disabled:opacity-50 transition hover:scale-[1.02] shadow-lg">
            {loading ? 'Signing In...' : 'Log In'}
          </button>
        </form>

        <p className="text-sm text-slate-400 text-center mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-agrigreen-400 font-semibold hover:underline">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}
