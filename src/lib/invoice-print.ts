import type { CustomerInvoice } from "@/lib/customer-api";
import type { ApiOrderDetail, OrderStatus } from "@/lib/orders-api";
import { formatCurrency } from "@/lib/utils";

function esc(value: string | null | undefined) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Break mailto autolink in browsers / PDF capture. */
function escEmail(value: string | null | undefined) {
  const raw = String(value ?? "");
  return esc(raw).replace(/@/g, "&#64;");
}

export function invoiceIdFromOrderNumber(orderNumber: string, fallbackId?: string) {
  const digits = orderNumber.replace(/\D/g, "");
  return `INV-${digits || fallbackId?.slice(-4) || "0000"}`;
}

function invoiceStatusFromOrder(status: OrderStatus | string) {
  const s = String(status).toLowerCase();
  return s === "delivered" || s === "shipped" ? "paid" : "pending";
}

/** Build a printable invoice from a customer/admin order detail payload. */
export function invoiceFromOrderDetail(order: ApiOrderDetail): CustomerInvoice {
  return {
    id: invoiceIdFromOrderNumber(order.orderNumber, order.id),
    orderId: order.orderNumber,
    date: order.createdAt.slice(0, 10),
    amount: order.total,
    subtotal: order.subtotal,
    shipping: order.shipping,
    tax: order.tax,
    discount: order.discount,
    status: invoiceStatusFromOrder(order.status),
    paymentMethod: order.paymentMethod,
    shippingName: order.shippingName ?? order.customer?.name,
    shippingEmail: order.shippingEmail ?? order.customer?.email,
    shippingAddress: order.shippingAddress,
    shippingCity: order.shippingCity,
    shippingState: order.shippingState,
    shippingZip: order.shippingZip,
    shippingMethod: order.shippingMethod,
    items: order.items.map((it) => ({
      name: it.name,
      quantity: it.quantity,
      unitPrice: it.unitPrice,
      size: it.size,
    })),
  };
}

type InvoiceHtmlOptions = {
  /** Tighter spacing for PDF capture */
  compact?: boolean;
  /** Preloaded logo as data URL (avoids blank/CORS in PDF) */
  logoDataUrl?: string | null;
};

