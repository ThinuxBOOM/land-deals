import Link from "next/link";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { getSiteSettings } from "@/lib/data";

export async function SiteHeader() {
  const settings = await getSiteSettings();
  const whatsappLink = settings.whatsapp_number
    ? `https://wa.me/${settings.whatsapp_number.replace(/\D/g, "")}`
    : null;
  return (
    <header className="relative z-10 border-b border-[#e6e9e3] bg-[#f7f7f2]">
      <div className="mx-auto flex h-[78px] max-w-[1400px] items-center justify-between px-5 md:px-10">
        <Link href="/" className="flex shrink-0 items-center gap-3" aria-label="Field & Found home">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-forest text-white">
            <span className="text-xl leading-none">f.</span>
          </span>
          <span className="whitespace-nowrap text-[15px] font-semibold tracking-[-.03em] text-ink">{settings.broker_name}</span>
        </Link>
        <nav className="hidden items-center gap-9 text-sm text-[#526056] md:flex">
          <Link className="transition hover:text-forest" href="/#properties">Properties</Link>
          <Link className="transition hover:text-forest" href="/#our-approach">Our approach</Link>
          {settings.display_email && <a className="transition hover:text-forest" href={`mailto:${settings.display_email}`}>Contact</a>}
        </nav>
        <a
          href={whatsappLink ?? (settings.display_email ? `mailto:${settings.display_email}` : "/#contact")}
          target={whatsappLink ? "_blank" : undefined}
          rel={whatsappLink ? "noreferrer" : undefined}
          className="hidden items-center gap-2 rounded-full bg-forest px-5 py-3 text-sm font-medium text-white transition hover:bg-[#193b29] md:flex"
        >
          Let&apos;s talk <ArrowUpRight size={15} />
        </a>
        <Link href="/#properties" className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[#dce2db] px-3.5 py-2.5 text-xs font-medium text-forest transition hover:bg-white md:hidden" aria-label="Browse properties">Browse <ArrowDown size={14} /></Link>
      </div>
    </header>
  );
}
