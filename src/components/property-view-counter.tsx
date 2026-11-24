"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export function PropertyViewCounter({ propertyId }: { propertyId: string }) {
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const key = `property-viewed-${propertyId}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "pending");
    void (async () => {
      try {
        const { error } = await createClient().rpc("increment_property_views", { property_id: propertyId });
        if (error) {
          sessionStorage.removeItem(key);
          console.error("Unable to record property view:", error.message);
        } else {
          sessionStorage.setItem(key, "1");
        }
      } catch (error: unknown) {
        sessionStorage.removeItem(key);
        console.error("Unable to record property view:", error);
      }
    })();
  }, [propertyId]);
  return null;
}
