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
  if (!artworkFile?.trim()) return "Artwork file";
  const value = artworkFile.trim();
  let raw = value;
  try {
    if (/^https?:\/\//i.test(value)) {
      raw = decodeURIComponent(new URL(value).pathname.split("/").pop() || value);
    } else if (value.includes("/")) {
      raw = decodeURIComponent(value.split("/").pop() || value);
    }
  } catch {
    /* ignore */
  }

  // Strip upload prefix: 1786171798069-829be5c6-paymenticons.png → paymenticons.png
  const cleaned = raw.replace(/^\d{10,}-[a-f0-9]{6,8}-/i, "");
  return cleaned || raw || "Artwork file";
}

export function artworkFileKind(
  artworkFile: string | null | undefined,
): "pdf" | "image" | "file" {
  const name = artworkDisplayName(artworkFile).toLowerCase();
  if (name.endsWith(".pdf")) return "pdf";
  if (/\.(png|jpe?g|gif|webp|svg|tiff?)$/i.test(name)) return "image";
  return "file";
}
