import { DesignEditor } from "@/components/editor/DesignEditor";

export const metadata = {
  title: "Design Studio",
  description: "Create print-ready designs with the Pressora studio editor.",
};

export default function EditorPage() {
  return (
    <div className="h-[calc(100dvh)] overflow-hidden">
      <DesignEditor />
    </div>
  );
}
