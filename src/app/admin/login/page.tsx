"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, KeyRound } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("error") === "unauthorized") {
      setError("This account is not authorized to access the admin dashboard.");
    }
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { error: signInError } = await createClient().auth.signInWithPassword({ email, password });
      if (signInError) setError(signInError.message);
      else window.location.assign("/admin");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-[#f7f7f2] md:grid-cols-2">
      <div className="hidden bg-[#1d3328] p-12 text-white md:flex md:flex-col md:justify-between">
        <Link href="/" className="text-lg font-semibold tracking-[-.04em]">Field & Found</Link>
        <div><p className="text-xs uppercase tracking-[.2em] text-white/50">A little more room to become.</p><h1 className="editorial-serif mt-5 max-w-lg text-6xl leading-[1.05]">Good places.<br /><em className="font-normal text-[#d3dfc5]">Good people.</em></h1><p className="mt-5 max-w-sm text-sm leading-6 text-white/65">Your workspace for sharing thoughtful places with the people who will make them home.</p></div>
        <span className="text-xs text-white/40">Property management</span>
      </div>
      <div className="flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-[420px]">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted hover:text-forest"><ArrowLeft size={15} /> Back to website</Link>
          <div className="mt-12 flex h-12 w-12 items-center justify-center rounded-full bg-[#e7eee5] text-forest"><KeyRound size={20} /></div>
          <h2 className="editorial-serif mt-6 text-4xl text-ink">Welcome back.</h2>
          <p className="mt-2 text-sm text-muted">Sign in to manage your property listings.</p>
          {!isSupabaseConfigured() ? (
            <div className="mt-8 rounded-xl border border-[#e3c9a9] bg-[#fff9ed] p-4 text-sm leading-6 text-[#755728]">Supabase isn&apos;t configured. Add <code className="rounded bg-white px-1">NEXT_PUBLIC_SUPABASE_URL</code> and <code className="rounded bg-white px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to <code className="rounded bg-white px-1">.env.local</code>, then create an admin user in Supabase.</div>
          ) : (
            <form onSubmit={submit} className="mt-8 space-y-4">
              <label className="block text-sm font-medium text-ink">Email<input className="admin-input mt-2" autoComplete="email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></label>
              <label className="block text-sm font-medium text-ink">Password<input className="admin-input mt-2" autoComplete="current-password" type="password" required value={password} onChange={(event) => setPassword(event.target.value)} /></label>
              {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
              <button disabled={loading} className="w-full rounded-full bg-forest px-5 py-3.5 text-sm font-medium text-white hover:bg-[#193b29] disabled:opacity-60">{loading ? "Signing in…" : "Sign in"}</button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
