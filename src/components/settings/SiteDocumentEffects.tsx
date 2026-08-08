"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSiteSettings } from "@/components/settings/SiteSettingsProvider";

function upsertLink(rel: string, href: string, attrs?: Record<string, string>) {
  const selector = `link[data-site-settings="${rel}"]`;
  let el = document.head.querySelector(selector) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("data-site-settings", rel);
    document.head.appendChild(el);
  }
  el.rel = rel;
  el.href = href;
  if (attrs) {
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  }
}

function upsertMeta(name: string, content: string, property = false) {
  const attr = property ? "property" : "name";
  const selector = `meta[data-site-settings="${name}"]`;
  let el = document.head.querySelector(selector) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("data-site-settings", name);
    document.head.appendChild(el);
  }
  el.setAttribute(attr, name);
  el.content = content;
}

function clearMarked(marker: string) {
  document
    .querySelectorAll(`[data-site-widget="${marker}"]`)
    .forEach((n) => n.remove());
}

/** Inject pasted HTML so <script> tags actually execute. */
function injectHtml(html: string, target: "head" | "body", marker: string) {
  clearMarked(marker);
  const trimmed = html.trim();
  if (!trimmed) return;

  const wrap = document.createElement("div");
  wrap.innerHTML = trimmed;
  const parent = target === "head" ? document.head : document.body;

  Array.from(wrap.childNodes).forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      if (!text) return;
      const span = document.createElement("span");
      span.setAttribute("data-site-widget", marker);
      span.style.display = "none";
      span.textContent = text;
      parent.appendChild(span);
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const el = node as HTMLElement;

    if (el.tagName === "SCRIPT") {
      const script = document.createElement("script");
      script.setAttribute("data-site-widget", marker);
      Array.from(el.attributes).forEach((attr) => {
        script.setAttribute(attr.name, attr.value);
      });
      if (el.textContent) script.text = el.textContent;
      parent.appendChild(script);
      return;
    }

    const clone = el.cloneNode(true) as HTMLElement;
    clone.setAttribute("data-site-widget", marker);
    parent.appendChild(clone);
  });
}

function extractSearchConsoleToken(raw: string): string | null {
  const value = raw.trim();
  if (!value) return null;
  const fromMeta = value.match(
    /content=["']([^"']+)["']/i,
  );
  if (fromMeta?.[1]) return fromMeta[1];
  return value.replace(/^google-site-verification=/i, "").trim() || null;
}

/** Applies favicon, SEO meta, analytics widgets, and custom head/body code. */
export function SiteDocumentEffects() {
  const site = useSiteSettings();
  const pathname = usePathname();
  const isAdmin = Boolean(pathname?.startsWith("/admin"));

  useEffect(() => {
    if (site.faviconUrl) {
      upsertLink("icon", site.faviconUrl);
      upsertLink("shortcut icon", site.faviconUrl);
    }
    if (site.seoDefaultDescription) {
      upsertMeta("description", site.seoDefaultDescription);
      upsertMeta("og:description", site.seoDefaultDescription, true);
    }
    if (site.seoOgImageUrl) {
      upsertMeta("og:image", site.seoOgImageUrl, true);
    }
    upsertMeta("og:site_name", site.name, true);
    document.title = document.title.includes("|")
      ? document.title.replace(/\|\s*.*$/, `| ${site.name}`)
      : document.title || site.name;
  }, [
    site.faviconUrl,
    site.seoDefaultDescription,
    site.seoOgImageUrl,
    site.name,
  ]);

  useEffect(() => {
    const token = extractSearchConsoleToken(site.googleSearchConsole ?? "");
    if (token) {
      upsertMeta("google-site-verification", token);
    } else {
      document
        .querySelectorAll('meta[data-site-settings="google-site-verification"]')
        .forEach((n) => n.remove());
    }
  }, [site.googleSearchConsole]);

  useEffect(() => {
    if (isAdmin) {
      clearMarked("ga");
      clearMarked("gtm");
      clearMarked("pixel");
      clearMarked("header-html");
      clearMarked("body-html");
      return;
    }

    const id = site.googleAnalyticsId?.trim();
    clearMarked("ga");
    if (!id || typeof window === "undefined") return;

    const script = document.createElement("script");
    script.setAttribute("data-site-widget", "ga");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
    document.head.appendChild(script);

    const inline = document.createElement("script");
    inline.setAttribute("data-site-widget", "ga");
    inline.text = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${id.replace(/'/g, "")}');`;
    document.head.appendChild(inline);
  }, [site.googleAnalyticsId, isAdmin]);

  useEffect(() => {
    if (isAdmin) return;
    const id = site.googleTagManagerId?.trim();
    clearMarked("gtm");
    if (!id || typeof window === "undefined") return;

    const script = document.createElement("script");
    script.setAttribute("data-site-widget", "gtm");
    script.text = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${id.replace(/'/g, "")}');`;
    document.head.appendChild(script);

    const noscript = document.createElement("noscript");
    noscript.setAttribute("data-site-widget", "gtm");
    noscript.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${encodeURIComponent(id)}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
    document.body.insertBefore(noscript, document.body.firstChild);
  }, [site.googleTagManagerId, isAdmin]);

  useEffect(() => {
    if (isAdmin) return;
    const id = site.metaPixelId?.trim();
    clearMarked("pixel");
    if (!id || typeof window === "undefined") return;

    const script = document.createElement("script");
    script.setAttribute("data-site-widget", "pixel");
    script.text = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${id.replace(/'/g, "")}');fbq('track','PageView');`;
    document.head.appendChild(script);
  }, [site.metaPixelId, isAdmin]);

  useEffect(() => {
    if (isAdmin) {
      clearMarked("header-html");
      return;
    }
    injectHtml(site.headerHtml ?? "", "head", "header-html");
  }, [site.headerHtml, isAdmin]);

  useEffect(() => {
    if (isAdmin) {
      clearMarked("body-html");
      return;
    }
    injectHtml(site.bodyHtml ?? "", "body", "body-html");
  }, [site.bodyHtml, isAdmin]);

  return null;
}
