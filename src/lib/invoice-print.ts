import type { CustomerInvoice } from "@/lib/customer-api";
import { formatCurrency } from "@/lib/utils";

function esc(value: string | null | undefined) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildInvoiceHtml(inv: CustomerInvoice) {
  const items = inv.items ?? [];
  const address = [
    inv.shippingAddress,
    [inv.shippingCity, inv.shippingState, inv.shippingZip]
      .filter(Boolean)
      .join(", "),
  ]
    .filter(Boolean)
    .join("<br/>");

  const rows =
    items.length > 0
      ? items
          .map(
            (it) => `
        <tr>
          <td>${esc(it.name)}${it.size ? `<div class="muted">${esc(it.size)}</div>` : ""}</td>
          <td class="num">${it.quantity}</td>
          <td class="num">${esc(formatCurrency(it.unitPrice))}</td>
          <td class="num">${esc(formatCurrency(it.unitPrice * it.quantity))}</td>
        </tr>`,
          )
          .join("")
      : `<tr><td colspan="4" class="muted">No line items</td></tr>`;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${esc(inv.id)} — Printoe Invoice</title>
  <style>
    body { font-family: Arial, Helvetica, sans-serif; color: #111; margin: 40px; }
    h1 { margin: 0 0 4px; font-size: 28px; }
    .muted { color: #666; font-size: 12px; }
    .row { display: flex; justify-content: space-between; gap: 24px; margin: 28px 0; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; }
    th, td { border-bottom: 1px solid #e5e7eb; padding: 10px 8px; text-align: left; font-size: 14px; }
    th { color: #666; font-size: 11px; text-transform: uppercase; letter-spacing: .04em; }
    .num { text-align: right; white-space: nowrap; }
    .totals { margin-left: auto; width: 280px; margin-top: 16px; }
    .totals div { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; }
    .totals .grand { font-weight: 700; font-size: 16px; border-top: 1px solid #111; margin-top: 8px; padding-top: 10px; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 999px; background: #f3f4f6; font-size: 12px; text-transform: capitalize; }
    @media print { body { margin: 16px; } }
  </style>
</head>
<body>
  <div class="row">
    <div>
      <h1>Invoice ${esc(inv.id)}</h1>
      <div class="muted">Order ${esc(inv.orderId)} · ${esc(inv.date)}</div>
      <div style="margin-top:8px"><span class="badge">${esc(inv.status)}</span></div>
    </div>
    <div style="text-align:right">
      <strong>Printoe</strong>
      <div class="muted">Custom print & packaging</div>
    </div>
  </div>

  <div class="row">
    <div>
      <div class="muted">Bill / ship to</div>
      <div><strong>${esc(inv.shippingName || "Customer")}</strong></div>
      ${inv.shippingEmail ? `<div class="muted">${esc(inv.shippingEmail)}</div>` : ""}
      ${address ? `<div style="margin-top:6px">${address}</div>` : ""}
    </div>
    <div style="text-align:right">
      ${inv.paymentMethod ? `<div class="muted">Payment</div><div>${esc(inv.paymentMethod)}</div>` : ""}
      ${inv.shippingMethod ? `<div class="muted" style="margin-top:8px">Shipping</div><div>${esc(inv.shippingMethod)}</div>` : ""}
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Item</th>
        <th class="num">Qty</th>
        <th class="num">Unit</th>
        <th class="num">Total</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>

  <div class="totals">
    <div><span>Subtotal</span><span>${esc(formatCurrency(inv.subtotal ?? inv.amount))}</span></div>
    ${(inv.discount ?? 0) > 0 ? `<div><span>Discount</span><span>-${esc(formatCurrency(inv.discount ?? 0))}</span></div>` : ""}
    <div><span>Shipping</span><span>${esc(formatCurrency(inv.shipping ?? 0))}</span></div>
    <div><span>Tax</span><span>${esc(formatCurrency(inv.tax ?? 0))}</span></div>
    <div class="grand"><span>Total</span><span>${esc(formatCurrency(inv.amount))}</span></div>
  </div>
</body>
</html>`;
}

/** Open invoice in a new tab for viewing / browser print. */
export function viewInvoice(inv: CustomerInvoice) {
  const html = buildInvoiceHtml(inv);
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank", "noopener,noreferrer");
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

/** Download invoice as an HTML file (open in browser → Print to PDF). */
export function downloadInvoice(inv: CustomerInvoice) {
  const html = buildInvoiceHtml(inv);
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${inv.id}.html`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}
