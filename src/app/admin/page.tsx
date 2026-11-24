"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowUpRight, Eye, LoaderCircle, MapPin, Plus, Search, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { PropertyWithImages } from "@/types/database";

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

function storagePath(publicUrl: string) {
  const marker = "/storage/v1/object/public/property-images/";
  const index = publicUrl.indexOf(marker);
  return index < 0 ? null : decodeURIComponent(publicUrl.slice(index + marker.length));
}

export default function AdminListingsPage() {
  const [properties, setProperties] = useState<PropertyWithImages[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError("");
    const { data, error: loadError } = await createClient().from("properties").select("*, property_images(image_url)").order("created_at", { ascending: false });
    if (loadError) setError(loadError.message);
    else setProperties((data ?? []) as PropertyWithImages[]);
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function toggleStatus(property: PropertyWithImages) {
    setUpdating(property.id);
    const nextStatus = property.status === "sold" ? "available" : "sold";
    const { error: updateError } = await createClient().from("properties").update({ status: nextStatus }).eq("id", property.id);
    if (updateError) setError(updateError.message);
    else setProperties((current) => current.map((item) => item.id === property.id ? { ...item, status: nextStatus } : item));
    setUpdating(null);
  }

  async function deleteProperty(property: PropertyWithImages) {
    if (!window.confirm(`Delete “${property.title}”? This cannot be undone.`)) return;
    setError("");
    const client = createClient();
    const { data: imageRows, error: imagesError } = await client.from("property_images").select("image_url").eq("property_id", property.id);
    if (imagesError) { setError(imagesError.message); return; }
    const paths = (imageRows ?? []).map((image) => storagePath(image.image_url)).filter((path): path is string => Boolean(path));
    if (paths.length) {
      const { error: storageError } = await client.storage.from("property-images").remove(paths);
      if (storageError) { setError(`Images could not be removed, so the listing was kept: ${storageError.message}`); return; }
    }
    const { error: deleteError } = await client.from("properties").delete().eq("id", property.id);
    if (deleteError) setError(deleteError.message);
    else setProperties((current) => current.filter((item) => item.id !== property.id));
  }

  const filtered = properties.filter((property) => `${property.title} ${property.location}`.toLowerCase().includes(search.toLowerCase()));
  const availableCount = properties.filter((property) => property.status === "available").length;
  const totalViews = properties.reduce((sum, property) => sum + property.views_count, 0);

  return (
    <>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="text-xs font-semibold uppercase tracking-[.18em] text-[#7b887d]">Your inventory</p><h1 className="editorial-serif mt-2 text-4xl text-ink">Property listings</h1><p className="mt-2 text-sm text-muted">Keep your collection up to date.</p></div>
        <Link href="/admin/properties/new" className="inline-flex items-center justify-center gap-2 rounded-full bg-forest px-5 py-3 text-sm font-medium text-white hover:bg-[#193b29]"><Plus size={16} /> Add a property</Link>
      </div>
      <div className="mt-7 grid gap-3 sm:grid-cols-3">
        {[["Total properties", properties.length], ["Available", availableCount], ["Property views", totalViews.toLocaleString()]].map(([label, value]) => <div key={label} className="rounded-xl border border-[#e4e9e2] bg-white p-4"><p className="text-xs text-muted">{label}</p><p className="mt-2 text-2xl font-semibold tracking-[-.04em] text-ink">{value}</p></div>)}
      </div>
      {error && <div role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      <div className="mt-7 overflow-hidden rounded-2xl border border-[#e3e8e1] bg-white">
        <div className="flex flex-col justify-between gap-3 border-b border-[#edf0eb] px-4 py-4 sm:flex-row sm:items-center sm:px-5">
          <h2 className="text-sm font-semibold text-ink">All properties <span className="ml-1 font-normal text-muted">({properties.length})</span></h2>
          <label className="relative w-full sm:max-w-[270px]"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#89938b]" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search listings" className="admin-input h-10 pl-9 text-sm" /></label>
        </div>
        {loading ? <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted"><LoaderCircle size={17} className="animate-spin" /> Loading properties…</div> : filtered.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-[#f8f9f6] text-[11px] uppercase tracking-[.1em] text-[#7b887d]"><tr><th className="px-5 py-3 font-medium">Property</th><th className="px-4 py-3 font-medium">Price</th><th className="px-4 py-3 font-medium">Status</th><th className="px-4 py-3 font-medium">Views</th><th className="px-4 py-3 text-right font-medium">Actions</th></tr></thead>
              <tbody className="divide-y divide-[#edf0eb]">
                {filtered.map((property) => (
                  <tr key={property.id} className="hover:bg-[#fcfcfa]">
                    <td className="px-5 py-4"><div className="flex items-center gap-3"><div className="property-image h-12 w-16 shrink-0 rounded-lg bg-[#e4e9e2]" style={property.property_images[0]?.image_url ? { backgroundImage: `url("${property.property_images[0].image_url}")` } : undefined} /><div><Link href={`/admin/properties/${property.id}/edit`} className="font-medium text-ink hover:text-forest">{property.title}</Link><p className="mt-1 flex items-center gap-1 text-xs text-muted"><MapPin size={12} />{property.location}</p></div></div></td>
                    <td className="px-4 py-4 font-medium text-ink">{money.format(property.price)}</td>
                    <td className="px-4 py-4"><button disabled={updating === property.id} onClick={() => void toggleStatus(property)} className={`rounded-full px-3 py-1.5 text-xs font-medium ${property.status === "available" ? "bg-[#eaf2e8] text-[#3d6948]" : "bg-[#f1f2ef] text-[#68716b]"}`}>{updating === property.id ? "Updating…" : property.status === "available" ? "For sale" : "Sold"}</button></td>
                    <td className="px-4 py-4 text-muted"><span className="inline-flex items-center gap-1.5"><Eye size={14} />{property.views_count}</span></td>
                    <td className="px-4 py-4"><div className="flex justify-end gap-3"><Link href={`/properties/${property.id}`} target="_blank" className="text-muted hover:text-forest" aria-label="View listing"><ArrowUpRight size={17} /></Link><Link href={`/admin/properties/${property.id}/edit`} className="text-xs font-medium text-forest hover:underline">Edit</Link><button onClick={() => void deleteProperty(property)} className="text-[#a55a55] hover:text-red-700" aria-label={`Delete ${property.title}`}><Trash2 size={16} /></button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <div className="px-5 py-16 text-center"><h3 className="editorial-serif text-2xl text-ink">{properties.length ? "No listings found." : "A blank canvas."}</h3><p className="mt-2 text-sm text-muted">{properties.length ? "Try another search." : "Add your first property to get started."}</p>{!properties.length && <Link href="/admin/properties/new" className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-forest hover:underline"><Plus size={15} /> Add a property</Link>}</div>}
      </div>
    </>
  );
}

