import Image from "next/image";

import { AppLink } from "@/components/ui/AppLink";
import type { StorefrontBlogPost } from "@/features/blog/application/queries";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type BlogPostViewProps = {
  locale: Locale;
  post: StorefrontBlogPost;
  copy: Dictionary["blog"];
};

export function BlogPostView({ locale, post, copy }: BlogPostViewProps) {
  return (
    <article className="mx-auto max-w-3xl pb-16">
      <AppLink
        href={`/${locale}/blog`}
        prefetchPolicy="intent"
        className="text-sm text-[#c2c9bd] hover:text-[#e5e2e1]"
      >
        {copy.back}
      </AppLink>
      <h1 className="mt-4 font-big-fat-boii text-[clamp(32px,4.5vw,56px)] leading-[1.05] font-normal text-[#e5e2e1]">
        {post.title}
      </h1>
      {post.excerpt ? (
        <p className="mt-4 text-lg leading-7 text-[#c2c9bd]">{post.excerpt}</p>
      ) : null}
      <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-3xl">
        <Image
          src={post.imageUrl}
          alt=""
          fill
          priority
          sizes="(min-width: 768px) 768px, 100vw"
          className="object-cover"
        />
      </div>
      <div className="mt-8 text-base leading-7 whitespace-pre-wrap text-[#e5e2e1]">
        {post.body}
      </div>
    </article>
  );
}
