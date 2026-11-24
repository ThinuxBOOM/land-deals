"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowLeft, ImagePlus, LoaderCircle, Trash2, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { PropertyImage, PropertyType, PropertyWithImages } from "@/types/database";

type Props = { initial?: PropertyWithImages };
type PendingImage = { file: File; preview: string };

function safeFileName(name: string) {
  return name.normalize("NFKD").replace(/[^a-zA-Z0-9._-]/g, "-");
}

function storagePath(publicUrl: string) {
  const marker = "/storage/v1/object/public/property-images/";
  const index = publicUrl.indexOf(marker);
  return index < 0 ? null : decodeURIComponent(publicUrl.slice(index + marker.length));
}

export function PropertyForm({ initial }: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const pendingRef = useRef<PendingImage[]>([]);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [propertyType, setPropertyType] = useState<PropertyType>(initial?.property_type ?? "land");
  const [price, setPrice] = useState(initial?.price?.toString() ?? "");
  const [location, setLocation] = useState(initial?.location ?? "");
  const [features, setFeatures] = useState(initial?.features?.join(", ") ?? "");
  const [status, setStatus] = useState(initial?.status ?? "available");
  const [existingImages, setExistingImages] = useState<Pick<PropertyImage, "id" | "image_url">[]>(initial?.property_images.map((image) => ({ id: image.id, image_url: image.image_url })) ?? []);
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => () => pendingRef.current.forEach(({ preview }) => URL.revokeObjectURL(preview)), []);

  function chooseFiles(files: FileList | null) {
    if (!files) return;
    const additions = Array.from(files).filter((file) => file.type.startsWith("image/")).map((file) => ({ file, preview: URL.createObjectURL(file) }));
    pendingRef.current = [...pendingRef.current, ...additions];
    setPendingImages(pendingRef.current);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function removeExisting(image: Pick<PropertyImage, "id" | "image_url">) {
    const client = createClient();
    const path = storagePath(image.image_url);
    if (path) {
      const { error: storageError } = await client.storage.from("property-images").remove([path]);
      if (storageError) { setError(`Could not remove image: ${storageError.message}`); return; }
    }
    const { error: rowError } = await client.from("property_images").delete().eq("id", image.id);
    if (rowError) { setError(rowError.message); return; }
    setExistingImages((current) => current.filter((item) => item.id !== image.id));
  }

  function removePending(index: number) {
    setPendingImages((current) => {
      const image = current[index];
      URL.revokeObjectURL(image.preview);
      pendingRef.current = current.filter((_, position) => position !== index);
      return pendingRef.current;
    });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSaving(true);
    const client = createClient();
    const values = { title: title.trim(), description: description.trim() || null, property_type: propertyType, price: Number(price), location: location.trim(), features: features.split(",").map((feature) => feature.trim()).filter(Boolean), status };
    try {
      let propertyId = initial?.id;
      if (initial) {
        const { error: updateError } = await client.from("properties").update(values).eq("id", initial.id);
        if (updateError) throw new Error(updateError.message);
      } else {
        const { data, error: insertError } = await client.from("properties").insert(values).select("id").single();
        if (insertError) throw new Error(insertError.message);
        propertyId = data.id;
      }
      if (!propertyId) throw new Error("The property could not be saved.");

      for (const { file } of pendingImages) {
        const path = `${propertyId}/${crypto.randomUUID()}-${safeFileName(file.name)}`;
        const { error: uploadError } = await client.storage.from("property-images").upload(path, file, { upsert: false, contentType: file.type });
        if (uploadError) throw new Error(`Property was saved, but an image could not be uploaded: ${uploadError.message}`);
        const { data: urlData } = client.storage.from("property-images").getPublicUrl(path);
        const { error: imageError } = await client.from("property_images").insert({ property_id: propertyId, image_url: urlData.publicUrl });
        if (imageError) {
          const { error: removeError } = await client.storage.from("property-images").remove([path]);
          if (removeError) console.error("Unable to remove an unlinked property image:", removeError.message);
          throw new Error(`Property was saved, but its image could not be linked: ${imageError.message}`);
        }
      }
      router.push("/admin");
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to save the property.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-[850px]">
      <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-muted hover:text-forest"><ArrowLeft size={15} /> All listings</Link>
      <div className="mt-6"><p className="text-xs font-semibold uppercase tracking-[.18em] text-[#7b887d]">{initial ? "Edit property" : "New listing"}</p><h1 className="editorial-serif mt-2 text-4xl text-ink">{initial ? "Make it just right." : "Add a new place."}</h1><p className="mt-2 text-sm text-muted">Share the details that help someone picture themselves here.</p></div>
      <form onSubmit={submit} className="mt-7 space-y-6 rounded-2xl border border-[#e3e8e1] bg-white p-5 md:p-8">
        <div className="grid gap-5 md:grid-cols-2">
          <label className="text-sm font-medium text-ink md:col-span-2">Listing title<input required maxLength={150} value={title} onChange={(event) => setTitle(event.target.value)} className="admin-input mt-2" placeholder="e.g. Willow Creek Acres" /></label>
          <label className="text-sm font-medium text-ink">Property type<select value={propertyType} onChange={(event) => setPropertyType(event.target.value as PropertyType)} className="admin-input mt-2"><option value="land">Land</option><option value="apartment">Apartment</option><option value="house">House</option></select></label>
          <label className="text-sm font-medium text-ink">Price<input required type="number" min="0" step="0.01" value={price} onChange={(event) => setPrice(event.target.value)} className="admin-input mt-2" placeholder="0" /></label>
          <label className="text-sm font-medium text-ink md:col-span-2">Location<input required value={location} onChange={(event) => setLocation(event.target.value)} className="admin-input mt-2" placeholder="Town, region" /></label>
          <label className="text-sm font-medium text-ink md:col-span-2">Description<textarea rows={6} value={description} onChange={(event) => setDescription(event.target.value)} className="admin-input mt-2 resize-y" placeholder="What makes this place special?" /></label>
          <label className="text-sm font-medium text-ink md:col-span-2">Features &amp; amenities<textarea rows={3} value={features} onChange={(event) => setFeatures(event.target.value)} className="admin-input mt-2 resize-y" placeholder="Garden, creek frontage, power nearby" /><span className="mt-1.5 block text-xs font-normal text-muted">Separate each feature with a comma.</span></label>
          <label className="text-sm font-medium text-ink">Availability<select value={status} onChange={(event) => setStatus(event.target.value as "available" | "sold")} className="admin-input mt-2"><option value="available">For sale</option><option value="sold">Sold</option></select></label>
        </div>

        <div className="border-t border-[#edf0eb] pt-6">
          <div className="flex items-start justify-between gap-4"><div><h2 className="text-sm font-semibold text-ink">Property photos</h2><p className="mt-1 text-xs text-muted">Upload images directly to your Supabase storage.</p></div><button type="button" onClick={() => inputRef.current?.click()} className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[#dce2db] px-4 py-2 text-xs font-medium text-forest hover:bg-[#f5f7f3]"><ImagePlus size={15} /> Add photos</button></div>
          <input ref={inputRef} type="file" accept="image/*" multiple onChange={(event) => chooseFiles(event.target.files)} className="hidden" />
          {(existingImages.length > 0 || pendingImages.length > 0) ? <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {existingImages.map((image) => <div key={image.id} className="relative"><div className="property-image aspect-[4/3] rounded-xl bg-[#e4e9e2]" style={{ backgroundImage: `url("${image.image_url}")` }} /><button type="button" aria-label="Remove image" onClick={() => void removeExisting(image)} className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 text-[#a55a55] hover:bg-white"><X size={15} /></button></div>)}
            {pendingImages.map((image, index) => <div key={image.preview} className="relative"><div className="property-image aspect-[4/3] rounded-xl bg-[#e4e9e2]" style={{ backgroundImage: `url("${image.preview}")` }} /><button type="button" aria-label="Remove selected image" onClick={() => removePending(index)} className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 text-[#a55a55] hover:bg-white"><Trash2 size={14} /></button><span className="absolute bottom-2 left-2 rounded bg-white/90 px-2 py-1 text-[10px] text-ink">New photo</span></div>)}
          </div> : <button type="button" onClick={() => inputRef.current?.click()} className="mt-4 flex w-full flex-col items-center rounded-xl border border-dashed border-[#d9e0d8] bg-[#fafbf8] px-4 py-9 text-center hover:bg-[#f5f7f3]"><ImagePlus size={22} className="text-[#7b887d]" /><span className="mt-2 text-sm font-medium text-ink">Choose property photos</span><span className="mt-1 text-xs text-muted">PNG, JPG or WebP</span></button>}
        </div>
        {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <div className="flex flex-col-reverse justify-end gap-3 border-t border-[#edf0eb] pt-5 sm:flex-row"><Link href="/admin" className="rounded-full border border-[#dce2db] px-5 py-3 text-center text-sm text-ink hover:bg-[#f5f7f3]">Cancel</Link><button disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-full bg-forest px-6 py-3 text-sm font-medium text-white hover:bg-[#193b29] disabled:opacity-60">{saving && <LoaderCircle size={15} className="animate-spin" />}{saving ? "Saving…" : initial ? "Save changes" : "Create listing"}</button></div>
      </form>
    </div>
  );
}
