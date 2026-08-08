import { notFound } from "next/navigation";
import { fetchPublicPage } from "@/lib/crm-api";
import {
  CmsDocumentBody,
  CmsPageShell,
} from "@/components/cms/CmsPageShell";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  try {
    const page = await fetchPublicPage(slug);
    return {
      title: page.seoTitle || page.title,
      description: page.seoDescription || undefined,
    };
  } catch {
    return { title: "Page" };
  }
}

export default async function CmsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let page;
  try {
    page = await fetchPublicPage(slug);
  } catch {
    notFound();
  }

  const updated = page.updatedAt
    ? new Date(page.updatedAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <CmsPageShell
      title={page.title}
      eyebrow="Company page"
      description={page.seoDescription}
      meta={updated ? `Last updated ${updated}` : null}
      backHref="/"
      backLabel="Home"
    >
      <CmsDocumentBody html={page.content} />
    </CmsPageShell>
  );
}
