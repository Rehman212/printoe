"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ChevronDown,
  ChevronRight,
  GripVertical,
  Plus,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import type { MenuTreeNode } from "@/lib/site-menus";

export type EditableMenuNode = {
  id: string;
  label: string;
  href: string;
  children?: EditableMenuNode[];
};

function newId() {
  return `m_${Math.random().toString(36).slice(2, 9)}`;
}

export function treeFromBlueprint(nodes: MenuTreeNode[]): EditableMenuNode[] {
  return nodes.map((n) => ({
    id: newId(),
    label: n.label,
    href: n.href,
    children: n.children?.length ? treeFromBlueprint(n.children) : undefined,
  }));
}

export function editableToPlain(nodes: EditableMenuNode[]): MenuTreeNode[] {
  return nodes.map((n) => ({
    label: n.label,
    href: n.href,
    children: n.children?.length ? editableToPlain(n.children) : undefined,
  }));
}

/** Restore tree from flat Label|href lines with — depth prefixes. */
export function treeFromFlatItems(
  items: { label: string; href: string }[],
): EditableMenuNode[] {
  const root: EditableMenuNode[] = [];
  const stack: { depth: number; node: EditableMenuNode }[] = [];

  for (const item of items) {
    const match = item.label.match(/^(—\s*)+/);
    const depth = match ? match[0].split("—").length - 1 : 0;
    const label = item.label.replace(/^(—\s*)+/, "").trim();
    const node: EditableMenuNode = {
      id: newId(),
      label,
      href: item.href,
      children: [],
    };

    while (stack.length && stack[stack.length - 1]!.depth >= depth) {
      stack.pop();
    }

    if (stack.length === 0) {
      root.push(node);
    } else {
      const parent = stack[stack.length - 1]!.node;
      parent.children = parent.children ?? [];
      parent.children.push(node);
    }
    stack.push({ depth, node });
  }

  const clean = (nodes: EditableMenuNode[]): EditableMenuNode[] =>
    nodes.map((n) => ({
      ...n,
      children: n.children?.length ? clean(n.children) : undefined,
    }));

  return clean(root);
}

function updateAt(
  nodes: EditableMenuNode[],
  id: string,
  patch: Partial<EditableMenuNode>,
): EditableMenuNode[] {
  return nodes.map((n) => {
    if (n.id === id) return { ...n, ...patch };
    if (n.children?.length) {
      return { ...n, children: updateAt(n.children, id, patch) };
    }
    return n;
  });
}

function removeAt(nodes: EditableMenuNode[], id: string): EditableMenuNode[] {
  return nodes
    .filter((n) => n.id !== id)
    .map((n) =>
      n.children?.length
        ? { ...n, children: removeAt(n.children, id) }
        : n,
    );
}

function addChild(
  nodes: EditableMenuNode[],
  parentId: string | null,
): EditableMenuNode[] {
  const child: EditableMenuNode = {
    id: newId(),
    label: "New link",
    href: "/",
  };
  if (!parentId) return [...nodes, child];
  return nodes.map((n) => {
    if (n.id === parentId) {
      return { ...n, children: [...(n.children ?? []), child] };
    }
    if (n.children?.length) {
      return { ...n, children: addChild(n.children, parentId) };
    }
    return n;
  });
}

function reorderChildren(
  nodes: EditableMenuNode[],
  parentId: string | null,
  activeId: string,
  overId: string,
): EditableMenuNode[] {
  if (!parentId) {
    const oldIndex = nodes.findIndex((n) => n.id === activeId);
    const newIndex = nodes.findIndex((n) => n.id === overId);
    if (oldIndex < 0 || newIndex < 0) return nodes;
    return arrayMove(nodes, oldIndex, newIndex);
  }
  return nodes.map((n) => {
    if (n.id === parentId && n.children) {
      const oldIndex = n.children.findIndex((c) => c.id === activeId);
      const newIndex = n.children.findIndex((c) => c.id === overId);
      if (oldIndex < 0 || newIndex < 0) return n;
      return { ...n, children: arrayMove(n.children, oldIndex, newIndex) };
    }
    if (n.children?.length) {
      return {
        ...n,
        children: reorderChildren(n.children, parentId, activeId, overId),
      };
    }
    return n;
  });
}

type TreeOps = {
  onChange: (id: string, patch: Partial<EditableMenuNode>) => void;
  onRemove: (id: string) => void;
  onAddChild: (id: string) => void;
  onReorderSiblings: (
    parentId: string | null,
    activeId: string,
    overId: string,
  ) => void;
};

