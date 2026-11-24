"use client";

import { useEffect, useState, type FormEvent } from "react";
import { CheckCircle2, LoaderCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { SiteSettings } from "@/types/database";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>({ id: 1, broker_name: "", whatsapp_number: "", display_email: "", instagram_url: "", facebook_url: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      const { data, error: loadError } = await createClient().from("site_settings").select("*").eq("id", 1).maybeSingle();
      if (loadError) setError(loadError.message);
      else if (data) setSettings(data);
      setLoading(false);
    }
    void load();
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);
    const { error: saveError } = await createClient().from("site_settings").upsert({ ...settings, id: 1 });
    if (saveError) setError(saveError.message);
    else setSaved(true);
    setSaving(false);
  }

  if (loading) return <div className="py-16 text-center text-sm text-muted">Loading settings…</div>;
  return (
    <div className="max-w-[800px]">
      <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#7b887d]">Your business</p>
      <h1 className="editorial-serif mt-2 text-4xl text-ink">Site settings</h1>
      <p className="mt-2 text-sm text-muted">These details show up on your public website and contact links.</p>
      {error && <p role="alert" className="mt-6 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {saved && <p role="status" className="mt-6 flex items-center gap-2 rounded-lg bg-[#eaf2e8] px-3 py-2 text-sm text-[#3d6948]"><CheckCircle2 size={16} /> Your settings have been saved.</p>}
      <form onSubmit={submit} className="mt-7 space-y-6 rounded-2xl border border-[#e3e8e1] bg-white p-5 md:p-8">
        <div><h2 className="text-sm font-semibold text-ink">Business information</h2><p className="mt-1 text-xs text-muted">Tell visitors who they&apos;re working with.</p></div>
        <label className="block text-sm font-medium text-ink">Business name<input required value={settings.broker_name} onChange={(event) => setSettings({ ...settings, broker_name: event.target.value })} className="admin-input mt-2" placeholder="Your brokerage" /></label>
        <label className="block text-sm font-medium text-ink">Display email<input type="email" value={settings.display_email} onChange={(event) => setSettings({ ...settings, display_email: event.target.value })} className="admin-input mt-2" placeholder="hello@example.com" /></label>
        <label className="block text-sm font-medium text-ink">WhatsApp phone number<input type="tel" value={settings.whatsapp_number} onChange={(event) => setSettings({ ...settings, whatsapp_number: event.target.value })} className="admin-input mt-2" placeholder="+1 555 123 4567" /><span className="mt-1.5 block text-xs font-normal text-muted">Include country code. Used for direct WhatsApp links.</span></label>
        <div className="border-t border-[#edf0eb] pt-5"><h2 className="text-sm font-semibold text-ink">Social profiles</h2><p className="mt-1 text-xs text-muted">Optional links shown in your website footer.</p></div>
        <label className="block text-sm font-medium text-ink">Instagram URL<input type="url" value={settings.instagram_url} onChange={(event) => setSettings({ ...settings, instagram_url: event.target.value })} className="admin-input mt-2" placeholder="https://instagram.com/yourprofile" /></label>
        <label className="block text-sm font-medium text-ink">Facebook URL<input type="url" value={settings.facebook_url} onChange={(event) => setSettings({ ...settings, facebook_url: event.target.value })} className="admin-input mt-2" placeholder="https://facebook.com/yourpage" /></label>
        <div className="border-t border-[#edf0eb] pt-5"><button disabled={saving} className="inline-flex items-center gap-2 rounded-full bg-forest px-6 py-3 text-sm font-medium text-white hover:bg-[#193b29] disabled:opacity-60">{saving && <LoaderCircle size={15} className="animate-spin" />}{saving ? "Saving…" : "Save settings"}</button></div>
      </form>
    </div>
  );
}
