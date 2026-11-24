import { createClient } from "@/lib/supabase/server";
import type { PropertyWithImages, SiteSettings } from "@/types/database";

export const defaultSettings: SiteSettings = {
  id: 1,
  broker_name: "Field & Found",
  whatsapp_number: "",
  display_email: "",
  instagram_url: "",
  facebook_url: "",
};

export async function getProperties(): Promise<PropertyWithImages[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .select("*, property_images(id, image_url)")
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Unable to load properties: ${error.message}`);
  return (data ?? []) as PropertyWithImages[];
}

export async function getProperty(id: string): Promise<PropertyWithImages | null> {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) return null;
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .select("*, property_images(id, image_url)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`Unable to load property: ${error.message}`);
  return data as PropertyWithImages | null;
}

export async function getSiteSettings(): Promise<SiteSettings> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return defaultSettings;
  }
  const supabase = await createClient();
  const { data, error } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
  if (error) throw new Error(`Unable to load site settings: ${error.message}`);
  return data ?? defaultSettings;
}
