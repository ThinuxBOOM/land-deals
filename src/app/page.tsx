import { ArrowDown, ArrowUpRight, Compass, Leaf, ShieldCheck } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PropertyGrid } from "@/components/property-grid";
import { getProperties, getSiteSettings } from "@/lib/data";

export default async function HomePage() {
  const [properties, settings] = await Promise.all([getProperties(), getSiteSettings()]);
  const contactHref = settings.whatsapp_number
    ? `https://wa.me/${settings.whatsapp_number.replace(/\D/g, "")}`
    : settings.display_email
      ? `mailto:${settings.display_email}`
      : "/#properties";
  const hasContact = Boolean(settings.whatsapp_number || settings.display_email);
  return (
    <>
      <SiteHeader />
      <main>
        <section className="hero-image relative flex min-h-[620px] items-center md:min-h-[690px]">
          <div className="mx-auto w-full max-w-[1400px] px-5 py-20 md:px-10">
            <div className="max-w-[740px] text-white">
              <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-[11px] font-medium uppercase tracking-[.17em] backdrop-blur"><span className="h-1.5 w-1.5 rounded-full bg-[#c4dbb8]" /> Land, homes & possibility</p>
              <h1 className="editorial-serif text-[54px] leading-[.99] tracking-[-.055em] md:text-[82px]">A little more<br />room to <em className="font-normal text-[#d3dfc5]">become.</em></h1>
              <p className="mt-7 max-w-[455px] text-base leading-7 text-white/80 md:text-lg">Good places have a way of changing what feels possible. Let&apos;s find the one that&apos;s yours.</p>
              <a href="#properties" className="mt-9 inline-flex items-center gap-3 rounded-full bg-[#f5f4ec] px-6 py-3.5 text-sm font-semibold text-forest transition hover:bg-white">Explore our properties <ArrowDown size={16} /></a>
            </div>
          </div>
          <div className="absolute bottom-7 right-5 hidden items-center gap-3 text-xs tracking-[.12em] text-white/75 md:flex md:right-10"><span>01</span><span className="h-px w-12 bg-white/50" /><span>THE GOOD GROUND</span></div>
        </section>

        <div className="border-b border-[#e5e9e3] bg-[#f0f2ec]">
          <div className="mx-auto grid max-w-[1400px] gap-6 px-5 py-7 sm:grid-cols-3 md:px-10">
            {[["01", "A human approach", "Good advice, no hard sell."], ["02", "Places with promise", "Selected for more than just the view."], ["03", "Here for the long run", "From first question to front door."]].map(([number, title, copy]) => (
              <div key={number} className="flex gap-4"><span className="pt-1 text-xs text-[#8a948b]">{number}</span><div><h2 className="text-sm font-semibold text-ink">{title}</h2><p className="mt-1 text-sm text-muted">{copy}</p></div></div>
            ))}
          </div>
        </div>

        <PropertyGrid properties={properties} />

        <section id="our-approach" className="border-y border-[#e5e9e3] bg-[#eff1eb]">
          <div className="mx-auto grid max-w-[1400px] gap-10 px-5 py-16 md:grid-cols-[.9fr_1.1fr] md:items-center md:px-10 md:py-24">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[.2em] text-[#7b887d]">A different kind of search</p>
              <h2 className="editorial-serif mt-4 max-w-lg text-4xl leading-[1.08] text-ink md:text-5xl">The right place is more than an address.</h2>
            </div>
            <div>
              <p className="max-w-xl text-base leading-7 text-[#59665d]">It&apos;s where a plan gets a little clearer. Where the morning light lands just right. We listen first, then help you find land and homes that make sense for your life—not someone else&apos;s checklist.</p>
              <div className="mt-7 flex flex-wrap gap-3">
                {[["Leaf", "Rooted in place"], ["Compass", "Guided by good sense"], ["ShieldCheck", "Straightforward advice"]].map(([icon, label]) => {
                  const Icon = icon === "Leaf" ? Leaf : icon === "Compass" ? Compass : ShieldCheck;
                  return <span key={label} className="inline-flex items-center gap-2 rounded-full border border-[#dce2db] bg-white/70 px-4 py-2.5 text-xs font-medium text-forest"><Icon size={15} />{label}</span>;
                })}
              </div>
            </div>
          </div>
        </section>
        <section id="contact" className="mx-auto flex max-w-[1400px] flex-col justify-between gap-6 px-5 py-16 md:flex-row md:items-center md:px-10 md:py-20">
          <div><p className="text-xs font-semibold uppercase tracking-[.2em] text-[#7b887d]">Start somewhere</p><h2 className="editorial-serif mt-3 text-4xl text-ink">Tell us what you&apos;re dreaming up.</h2></div>
          <a href={contactHref} target={settings.whatsapp_number ? "_blank" : undefined} rel={settings.whatsapp_number ? "noreferrer" : undefined} className="inline-flex w-fit items-center gap-2 rounded-full bg-forest px-6 py-3.5 text-sm font-medium text-white hover:bg-[#193b29]">{hasContact ? "Get in touch" : "Explore properties"} <ArrowUpRight size={16} /></a>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
