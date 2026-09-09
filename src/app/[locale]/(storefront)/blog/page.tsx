import { notFound } from 'next/navigation';

import { listPublishedBlogPosts } from '@/features/blog/application/queries';
import { BlogListView } from '@/features/blog/ui/BlogListView';
import { isLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/get-dictionary';

type BlogPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function BlogPage({ params }: BlogPageProps) {
  const { locale: rawLocale } = await params;

  if (!isLocale(rawLocale)) {
    notFound();
  }

  const dictionary = getDictionary(rawLocale);
  const posts = await listPublishedBlogPosts(rawLocale);

  return (
    <BlogListView
      locale={rawLocale}
      copy={{
        title: dictionary.blog.title,
        empty: dictionary.blog.empty,
        readMore: dictionary.blog.readMore,
      }}
      posts={posts}
    />
  );
}