export function AdminMenuTreeEditor({
  value,
  onChange,
}: {
  value: EditableMenuNode[];
  onChange: (next: EditableMenuNode[]) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const treeOps: TreeOps = {
    onChange: (id, patch) => onChange(updateAt(value, id, patch)),
    onRemove: (id) => onChange(removeAt(value, id)),
    onAddChild: (id) => onChange(addChild(value, id)),
    onReorderSiblings: (parentId, activeId, overId) =>
      onChange(reorderChildren(value, parentId, activeId, overId)),
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-zinc-400">
          Drag the handle to reorder. Use + to add a submenu under a link.
        </p>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="border-zinc-600 bg-transparent text-zinc-200 hover:bg-zinc-800"
          onClick={() => onChange(addChild(value, null))}
        >
          <Plus className="h-3.5 w-3.5" />
          Add top link
        </Button>
      </div>

      {value.length === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-700 px-4 py-10 text-center text-sm text-zinc-500">
          No links yet. Load Homepage header / Footer, or add a top link.
        </p>
      ) : (
        <NestedSortable
          nodes={value}
          depth={0}
          parentId={null}
          treeOps={treeOps}
          sensors={sensors}
        />
      )}
    </div>
  );
}

function NestedSortable({
  nodes,
  depth,
  parentId,
  treeOps,
  sensors,
}: {
  nodes: EditableMenuNode[];
  depth: number;
  parentId: string | null;
  treeOps: TreeOps;
  sensors: ReturnType<typeof useSensors>;
}) {
  const ids = useMemo(() => nodes.map((n) => n.id), [nodes]);

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    treeOps.onReorderSiblings(parentId, String(active.id), String(over.id));
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
    >
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <div className="space-y-1.5">
          {nodes.map((node) => (
            <SortableNodeBlock
              key={node.id}
              node={node}
              depth={depth}
              treeOps={treeOps}
              sensors={sensors}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function SortableNodeBlock({
  node,
  depth,
  treeOps,
  sensors,
}: {
  node: EditableMenuNode;
  depth: number;
  treeOps: TreeOps;
  sensors: ReturnType<typeof useSensors>;
}) {
  const [open, setOpen] = useState(depth < 2);
  const hasKids = Boolean(node.children?.length);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: node.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn(isDragging && "z-20")}
    >
      <div
        className={cn(
          "flex items-start gap-2 rounded-xl border border-zinc-700/80 bg-[#1a1d26] px-2 py-2",
          isDragging &&
            "border-primary opacity-90 shadow-lg ring-2 ring-primary/25",
        )}
        style={{ marginLeft: Math.min(depth, 4) * 14 }}
      >
        <button
          type="button"
          className="mt-2 cursor-grab touch-none rounded-md p-1 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200 active:cursor-grabbing"
          aria-label="Drag to reorder"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="mt-2 rounded-md p-1 text-zinc-400 hover:bg-zinc-800 disabled:opacity-20"
          disabled={!hasKids}
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Collapse" : "Expand"}
        >
          {hasKids ? (
            open ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )
          ) : (
            <span className="inline-block w-4" />
          )}
        </button>
        <div className="min-w-0 flex-1 space-y-1.5">
          <input
            value={node.label}
            onChange={(e) =>
              treeOps.onChange(node.id, { label: e.target.value })
            }
            className="h-9 w-full rounded-lg border border-zinc-700 bg-[#12151c] px-2.5 text-sm font-semibold text-zinc-100 focus:border-primary/50 focus:outline-none"
            placeholder="Label"
          />
          <input
            value={node.href}
            onChange={(e) =>
              treeOps.onChange(node.id, { href: e.target.value })
            }
            className="h-8 w-full rounded-lg border border-zinc-700 bg-[#12151c] px-2.5 font-mono text-xs text-zinc-400 focus:border-primary/50 focus:outline-none"
            placeholder="/path"
          />
        </div>
        <div className="flex shrink-0 flex-col gap-1">
          <button
            type="button"
            title="Add submenu"
            onClick={() => treeOps.onAddChild(node.id)}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-primary"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            title="Remove"
            onClick={() => treeOps.onRemove(node.id)}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-danger/20 hover:text-danger"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      {hasKids && open ? (
        <div className="mt-1.5">
          <NestedSortable
            nodes={node.children!}
            depth={depth + 1}
            parentId={node.id}
            treeOps={treeOps}
            sensors={sensors}
          />
        </div>
      ) : null}
    </div>
  );
}
