"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function PropertyGallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState(0);
  const currentImage = images[active];
  const changeImage = (direction: number) => setActive((current) => (current + direction + images.length) % images.length);

  return (
    <div>
      <div className="property-image relative min-h-[340px] overflow-hidden rounded-2xl bg-[#e1e7df] md:min-h-[560px]" style={currentImage ? { backgroundImage: `url("${currentImage}")` } : undefined} role={currentImage ? "img" : undefined} aria-label={currentImage ? `${title}, photo ${active + 1} of ${images.length}` : undefined}>
        {!currentImage && <div className="grid h-full min-h-[340px] place-items-center text-sm text-[#87938a]">Image coming soon</div>}
        {images.length > 1 && <>
          <button type="button" onClick={() => changeImage(-1)} aria-label="Previous photo" className="absolute left-4 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink shadow hover:bg-white"><ChevronLeft size={20} /></button>
          <button type="button" onClick={() => changeImage(1)} aria-label="Next photo" className="absolute right-4 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink shadow hover:bg-white"><ChevronRight size={20} /></button>
          <span className="absolute bottom-4 right-4 rounded-full bg-[#1d3328]/75 px-3 py-1.5 text-xs text-white">{active + 1} / {images.length}</span>
        </>}
      </div>
      {images.length > 1 && <div className="mt-3 flex gap-2 overflow-x-auto pb-1">{images.map((image, index) => <button key={`${image}-${index}`} type="button" onClick={() => setActive(index)} aria-label={`Show photo ${index + 1}`} aria-current={active === index} className={`property-image h-[76px] w-[100px] shrink-0 rounded-lg bg-[#e1e7df] ${active === index ? "ring-2 ring-forest ring-offset-2" : "opacity-70 hover:opacity-100"}`} style={{ backgroundImage: `url("${image}")` }} />)}</div>}
    </div>
  );
}
