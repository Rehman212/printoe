import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

export const runtime = "nodejs";

const ALLOWED = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/tiff",
  "application/pdf",
]);

function extFor(file: File): string {
  const fromName = path.extname(file.name || "").toLowerCase();
  if (fromName && fromName.length <= 8) return fromName;
  switch (file.type) {
    case "image/png":
      return ".png";
    case "image/webp":
      return ".webp";
    case "image/gif":
      return ".gif";
    case "image/svg+xml":
      return ".svg";
    case "image/tiff":
      return ".tiff";
    case "application/pdf":
      return ".pdf";
    default:
      return ".jpg";
  }
}

/** Customer artwork uploads for checkout proofs (public/uploads/artwork). */
export async function POST(req: NextRequest) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json(
      { message: "Invalid multipart form data" },
      { status: 400 },
    );
  }

  const file = form.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json(
      { message: "No artwork file uploaded" },
      { status: 400 },
    );
  }

  const typeOk =
    ALLOWED.has(file.type) ||
    /\.(png|jpe?g|gif|webp|svg|tiff?|pdf)$/i.test(file.name);
  if (!typeOk) {
    return NextResponse.json(
      {
        message:
          "Only image or PDF files are allowed for artwork proofs (JPEG, PNG, WebP, GIF, SVG, TIFF, PDF)",
      },
      { status: 400 },
    );
  }

  if (file.size > 40 * 1024 * 1024) {
    return NextResponse.json(
      { message: "Artwork must be 40MB or smaller" },
      { status: 400 },
    );
  }

  const dir = path.join(process.cwd(), "public", "uploads", "artwork");
  await mkdir(dir, { recursive: true });

  const safeBase = file.name
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
  const filename = `${Date.now()}-${randomUUID().slice(0, 8)}-${safeBase || `file${extFor(file)}`}`;
  const dest = path.join(dir, filename);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(dest, buffer);

  const origin = req.nextUrl.origin;
  const url = `${origin}/uploads/artwork/${filename}`;

  return NextResponse.json({
    success: true,
    message: "Artwork uploaded",
    data: {
      url,
      filename: file.name,
      storedName: filename,
      size: file.size,
      type: file.type,
    },
  });
}