export function buildInvoiceHtml(
  inv: CustomerInvoice,
  options: InvoiceHtmlOptions = {},
) {
  const { compact = false, logoDataUrl } = options;
  const items = inv.items ?? [];
  const address = [
    inv.shippingAddress,
    [inv.shippingCity, inv.shippingState, inv.shippingZip]
      .filter(Boolean)
      .join(", "),
  ]
    .filter(Boolean)
    .join("<br/>");

  const origin =
    typeof window !== "undefined" ? window.location.origin : "https://printoe.com";
  const logoUrl = logoDataUrl || `${origin}/assests/images/Printoe_Logo.png`;
  const status = String(inv.status || "pending").toLowerCase();
  const statusClass =
    status === "paid"
      ? "badge-paid"
      : status === "overdue"
        ? "badge-overdue"
        : "badge-pending";
  const paymentLabel = inv.paymentMethod
    ? esc(inv.paymentMethod.replace(/_/g, " "))
    : "";
  const shippingLabel = inv.shippingMethod
    ? esc(inv.shippingMethod.replace(/_/g, " "))
    : "";

  const rows =
    items.length > 0
      ? items
          .map(
            (it) => `
        <tr>
          <td>
            <div class="item-name">${esc(it.name)}</div>
            ${it.size && it.size !== "—" ? `<div class="item-meta">${esc(it.size)}</div>` : ""}
          </td>
          <td class="num">${it.quantity}</td>
          <td class="num">${esc(formatCurrency(it.unitPrice))}</td>
          <td class="num">${esc(formatCurrency(it.unitPrice * it.quantity))}</td>
        </tr>`,
          )
          .join("")
      : `<tr><td colspan="4" class="empty">No line items</td></tr>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${esc(inv.id)} — Printoe Invoice</title>
  <style>
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; }
    body {
      padding: ${compact ? "0" : "28px 16px"};
      background: ${compact ? "#ffffff" : "#e8ecf1"};
      color: #1a2332;
      font-family: "Segoe UI", "Helvetica Neue", Arial, sans-serif;
      font-size: 13px;
      line-height: 1.4;
      -webkit-font-smoothing: antialiased;
    }
    .sheet {
      width: ${compact ? "720px" : "100%"};
      max-width: 720px;
      margin: 0 auto;
      background: #fff;
      border-radius: ${compact ? "0" : "14px"};
      padding: ${compact ? "28px 32px 24px" : "32px 36px 28px"};
      box-shadow: ${compact ? "none" : "0 10px 32px rgba(26, 35, 50, 0.08)"};
    }
    .top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding-bottom: 16px;
      border-bottom: 1px solid #e4e8ee;
    }
    .logo {
      height: 48px;
      width: auto;
      max-width: 200px;
      object-fit: contain;
      display: block;
    }
    .brand-side { text-align: right; }
    .brand-side .tag {
      font-size: 11px;
      color: #7a8699;
      line-height: 1.35;
    }
    .meta {
      display: flex;
      justify-content: space-between;
      gap: 20px;
      margin-top: 20px;
      align-items: flex-start;
    }
    .title-row {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      gap: 8px 12px;
    }
    .title-row .label {
      font-size: 28px;
      font-weight: 800;
      color: #152238;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      line-height: 1;
    }
    .title-row .inv-id {
      font-size: 16px;
      font-weight: 700;
      color: #0d9aa8;
      line-height: 1;
    }
    .order-line {
      margin-top: 8px;
      color: #6b778a;
      font-size: 12px;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      margin-top: 10px;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 700;
      text-transform: capitalize;
    }
    .badge .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: currentColor;
      flex-shrink: 0;
    }
    .badge-pending { background: #fff1e6; color: #c2410c; }
    .badge-paid { background: #e8f8ef; color: #15803d; }
    .badge-overdue { background: #fde8e8; color: #b91c1c; }
    .side-card {
      min-width: 168px;
      background: #f5f7fa;
      border-radius: 10px;
      padding: 12px 14px;
    }
    .side-card .row {
      display: flex;
      justify-content: space-between;
      gap: 14px;
      font-size: 12px;
      padding: 3px 0;
    }
    .side-card .k { color: #8a94a6; }
    .side-card .v { color: #1a2332; font-weight: 700; text-transform: capitalize; }
    .bill {
      margin-top: 16px;
      background: #f5f7fa;
      border-radius: 10px;
      padding: 12px 14px;
    }
    .bill .section {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #8a94a6;
      margin-bottom: 6px;
    }
    .bill .who { font-weight: 700; color: #152238; font-size: 14px; }
    .bill .detail { margin-top: 2px; color: #5c6b7e; font-size: 12px; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 18px;
      border: 1px solid #e4e8ee;
      border-radius: 10px;
      overflow: hidden;
    }
    th {
      background: #eef3f8;
      color: #8a94a6;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.07em;
      text-transform: uppercase;
      text-align: left;
      padding: 10px 12px;
    }
    td {
      padding: 11px 12px;
      border-top: 1px solid #eef1f5;
      vertical-align: top;
      color: #1a2332;
      font-size: 13px;
    }
    .item-name { font-weight: 700; }
    .item-meta { margin-top: 2px; font-size: 11px; color: #8a94a6; }
    .num { text-align: right; white-space: nowrap; font-variant-numeric: tabular-nums; }
    .empty { color: #8a94a6; text-align: center; padding: 20px !important; }
    .totals {
      margin-top: 16px;
      margin-left: auto;
      width: 240px;
    }
    .totals .line {
      display: flex;
      justify-content: space-between;
      padding: 5px 2px;
      color: #5c6b7e;
      font-size: 12px;
    }
    .totals .line span:last-child { color: #1a2332; font-weight: 600; }
    .totals .grand {
      margin-top: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 11px 14px;
      border-radius: 8px;
      background: #152238;
      color: #fff;
      font-weight: 700;
      font-size: 14px;
    }
    .foot {
      margin-top: 22px;
      padding-top: 14px;
      border-top: 1px solid #e4e8ee;
      text-align: center;
      color: #9aa3b2;
      font-size: 12px;
    }
    @media (max-width: 640px) {
      .sheet { padding: 22px 16px; }
      .meta { flex-direction: column; }
      .side-card { width: 100%; }
      .title-row .label { font-size: 24px; }
    }
    @media print {
      body { background: #fff; padding: 0; }
      .sheet { max-width: none; box-shadow: none; border-radius: 0; padding: 12px; }
    }
  </style>
</head>
<body>
  <div class="sheet">
    <div class="top">
      <img class="logo" src="${esc(logoUrl)}" alt="Printoe" />
      <div class="brand-side">
        <div class="tag">Custom print &amp; packaging<br/>printoe.com</div>
      </div>
    </div>

    <div class="meta">
      <div>
        <div class="title-row">
          <span class="label">Invoice</span>
          <span class="inv-id">${esc(inv.id)}</span>
        </div>
        <div class="order-line">Order ${esc(inv.orderId)} · ${esc(inv.date)}</div>
        <span class="badge ${statusClass}"><span class="dot"></span>${esc(status)}</span>
      </div>
      ${
        paymentLabel || shippingLabel
          ? `<div class="side-card">
        ${paymentLabel ? `<div class="row"><span class="k">Payment</span><span class="v">${paymentLabel}</span></div>` : ""}
        ${shippingLabel ? `<div class="row"><span class="k">Shipping</span><span class="v">${shippingLabel}</span></div>` : ""}
      </div>`
          : ""
      }
    </div>

    <div class="bill">
      <div class="section">Bill / ship to</div>
      <div class="who">${esc(inv.shippingName || "Customer")}</div>
      ${inv.shippingEmail ? `<div class="detail">${escEmail(inv.shippingEmail)}</div>` : ""}
      ${address ? `<div class="detail">${address}</div>` : ""}
    </div>

    <table>
      <thead>
        <tr>
          <th>Item</th>
          <th class="num">Qty</th>
          <th class="num">Unit price</th>
          <th class="num">Total</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>

    <div class="totals">
      <div class="line"><span>Subtotal</span><span>${esc(formatCurrency(inv.subtotal ?? inv.amount))}</span></div>
      ${(inv.discount ?? 0) > 0 ? `<div class="line"><span>Discount</span><span>-${esc(formatCurrency(inv.discount ?? 0))}</span></div>` : ""}
      <div class="line"><span>Shipping</span><span>${esc(formatCurrency(inv.shipping ?? 0))}</span></div>
      <div class="line"><span>Tax</span><span>${esc(formatCurrency(inv.tax ?? 0))}</span></div>
      <div class="grand"><span>Total</span><span>${esc(formatCurrency(inv.amount))}</span></div>
    </div>

    <div class="foot">Thank you for your business.</div>
  </div>
</body>
</html>`;
}

