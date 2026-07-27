import { Suspense } from "react";
import { DesignEditor } from "@/components/editor/DesignEditor";

export const metadata = {
  title: "Design Studio",
  description: "Create print-ready designs with the Printoe studio editor.",
};

export default function EditorPage() {
  return (
    <div className="h-[calc(100dvh)] overflow-hidden">
      <Suspense
        fallback={
          <div className="flex h-full items-center justify-center text-sm text-text-secondary">
            Loading Design Studio…
          </div>
        }
      >
        <DesignEditor />
      </Suspense>
    </div>
  );
}
