import Link from "next/link";
import { ArrowUpRight, Facebook, Instagram } from "lucide-react";
import { getSiteSettings } from "@/lib/data";

export async function SiteFooter() {
  const settings = await getSiteSettings();
  const waLink = settings.whatsapp_number ? `https://wa.me/${settings.whatsapp_number.replace(/\D/g, "")}` : "#";
  return (
    <footer className="bg-[#1d3328] text-white">
      <div className="mx-auto grid max-w-[1400px] gap-12 px-5 py-14 md:grid-cols-[1.4fr_1fr_1fr] md:px-10 md:py-20">
        <div>
          <Link href="/" className="text-xl font-semibold tracking-[-.04em]">{settings.broker_name}</Link>
          <p className="mt-4 max-w-sm text-sm leading-6 text-white/65">Good land changes what&apos;s possible. Let&apos;s find the place that feels like your next chapter.</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[.18em] text-white/45">Explore</p>
          <div className="mt-5 flex flex-col gap-3 text-sm text-white/80">
            <Link href="/#properties" className="hover:text-white">Available properties</Link>
            <Link href="/#our-approach" className="hover:text-white">Our approach</Link>
          </div>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[.18em] text-white/45">Get in touch</p>
          {settings.display_email && <a href={`mailto:${settings.display_email}`} className="mt-5 block text-sm hover:text-white/70">{settings.display_email}</a>}
          {settings.whatsapp_number && <a href={waLink} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 text-sm hover:text-white/70">WhatsApp us <ArrowUpRight size={14} /></a>}
          {(settings.instagram_url || settings.facebook_url) && <div className="mt-5 flex gap-4">
            {settings.instagram_url && <a href={settings.instagram_url} target="_blank" rel="noreferrer" aria-label="Instagram" className="text-white/70 hover:text-white"><Instagram size={18} /></a>}
            {settings.facebook_url && <a href={settings.facebook_url} target="_blank" rel="noreferrer" aria-label="Facebook" className="text-white/70 hover:text-white"><Facebook size={18} /></a>}
          </div>}
        </div>
      </div>
      <div className="mx-auto flex max-w-[1400px] flex-col gap-2 border-t border-white/10 px-5 py-5 text-xs text-white/45 md:flex-row md:justify-between md:px-10">
        <span>© {new Date().getFullYear()} {settings.broker_name}. All rights reserved.</span>
        <Link href="/admin/login" className="hover:text-white/70">Admin</Link>
      </div>
    </footer>
  );
}
