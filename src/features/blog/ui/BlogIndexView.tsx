import Image from "next/image";

import { AppLink } from "@/components/ui/AppLink";
import { Reveal } from "@/components/ui/RevealMotion";
import { BlogEmptyIllustration } from "@/features/blog/ui/BlogEmptyIllustration";
import type { StorefrontBlogCard } from "@/features/blog/application/queries";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type BlogIndexViewProps = {
  locale: Locale;
  posts: StorefrontBlogCard[];
  copy: Dictionary["blog"];
};

export function BlogIndexView({ locale, posts, copy }: BlogIndexViewProps) {
  return (
    <section className="pb-16">
      <header className="mb-8 max-w-2xl">
        <Reveal immediate>
          <h1 className="font-big-fat-boii text-[clamp(36px,5vw,64px)] leading-[1.05] font-normal text-[#e5e2e1]">
            {copy.title}
          </h1>
        </Reveal>
      </header>
      {posts.length === 0 ? (
        <div className="relative left-1/2 min-h-[420px] w-screen max-w-[100vw] -translate-x-1/2 [--blog-empty-photo:min(44vw,780px)] sm:min-h-[520px]">
          <p className="absolute inset-y-0 left-0 z-[1] flex w-[calc(100%-var(--blog-empty-photo))] items-center justify-center px-6 text-center font-big-fat-boii text-[clamp(22px,3vw,36px)] leading-[1.15] font-normal whitespace-pre-line text-[#e5e2e1]">
            {copy.empty}
          </p>
          <BlogEmptyIllustration />
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {posts.map((post) => (
            <li key={post.slug}>
              <AppLink
                href={`/${locale}/blog/${post.slug}`}
                prefetchPolicy="intent"
                className="group block overflow-hidden rounded-3xl border border-white/15 bg-white/5"
              >
                <div className="relative aspect-[4/3]">
                  <Image
                    src={post.imageUrl}
                    alt=""
                    fill
                    sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                </div>
                <h2 className="px-4 py-4 text-lg font-medium text-[#e5e2e1]">{post.title}</h2>
              </AppLink>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
