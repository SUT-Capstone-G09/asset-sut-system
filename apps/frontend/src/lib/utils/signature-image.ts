// Shared helpers for signature image handling — used by both the booking-
// confirm SignaturePad and the profile page's saved-signature manager.

export async function dataUrlToFile(dataUrl: string, filename = "signature.png"): Promise<File> {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return new File([blob], filename, { type: "image/png" });
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Signature must be a mostly-transparent PNG (transparent canvas with only
// opaque pen strokes), not a flat-colored background — require a meaningful
// fraction of pixels to be transparent rather than just one, otherwise a
// solid-background scan with a single faked corner pixel would pass. Mirrors
// hasTransparentBackground() in apps/backend/internal/services/signature.go,
// which is the check that actually matters since this one only saves the
// user a round-trip — the backend re-validates regardless.
const MIN_TRANSPARENT_PIXEL_RATIO = 0.2;

export function hasTransparentBackground(dataUrl: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) { resolve(true); return; }
      ctx.drawImage(img, 0, 0);
      try {
        const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
        let transparent = 0;
        let total = 0;
        for (let i = 3; i < data.length; i += 4) {
          total++;
          if (data[i] < 128) transparent++;
        }
        resolve(total > 0 && transparent / total >= MIN_TRANSPARENT_PIXEL_RATIO);
      } catch {
        resolve(true); // can't read pixels (e.g. CORS) — don't block the user
      }
    };
    img.onerror = () => resolve(false);
    img.src = dataUrl;
  });
}
