'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Globe, Lock, Mail, UserPlus, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/lib/auth';

export default function AuthPage() {
  const router = useRouter();
  const { user, error, signIn, signInWithProvider, signUp } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setStatus(null);

    const success = mode === 'register'
      ? await signUp(name, email, password)
      : await signIn(email, password);

    setLoading(false);

    if (success) {
      router.push('/');
    } else if (!success) {
      setStatus('Unable to authenticate. Please review form details.');
    }
  };

  const handleProvider = async (provider: 'Google' | 'Facebook') => {
    setLoading(true);
    setStatus(null);
    await signInWithProvider(provider);
    setLoading(false);
    router.push('/');
  };

  if (user) {
    return (
      <div className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Account</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900">You are already signed in</h1>
          <p className="mt-4 text-sm leading-6 text-slate-600">Continue to your thesis dashboard or sign out from the account card.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[1.3fr_1fr]">
      <div className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Secure academic access</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900">Sign in or register for ThesisMate AI</h1>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            Use your credentials or connect with Google and Facebook to access your thesis workflow, sources, and comment tracking.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">{mode === 'login' ? 'Academic login' : 'Create a workspace account'}</h2>
              <p className="mt-2 text-sm text-slate-600">{mode === 'login' ? 'Sign in with your institution-ready account.' : 'Register to save your thesis progress in one place.'}</p>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-slate-50 px-3 py-2 text-sm text-slate-600">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`rounded-full px-4 py-2 transition ${mode === 'login' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-100'}`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setMode('register')}
                className={`rounded-full px-4 py-2 transition ${mode === 'register' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-100'}`}
              >
                Register
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {mode === 'register' && (
              <label className="block text-sm font-semibold text-slate-700">
                Full name
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-indigo-500"
                  placeholder="Ali Veli"
                />
              </label>
            )}

            <label className="block text-sm font-semibold text-slate-700">
              Email address
              <div className="mt-2 relative">
                <Mail className="pointer-events-none absolute left-4 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-11 py-3 text-sm outline-none focus:border-indigo-500"
                  placeholder="student@example.com"
                />
              </div>
            </label>

            <label className="block text-sm font-semibold text-slate-700">
              Password
              <div className="mt-2 relative">
                <Lock className="pointer-events-none absolute left-4 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-11 py-3 text-sm outline-none focus:border-indigo-500"
                  placeholder="Minimum 6 characters"
                />
              </div>
            </label>

            {error && <p className="text-sm text-rose-600">{error}</p>}
            {status && <p className="text-sm text-slate-600">{status}</p>}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center rounded-3xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {loading ? 'Processing...' : mode === 'login' ? 'Sign in' : 'Create account'}
            </button>
          </form>

          <div className="mt-8 border-t border-slate-200 pt-6">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Or continue with</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => handleProvider('Google')}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                <Globe className="h-4 w-4 text-indigo-600" />
                Continue with Google
              </button>
              <button
                type="button"
                onClick={() => handleProvider('Facebook')}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                <Globe className="h-4 w-4 text-sky-600 animate-pulse" />
                Continue with Facebook
              </button>
            </div>
            <p className="mt-4 text-sm text-slate-500">
              This is a portfolio-ready auth interface. Google and Facebook sign-in actions are mocked for local development.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Why create a ThesisMate account?</h2>
          <ul className="mt-6 space-y-4 text-sm text-slate-600">
            <li className="flex gap-3">
              <span className="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <span>
                Save your thesis progress, source list, comments, and chapter improvements in an academic workspace.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm">
                <UserPlus className="h-5 w-5" />
              </span>
              <span>
                Register with credentials or connect via Google / Facebook to streamline research workflows.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm">
                <Lock className="h-5 w-5" />
              </span>
              <span>
                Keep your dashboard more professional with a dedicated workspace and account-oriented experience.
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
