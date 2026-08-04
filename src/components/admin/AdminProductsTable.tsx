"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type RowSelectionState,
  type SortingState,
} from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Pencil,
  Trash2,
} from "lucide-react";
import type { ProductDetailPayload } from "@/types";
import { cn, formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

type AdminProductsTableProps = {
  data: ProductDetailPayload[];
  globalFilter: string;
  onEdit: (row: ProductDetailPayload) => void;
  onDelete: (row: ProductDetailPayload) => void;
  onBulkDelete: (rows: ProductDetailPayload[]) => Promise<void> | void;
  bulkDeleting?: boolean;
};

export function AdminProductsTable({
  data,
  globalFilter,
  onEdit,
  onDelete,
  onBulkDelete,
  bulkDeleting = false,
}: AdminProductsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const columns = useMemo<ColumnDef<ProductDetailPayload>[]>(
    () => [
      {
        id: "select",
        enableSorting: false,
        header: ({ table }) => (
          <input
            type="checkbox"
            aria-label="Select all products"
            className="h-4 w-4 rounded border-border accent-primary"
            checked={table.getIsAllRowsSelected()}
            ref={(el) => {
              if (el) {
                el.indeterminate =
                  table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected();
              }
            }}
            onChange={table.getToggleAllRowsSelectedHandler()}
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            aria-label={`Select ${row.original.product.name}`}
            className="h-4 w-4 rounded border-border accent-primary"
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            onChange={row.getToggleSelectedHandler()}
          />
        ),
      },
      {
        id: "product",
        accessorFn: (row) => row.product.name,
        header: "Product",
        cell: ({ row }) => {
          const p = row.original.product;
          const img = p.imageUrl || p.galleryUrls?.[0];
          return (
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[#eceef2]">
                {img ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={img}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[10px] font-bold uppercase text-text-secondary">
                    DB
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold text-text-primary">
                  {p.name}
                </p>
                <Link
                  href={`/products/${p.slug}`}
                  className="text-xs text-primary hover:underline"
                >
                  /products/{p.slug}
                </Link>
              </div>
            </div>
          );
        },
      },
      {
        id: "category",
        accessorFn: (row) => row.product.category.name,
        header: "Category",
        cell: ({ row }) => (
          <span className="capitalize text-text-secondary">
            {row.original.product.category.name}
          </span>
        ),
      },
      {
        id: "price",
        accessorFn: (row) => row.product.basePrice,
        header: "Price",
        cell: ({ row }) => (
          <span className="font-semibold">
            {formatCurrency(row.original.product.basePrice)}
          </span>
        ),
      },
      {
        id: "options",
        accessorFn: (row) => row.options.length,
        header: "Options",
        cell: ({ row }) => (
          <span className="text-text-secondary">
            {row.original.options.length} fields
          </span>
        ),
      },
      {
        id: "status",
        accessorFn: (row) =>
          row.product.active === false
            ? "inactive"
            : row.product.featured
              ? "featured"
              : "live",
        header: "Status",
        cell: ({ row }) => {
          const p = row.original.product;
          if (p.active === false) return <Badge variant="outline">Inactive</Badge>;
          if (p.featured) return <Badge variant="primary">Featured</Badge>;
          return <Badge>Live</Badge>;
        },
      },
      {
        id: "actions",
        enableSorting: false,
        header: () => <span className="block text-right">Actions</span>,
        cell: ({ row }) => {
          const p = row.original.product;
          return (
            <div className="flex flex-wrap justify-end gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(row.original)}
                className="gap-1.5"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDelete(row.original)}
                className="gap-1.5 text-danger hover:text-danger"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </Button>
              <Link
                href={`/products/${p.slug}`}
                target="_blank"
                className="inline-flex h-9 items-center gap-1 rounded-xl px-3 text-xs font-semibold text-primary hover:underline"
              >
                View
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          );
        },
      },
    ],
    [onDelete, onEdit],
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      rowSelection,
      globalFilter,
    },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowId: (row) => row.product.id,
    enableRowSelection: true,
    globalFilterFn: (row, _columnId, filterValue) => {
      const q = String(filterValue ?? "")
        .trim()
        .toLowerCase();
      if (!q) return true;
      const p = row.original.product;
      return (
        p.name.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        p.category.slug.toLowerCase().includes(q) ||
        p.category.name.toLowerCase().includes(q)
      );
    },
    initialState: {
      pagination: { pageSize: 20 },
    },
  });

  const selectedRows = table
    .getFilteredSelectedRowModel()
    .rows.map((r) => r.original);
  const selectedCount = selectedRows.length;

  async function handleBulkDelete() {
    if (!selectedCount) return;
    if (
      !window.confirm(
        `Delete ${selectedCount} selected product${selectedCount === 1 ? "" : "s"} from the database? This cannot be undone.`,
      )
    ) {
      return;
    }
    await onBulkDelete(selectedRows);
    setRowSelection({});
  }

  const pageCount = table.getPageCount();
  const pageIndex = table.getState().pagination.pageIndex;
  const filteredCount = table.getFilteredRowModel().rows.length;

  return (
    <div>
      {selectedCount > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-primary/[0.04] px-6 py-3">
          <p className="text-sm font-semibold text-text-primary">
            {selectedCount} selected
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setRowSelection({})}
              disabled={bulkDeleting}
            >
              Clear selection
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => void handleBulkDelete()}
              disabled={bulkDeleting}
              className="gap-1.5 bg-danger/10 text-danger hover:bg-danger/15 hover:text-danger"
            >
              <Trash2 className={cn("h-3.5 w-3.5", bulkDeleting && "animate-pulse")} />
              {bulkDeleting ? "Deleting…" : "Delete selected"}
            </Button>
          </div>
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="border-y border-border bg-secondary/[0.02] text-xs font-semibold uppercase tracking-wider text-text-secondary"
              >
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  return (
                    <th
                      key={header.id}
                      className={cn(
                        "px-6 py-3",
                        header.id === "select" && "w-12 px-4",
                        header.id === "actions" && "text-right",
                      )}
                    >
                      {header.isPlaceholder ? null : canSort ? (
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 hover:text-text-primary"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          {{
                            asc: " ↑",
                            desc: " ↓",
                          }[header.column.getIsSorted() as string] ?? null}
                        </button>
                      ) : (
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className={cn(
                  "border-b border-border/60 last:border-0",
                  row.getIsSelected() && "bg-primary/[0.03]",
                )}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className={cn(
                      "px-6 py-3",
                      cell.column.id === "select" && "w-12 px-4",
                    )}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredCount === 0 ? (
        <p className="px-6 py-10 text-center text-sm text-text-secondary">
          No products match your search.
        </p>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-6 py-3">
          <p className="text-xs font-medium text-text-secondary">
            {filteredCount} product{filteredCount === 1 ? "" : "s"}
            {pageCount > 1
              ? ` · Page ${pageIndex + 1} of ${pageCount}`
              : null}
          </p>
          {pageCount > 1 ? (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="gap-1"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Prev
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="gap-1"
              >
                Next
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
