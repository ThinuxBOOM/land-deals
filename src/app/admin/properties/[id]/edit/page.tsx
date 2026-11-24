"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PropertyForm } from "@/components/property-form";
import { createClient } from "@/lib/supabase/client";
import type { PropertyWithImages } from "@/types/database";

export default function EditPropertyPage() {
  const params = useParams<{ id: string }>();
  const [property, setProperty] = useState<PropertyWithImages | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const { data, error: loadError } = await createClient().from("properties").select("*, property_images(image_url, id)").eq("id", params.id).maybeSingle();
      if (loadError) setError(loadError.message);
      else if (!data) setError("This listing could not be found.");
      else setProperty(data as PropertyWithImages);
    }
    void load();
  }, [params.id]);

  if (error) return <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">{error}</div>;
  if (!property) return <div className="py-16 text-center text-sm text-muted">Loading listing…</div>;
  return <PropertyForm initial={property} />;
}
