'use client';

import { useAuth } from '@/lib/auth';
import { LogOut, ShieldCheck, UserCircle2 } from 'lucide-react';

export default function AuthBanner() {
  const { user, isAuthenticated, signOut } = useAuth();

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Account access</p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-900">
            {isAuthenticated ? `Welcome back, ${user?.name}` : 'Sign in to unlock the thesis workspace'}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            {isAuthenticated
              ? 'Your account is connected and your research progress is ready to continue.'
              : 'Use the academic login portal to access sources, comments, and workflow tools.'}
          </p>
        </div>
        <div className="rounded-3xl bg-slate-50 px-5 py-4 text-slate-700 shadow-sm">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <UserCircle2 className="h-6 w-6 text-indigo-600" />
              <div>
                <p className="text-sm font-semibold text-slate-900">{user?.provider} account</p>
                <button
                  type="button"
                  onClick={signOut}
                  className="mt-2 inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-900">Get started with Scholar login</p>
              <p className="text-sm text-slate-600">Click Account in the sidebar to create your thesis workspace.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
