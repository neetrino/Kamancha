'use client';

import Image from 'next/image';

import { AppLink } from '@/components/ui/AppLink';
import { Stagger, StaggerItem } from '@/components/ui/RevealMotion';
import type { StorefrontBlogPostListItem } from '@/features/blog/application/queries';
import { CatalogPageHeader } from '@/features/products/ui/CatalogPageHeader';
import type { Locale } from '@/lib/i18n/config';
import { formatLongDate } from '@/lib/i18n/format-date';

type BlogListCopy = {
  title: string;
  empty: string;
  readMore: string;
};

type BlogListViewProps = {
  locale: Locale;
  copy: BlogListCopy;
  posts: StorefrontBlogPostListItem[];
};

/**
 * Storefront blog index — forest page chrome, cream cards.
 */
export function BlogListView({ locale, copy, posts }: BlogListViewProps) {
  return (
    <section className="flex flex-col gap-8 pb-16 sm:gap-10 sm:pb-20">
      <CatalogPageHeader heading={copy.title} />

      {posts.length === 0 ? (
        <p className="py-10 text-[16px] leading-[26px] text-[#c2c9bd]">{copy.empty}</p>
      ) : (
        <Stagger className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6 xl:gap-8" stagger={0.08}>
          {posts.map((post) => (
            <StaggerItem key={post.id}>
              <BlogPostCard
                locale={locale}
                href={`/${locale}/blog/${post.copy.slug}`}
                title={post.copy.title}
                excerpt={post.copy.excerpt}
                coverUrl={post.coverUrl}
                publishedAt={post.publishedAt}
                readMore={copy.readMore}
              />
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </section>
  );
}

type BlogPostCardProps = {
  locale: Locale;
  href: string;
  title: string;
  excerpt?: string;
  coverUrl: string | null;
  publishedAt: string | null;
  readMore: string;
};

function BlogPostCard({
  locale,
  href,
  title,
  excerpt,
  coverUrl,
  publishedAt,
  readMore,
}: BlogPostCardProps) {
  return (
    <article className="h-full overflow-hidden rounded-[30px] bg-[#efe7da] transition-transform duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] hover:-translate-y-1 motion-reduce:hover:translate-y-0">
      <AppLink href={href} prefetchPolicy="auto" className="flex h-full flex-col">
        {coverUrl ? (
          <div className="relative aspect-[16/10] w-full overflow-hidden">
            <Image
              src={coverUrl}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        ) : null}
        <div className="flex flex-1 flex-col px-6 pt-5 pb-6 sm:px-7 sm:pt-6">
          {publishedAt ? (
            <time
              dateTime={publishedAt}
              className="text-[13px] leading-5 text-[rgba(38,81,39,0.62)]"
            >
              {formatLongDate(publishedAt, locale)}
            </time>
          ) : null}
          <h2 className="font-big-fat-boii mt-2 text-[22px] leading-7 font-normal text-[#222] uppercase sm:text-[24px] sm:leading-8">
            {title}
          </h2>
          {excerpt ? (
            <p className="mt-3 line-clamp-3 text-[15px] leading-6 text-[rgba(34,34,34,0.72)]">
              {excerpt}
            </p>
          ) : null}
          <span className="mt-auto pt-5 font-big-fat-boii text-[14px] leading-5 font-normal text-brand-forest uppercase">
            {readMore}
          </span>
        </div>
      </AppLink>
    </article>
  );
}
