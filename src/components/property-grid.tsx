"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight, Eye, MapPin, Search, SlidersHorizontal } from "lucide-react";
import type { PropertyWithImages } from "@/types/database";

const categoryNames = { land: "Land", apartment: "Apartment", house: "House" };
const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export function PropertyGrid({ properties }: { properties: PropertyWithImages[] }) {
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [location, setLocation] = useState("");
  const [minimum, setMinimum] = useState("");
  const [maximum, setMaximum] = useState("");

  const filtered = useMemo(() => properties.filter((property) => {
    const matchesCategory = category === "all" || property.property_type === category;
    const matchesStatus = status === "all" || property.status === status;
    const matchesLocation = property.location.toLowerCase().includes(location.trim().toLowerCase());
    const matchesMinimum = !minimum || property.price >= Number(minimum);
    const matchesMaximum = !maximum || property.price <= Number(maximum);
    return matchesCategory && matchesStatus && matchesLocation && matchesMinimum && matchesMaximum;
  }), [category, status, location, minimum, maximum, properties]);

  return (
    <section id="properties" className="mx-auto max-w-[1400px] px-5 py-20 md:px-10 md:py-28">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.2em] text-[#7b887d]">A considered collection</p>
          <h2 className="editorial-serif mt-3 text-4xl text-ink md:text-5xl">Find your place in it.</h2>
        </div>
        <p className="max-w-sm text-sm leading-6 text-muted">A few good places, each with a little room for what comes next.</p>
      </div>

      <div className="mt-9 rounded-2xl border border-[#e3e7e0] bg-white p-4 shadow-[0_8px_24px_rgba(29,51,40,.035)]">
        <div className="mb-3 flex items-center gap-2 px-1 text-[11px] font-semibold uppercase tracking-[.16em] text-[#7b887d]"><SlidersHorizontal size={13} /> Refine your search</div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.1fr_1fr_1.2fr_.8fr_.8fr]">
          <label className="relative">
            <span className="sr-only">Search location</span>
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#89938b]" />
            <input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Search a location" className="admin-input input-with-icon h-11 text-sm" />
          </label>
          <select value={category} onChange={(event) => setCategory(event.target.value)} className="admin-input h-11 text-sm">
            <option value="all">All property types</option><option value="land">Land</option><option value="apartment">Apartments</option><option value="house">Houses</option>
          </select>
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="admin-input h-11 text-sm">
            <option value="all">Any availability</option><option value="available">For sale</option><option value="sold">Sold</option>
          </select>
          <input type="number" min="0" value={minimum} onChange={(event) => setMinimum(event.target.value)} placeholder="Min price" className="admin-input h-11 text-sm" aria-label="Minimum price" />
          <input type="number" min="0" value={maximum} onChange={(event) => setMaximum(event.target.value)} placeholder="Max price" className="admin-input h-11 text-sm" aria-label="Maximum price" />
        </div>
      </div>

      <div className="mt-7 flex items-center justify-between text-sm text-muted">
        <span>{filtered.length} {filtered.length === 1 ? "property" : "properties"}</span>
        <span className="hidden sm:block">Curated with care, not just clicks.</span>
      </div>
      {filtered.length ? (
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((property) => {
            const image = property.property_images[0]?.image_url;
            return (
              <Link href={`/properties/${property.id}`} key={property.id} className="group overflow-hidden rounded-2xl border border-[#e6e9e3] bg-white transition duration-300 hover:-translate-y-1 hover:shadow-card">
                <div className="property-image relative h-[245px] bg-[#e1e7df]" style={image ? { backgroundImage: `url("${image}")` } : undefined}>
                  {!image && <div className="grid h-full place-items-center text-sm text-[#87938a]">Image coming soon</div>}
                  <span className={`absolute left-4 top-4 rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[.1em] ${property.status === "sold" ? "bg-[#323d36] text-white" : "bg-white text-forest"}`}>{property.status === "sold" ? "Sold" : "For sale"}</span>
                  <span className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-medium text-ink">{categoryNames[property.property_type]}</span>
                  <span className="absolute bottom-4 right-4 flex items-center gap-1 rounded-full bg-[#1d3328]/75 px-2.5 py-1.5 text-[11px] text-white"><Eye size={13} /> {property.views_count}</span>
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-lg font-medium tracking-[-.03em] text-ink">{property.title}</h3>
                    <ArrowUpRight size={18} className="mt-1 shrink-0 text-[#9aa39c] transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-forest" />
                  </div>
                  <p className="mt-2 flex items-center gap-1.5 text-sm text-muted"><MapPin size={14} /> {property.location}</p>
                  <div className="mt-5 flex items-center justify-between border-t border-[#edf0eb] pt-4">
                    <span className="text-lg font-semibold tracking-[-.03em] text-ink">{money.format(property.price)}</span>
                    <span className="text-xs text-[#8b948d]">{property.views_count.toLocaleString()} views</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="mt-5 rounded-2xl border border-dashed border-[#d9e0d8] bg-white px-6 py-16 text-center">
          <h3 className="editorial-serif text-2xl text-ink">Nothing just yet.</h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">{properties.length ? "Try widening your filters and see what else might fit." : "We’re preparing a thoughtful collection. Check back soon or get in touch and tell us what you’re looking for."}</p>
          {(location || category !== "all" || status !== "all" || minimum || maximum) && <button onClick={() => { setCategory("all"); setStatus("all"); setLocation(""); setMinimum(""); setMaximum(""); }} className="mt-5 rounded-full border border-[#dce2db] px-4 py-2 text-sm text-forest hover:bg-sage">Clear filters</button>}
        </div>
      )}
    </section>
  );
}