/** Open invoice in a new tab for viewing. */
export function viewInvoice(inv: CustomerInvoice) {
  const html = buildInvoiceHtml(inv, { compact: false });
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank", "noopener,noreferrer");
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

function waitForImages(root: ParentNode, timeoutMs = 8000) {
  const images = Array.from(root.querySelectorAll("img"));
  if (images.length === 0) return Promise.resolve();
  return Promise.all(
    images.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete && img.naturalWidth > 0) {
            resolve();
            return;
          }
          const done = () => resolve();
          img.addEventListener("load", done, { once: true });
          img.addEventListener("error", done, { once: true });
          setTimeout(done, timeoutMs);
        }),
    ),
  ).then(() => undefined);
}

async function loadLogoDataUrl(): Promise<string | null> {
  try {
    const origin = window.location.origin;
    const res = await fetch(`${origin}/assests/images/Printoe_Logo.png`);
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

/** Download invoice as a real PDF — scaled to fit one A4 page without stretch. */
export async function downloadInvoice(inv: CustomerInvoice) {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ]);

  const logoDataUrl = await loadLogoDataUrl();
  const html = buildInvoiceHtml(inv, { compact: true, logoDataUrl });

  const host = document.createElement("div");
  host.setAttribute("aria-hidden", "true");
  host.style.cssText =
    "position:fixed;left:-10000px;top:0;width:720px;background:#fff;pointer-events:none;";

  const parsed = new DOMParser().parseFromString(html, "text/html");
  const sourceSheet = parsed.querySelector(".sheet");
  const sourceStyle = parsed.querySelector("style");
  if (!(sourceSheet instanceof HTMLElement)) {
    throw new Error("Could not prepare invoice for PDF");
  }
  if (sourceStyle) {
    host.appendChild(document.importNode(sourceStyle, true));
  }
  const sheet = document.importNode(sourceSheet, true) as HTMLElement;
  host.appendChild(sheet);
  document.body.appendChild(host);

  try {
    await waitForImages(host);
    await new Promise((r) => setTimeout(r, 80));

    const canvas = await html2canvas(sheet, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      logging: false,
      width: 720,
      windowWidth: 720,
    });

    const imgData = canvas.toDataURL("image/png", 1.0);
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 12;
    const maxW = pageWidth - margin * 2;
    const maxH = pageHeight - margin * 2;

    // Uniform scale — never stretch
    const ratio = Math.min(maxW / canvas.width, maxH / canvas.height);
    const drawW = canvas.width * ratio;
    const drawH = canvas.height * ratio;
    const x = (pageWidth - drawW) / 2;
    const y = margin;

    pdf.addImage(imgData, "PNG", x, y, drawW, drawH, undefined, "FAST");
    pdf.save(`${inv.id}.pdf`);
  } finally {
    host.remove();
  }
}
