export type EditorQuantityChoice = {
  value: string;
  label: string;
  qty: number;
  total?: number;
  unitPrice?: number;
};

export type EditorHandoff = {
  slug: string;
  name: string;
  apiBase: string;
  shopBase?: string;
  accessToken?: string;
  quantityKey: string;
  selections: Record<string, string>;
  details: { label: string; value: string }[];
  quantities: EditorQuantityChoice[];
  quantity: number;
  unitPrice: number;
  totalPrice: number;
};

export function getEditorBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_EDITOR_URL?.replace(/\/$/, "") ||
    (process.env.NODE_ENV === "production"
      ? "https://editor.printoe.com"
      : "http://localhost:3003")
  );
}

export function editorDesignUrl(handoff: EditorHandoff) {
  const { accessToken: _token, ...safe } = {
    ...sessionAuth(),
    ...handoff,
    accessToken: undefined,
  };
  const payload = encodeURIComponent(JSON.stringify(safe));
  return `${getEditorBaseUrl()}/?handoff=${payload}`;
}

export function openSavedDesignEditor(design: { id: string; previewUrl?: string | null }) {
  if (typeof window === "undefined") return;
  const token = window.localStorage.getItem("printoe_access_token");
  if (!token) {
    window.location.assign(
      `/login?next=${encodeURIComponent("/dashboard/saved-designs")}`,
    );
    return;
  }
  const url = new URL(`${getEditorBaseUrl()}/`);
  url.searchParams.set("printoeDesign", design.id);
  url.searchParams.set("pt", token);
  url.searchParams.set("api", getApiBaseUrlSafe());
  const preview = design.previewUrl || "";
  if (preview.startsWith("options:editor:")) {
    url.searchParams.set("projectId", preview.slice("options:editor:".length));
  }
  window.location.assign(url.toString());
}

export function openDesignStudio(editorUrl: string, returnPath: string) {
  if (typeof window === "undefined") return;
  const token = window.localStorage.getItem("printoe_access_token");
  if (!token) {
    window.location.assign(
      `/login?next=${encodeURIComponent(returnPath)}`,
    );
    return;
  }
  const url = new URL(editorUrl);
  url.searchParams.set("pt", token);
  window.location.assign(url.toString());
}

export function editorUrlFromFields(input: {
  slug: string;
  name: string;
  details: { label: string; value: string }[];
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  quantities?: EditorQuantityChoice[];
  selections?: Record<string, string>;
  quantityKey?: string;
}) {
  const qty = input.quantity || 1;
  return editorDesignUrl({
    slug: input.slug,
    name: input.name,
    apiBase: getApiBaseUrlSafe(),
    quantityKey: input.quantityKey ?? "quantity",
    selections: input.selections ?? {},
    details: input.details,
    quantities: input.quantities?.length
      ? input.quantities
      : [{ value: String(qty), label: String(qty), qty, unitPrice: input.unitPrice, total: input.totalPrice }],
    quantity: qty,
    unitPrice: input.unitPrice,
    totalPrice: input.totalPrice,
  });
}

function sessionAuth() {
  if (typeof window === "undefined") return {} as { shopBase?: string; accessToken?: string };
  const accessToken = window.localStorage.getItem("printoe_access_token") || undefined;
  return { shopBase: window.location.origin, accessToken };
}

function getApiBaseUrlSafe() {
  return (
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
    (process.env.NODE_ENV === "production"
      ? "https://api.printoe.com/api"
      : "http://localhost:4000/api")
  );
}

export function isAllowedEditorReturnUrl(raw: string) {
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" && url.protocol !== "http:") return false;
    const host = url.hostname.toLowerCase();
    return (
      host === "editor.printoe.com" ||
      host === "localhost" ||
      host === "127.0.0.1"
    );
  } catch {
    return false;
  }
}

export function sendLoggedInUserToEditor(rawNext: string) {
  if (typeof window === "undefined") return false;
  if (!isAllowedEditorReturnUrl(rawNext)) return false;
  const token = window.localStorage.getItem("printoe_access_token");
  if (!token) return false;
  const url = new URL(rawNext);
  url.searchParams.set("pt", token);
  url.searchParams.set("api", getApiBaseUrlSafe());
  window.location.assign(url.toString());
  return true;
}

export function parseQtyFromLabel(label: string, fallback = 1) {
  const n = Number(String(label).replace(/,/g, "").match(/[\d.]+/)?.[0]);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}
