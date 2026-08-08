import { getApiBaseUrl } from "@/lib/auth";

/** Turn stored artwork paths into a loadable absolute URL (Nest file API). */
export function resolvePublicArtworkUrl(
  artworkFile: string | null | undefined,
): string | null {
  if (!artworkFile?.trim()) return null;
  const value = artworkFile.trim();

  if (/^https?:\/\//i.test(value)) return value;

  const apiOrigin = getApiBaseUrl().replace(/\/api\/?$/, "");

  const artworkMatch = value.match(/\/uploads\/artwork\/([^/?#]+)/i);
  if (artworkMatch) {
    return `${apiOrigin}/api/files/artwork/${artworkMatch[1]}`;
  }

  if (value.startsWith("/api/files/artwork/")) {
    return `${apiOrigin}${value}`;
  }

  // Bare image/pdf filename from legacy uploads
  if (/\.(png|jpe?g|gif|webp|svg|pdf|tiff?)$/i.test(value) && !value.includes("/")) {
    return `${apiOrigin}/api/files/artwork/${encodeURIComponent(value)}`;
  }

  if (value.startsWith("/")) return value;
  return null;
}

export function artworkDisplayName(artworkFile: string | null | undefined): string {
  if (!artworkFile?.trim()) return "artwork";
  const value = artworkFile.trim();
  try {
    if (/^https?:\/\//i.test(value)) {
      return decodeURIComponent(new URL(value).pathname.split("/").pop() || value);
    }
  } catch {
    /* ignore */
  }
  if (value.includes("/")) {
    return decodeURIComponent(value.split("/").pop() || value);
  }
  return value;
}
