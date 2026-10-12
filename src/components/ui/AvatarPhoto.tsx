"use client";

import { useState } from "react";

type AvatarPhotoProps = {
  // The user's profile photo (Cloudinary URL), or null/undefined for none.
  src?: string | null;
  alt: string;
};

// Layered over an initials circle (which must be `relative overflow-hidden`):
// covers the initials when the user has a photo, and disappears -- leaving
// the initials -- when they don't or it fails to load. A plain <img>: the
// photo is already a small square from Cloudinary, and next/image would need
// its own remote-host config for no gain.
export default function AvatarPhoto({ src, alt }: AvatarPhotoProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  if (!src || src === failedSrc) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailedSrc(src)}
      className="absolute inset-0 h-full w-full object-cover"
    />
  );
}
