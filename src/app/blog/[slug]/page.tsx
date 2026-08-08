import { notFound } from "next/navigation";
import { fetchPublicPost } from "@/lib/crm-api";
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
    const post = await fetchPublicPost(slug);
    return {
      title: post.title,
      description: post.excerpt || undefined,
    };
  } catch {
    return { title: "Post" };
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let post;
  try {
    post = await fetchPublicPost(slug);
  } catch {
    notFound();
  }

  const published = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <CmsPageShell
      title={post.title}
      eyebrow="Blog"
      description={post.excerpt}
      meta={published ? `Published ${published}` : null}
      coverImage={post.coverImage}
      backHref="/blog"
      backLabel="Back to blog"
    >
      <CmsDocumentBody html={post.content} />
    </CmsPageShell>
  );
}
