"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Circle,
  Cloud,
  CloudOff,
  Download,
  Eye,
  EyeOff,
  Grid3X3,
  ImagePlus,
  Layers,
  LayoutTemplate,
  Lock,
  Minus,
  Plus,
  QrCode,
  Redo2,
  Shapes,
  Square,
  Star,
  Trash2,
  Type,
  Undo2,
  Upload,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

type ToolPanel =
  | "templates"
  | "uploads"
  | "text"
  | "shapes"
  | "icons"
  | "qr"
  | "backgrounds";

type Layer = {
  id: string;
  name: string;
  type: "text" | "shape" | "image" | "icon";
  visible: boolean;
  locked: boolean;
};

const TOOLBAR: { id: ToolPanel; label: string; icon: React.ReactNode }[] = [
  { id: "templates", label: "Templates", icon: <LayoutTemplate className="h-5 w-5" /> },
  { id: "uploads", label: "Uploads", icon: <Upload className="h-5 w-5" /> },
  { id: "text", label: "Text", icon: <Type className="h-5 w-5" /> },
  { id: "shapes", label: "Shapes", icon: <Shapes className="h-5 w-5" /> },
  { id: "icons", label: "Icons", icon: <Star className="h-5 w-5" /> },
  { id: "qr", label: "QR Codes", icon: <QrCode className="h-5 w-5" /> },
  { id: "backgrounds", label: "Backgrounds", icon: <Grid3X3 className="h-5 w-5" /> },
];

const TEMPLATES = [
  { id: "t1", name: "Minimal Card", color: "#2563EB" },
  { id: "t2", name: "Bold Flyer", color: "#06B6D4" },
  { id: "t3", name: "Elegant Brochure", color: "#0F172A" },
  { id: "t4", name: "Event Poster", color: "#EF4444" },
];

const INITIAL_LAYERS: Layer[] = [
  { id: "l1", name: "Background", type: "shape", visible: true, locked: true },
  { id: "l2", name: "Headline", type: "text", visible: true, locked: false },
  { id: "l3", name: "Logo", type: "image", visible: true, locked: false },
  { id: "l4", name: "Accent Shape", type: "shape", visible: true, locked: false },
];

