"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Building2, CircleUserRound, LayoutDashboard, LogOut, Settings2 } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

const links = [
  { href: "/admin", label: "Listings", icon: LayoutDashboard },
  { href: "/admin/settings", label: "Site settings", icon: Settings2 },
];

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(pathname === "/admin/login");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (pathname === "/admin/login") {
      setAuthorized(true);
      return;
    }
    if (!isSupabaseConfigured()) {
      router.replace("/admin/login");
      return;
    }
    const supabase = createClient();
    void supabase.auth.getUser().then(({ data, error }) => {
      if (error || !data.user || data.user.app_metadata?.role !== "admin") router.replace("/admin/login?error=unauthorized");
      else {
        setEmail(data.user.email ?? "");
        setAuthorized(true);
      }
    });
  }, [pathname, router]);

  if (pathname === "/admin/login") return <>{children}</>;
  if (!authorized) return <div className="grid min-h-screen place-items-center bg-[#f7f7f2] text-sm text-muted">Checking your session…</div>;

  async function signOut() {
    const { error } = await createClient().auth.signOut();
    if (error) {
      console.error("Unable to sign out:", error.message);
      return;
    }
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[#f7f7f2] md:grid md:grid-cols-[250px_1fr]">
      <aside className="flex flex-col border-b border-[#e4e9e2] bg-white px-5 py-5 md:sticky md:top-0 md:h-screen md:border-b-0 md:border-r md:px-6 md:py-7">
        <Link href="/admin" className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-forest text-xl text-white">f.</span>
          <span><span className="block text-sm font-semibold tracking-[-.03em] text-ink">Field & Found</span><span className="mt-0.5 block text-[11px] text-muted">Property admin</span></span>
        </Link>
        <nav className="mt-8 flex gap-2 md:flex-col">
          {links.map(({ href, label, icon: Icon }) => {
            const active = href === "/admin" ? pathname === href || pathname.startsWith("/admin/properties") : pathname.startsWith(href);
            return <Link key={href} href={href} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${active ? "bg-[#edf2eb] font-medium text-forest" : "text-[#657168] hover:bg-[#f5f7f3] hover:text-ink"}`}><Icon size={17} />{label}</Link>;
          })}
        </nav>
        <div className="mt-auto hidden border-t border-[#edf0eb] pt-5 md:block">
          <div className="flex items-center gap-2 text-xs text-muted"><CircleUserRound size={15} /><span className="truncate">{email}</span></div>
          <button onClick={signOut} className="mt-4 flex items-center gap-2 text-xs text-[#657168] hover:text-ink"><LogOut size={14} /> Sign out</button>
        </div>
        <div className="mt-4 flex gap-4 md:hidden">
          <span className="flex items-center gap-2 text-xs text-muted"><CircleUserRound size={14} />{email}</span>
          <button onClick={signOut} className="flex items-center gap-2 text-xs text-[#657168]"><LogOut size={14} />Sign out</button>
        </div>
      </aside>
      <div className="min-w-0">
        <div className="flex h-[60px] items-center justify-between border-b border-[#e5e9e3] px-5 md:px-9">
          <span className="text-sm text-muted">Workspace <span className="px-1 text-[#a2aba3]">/</span> <span className="capitalize text-ink">{pathname === "/admin" ? "Listings" : pathname.split("/").pop()?.replaceAll("-", " ")}</span></span>
          <Link href="/" target="_blank" className="inline-flex items-center gap-2 text-xs text-forest hover:underline"><Building2 size={15} /> View website</Link>
        </div>
        <main className="mx-auto max-w-[1250px] px-5 py-7 md:px-9 md:py-10">{children}</main>
      </div>
    </div>
  );
}
