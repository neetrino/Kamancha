import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getPublishedBlogPost } from "@/features/blog/application/queries";
import { BlogPostView } from "@/features/blog/ui/BlogPostView";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

type BlogPostPageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) {
    return {};
  }

  const post = await getPublishedBlogPost(locale, slug);
  if (!post) {
    return { title: getDictionary(locale).blog.title };
  }

  return {
    title: post.title,
    description: post.excerpt ?? post.body.slice(0, 160),
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const post = await getPublishedBlogPost(locale, slug);
  if (!post) {
    notFound();
  }

  return (
    <BlogPostView
      locale={locale}
      post={post}
      copy={getDictionary(locale).blog}
    />
  );
}