export function DesignEditor() {
  const [activePanel, setActivePanel] = useState<ToolPanel>("templates");
  const [zoom, setZoom] = useState(100);
  const [livePreview, setLivePreview] = useState(false);
  const [saved, setSaved] = useState(true);
  const [selectedLayer, setSelectedLayer] = useState("l2");
  const [layers, setLayers] = useState<Layer[]>(INITIAL_LAYERS);
  const [history, setHistory] = useState<number[]>([100]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const triggerAutosave = useCallback(() => {
    setSaved(false);
    const timer = setTimeout(() => setSaved(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!saved) {
      const t = setTimeout(() => setSaved(true), 1200);
      return () => clearTimeout(t);
    }
  }, [saved]);

  const handleZoom = (delta: number) => {
    const next = Math.min(200, Math.max(25, zoom + delta));
    setZoom(next);
    setHistory((h) => [...h.slice(0, historyIndex + 1), next]);
    setHistoryIndex((i) => i + 1);
    triggerAutosave();
  };

  const undo = () => {
    if (!canUndo) return;
    const next = historyIndex - 1;
    setHistoryIndex(next);
    setZoom(history[next]);
  };

  const redo = () => {
    if (!canRedo) return;
    const next = historyIndex + 1;
    setHistoryIndex(next);
    setZoom(history[next]);
  };

  const toggleLayerVisibility = (id: string) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l)),
    );
    triggerAutosave();
  };

  return (
    <div className="flex h-[calc(100vh-5rem)] min-h-[640px] flex-col bg-background">
      {/* Top bar */}
      <header className="flex shrink-0 items-center justify-between gap-4 border-b border-border bg-card px-4 py-3 shadow-soft md:px-6">
        <div className="flex items-center gap-2">
          <Badge variant="primary">Design Studio</Badge>
          <span className="hidden text-sm font-semibold text-text-secondary sm:inline">
            Business Card · 3.5″ × 2″
          </span>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" disabled={!canUndo} onClick={undo} aria-label="Undo">
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" disabled={!canRedo} onClick={redo} aria-label="Redo">
            <Redo2 className="h-4 w-4" />
          </Button>
          <div className="mx-2 hidden h-6 w-px bg-border sm:block" />
          <Button variant="ghost" size="icon" onClick={() => handleZoom(-10)} aria-label="Zoom out">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="min-w-[3.5rem] text-center text-xs font-bold text-text-primary">
            {zoom}%
          </span>
          <Button variant="ghost" size="icon" onClick={() => handleZoom(10)} aria-label="Zoom in">
            <ZoomIn className="h-4 w-4" />
          </Button>
          <div className="mx-2 hidden h-6 w-px bg-border sm:block" />
          <Button variant="ghost" size="icon" aria-label="Align left">
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Align center">
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Align right">
            <AlignRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <motion.div
            animate={{ opacity: saved ? 1 : 0.6 }}
            className="hidden items-center gap-1.5 text-xs font-semibold text-text-secondary sm:flex"
          >
            {saved ? (
              <>
                <Cloud className="h-3.5 w-3.5 text-success" />
                Saved
              </>
            ) : (
              <>
                <CloudOff className="h-3.5 w-3.5 animate-pulse text-warning" />
                Saving…
              </>
            )}
          </motion.div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLivePreview((v) => !v)}
            className="gap-1.5"
          >
            {livePreview ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{livePreview ? "Edit" : "Preview"}</span>
          </Button>
          <Button size="sm" className="gap-1.5">
            <Download className="h-3.5 w-3.5" />
            Export
          </Button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Left toolbar */}
        <aside className="flex shrink-0 border-r border-border bg-card">
          <nav className="flex w-16 flex-col items-center gap-1 border-r border-border py-3">
            {TOOLBAR.map((tool) => (
              <button
                key={tool.id}
                type="button"
                onClick={() => setActivePanel(tool.id)}
                className={cn(
                  "flex w-12 flex-col items-center gap-1 rounded-xl px-1 py-2 text-[10px] font-semibold transition-all focus-ring",
                  activePanel === tool.id
                    ? "bg-primary/10 text-primary"
                    : "text-text-secondary hover:bg-secondary/5 hover:text-text-primary",
                )}
                aria-label={tool.label}
                aria-current={activePanel === tool.id ? "true" : undefined}
              >
                {tool.icon}
                <span className="leading-tight">{tool.label.split(" ")[0]}</span>
              </button>
            ))}
          </nav>

          <div className="hidden w-64 flex-col sm:flex">
            <div className="border-b border-border px-4 py-3">
              <h2 className="text-sm font-bold capitalize text-text-primary">
                {activePanel.replace("-", " ")}
              </h2>
            </div>
            <div className="scrollbar-thin flex-1 overflow-y-auto p-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activePanel}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  transition={{ duration: 0.15 }}
                >
                  {activePanel === "templates" &&
                    TEMPLATES.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={triggerAutosave}
                        className="mb-3 w-full rounded-2xl border border-border p-3 text-left transition-all hover:border-primary/30 hover:shadow-soft focus-ring"
                      >
                        <div
                          className="mb-2 aspect-[1.75/1] rounded-xl"
                          style={{
                            background: `linear-gradient(135deg, ${t.color}22, ${t.color}55)`,
                          }}
                        />
                        <p className="text-xs font-bold text-text-primary">{t.name}</p>
                      </button>
                    ))}
                  {activePanel === "uploads" && (
                    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border py-10 text-center">
                      <ImagePlus className="mb-2 h-8 w-8 text-text-secondary" />
                      <p className="text-sm font-semibold text-text-primary">Drop files here</p>
                      <p className="mt-1 text-xs text-text-secondary">PNG, JPG, SVG, PDF</p>
                      <Button size="sm" className="mt-4" variant="outline">
                        Browse
                      </Button>
                    </div>
                  )}
                  {activePanel === "text" && (
                    <div className="space-y-2">
                      {["Heading", "Subheading", "Body", "Caption"].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={triggerAutosave}
                          className="w-full rounded-xl border border-border px-3 py-3 text-left hover:border-primary/30 focus-ring"
                        >
                          <span
                            className={cn(
                              "font-bold text-text-primary",
                              preset === "Heading" && "text-lg",
                              preset === "Subheading" && "text-base",
                              preset === "Body" && "text-sm font-medium",
                              preset === "Caption" && "text-xs text-text-secondary",
                            )}
                          >
                            {preset}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                  {activePanel === "shapes" && (
                    <div className="grid grid-cols-3 gap-2">
                      {[Square, Circle, Minus].map((Icon, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={triggerAutosave}
                          className="flex aspect-square items-center justify-center rounded-xl border border-border hover:border-primary/30 focus-ring"
                        >
                          <Icon className="h-6 w-6 text-text-secondary" />
                        </button>
                      ))}
                    </div>
                  )}
                  {activePanel === "icons" && (
                    <div className="grid grid-cols-4 gap-2">
                      {["★", "♥", "✉", "☎", "⚡", "◆", "▲", "●"].map((icon) => (
                        <button
                          key={icon}
                          type="button"
                          onClick={triggerAutosave}
                          className="flex aspect-square items-center justify-center rounded-xl border border-border text-lg hover:border-primary/30 focus-ring"
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                  )}
                  {activePanel === "qr" && (
                    <div className="space-y-3">
                      <p className="text-xs text-text-secondary">
                        Generate a scannable QR code for URLs, contact info, or Wi-Fi.
                      </p>
                      <Button className="w-full gap-2" size="sm" onClick={triggerAutosave}>
                        <QrCode className="h-4 w-4" />
                        Add QR Code
                      </Button>
                    </div>
                  )}
                  {activePanel === "backgrounds" && (
                    <div className="grid grid-cols-2 gap-2">
                      {["#FFFFFF", "#F8FAFC", "#2563EB", "#0F172A", "#06B6D4", "#FEF3C7"].map(
                        (color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={triggerAutosave}
                            className="aspect-square rounded-xl border border-border shadow-soft focus-ring"
                            style={{ background: color }}
                            aria-label={`Background ${color}`}
                          />
                        ),
                      )}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </aside>

        {/* Canvas */}
        <main className="relative flex min-w-0 flex-1 flex-col items-center justify-center overflow-hidden bg-[#EEF2F7] p-6">
          <div
            className="absolute inset-0 opacity-[0.35]"
            style={{
              backgroundImage:
                "radial-gradient(circle, #94A3B8 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          />
          <motion.div
            animate={{ scale: zoom / 100 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={cn(
              "relative z-10 aspect-[1.75/1] w-full max-w-xl rounded-sm bg-white shadow-card ring-1 ring-border",
              livePreview && "pointer-events-none",
            )}
          >
            <div className="absolute inset-0 overflow-hidden rounded-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/10" />
              <div className="absolute left-6 top-6 h-3 w-24 rounded-full bg-primary" />
              <div className="absolute left-6 top-14 space-y-2">
                <div className="h-2 w-40 rounded-full bg-slate-200" />
                <div className="h-2 w-28 rounded-full bg-slate-200" />
              </div>
              <div
                className={cn(
                  "absolute bottom-8 right-8 h-16 w-16 rounded-xl bg-gradient-to-br from-primary to-accent opacity-90",
                  selectedLayer === "l4" && "ring-2 ring-primary ring-offset-2",
                )}
              />
              <p
                className={cn(
                  "absolute left-6 top-24 text-2xl font-bold text-secondary",
                  selectedLayer === "l2" && "ring-2 ring-primary ring-offset-4",
                )}
              >
                Your Brand
              </p>
            </div>
            {!livePreview && (
              <div className="absolute -inset-px rounded-sm border-2 border-dashed border-primary/40" />
            )}
          </motion.div>
        </main>

        {/* Right panel */}
        <aside className="hidden w-72 shrink-0 flex-col border-l border-border bg-card lg:flex">
          <div className="border-b border-border px-4 py-3">
            <h2 className="text-sm font-bold text-text-primary">Properties</h2>
          </div>
          <div className="scrollbar-thin flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-text-secondary">
                  Fill
                </label>
                <div className="flex gap-2">
                  {["#2563EB", "#0F172A", "#FFFFFF"].map((c) => (
                    <button
                      key={c}
                      type="button"
                      className="h-8 w-8 rounded-lg border border-border shadow-soft focus-ring"
                      style={{ background: c }}
                      aria-label={`Color ${c}`}
                    />
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-text-secondary">
                  Opacity
                </label>
                <input type="range" min={0} max={100} defaultValue={100} className="w-full" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-text-secondary">
                  Font size
                </label>
                <input
                  type="number"
                  defaultValue={24}
                  className="h-9 w-full rounded-xl border border-border px-3 text-sm font-medium"
                />
              </div>
            </div>

            <div className="mt-8">
              <div className="mb-3 flex items-center gap-2">
                <Layers className="h-4 w-4 text-text-secondary" />
                <h3 className="text-sm font-bold text-text-primary">Layers</h3>
              </div>
              <ul className="space-y-1">
                {[...layers].reverse().map((layer) => (
                  <li key={layer.id}>
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedLayer(layer.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") setSelectedLayer(layer.id);
                      }}
                      className={cn(
                        "group flex w-full cursor-pointer items-center gap-2 rounded-xl px-2 py-2 text-left text-xs font-semibold transition-colors focus-ring",
                        selectedLayer === layer.id
                          ? "bg-primary/10 text-primary"
                          : "text-text-primary hover:bg-secondary/5",
                      )}
                    >
                      <span className="flex-1 truncate">{layer.name}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLayerVisibility(layer.id);
                        }}
                        className="rounded-lg p-1 hover:bg-secondary/10"
                        aria-label={layer.visible ? "Hide layer" : "Show layer"}
                      >
                        {layer.visible ? (
                          <Eye className="h-3.5 w-3.5" />
                        ) : (
                          <EyeOff className="h-3.5 w-3.5 opacity-40" />
                        )}
                      </button>
                      {layer.locked ? (
                        <Lock className="h-3.5 w-3.5 text-text-secondary" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5 text-text-secondary opacity-0 group-hover:opacity-100" />
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
