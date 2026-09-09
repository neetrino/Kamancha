import Image from 'next/image';

import { AppLink } from '@/components/ui/AppLink';
import type { StorefrontBlogPost } from '@/features/blog/application/queries';
import type { Locale } from '@/lib/i18n/config';
import { formatLongDate } from '@/lib/i18n/format-date';

type BlogPostCopy = {
  back: string;
  tags: string;
};

type BlogPostViewProps = {
  locale: Locale;
  copy: BlogPostCopy;
  post: StorefrontBlogPost;
  contentHtml: string;
};

const ARTICLE_PROSE_CLASS = [
  'flex flex-col gap-4 text-[16px] leading-[26px] text-[rgba(34,34,34,0.81)]',
  '[&_h2]:font-big-fat-boii [&_h2]:text-[22px] [&_h2]:leading-7 [&_h2]:font-normal [&_h2]:text-[#222] [&_h2]:uppercase',
  '[&_h3]:font-big-fat-boii [&_h3]:text-[18px] [&_h3]:leading-6 [&_h3]:font-normal [&_h3]:text-[#222] [&_h3]:uppercase',
  '[&_a]:text-brand-forest [&_a]:underline [&_a]:underline-offset-2',
  '[&_ul]:list-disc [&_ul]:pl-5',
  '[&_ol]:list-decimal [&_ol]:pl-5',
  '[&_img]:rounded-[20px]',
  '[&_blockquote]:border-l-2 [&_blockquote]:border-brand-forest [&_blockquote]:pl-4 [&_blockquote]:italic',
].join(' ');

/**
 * Storefront blog article — cream sheet on forest chrome.
 */
export function BlogPostView({ locale, copy, post, contentHtml }: BlogPostViewProps) {
  return (
    <article className="flex flex-col gap-8 pb-16 sm:gap-10 sm:pb-20">
      <p>
        <AppLink
          href={`/${locale}/blog`}
          prefetchPolicy="intent"
          className="text-[14px] leading-6 text-[#c2c9bd] transition-colors hover:text-white"
        >
          ← {copy.back}
        </AppLink>
      </p>

      <header className="flex max-w-3xl flex-col gap-3">
        <h1 className="font-big-fat-boii text-[clamp(32px,4.6vw,58px)] leading-[1.05] font-normal text-[#e5e2e1] uppercase">
          {post.copy.title}
        </h1>
        {post.publishedAt ? (
          <time dateTime={post.publishedAt} className="text-[14px] leading-6 text-[#c2c9bd]">
            {formatLongDate(post.publishedAt, locale)}
          </time>
        ) : null}
        {post.copy.excerpt ? (
          <p className="text-[16px] leading-[26px] text-[#c2c9bd]">{post.copy.excerpt}</p>
        ) : null}
      </header>

      <div className="overflow-hidden rounded-[30px] bg-[#efe7da]">
        {post.coverUrl ? (
          <div className="relative aspect-[21/9] w-full overflow-hidden max-sm:aspect-[16/10]">
            <Image
              src={post.coverUrl}
              alt=""
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
          </div>
        ) : null}
        <div className="px-6 py-8 sm:px-10 sm:py-10 xl:px-14">
          <div className={ARTICLE_PROSE_CLASS} dangerouslySetInnerHTML={{ __html: contentHtml }} />
          {post.tags.length > 0 ? (
            <p className="mt-8 text-[13px] leading-5 text-[rgba(38,81,39,0.62)]">
              {copy.tags}: {post.tags.join(', ')}
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}
