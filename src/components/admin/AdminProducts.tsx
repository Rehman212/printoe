"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  DollarSign,
  FileText,
  Globe,
  HelpCircle,
  ImagePlus,
  Info,
  Layers,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Trash2,
  X,
  ExternalLink,
} from "lucide-react";
import {
  createAdminProduct,
  beginAdminPricingMatrix,
  completeAdminPricingMatrix,
  deleteAdminProduct,
  fetchAdminCategories,
  fetchAdminProducts,
  updateAdminProduct,
  uploadAdminImage,
  uploadAdminPricingChunk,
  type ImportedVariationPrice,
} from "@/lib/products-api";
import {
  POPULAR_PRODUCT_SECTIONS,
  slugifyProductName,
} from "@/lib/option-templates";
import { DEFAULT_PRODUCT_FAQS } from "@/lib/product-faqs";
import { getStorefrontPlacement } from "@/lib/storefront-placement";
import { DynamicIcon } from "@/lib/icons";
import type { ProductDetailPayload, ProductTab } from "@/types";
import { cn, formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { useToast } from "@/components/ui/Toast";
import { AdminProductsTable } from "@/components/admin/AdminProductsTable";
import {
  AdminProductOptionEditor,
  optionGroupsFromApi,
  optionGroupsFromCategory,
  optionGroupsToPayload,
  type FormOptionGroup,
} from "@/components/admin/AdminProductOptionEditor";
import { AdminProductPricingEditor } from "@/components/admin/AdminProductPricingEditor";

type ApiCategory = {
  id: string;
  name: string;
  slug: string;
};

type FormFaq = { question: string; answer: string };

type FormTabField = {
  id: string;
  label: string;
  type: "select" | "text" | "number";
  optionsText: string;
  helpText: string;
};

type FormTab = {
  id: string;
  label: string;
  iconUrl: string;
  price: string;
  fields: FormTabField[];
};

type FormState = {
  name: string;
  slug: string;
  slugLocked: boolean;
  categorySlug: string;
  categoryId: string;
  description: string;
  shortDescription: string;
  seoTitle: string;
  seoDescription: string;
  price: string;
  deliveryDays: string;
  badge: string;
  status: "published" | "draft";
  featured: boolean;
  active: boolean;
  imageUrl: string;
  videoUrl: string;
  previewDataUrl: string | null;
  /** Extra photos (besides primary feature image) */
  galleryUrls: string[];
  faqs: FormFaq[];
  tabs: FormTab[];
  optionGroups: FormOptionGroup[];
};

function newId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

function emptyField(): FormTabField {
  return {
    id: newId("field"),
    label: "",
    type: "select",
    optionsText: "",
    helpText: "",
  };
}

function emptyTab(): FormTab {
  return {
    id: newId("tab"),
    label: "",
    iconUrl: "",
    price: "",
    fields: [emptyField()],
  };
}

function tabsFromProduct(tabs?: ProductTab[] | null): FormTab[] {
  if (!tabs?.length) return [];
  return tabs.map((tab) => ({
    id: tab.id || newId("tab"),
    label: tab.label ?? "",
    iconUrl: tab.iconUrl ?? "",
    price:
      typeof tab.price === "number" && Number.isFinite(tab.price)
        ? String(tab.price)
        : "",
    fields: tab.fields?.length
      ? tab.fields.map((f) => ({
          id: f.id || newId("field"),
          label: f.label ?? "",
          type: f.type ?? "select",
          optionsText: (f.options ?? []).join("\n"),
          helpText: f.helpText ?? "",
        }))
      : [emptyField()],
  }));
}

function tabsToPayload(tabs: FormTab[]): ProductTab[] {
  return tabs
    .map((tab) => {
      const priceNum = Number(tab.price);
      return {
        id: tab.id,
        label: (tab.label ?? "").trim(),
        iconUrl: (tab.iconUrl ?? "").trim() || undefined,
        price:
          tab.price.trim() !== "" && Number.isFinite(priceNum) && priceNum >= 0
            ? priceNum
            : undefined,
        fields: (tab.fields ?? [])
          .map((f) => ({
            id: f.id,
            label: (f.label ?? "").trim(),
            type: f.type ?? "select",
            options:
              (f.type ?? "select") === "select"
                ? (f.optionsText ?? "")
                    .split("\n")
                    .map((o) => o.trim())
                    .filter(Boolean)
                : undefined,
            helpText: (f.helpText ?? "").trim() || undefined,
          }))
          .filter((f) => f.label),
      };
    })
    .filter((tab) => tab.label);
}

const emptyForm = (cats: ApiCategory[] = []): FormState => {
  const categorySlug = cats[0]?.slug ?? "stickers";
  return {
    name: "",
    slug: "",
    slugLocked: false,
    categorySlug,
    categoryId: cats[0]?.id ?? "",
    description: "",
    shortDescription: "",
    seoTitle: "",
    seoDescription: "",
    price: "",
    deliveryDays: "3",
    badge: "",
    status: "published",
    featured: false,
    active: true,
    imageUrl: "",
    videoUrl: "",
    previewDataUrl: null,
    galleryUrls: [],
    faqs: DEFAULT_PRODUCT_FAQS.map((f) => ({
      question: f.question,
      answer: f.answer,
    })),
    tabs: [],
    optionGroups: optionGroupsFromCategory(categorySlug),
  };
};

type FormSection =
  | "basics"
  | "media"
  | "content"
  | "options"
  | "pricing"
  | "tabs"
  | "faqs"
  | "seo";

const FORM_SECTIONS: Array<{
  id: FormSection;
  label: string;
  hint: string;
  icon: typeof Info;
}> = [
  {
    id: "basics",
    label: "Basics",
    hint: "Name, URL, category, price and publish status.",
    icon: Info,
  },
  {
    id: "media",
    label: "Images",
    hint: "Featured photo plus the product page gallery.",
    icon: ImagePlus,
  },
  {
    id: "content",
    label: "Descriptions",
    hint: "Short blurb and the full rich-text description.",
    icon: FileText,
  },
  {
    id: "options",
    label: "Customer fields",
    hint: "Dropdowns + Price $ / Extra $ on each choice.",
    icon: SlidersHorizontal,
  },
  {
    id: "pricing",
    label: "Pricing",
    hint: "Starting price and Width × Height (if needed).",
    icon: DollarSign,
  },
  {
    id: "tabs",
    label: "Product tabs",
    hint: "Optional tab switchers with their own custom fields.",
    icon: Layers,
  },
  {
    id: "faqs",
    label: "FAQs",
    hint: "Questions shown in the FAQs tab on the product page.",
    icon: HelpCircle,
  },
  {
    id: "seo",
    label: "SEO & placement",
    hint: "Search title, meta description and where this appears.",
    icon: Globe,
  },
];

export function AdminProducts() {
  const { toast } = useToast();
  const fileId = useId();
  const galleryFileId = useId();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ProductDetailPayload | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<ProductDetailPayload[]>([]);
  const [apiCategories, setApiCategories] = useState<ApiCategory[]>([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [section, setSection] = useState<FormSection>("basics");
  const [pricingImport, setPricingImport] = useState<{
    sourceUrl?: string;
    rows: ImportedVariationPrice[];
  } | null>(null);
  const [readingPricingImport, setReadingPricingImport] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [productsRes, catsRes] = await Promise.all([
        fetchAdminProducts(),
        fetchAdminCategories(),
      ]);
      setItems(productsRes.data);
      setApiCategories(catsRes.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not load products from API / database.",
      );
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const categoryOptions = useMemo(() => {
    // Popular Products sidebar order; merge API ids
    return POPULAR_PRODUCT_SECTIONS.map((section) => {
      const api = apiCategories.find((c) => c.slug === section.slug);
      return {
        id: api?.id ?? section.slug,
        slug: section.slug,
        name: section.name,
        icon: section.icon,
        inDb: Boolean(api),
      };
    }).filter((c) => c.inDb || apiCategories.length === 0);
  }, [apiCategories]);

  const placement = useMemo(
    () => getStorefrontPlacement(form.categorySlug),
    [form.categorySlug],
  );

  const sectionIndex = FORM_SECTIONS.findIndex((s) => s.id === section);
  const activeSection = FORM_SECTIONS[sectionIndex] ?? FORM_SECTIONS[0]!;

  /** Sections that still need attention before the product can be saved. */
  const incompleteSections = useMemo<Partial<Record<FormSection, boolean>>>(
    () => ({
      basics: !form.name.trim() || !form.price || !form.categoryId,
      media: !form.imageUrl,
    }),
    [form.name, form.price, form.categoryId, form.imageUrl],
  );

  function openCreate() {
    setEditing(null);
    setForm(emptyForm(apiCategories));
    setSection("basics");
    setPricingImport(null);
    setOpen(true);
  }

  function openEdit(row: ProductDetailPayload) {
    setEditing(row);
    const loadedFaqs =
      row.product.faqs
        ?.filter((f) => (f?.question ?? "").trim() || (f?.answer ?? "").trim())
        .map((f) => ({
          question: f.question ?? "",
          answer: f.answer ?? "",
        })) ?? [];
    setForm({
      name: row.product.name,
      slug: row.product.slug,
      slugLocked: true,
      categorySlug: row.product.category.slug,
      categoryId: row.product.category.id,
      description: row.product.description,
      shortDescription: row.product.shortDescription ?? "",
      seoTitle: row.product.seoTitle ?? "",
      seoDescription: row.product.seoDescription ?? "",
      price: String(row.product.basePrice),
      deliveryDays: String(row.product.deliveryDays),
      badge: row.product.badge ?? "",
      status: row.product.active !== false ? "published" : "draft",
      featured: Boolean(row.product.featured),
      active: row.product.active !== false,
      imageUrl: row.product.imageUrl ?? "",
      videoUrl: row.product.videoUrl ?? "",
      previewDataUrl: row.product.imageUrl ?? null,
      galleryUrls: (() => {
        const imgs = (row.product.galleryUrls ?? []).filter(Boolean);
        const primary = row.product.imageUrl ?? "";
        // Prefer extras only; fall back to full list minus primary when stored as full gallery
        const extras = imgs.filter((u) => u !== primary);
        return extras.length ? extras : imgs.filter((u) => u !== primary);
      })(),
      faqs: loadedFaqs.length
        ? loadedFaqs
        : DEFAULT_PRODUCT_FAQS.map((f) => ({
            question: f.question,
            answer: f.answer,
          })),
      tabs: tabsFromProduct(row.product.productTabs),
      optionGroups: optionGroupsFromApi(row.options),
    });
    setSection("basics");
    setPricingImport(null);
    setOpen(true);
  }

  function onCategoryChange(slug: string) {
    const cat = apiCategories.find((c) => c.slug === slug);
    setForm((f) => ({
      ...f,
      categorySlug: slug,
      categoryId: cat?.id ?? "",
      // On create, refresh template options for the new category
      optionGroups: editing ? f.optionGroups : optionGroupsFromCategory(slug),
    }));
  }

  async function onPickImage(file: File | null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file",
        description: "Please choose an image (PNG, JPG, WebP).",
        tone: "warning",
      });
      return;
    }

    // Local preview immediately
    const localPreview = URL.createObjectURL(file);
    setForm((f) => ({
      ...f,
      previewDataUrl: localPreview,
    }));

    setUploading(true);
    try {
      const res = await uploadAdminImage(file);
      const url = res.data.url;
      setForm((f) => ({
        ...f,
        imageUrl: url,
        previewDataUrl: url,
      }));

      // If editing an existing product, persist image to DB immediately
      if (editing?.product?.id) {
        const gallery = [
          url,
          ...form.galleryUrls.filter((u) => u && u !== url),
        ];
        await updateAdminProduct(editing.product.id, {
          imageUrl: url,
          galleryUrls: gallery,
        });
        await load();
        toast({
          title: "Image saved",
          description: "Uploaded to public/uploads and stored on this product.",
          tone: "success",
        });
      } else {
        toast({
          title: "Image uploaded",
          description:
            "Saved to uploads — click Save to attach to the new product.",
          tone: "success",
        });
      }
    } catch (err) {
      setForm((f) => ({
        ...f,
        previewDataUrl: f.imageUrl || null,
      }));
      toast({
        title: "Upload failed",
        description:
          err instanceof Error ? err.message : "Could not upload image.",
        tone: "danger",
      });
    } finally {
      setUploading(false);
    }
  }

  async function onPickGalleryFiles(files: FileList | null) {
    if (!files?.length) return;
    const images = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (!images.length) {
      toast({
        title: "Invalid file",
        description: "Please choose image files (PNG, JPG, WebP).",
        tone: "warning",
      });
      return;
    }

    setUploading(true);
    const added: string[] = [];
    try {
      for (const file of images) {
        const res = await uploadAdminImage(file);
        added.push(res.data.url);
      }
      setForm((f) => {
        const next = [...f.galleryUrls];
        for (const url of added) {
          if (url && !next.includes(url) && url !== f.imageUrl) next.push(url);
        }
        return { ...f, galleryUrls: next };
      });

      if (editing?.product?.id) {
        const primary = form.imageUrl.trim();
        const gallery = [
          ...(primary ? [primary] : []),
          ...form.galleryUrls,
          ...added,
        ].filter((u, i, arr) => u && arr.indexOf(u) === i);
        await updateAdminProduct(editing.product.id, {
          imageUrl: primary || gallery[0] || undefined,
          galleryUrls: gallery,
        });
        await load();
      }

      toast({
        title:
          added.length === 1 ? "Gallery image added" : "Gallery images added",
        description: `${added.length} image${added.length === 1 ? "" : "s"} uploaded.`,
        tone: "success",
      });
    } catch (err) {
      toast({
        title: "Gallery upload failed",
        description:
          err instanceof Error ? err.message : "Could not upload images.",
        tone: "danger",
      });
    } finally {
      setUploading(false);
    }
  }

  function removeGalleryUrl(url: string) {
    setForm((f) => ({
      ...f,
      galleryUrls: f.galleryUrls.filter((u) => u !== url),
    }));
  }

  function addGalleryUrlFromInput(raw: string) {
    const url = raw.trim();
    if (!url) return;
    setForm((f) => {
      if (f.galleryUrls.includes(url) || url === f.imageUrl) return f;
      return { ...f, galleryUrls: [...f.galleryUrls, url] };
    });
  }

  function buildOptionsPayload() {
    return optionGroupsToPayload(form.optionGroups);
  }

  async function onImportPricingJson(file: File) {
    setReadingPricingImport(true);
    try {
      const data = JSON.parse(await file.text()) as {
        metadata?: { source_url?: string; sourceUrl?: string; product_name?: string; productName?: string };
        default_selection?: Record<string, string>;
        description?: string;
        product_image?: string;
        images?: string[];
        video?: string;
        attributes?: Array<{
          attribute_id?: string;
          attributeId?: string;
          name: string;
          defaults_by_product?: Record<string, string>;
          hide_rules_by_product?: Record<string, Array<Record<string, string>>>;
          options: Array<{
            option_id?: string;
            optionId?: string;
            label: string;
            default?: boolean;
            available_product_ids?: string[];
            exclusion_rules_by_product?: Record<string, Array<Record<string, string>>>;
          }>;
        }>;
        prices?: Array<{
          selection: Record<string, string>;
          price: number | string;
          unit_price?: number | string;
          unitPrice?: number | string;
          quantity: number;
          turnaround_days?: number;
          turnaroundDays?: number;
          in_stock?: string | boolean;
          inStock?: boolean;
        }>;
      };
      if (!Array.isArray(data.attributes) || !Array.isArray(data.prices)) {
        throw new Error("Invalid file: attributes aur prices arrays required hain.");
      }
      const normalizeRuleMap = (
        value?: Record<string, Array<Record<string, string>>>,
      ) =>
        Object.fromEntries(
          Object.entries(value ?? {}).map(([productId, rules]) => [
            productId,
            rules.map((rule) =>
              Object.fromEntries(
                Object.entries(rule).map(([key, selected]) => [
                  key.startsWith("attr") ? key : `attr${key}`,
                  String(selected),
                ]),
              ),
            ),
          ]),
        );
      // priceMod feeds calcConfiguredPrice as a MULTIPLIER (mod *= value.priceMod,
      // then total = basePrice * mod) - it is never a dollar delta. "1" is the
      // correct neutral value for every option here: imported products are
      // meant to always be priced from the exact combination matrix
      // (pricingMatrixEnabled), and this formula is only the emergency
      // fallback for a combination the matrix doesn't cover. Do not compute
      // per-option dollar deltas and store them as priceMod - a $102.51 delta
      // multiplies the base price by over 100x under this formula.
      const importedGroups: FormOptionGroup[] = data.attributes.map((attribute, index) => {
        const attributeId = String(attribute.attribute_id ?? attribute.attributeId ?? "");
        if (!attributeId || !attribute.name || !Array.isArray(attribute.options)) {
          throw new Error(`Invalid attribute at position ${index + 1}`);
        }
        return {
          id: `import_group_${attributeId}`,
          key: `attr${attributeId}`,
          keyLocked: true,
          label: attribute.name,
          uiType: "SELECT",
          helpText: "",
          meta: {
            defaultsByProduct: attribute.defaults_by_product ?? {},
            hideRulesByProduct: normalizeRuleMap(
              attribute.hide_rules_by_product,
            ),
          },
          values: attribute.options
            .filter((option) => String(option.option_id ?? option.optionId ?? "") !== "custom")
            .map((option) => {
              const optionId = String(option.option_id ?? option.optionId ?? "");
              const allowedLinkedValues = attributeId === "0"
                ? []
                : [...new Set(data.prices!
                    .filter((row) => String(row.selection?.[`attr${attributeId}`] ?? "") === optionId)
                    .map((row) => String(row.selection?.attr0 ?? ""))
                    .filter(Boolean))];
              return {
                id: `import_value_${attributeId}_${optionId}`,
                label: option.label,
                value: optionId,
                priceMod: "1",
                meta: {
                  uprintingOptionId: optionId,
                  default: Boolean(option.default),
                  allowedLinkedValues:
                    attributeId === "0"
                      ? []
                      : option.available_product_ids ?? allowedLinkedValues,
                  exclusionRulesByProduct: normalizeRuleMap(
                    option.exclusion_rules_by_product,
                  ),
                },
              };
            }),
        };
      });
      const allowedSelectionKeys = new Set(importedGroups.map((group) => group.key));
      const allImportedRows: ImportedVariationPrice[] = data.prices.map((row, index) => {
        const price = Number(row.price);
        const unitPrice = Number(row.unitPrice ?? row.unit_price);
        const quantity = Number(row.quantity);
        if (!row.selection || !Number.isFinite(price) || !Number.isFinite(unitPrice) || !Number.isFinite(quantity)) {
          throw new Error(`Invalid price row at position ${index + 1}`);
        }
        return {
          selection: Object.fromEntries(Object.entries(row.selection)
            .filter(([key]) => allowedSelectionKeys.has(key))
            .map(([key, value]) => [key, String(value)])),
          price,
          unitPrice,
          quantity,
          turnaroundDays: row.turnaroundDays ?? row.turnaround_days,
          inStock: typeof row.inStock === "boolean" ? row.inStock : row.in_stock !== "n" && row.in_stock !== false,
        };
      });
      // Two originally-different scrape requests can resolve to the exact
      // same real combination (UPrinting substituted both to the same valid
      // paper/quantity), and trimming to only the imported attributes can
      // also collapse rows further. The backend's unique (productId,
      // selectionKey) constraint already discards true duplicates - dedupe
      // here too so the row count we tell it to expect matches what actually
      // gets stored, instead of failing the import over a legitimate collapse.
      const seenSelectionKeys = new Set<string>();
      const rows: ImportedVariationPrice[] = [];
      for (const row of allImportedRows) {
        const key = Object.entries(row.selection).sort().map(([k, v]) => `${k}=${v}`).join("&");
        if (seenSelectionKeys.has(key)) continue;
        seenSelectionKeys.add(key);
        rows.push(row);
      }
      // The scraper sweeps one attribute at a time off the default combo (see
      // preview_server.py's /api/export) rather than every joint combination -
      // that's thousands of live requests and gets rate-limited long before it
      // finishes. Each such row therefore isolates exactly one option's real
      // dollar effect: reconstruct it as that option's priceAdd (read by
      // calcMatrixFallbackPrice, see products-api.ts) so a combination the
      // matrix never saw still prices from real deltas instead of freezing at
      // the flat base price. matrixUnitPrice is also stashed from the same
      // row - Quantity specifically needs its real per-unit rate (bulk
      // discount), not a flat per-unit add, since its rows are priced at
      // that exact quantity rather than at quantity 1 like every other group.
      const defaultSelection = Object.fromEntries(
        Object.entries(data.default_selection ?? {}).filter(([key]) => allowedSelectionKeys.has(key)),
      );
      const anchorRow = rows.find(
        (row) =>
          Object.keys(row.selection).length === Object.keys(defaultSelection).length &&
          Object.entries(defaultSelection).every(([key, value]) => row.selection[key] === value),
      );
      if (anchorRow) {
        for (const row of rows) {
          if (row === anchorRow) continue;
          const diffKeys = Object.keys(defaultSelection).filter(
            (key) => row.selection[key] !== anchorRow.selection[key],
          );
          if (diffKeys.length !== 1) continue;
          const [changedKey] = diffKeys;
          const group = importedGroups.find((g) => g.key === changedKey);
          const value = group?.values.find((v) => v.value === row.selection[changedKey]);
          if (value) {
            value.meta = {
              ...value.meta,
              unitPriceAdd: row.unitPrice - anchorRow.unitPrice,
              matrixUnitPrice: row.unitPrice,
            };
          }
        }
        for (const group of importedGroups) {
          for (const value of group.values) {
            value.meta = {
              ...value.meta,
              matrixAnchorPrice: anchorRow.price,
              matrixAnchorUnitPrice: anchorRow.unitPrice,
            };
          }
        }
      }
      const importedDescription = typeof data.description === "string" ? data.description.trim() : "";
      const importedFeaturedImage = typeof data.product_image === "string" ? data.product_image.trim() : "";
      const importedGallery = Array.isArray(data.images)
        ? [...new Set(data.images.map((url) => String(url).trim()).filter(Boolean))]
        : [];
      const importedName = (data.metadata?.productName ?? data.metadata?.product_name ?? "").trim();
      const importedMinPrice = rows.length ? Math.min(...rows.map((row) => row.price)) : undefined;
      setForm((current) => {
        const featuredImage = importedFeaturedImage || current.imageUrl;
        const galleryUrls = importedGallery.length
          ? importedGallery.filter((url) => url !== featuredImage)
          : current.galleryUrls;
        const name = importedName || current.name;
        return {
          ...current,
          optionGroups: importedGroups,
          description: importedDescription || current.description,
          imageUrl: featuredImage,
          videoUrl: typeof data.video === "string" ? data.video.trim() : current.videoUrl,
          previewDataUrl: featuredImage || current.previewDataUrl,
          galleryUrls,
          name,
          slug: importedName && !current.slugLocked ? slugifyProductName(name) : current.slug,
          // The imported matrix already has real prices for every combination;
          // seed "Starting from" with the cheapest one so admins aren't forced
          // to guess a number just to get past the required-field check.
          price: current.price.trim() ? current.price : (importedMinPrice !== undefined ? String(importedMinPrice) : current.price),
        };
      });
      setPricingImport({ sourceUrl: data.metadata?.sourceUrl ?? data.metadata?.source_url, rows });
      const importedMediaNote = [
        importedName && "title",
        importedDescription && "description",
        (importedFeaturedImage || importedGallery.length) && "images",
      ].filter(Boolean).join(" · ");
      toast({ title: "Pricing JSON loaded", description: `${importedGroups.length} fields · ${rows.length.toLocaleString()} exact prices${importedMediaNote ? ` · ${importedMediaNote} filled` : ""}. Save/Update to import.`, tone: "success" });
    } catch (err) {
      setPricingImport(null);
      toast({ title: "JSON import failed", description: err instanceof Error ? err.message : "Invalid pricing file", tone: "danger" });
    } finally {
      setReadingPricingImport(false);
    }
  }

  async function uploadPricingMatrix(productId: string) {
    if (!pricingImport) return;
    await beginAdminPricingMatrix(productId, pricingImport.sourceUrl);
    const chunkSize = 500;
    for (let offset = 0; offset < pricingImport.rows.length; offset += chunkSize) {
      await uploadAdminPricingChunk(productId, pricingImport.rows.slice(offset, offset + chunkSize));
    }
    await completeAdminPricingMatrix(productId, pricingImport.rows.length);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.price) {
      setSection("basics");
      toast({
        title: "Missing fields",
        description: "Name and price are required.",
        tone: "warning",
      });
      return;
    }
    const slug =
      slugifyProductName(form.slug || form.name) ||
      `product-${Date.now().toString(36).slice(-4)}`;
    if (!slug) {
      setSection("basics");
      toast({
        title: "Slug required",
        description: "Enter a valid URL slug (letters, numbers, hyphens).",
        tone: "warning",
      });
      return;
    }
    if (!form.categoryId) {
      setSection("basics");
      toast({
        title: "Category required",
        description: "Select a DB category (backend must be running).",
        tone: "warning",
      });
      return;
    }

    setSaving(true);
    // Persist public/uploaded URL; never send data: previews
    const imageUrl =
      form.imageUrl && !form.imageUrl.startsWith("data:")
        ? form.imageUrl.trim()
        : "";

    if (form.previewDataUrl?.startsWith("blob:") && !imageUrl) {
      setSaving(false);
      setSection("media");
      toast({
        title: "Image not uploaded",
        description: "Wait for upload to finish, or paste a public image URL.",
        tone: "warning",
      });
      return;
    }

    try {
      const faqs = form.faqs
        .map((f) => ({
          question: (f.question ?? "").trim(),
          answer: (f.answer ?? "").trim(),
        }))
        .filter((f) => f.question && f.answer);
      const productTabs = tabsToPayload(form.tabs ?? []);
      const isPublished = form.status === "published";
      const galleryFromForm = form.galleryUrls
        .map((u) => u.trim())
        .filter((u) => u && !u.startsWith("data:") && !u.startsWith("blob:"));
      const galleryUrls = [
        ...(imageUrl ? [imageUrl] : []),
        ...galleryFromForm.filter((u) => u !== imageUrl),
      ].filter((u, i, arr) => arr.indexOf(u) === i);

      if (editing) {
        await updateAdminProduct(editing.product.id, {
          name: form.name.trim(),
          slug,
          description: form.description.trim() || "Custom print product.",
          shortDescription: form.shortDescription.trim() || undefined,
          seoTitle: form.seoTitle.trim() || undefined,
          seoDescription: form.seoDescription.trim() || undefined,
          basePrice: Number(form.price),
          categoryId: form.categoryId,
          deliveryDays: Number(form.deliveryDays) || 3,
          badge: form.badge.trim() || undefined,
          featured: form.featured,
          active: isPublished,
          imageUrl,
          videoUrl: form.videoUrl.trim() || undefined,
          galleryUrls,
          faqs,
          productTabs,
          options: buildOptionsPayload(),
        });
        await uploadPricingMatrix(editing.product.id);
        toast({
          title: "Saved to database",
          description: form.name,
          tone: "success",
        });
      } else {
        const res = await createAdminProduct({
          name: form.name.trim(),
          slug,
          description:
            form.description.trim() ||
            "Custom print product with flexible options.",
          shortDescription: form.shortDescription.trim() || undefined,
          seoTitle: form.seoTitle.trim() || undefined,
          seoDescription: form.seoDescription.trim() || undefined,
          basePrice: Number(form.price),
          categoryId: form.categoryId,
          deliveryDays: Number(form.deliveryDays) || 3,
          badge: form.badge.trim() || undefined,
          imageUrl: imageUrl || undefined,
          videoUrl: form.videoUrl.trim() || undefined,
          galleryUrls: galleryUrls.length ? galleryUrls : undefined,
          faqs,
          productTabs,
          featured: form.featured,
          active: isPublished,
          options: buildOptionsPayload(),
        });
        await uploadPricingMatrix(res.data.product.id);
        toast({
          title: "Stored in database",
          description: `${form.name} → /products/${res.data.product.slug}`,
          tone: "success",
        });
      }

      setOpen(false);
      setEditing(null);
      setForm(emptyForm(apiCategories));
      setPricingImport(null);
      await load();
    } catch (err) {
      toast({
        title: "Database save failed",
        description:
          err instanceof Error ? err.message : "Could not save product.",
        tone: "danger",
      });
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(row: ProductDetailPayload) {
    if (
      !window.confirm(
        `Delete “${row.product.name}” from the database? This cannot be undone.`,
      )
    ) {
      return;
    }
    try {
      await deleteAdminProduct(row.product.id);
      toast({
        title: "Deleted from database",
        description: row.product.name,
        tone: "info",
      });
      await load();
    } catch (err) {
      toast({
        title: "Delete failed",
        description:
          err instanceof Error ? err.message : "Could not delete product.",
        tone: "danger",
      });
    }
  }

  async function onBulkDelete(rows: ProductDetailPayload[]) {
    if (!rows.length) return;
    setBulkDeleting(true);
    let ok = 0;
    let failed = 0;
    try {
      for (const row of rows) {
        try {
          await deleteAdminProduct(row.product.id);
          ok += 1;
        } catch {
          failed += 1;
        }
      }
      toast({
        title: failed
          ? "Bulk delete finished with errors"
          : "Deleted from database",
        description:
          failed > 0
            ? `${ok} deleted, ${failed} failed.`
            : `${ok} product${ok === 1 ? "" : "s"} deleted.`,
        tone: failed > 0 ? "warning" : "info",
      });
      await load();
    } finally {
      setBulkDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary md:text-3xl">
            Products
          </h1>
          <p className="mt-1 text-sm font-medium text-text-secondary">
            {loading
              ? "Loading from PostgreSQL…"
              : `${items.length} product${items.length === 1 ? "" : "s"} in database · Edit / Delete below`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => void load()}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            Refresh
          </Button>
          <Button onClick={openCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Upload product
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-secondary">
                All products (database)
              </h2>
              <p className="mt-0.5 text-xs text-text-secondary">
                Search, edit price/image, or delete. Changes save to PostgreSQL.
              </p>
            </div>
            <div className="relative max-w-md flex-1 sm:min-w-[240px]">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search database products…"
                className="h-11 w-full rounded-xl border border-border bg-card pl-10 pr-4 text-sm font-medium focus-ring"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          {loading ? (
            <div className="space-y-3 p-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-14 animate-pulse rounded-xl bg-border/50"
                />
              ))}
            </div>
          ) : error ? (
            <div className="p-6 text-sm text-text-secondary">
              <p className="font-semibold text-secondary">API / DB error</p>
              <p className="mt-1">{error}</p>
              <p className="mt-2 text-xs">
                Start backend on :4000 and sign in at{" "}
                <Link
                  href="/admin/login"
                  className="font-semibold text-primary hover:underline"
                >
                  /admin/login
                </Link>
                .
              </p>
            </div>
          ) : items.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-text-secondary">
              No products in the database yet. Upload one to store it in
              PostgreSQL.
            </p>
          ) : (
            <AdminProductsTable
              data={items}
              globalFilter={query}
              onEdit={openEdit}
              onDelete={(row) => void onDelete(row)}
              onBulkDelete={onBulkDelete}
              bulkDeleting={bulkDeleting}
            />
          )}
        </CardContent>
      </Card>

      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
          setEditing(null);
        }}
        title={editing ? "Edit product" : "Add product"}
        description="Simple setup — fields, prices, then save."
        size="full"
        variant="dark"
        bodyClassName="bg-[#0f1117] p-4 sm:p-5"
        footer={
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex items-center gap-2 text-sm font-semibold text-zinc-200">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) =>
                  setForm((f) => ({ ...f, featured: e.target.checked }))
                }
                className="h-4 w-4 accent-[var(--primary)]"
              />
              Feature on homepage
            </label>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={sectionIndex <= 0}
                className="text-zinc-300 hover:bg-zinc-800 hover:text-white"
                onClick={() =>
                  setSection(FORM_SECTIONS[Math.max(0, sectionIndex - 1)]!.id)
                }
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={sectionIndex >= FORM_SECTIONS.length - 1}
                className="text-zinc-300 hover:bg-zinc-800 hover:text-white"
                onClick={() =>
                  setSection(
                    FORM_SECTIONS[
                      Math.min(FORM_SECTIONS.length - 1, sectionIndex + 1)
                    ]!.id,
                  )
                }
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
              <span className="mx-1 hidden h-6 w-px bg-zinc-700 sm:block" />
              <Button
                type="button"
                variant="outline"
                className="border-zinc-600 bg-transparent text-zinc-200 hover:bg-zinc-800"
                onClick={() => {
                  setOpen(false);
                  setEditing(null);
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form="admin-product-form"
                disabled={saving || uploading}
              >
                {saving
                  ? "Saving…"
                  : uploading
                    ? "Uploading…"
                    : editing
                      ? "Update"
                      : "Save"}
              </Button>
            </div>
          </div>
        }
      >
        <form
          id="admin-product-form"
          onSubmit={onSubmit}
          className="grid items-start gap-4 lg:grid-cols-[240px_1fr] xl:grid-cols-[260px_1fr]"
        >
          {/* Compact preview + steps */}
          <aside className="space-y-3 lg:sticky lg:top-0 lg:self-start">
            <div className="overflow-hidden rounded-xl border border-border bg-card">
              <div className="relative aspect-[4/3] bg-background">
                {form.previewDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={form.previewDataUrl}
                    alt="Preview"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-1 text-text-secondary">
                    <ImagePlus className="h-8 w-8 opacity-40" />
                    <span className="text-[11px] font-semibold">No image</span>
                  </div>
                )}
              </div>
              <div className="space-y-1 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-text-secondary">
                  {categoryOptions.find((c) => c.slug === form.categorySlug)
                    ?.name ?? "Category"}
                </p>
                <h4 className="truncate text-sm font-bold text-text-primary">
                  {form.name.trim() || "Product name"}
                </h4>
                <div className="flex items-center justify-between gap-2 pt-0.5">
                  <span className="text-base font-extrabold text-primary">
                    {form.price
                      ? `From ${formatCurrency(Number(form.price) || 0)}`
                      : "From $—"}
                  </span>
                  <Badge
                    variant={
                      form.status === "published" ? "success" : "outline"
                    }
                  >
                    {form.status === "published" ? "Live" : "Draft"}
                  </Badge>
                </div>
              </div>
            </div>

            <nav className="overflow-hidden rounded-xl border border-border bg-card">
              <ol className="p-1.5">
                {FORM_SECTIONS.map((s, i) => {
                  const isActive = s.id === section;
                  const needsAttention = incompleteSections[s.id];
                  return (
                    <li key={s.id}>
                      <button
                        type="button"
                        onClick={() => setSection(s.id)}
                        className={cn(
                          "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition focus-ring",
                          isActive
                            ? "bg-primary text-white"
                            : "text-text-secondary hover:bg-background hover:text-text-primary",
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[11px] font-bold",
                            isActive
                              ? "bg-white/20 text-white"
                              : "bg-background text-text-secondary",
                          )}
                        >
                          {i + 1}
                        </span>
                        <span className="min-w-0 flex-1 truncate text-sm font-semibold">
                          {s.label}
                        </span>
                        {needsAttention ? (
                          <span
                            className={cn(
                              "h-1.5 w-1.5 shrink-0 rounded-full",
                              isActive ? "bg-white" : "bg-warning",
                            )}
                            title="Still needs input"
                          />
                        ) : null}
                      </button>
                    </li>
                  );
                })}
              </ol>
            </nav>
          </aside>

          {/* Active section only — keeps each group of fields clearly separated */}
          <div className="min-w-0 space-y-4">
            <header className="rounded-xl border border-border bg-card px-4 py-3 sm:px-5">
              <p className="text-[11px] font-bold uppercase tracking-wide text-text-secondary">
                Step {sectionIndex + 1} / {FORM_SECTIONS.length}
              </p>
              <h4 className="text-lg font-bold text-text-primary">
                {activeSection.label}
              </h4>
              <p className="mt-0.5 text-xs text-text-secondary">
                {activeSection.hint}
              </p>
            </header>

            {section === "media" ? (
              <>
                <div className="rounded-2xl border border-border bg-card p-4 shadow-soft sm:p-5">
                  <h4 className="text-sm font-bold text-secondary">
                    Featured image
                  </h4>
                  <p className="mt-1 text-xs text-text-secondary">
                    Main product photo shown on cards and the product page hero.
                  </p>
                  <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-stretch">
                    <label
                      htmlFor={fileId}
                      className={cn(
                        "relative flex min-h-[140px] flex-1 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-background px-4 py-6 text-center transition hover:border-primary/50 hover:bg-primary/5",
                        uploading && "pointer-events-none opacity-70",
                      )}
                    >
                      <ImagePlus className="h-8 w-8 text-primary" />
                      <span className="text-sm font-bold text-secondary">
                        {uploading ? "Uploading…" : "Upload featured image"}
                      </span>
                      <span className="text-[11px] text-text-secondary">
                        PNG, JPG, WebP · recommended square
                      </span>
                    </label>
                    <input
                      id={fileId}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploading || saving}
                      onChange={(e) => {
                        void onPickImage(e.target.files?.[0] ?? null);
                        e.target.value = "";
                      }}
                    />
                    <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
                      <Input
                        label="Featured image URL"
                        value={
                          form.imageUrl.startsWith("data:") ? "" : form.imageUrl
                        }
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            imageUrl: e.target.value,
                            previewDataUrl: e.target.value || f.previewDataUrl,
                          }))
                        }
                        placeholder="https://… or pick a file to upload"
                      />
                      {form.previewDataUrl ? (
                        <button
                          type="button"
                          onClick={() =>
                            setForm((f) => ({
                              ...f,
                              imageUrl: "",
                              previewDataUrl: null,
                            }))
                          }
                          className="inline-flex w-fit items-center gap-1 text-xs font-semibold text-danger"
                        >
                          <X className="h-3.5 w-3.5" /> Remove featured image
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-card p-4 shadow-soft sm:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-secondary">
                        Gallery images
                      </h4>
                      <p className="mt-1 text-xs text-text-secondary">
                        Extra photos on the product page. Upload multiple at
                        once or paste URLs.
                      </p>
                    </div>
                    <label
                      htmlFor={galleryFileId}
                      className={cn(
                        "inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-xl border border-border bg-card px-3 text-xs font-semibold text-secondary transition hover:border-primary/40 hover:bg-primary/5",
                        uploading && "pointer-events-none opacity-60",
                      )}
                    >
                      <ImagePlus className="h-3.5 w-3.5 text-primary" />
                      {uploading ? "Uploading…" : "Add images"}
                    </label>
                    <input
                      id={galleryFileId}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      disabled={uploading || saving}
                      onChange={(e) => {
                        void onPickGalleryFiles(e.target.files);
                        e.target.value = "";
                      }}
                    />
                  </div>

                  {form.galleryUrls.length > 0 ? (
                    <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                      {form.galleryUrls.map((url) => (
                        <div
                          key={url}
                          className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-background"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={url}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeGalleryUrl(url)}
                            className="absolute right-1.5 top-1.5 inline-flex h-7 w-7 items-center justify-center rounded-lg bg-card/95 text-danger shadow-soft opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                            aria-label="Remove gallery image"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-4 rounded-xl border border-dashed border-border bg-[#f8f9fb] px-3 py-6 text-center text-xs text-text-secondary">
                      No gallery images yet. Use <strong>Add images</strong> or
                      paste a URL below.
                    </p>
                  )}

                  <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end">
                    <div className="min-w-0 flex-1">
                      <Input
                        label="Or paste gallery image URL"
                        id="gallery-url-input"
                        placeholder="https://…"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            const el = e.currentTarget;
                            addGalleryUrlFromInput(el.value);
                            el.value = "";
                          }
                        }}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="shrink-0"
                      onClick={() => {
                        const el = document.getElementById(
                          "gallery-url-input",
                        ) as HTMLInputElement | null;
                        if (!el) return;
                        addGalleryUrlFromInput(el.value);
                        el.value = "";
                      }}
                    >
                      Add URL
                    </Button>
                  </div>
                  <p className="mt-2 text-[11px] text-text-secondary">
                    {form.galleryUrls.length} gallery image
                    {form.galleryUrls.length === 1 ? "" : "s"}
                    {form.imageUrl ? " · featured image kept separate" : ""}
                  </p>
                </div>

                <div className="rounded-2xl border border-border bg-card p-4 shadow-soft sm:p-5">
                  <h4 className="text-sm font-bold text-secondary">
                    Product video
                  </h4>
                  <p className="mt-1 text-xs text-text-secondary">
                    Optional YouTube/Vimeo embed or direct MP4 URL shown below the gallery.
                  </p>
                  <div className="mt-4">
                    <Input
                      label="Video URL"
                      value={form.videoUrl}
                      onChange={(e) =>
                        setForm((current) => ({
                          ...current,
                          videoUrl: e.target.value,
                        }))
                      }
                      placeholder="https://www.youtube.com/embed/… or https://…/video.mp4"
                    />
                  </div>
                </div>
              </>
            ) : null}

            {section === "basics" ||
            section === "content" ||
            section === "seo" ? (
              <div className="rounded-2xl border border-border bg-card p-4 shadow-soft sm:p-5">
                <h4 className="text-sm font-bold text-secondary">
                  {section === "basics"
                    ? "Product information"
                    : section === "content"
                      ? "Descriptions"
                      : "Search engine listing"}
                </h4>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {section === "basics" ? (
                    <>
                      <div className="sm:col-span-2">
                        <Input
                          label="Product name"
                          value={form.name}
                          onChange={(e) => {
                            const name = e.target.value;
                            setForm((f) => ({
                              ...f,
                              name,
                              slug: f.slugLocked
                                ? f.slug
                                : slugifyProductName(name),
                            }));
                          }}
                          required
                        />
                      </div>

                      <div className="sm:col-span-2 space-y-1.5">
                        <Input
                          label="URL slug (custom URL)"
                          value={form.slug}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              slug:
                                slugifyProductName(e.target.value) ||
                                e.target.value,
                              slugLocked: true,
                            }))
                          }
                          placeholder="custom-product-boxes"
                          required
                        />
                        <p className="text-xs text-text-secondary">
                          Storefront URL:{" "}
                          <span className="font-semibold text-secondary">
                            /products/{form.slug || "…"}
                          </span>
                        </p>
                      </div>
                    </>
                  ) : null}

                  {section === "seo" ? (
                    <>
                      <div className="sm:col-span-2 space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <label className="block text-sm font-semibold text-text-primary">
                            SEO title
                          </label>
                          <span
                            className={cn(
                              "text-[11px] font-semibold",
                              form.seoTitle.length >= 60
                                ? "text-danger"
                                : "text-text-secondary",
                            )}
                          >
                            {form.seoTitle.length}/60
                          </span>
                        </div>
                        <input
                          value={form.seoTitle}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              seoTitle: e.target.value.slice(0, 60),
                            }))
                          }
                          maxLength={60}
                          className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm font-medium focus-ring"
                          placeholder={
                            form.name.trim() || "Browser tab / Google title"
                          }
                        />
                      </div>

                      <div className="sm:col-span-2 space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <label className="block text-sm font-semibold text-text-primary">
                            Meta description
                          </label>
                          <span
                            className={cn(
                              "text-[11px] font-semibold",
                              form.seoDescription.length >= 150
                                ? "text-danger"
                                : "text-text-secondary",
                            )}
                          >
                            {form.seoDescription.length}/150
                          </span>
                        </div>
                        <textarea
                          value={form.seoDescription}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              seoDescription: e.target.value.slice(0, 150),
                            }))
                          }
                          maxLength={150}
                          rows={2}
                          className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm font-medium focus-ring"
                          placeholder="Short SEO blurb for search results…"
                        />
                      </div>

                      <div className="sm:col-span-2 rounded-xl border border-border bg-background p-4">
                        <p className="text-[11px] font-bold uppercase tracking-wide text-text-secondary">
                          Google preview
                        </p>
                        <p className="mt-2 truncate text-base font-medium text-[#1a0dab]">
                          {form.seoTitle.trim() ||
                            form.name.trim() ||
                            "Product title"}
                        </p>
                        <p className="truncate text-xs text-[#006621]">
                          printoe.com/products/{form.slug || "…"}
                        </p>
                        <p className="mt-1 line-clamp-2 text-xs text-text-secondary">
                          {form.seoDescription.trim() ||
                            form.shortDescription.trim() ||
                            "Your meta description will appear here in search results."}
                        </p>
                      </div>
                    </>
                  ) : null}

                  {section === "basics" ? (
                    <>
                      <div className="sm:col-span-2 space-y-2">
                        <label className="block text-sm font-semibold text-text-primary">
                          Popular Products section
                        </label>
                        <p className="text-xs text-text-secondary">
                          Same list as homepage sidebar — pick where this
                          product goes.
                        </p>
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                          {categoryOptions.map((c) => {
                            const active = form.categorySlug === c.slug;
                            return (
                              <button
                                key={c.slug}
                                type="button"
                                onClick={() => onCategoryChange(c.slug)}
                                className={cn(
                                  "flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition focus-ring",
                                  active
                                    ? "border-primary bg-primary/15 text-primary shadow-soft"
                                    : "border-border bg-background text-text-primary hover:border-primary/40 hover:bg-primary/10",
                                )}
                              >
                                <span
                                  className={cn(
                                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                                    active ? "bg-primary/10" : "bg-background",
                                  )}
                                >
                                  <DynamicIcon
                                    name={c.icon}
                                    className="h-4 w-4"
                                  />
                                </span>
                                <span className="text-xs font-semibold leading-tight">
                                  {c.name}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <Input
                        label="Starting from ($)"
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.price}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, price: e.target.value }))
                        }
                        required
                        hint="Shown on storefront as “From $…”"
                      />
                      <Input
                        label="Delivery days"
                        type="number"
                        min="1"
                        value={form.deliveryDays}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            deliveryDays: e.target.value,
                          }))
                        }
                      />
                      <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-text-primary">
                          Publish status
                        </label>
                        <select
                          value={form.status}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              status: e.target.value as "published" | "draft",
                              active: e.target.value === "published",
                            }))
                          }
                          className="h-12 w-full rounded-2xl border border-border bg-card px-4 text-sm font-medium text-text-primary shadow-soft focus-ring focus:border-primary/50"
                        >
                          <option value="published">
                            Published (live in store)
                          </option>
                          <option value="draft">
                            Draft (hidden from store)
                          </option>
                        </select>
                      </div>
                      <div className="sm:col-span-1">
                        <Input
                          label="Badge (optional)"
                          value={form.badge}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, badge: e.target.value }))
                          }
                          placeholder="Best Seller"
                        />
                      </div>
                    </>
                  ) : null}

                  {section === "content" ? (
                    <>
                      <div className="sm:col-span-2 space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <label className="block text-sm font-semibold text-text-primary">
                            Product short description
                          </label>
                          <span
                            className={cn(
                              "text-[11px] font-semibold",
                              form.shortDescription.length >= 200
                                ? "text-danger"
                                : "text-text-secondary",
                            )}
                          >
                            {form.shortDescription.length}/200
                          </span>
                        </div>
                        <textarea
                          value={form.shortDescription}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              shortDescription: e.target.value.slice(0, 200),
                            }))
                          }
                          maxLength={200}
                          rows={2}
                          className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm font-medium focus-ring"
                          placeholder="One or two lines under the product title…"
                        />
                      </div>

                      <div className="sm:col-span-2 space-y-1.5">
                        <label className="block text-sm font-semibold text-text-primary">
                          Full description
                        </label>
                        <RichTextEditor
                          value={form.description}
                          onChange={(html) =>
                            setForm((f) => ({ ...f, description: html }))
                          }
                          placeholder="Write headings, bold text, lists, links…"
                        />
                      </div>
                    </>
                  ) : null}
                </div>
              </div>
            ) : null}

            {section === "faqs" ? (
              <div className="rounded-2xl border border-border bg-card p-4 shadow-soft sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-secondary">
                      Custom FAQs
                    </h4>
                    <p className="mt-1 text-xs text-text-secondary">
                      Same FAQs as the storefront FAQs tab. Edit or add your own
                      — empty rows are ignored on save.
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        faqs: [...f.faqs, { question: "", answer: "" }],
                      }))
                    }
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add FAQ
                  </Button>
                </div>
                <div className="mt-4 space-y-3">
                  {form.faqs.map((faq, index) => (
                    <div
                      key={index}
                      className="rounded-xl border border-border bg-background p-3 sm:p-4"
                    >
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-text-secondary">
                          FAQ {index + 1}
                        </span>
                        {form.faqs.length > 1 ? (
                          <button
                            type="button"
                            onClick={() =>
                              setForm((f) => ({
                                ...f,
                                faqs: f.faqs.filter((_, i) => i !== index),
                              }))
                            }
                            className="inline-flex items-center gap-1 text-xs font-semibold text-danger"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Remove
                          </button>
                        ) : null}
                      </div>
                      <div className="space-y-2">
                        <Input
                          label="Question"
                          value={faq.question}
                          onChange={(e) =>
                            setForm((f) => {
                              const faqs = [...f.faqs];
                              faqs[index] = {
                                ...faqs[index]!,
                                question: e.target.value,
                              };
                              return { ...f, faqs };
                            })
                          }
                          placeholder="What file formats do you accept?"
                        />
                        <div className="space-y-1.5">
                          <label className="block text-sm font-semibold text-text-primary">
                            Answer
                          </label>
                          <textarea
                            value={faq.answer}
                            onChange={(e) =>
                              setForm((f) => {
                                const faqs = [...f.faqs];
                                faqs[index] = {
                                  ...faqs[index]!,
                                  answer: e.target.value,
                                };
                                return { ...f, faqs };
                              })
                            }
                            rows={2}
                            className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm font-medium focus-ring"
                            placeholder="PDF, AI, EPS, and high-res PNG/JPG…"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {section === "tabs" ? (
              <div className="rounded-2xl border border-border bg-card p-4 shadow-soft sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-secondary">
                      Product tabs
                    </h4>
                    <p className="mt-1 text-xs text-text-secondary">
                      Optional UPrinting-style tabs under the product title.
                      Each tab has its own label and custom fields.
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        tabs: [...f.tabs, emptyTab()],
                      }))
                    }
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Tab
                  </Button>
                </div>

                {form.tabs.length === 0 ? (
                  <p className="mt-4 rounded-xl border border-dashed border-border bg-background px-4 py-6 text-center text-xs text-text-secondary">
                    No tabs yet. Click <strong>Add Tab</strong> if this product
                    needs Mailer / Product / Shipping style switchers.
                  </p>
                ) : (
                  <div className="mt-4 space-y-4">
                    {form.tabs.map((tab, tabIndex) => (
                      <div
                        key={tab.id}
                        className="rounded-xl border border-border bg-background p-3 sm:p-4"
                      >
                        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                          <span className="text-xs font-bold text-text-secondary">
                            Tab {tabIndex + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setForm((f) => ({
                                ...f,
                                tabs: f.tabs.filter((_, i) => i !== tabIndex),
                              }))
                            }
                            className="inline-flex items-center gap-1 text-xs font-semibold text-danger"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Remove tab
                          </button>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <Input
                            label="Tab label"
                            value={tab.label}
                            onChange={(e) =>
                              setForm((f) => {
                                const tabs = [...f.tabs];
                                tabs[tabIndex] = {
                                  ...tabs[tabIndex]!,
                                  label: e.target.value,
                                };
                                return { ...f, tabs };
                              })
                            }
                            placeholder="Product Boxes"
                          />
                          <Input
                            label="Tab price ($)"
                            type="number"
                            min={0}
                            step="0.01"
                            value={tab.price}
                            onChange={(e) =>
                              setForm((f) => {
                                const tabs = [...f.tabs];
                                tabs[tabIndex] = {
                                  ...tabs[tabIndex]!,
                                  price: e.target.value,
                                };
                                return { ...f, tabs };
                              })
                            }
                            placeholder="e.g. 29.99"
                          />
                          <div className="sm:col-span-2">
                            <Input
                              label="Icon URL (optional)"
                              value={tab.iconUrl}
                              onChange={(e) =>
                                setForm((f) => {
                                  const tabs = [...f.tabs];
                                  tabs[tabIndex] = {
                                    ...tabs[tabIndex]!,
                                    iconUrl: e.target.value,
                                  };
                                  return { ...f, tabs };
                                })
                              }
                              placeholder="https://… or /uploads/…"
                            />
                          </div>
                        </div>
                        <p className="mt-2 text-[11px] text-text-secondary">
                          Tab price shows on the storefront when this tab is
                          selected. Dropdown options can add extra with{" "}
                          <code className="rounded bg-background px-1">
                            Label | 5
                          </code>{" "}
                          (adds $5).
                        </p>

                        <div className="mt-4 space-y-3 border-t border-border pt-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-xs font-bold text-secondary">
                              Custom fields for this tab
                            </p>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                setForm((f) => {
                                  const tabs = [...f.tabs];
                                  const current = tabs[tabIndex]!;
                                  tabs[tabIndex] = {
                                    ...current,
                                    fields: [...current.fields, emptyField()],
                                  };
                                  return { ...f, tabs };
                                })
                              }
                            >
                              <Plus className="h-3.5 w-3.5" />
                              Add field
                            </Button>
                          </div>
                          {tab.fields.map((field, fieldIndex) => (
                            <div
                              key={field.id}
                              className="rounded-lg border border-border bg-card p-3"
                            >
                              <div className="mb-2 flex items-center justify-between gap-2">
                                <span className="text-[11px] font-semibold text-text-secondary">
                                  Field {fieldIndex + 1}
                                </span>
                                {tab.fields.length > 1 ? (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setForm((f) => {
                                        const tabs = [...f.tabs];
                                        const current = tabs[tabIndex]!;
                                        tabs[tabIndex] = {
                                          ...current,
                                          fields: current.fields.filter(
                                            (_, i) => i !== fieldIndex,
                                          ),
                                        };
                                        return { ...f, tabs };
                                      })
                                    }
                                    className="text-[11px] font-semibold text-danger"
                                  >
                                    Remove
                                  </button>
                                ) : null}
                              </div>
                              <div className="grid gap-3 sm:grid-cols-2">
                                <Input
                                  label="Field label"
                                  value={field.label}
                                  onChange={(e) =>
                                    setForm((f) => {
                                      const tabs = [...f.tabs];
                                      const current = tabs[tabIndex]!;
                                      const fields = [...current.fields];
                                      fields[fieldIndex] = {
                                        ...fields[fieldIndex]!,
                                        label: e.target.value,
                                      };
                                      tabs[tabIndex] = { ...current, fields };
                                      return { ...f, tabs };
                                    })
                                  }
                                  placeholder="Box size"
                                />
                                <div className="space-y-1.5">
                                  <label className="block text-sm font-semibold text-text-primary">
                                    Field type
                                  </label>
                                  <select
                                    value={field.type}
                                    onChange={(e) =>
                                      setForm((f) => {
                                        const tabs = [...f.tabs];
                                        const current = tabs[tabIndex]!;
                                        const fields = [...current.fields];
                                        fields[fieldIndex] = {
                                          ...fields[fieldIndex]!,
                                          type: e.target
                                            .value as FormTabField["type"],
                                        };
                                        tabs[tabIndex] = { ...current, fields };
                                        return { ...f, tabs };
                                      })
                                    }
                                    className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm font-medium focus-ring"
                                  >
                                    <option value="select">Dropdown</option>
                                    <option value="text">Text</option>
                                    <option value="number">Number</option>
                                  </select>
                                </div>
                              </div>
                              {field.type === "select" ? (
                                <div className="mt-2 space-y-1.5">
                                  <label className="block text-sm font-semibold text-text-primary">
                                    Options (one per line)
                                  </label>
                                  <textarea
                                    value={field.optionsText}
                                    onChange={(e) =>
                                      setForm((f) => {
                                        const tabs = [...f.tabs];
                                        const current = tabs[tabIndex]!;
                                        const fields = [...current.fields];
                                        fields[fieldIndex] = {
                                          ...fields[fieldIndex]!,
                                          optionsText: e.target.value,
                                        };
                                        tabs[tabIndex] = { ...current, fields };
                                        return { ...f, tabs };
                                      })
                                    }
                                    rows={3}
                                    className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm font-medium focus-ring"
                                    placeholder={
                                      "Small\nMedium | 5\nLarge | 12"
                                    }
                                  />
                                  <p className="text-[11px] text-text-secondary">
                                    Optional price addon:{" "}
                                    <code className="rounded bg-background px-1">
                                      Large | 12
                                    </code>
                                  </p>
                                </div>
                              ) : null}
                              <div className="mt-2">
                                <Input
                                  label="Help text (optional)"
                                  value={field.helpText}
                                  onChange={(e) =>
                                    setForm((f) => {
                                      const tabs = [...f.tabs];
                                      const current = tabs[tabIndex]!;
                                      const fields = [...current.fields];
                                      fields[fieldIndex] = {
                                        ...fields[fieldIndex]!,
                                        helpText: e.target.value,
                                      };
                                      tabs[tabIndex] = { ...current, fields };
                                      return { ...f, tabs };
                                    })
                                  }
                                  placeholder="Shown under the field"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : null}

            {section === "seo" ? (
              <div className="rounded-2xl border border-accent/30 bg-accent/5 p-4 sm:p-5">
                <p className="flex items-center gap-2 text-sm font-bold text-secondary">
                  <MapPin className="h-4 w-4 text-accent" />
                  Yeh product yahan show hoga
                </p>
                <ul className="mt-3 grid gap-2 text-sm text-text-secondary sm:grid-cols-2">
                  <li>
                    <span className="font-semibold text-secondary">
                      Popular Products →
                    </span>{" "}
                    {placement.popularName} (sidebar flyout)
                  </li>
                  <li>
                    <span className="font-semibold text-secondary">
                      Top nav →
                    </span>{" "}
                    {placement.navLabel}
                  </li>
                  <li>
                    <span className="font-semibold text-secondary">
                      Catalog page →
                    </span>{" "}
                    <Link
                      href={placement.catalogPath}
                      target="_blank"
                      className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                    >
                      {placement.catalogLabel}
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </li>
                  <li>
                    <span className="font-semibold text-secondary">
                      Featured Products →
                    </span>{" "}
                    {form.featured
                      ? "Haan — homepage Featured section"
                      : "Nahi (footer mein “Feature on homepage” check karo)"}
                  </li>
                  <li className="sm:col-span-2">
                    <span className="font-semibold text-secondary">
                      Top Sellers →
                    </span>{" "}
                    Homepage Top Sellers grid (DB products)
                  </li>
                </ul>
              </div>
            ) : null}

            {section === "options" ? (
              <AdminProductOptionEditor
                groups={form.optionGroups}
                onChange={(optionGroups) =>
                  setForm((f) => ({ ...f, optionGroups }))
                }
                categorySlug={form.categorySlug}
                categoryName={
                  categoryOptions.find((c) => c.slug === form.categorySlug)
                    ?.name
                }
                basePrice={Number(form.price) || 0}
                onImportJson={onImportPricingJson}
                importing={readingPricingImport}
                importSummary={pricingImport ? `${form.optionGroups.length} fields · ${pricingImport.rows.length.toLocaleString()} exact combination prices ready to upload on Save` : null}
              />
            ) : null}

            {section === "pricing" ? (
              <AdminProductPricingEditor
                basePrice={form.price}
                onBasePriceChange={(price) =>
                  setForm((current) => ({ ...current, price }))
                }
                groups={form.optionGroups}
                onChange={(optionGroups) =>
                  setForm((current) => ({ ...current, optionGroups }))
                }
              />
            ) : null}
          </div>
        </form>
      </Modal>
    </div>
  );
}
