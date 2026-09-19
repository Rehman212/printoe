"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { getAccessToken } from "@/lib/auth";
import { sendLoggedInUserToEditor } from "@/lib/editor-url";

function EditorAuthBridge() {
  const router = useRouter();
  const search = useSearchParams();

  useEffect(() => {
    const next = search.get("next") || "";
    const token = getAccessToken();
    if (!token) {
      router.replace(`/login?next=${encodeURIComponent(next || "/dashboard")}`);
      return;
    }
    if (sendLoggedInUserToEditor(next)) return;
    router.replace("/dashboard");
  }, [router, search]);

  return (
    <div className="flex min-h-dvh items-center justify-center text-sm text-text-secondary">
      Opening Design Studio…
    </div>
  );
}

export default function EditorAuthPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center text-sm text-text-secondary">
          Opening Design Studio…
        </div>
      }
    >
      <EditorAuthBridge />
    </Suspense>
  );
}
