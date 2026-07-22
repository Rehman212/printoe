import { Suspense } from "react";
import type { Metadata } from "next";
import { FileUploadPage } from "@/components/products/FileUploadPage";

export const metadata: Metadata = {
  title: "File Upload",
  description: "Upload your artwork for printing.",
};

export default function UploadRoute() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center text-sm text-text-secondary">
          Loading upload…
        </div>
      }
    >
      <FileUploadPage />
    </Suspense>
  );
}
