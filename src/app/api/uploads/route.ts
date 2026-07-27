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
]);

function extFor(file: File): string {
  const fromName = path.extname(file.name || "").toLowerCase();
  if (fromName && fromName.length <= 5) return fromName;
  switch (file.type) {
    case "image/png":
      return ".png";
    case "image/webp":
      return ".webp";
    case "image/gif":
      return ".gif";
    case "image/svg+xml":
      return ".svg";
    default:
      return ".jpg";
  }
}

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization") || "";
  if (!auth.toLowerCase().startsWith("bearer ")) {
    return NextResponse.json(
      { message: "Unauthorized — admin login required" },
      { status: 401 },
    );
  }

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
      { message: "No image file uploaded" },
      { status: 400 },
    );
  }

  if (!ALLOWED.has(file.type)) {
    return NextResponse.json(
      {
        message:
          "Only image files are allowed (JPEG, PNG, WebP, GIF, SVG)",
      },
      { status: 400 },
    );
  }

  if (file.size > 8 * 1024 * 1024) {
    return NextResponse.json(
      { message: "Image must be 8MB or smaller" },
      { status: 400 },
    );
  }

  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });

  const filename = `${Date.now()}-${randomUUID().slice(0, 8)}${extFor(file)}`;
  const dest = path.join(dir, filename);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(dest, buffer);

  const origin = req.nextUrl.origin;
  const url = `${origin}/uploads/${filename}`;

  return NextResponse.json({
    success: true,
    message: "Image uploaded",
    data: { url, filename },
  });
}
