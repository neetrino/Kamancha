import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { listPublishedBlogPosts } from "@/features/blog/application/queries";
import { BlogIndexView } from "@/features/blog/ui/BlogIndexView";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

type BlogPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: BlogPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) {
    return {};
  }

  const copy = getDictionary(locale).blog;
  return { title: copy.title, description: copy.subtitle };
}

export default async function BlogPage({ params }: BlogPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = getDictionary(locale);
  const posts = await listPublishedBlogPosts(locale);

  return (
    <BlogIndexView locale={locale} posts={posts} copy={dictionary.blog} />
  );
}
