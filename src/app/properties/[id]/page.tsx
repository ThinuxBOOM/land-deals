import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Check, Eye, MapPin } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PropertyViewCounter } from "@/components/property-view-counter";
import { PropertyGallery } from "@/components/property-gallery";
import { getProperties, getSiteSettings } from "@/lib/data";

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export default async function PropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [properties, settings] = await Promise.all([getProperties(), getSiteSettings()]);
  const property = properties.find((item) => item.id === id);
  if (!property) notFound();
  const images = property.property_images.map((image) => image.image_url);
  const whatsapp = settings.whatsapp_number.replace(/\D/g, "");
  const message = encodeURIComponent(`Hi, I am interested in ${property.title} (ID: ${property.id})`);
  const whatsAppLink = whatsapp ? `https://wa.me/${whatsapp}?text=${message}` : null;

  return (
    <>
      <SiteHeader />
      <PropertyViewCounter propertyId={property.id} />
      <main className="mx-auto max-w-[1400px] px-5 py-8 md:px-10 md:py-12">
        <Link href="/#properties" className="inline-flex items-center gap-2 text-sm text-muted hover:text-forest"><ArrowLeft size={16} /> Back to properties</Link>
        <div className="relative mt-7">
          <PropertyGallery images={images} title={property.title} />
          <span className={`absolute left-5 top-5 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[.1em] ${property.status === "sold" ? "bg-[#323d36] text-white" : "bg-white text-forest"}`}>{property.status === "sold" ? "Sold" : "For sale"}</span>
        </div>
        <div className="grid gap-12 py-10 md:grid-cols-[1fr_350px] md:py-14">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#7b887d]">{property.property_type}</p>
            <h1 className="editorial-serif mt-3 text-4xl leading-tight text-ink md:text-6xl">{property.title}</h1>
            <p className="mt-4 flex items-center gap-2 text-base text-muted"><MapPin size={17} />{property.location}</p>
            <div className="mt-8 border-t border-[#e3e7e0] pt-7">
              <h2 className="text-lg font-semibold text-ink">A little about this place</h2>
              <p className="mt-4 whitespace-pre-line text-[15px] leading-7 text-[#59665d]">{property.description || "A wonderful opportunity to make a place your own. Get in touch to learn more about this property."}</p>
            </div>
            <div className="mt-8 border-t border-[#e3e7e0] pt-7">
              <h2 className="text-lg font-semibold text-ink">The details</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {[["Property type", property.property_type[0].toUpperCase() + property.property_type.slice(1)], ["Availability", property.status === "sold" ? "Sold" : "For sale"], ["Location", property.location], ["Views", property.views_count.toLocaleString()]].map(([label, value]) => <div key={label} className="flex items-center justify-between border-b border-[#edf0eb] pb-3 text-sm"><span className="text-muted">{label}</span><span className="font-medium capitalize text-ink">{value}</span></div>)}
              </div>
            </div>
            {property.features.length > 0 && <div className="mt-8 border-t border-[#e3e7e0] pt-7">
              <h2 className="text-lg font-semibold text-ink">Features &amp; amenities</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">{property.features.map((feature) => <li key={feature} className="flex items-center gap-2 text-sm text-[#59665d]"><Check size={15} className="text-forest" />{feature}</li>)}</ul>
            </div>}
            <div className="mt-8 flex items-center gap-2 text-sm text-muted"><Eye size={16} /> {property.views_count.toLocaleString()} people have viewed this place</div>
          </div>
          <aside className="h-fit rounded-2xl border border-[#e2e7df] bg-white p-6 shadow-[0_12px_35px_rgba(29,51,40,.05)] md:sticky md:top-8">
            <p className="text-xs uppercase tracking-[.16em] text-[#7b887d]">Asking price</p>
            <p className="mt-2 text-3xl font-semibold tracking-[-.04em] text-ink">{money.format(property.price)}</p>
            <div className="mt-6 border-t border-[#edf0eb] pt-5">
              <p className="text-sm font-semibold text-ink">Curious about this one?</p>
              <p className="mt-2 text-sm leading-6 text-muted">We&apos;re happy to answer questions and help you take a closer look.</p>
            </div>
            {whatsAppLink ? <a href={whatsAppLink} target="_blank" rel="noreferrer" className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#244b38] px-5 py-3.5 text-sm font-medium text-white hover:bg-[#193b29]">Ask us on WhatsApp <ArrowUpRight size={16} /></a> : <p className="mt-6 rounded-xl bg-[#f4f6f2] p-4 text-sm text-muted">Contact details haven&apos;t been added yet.</p>}
            <p className="mt-4 flex items-center justify-center gap-2 text-[11px] text-[#87938a]"><Check size={13} /> No pressure. Just a conversation.</p>
          </aside>
        </div>
      </main>
      {whatsAppLink && <a href={whatsAppLink} target="_blank" rel="noreferrer" className="fixed bottom-5 right-5 z-20 rounded-full bg-[#244b38] px-5 py-3.5 text-sm font-medium text-white shadow-[0_8px_24px_rgba(29,51,40,.28)] transition hover:-translate-y-0.5 hover:bg-[#193b29]">WhatsApp about this property</a>}
      <SiteFooter />
    </>
  );
}
