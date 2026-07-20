import { BlogListing } from "@/components/blog/BlogListing";

export const metadata = {
  title: "Resources & Blog",
  description:
    "Print craft guides, enterprise tips, and production best practices from Printoe.",
};

export default function BlogPage() {
  return <BlogListing />;
}
