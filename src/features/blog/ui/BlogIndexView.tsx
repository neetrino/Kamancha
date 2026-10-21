import Image from "next/image";

import { AppLink } from "@/components/ui/AppLink";
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
        <h1 className="font-big-fat-boii text-[clamp(36px,5vw,64px)] leading-[1.05] font-normal text-[#e5e2e1]">
          {copy.title}
        </h1>
        <p className="mt-3 text-base leading-7 text-[#c2c9bd]">{copy.subtitle}</p>
      </header>
      {posts.length === 0 ? (
        <p className="text-[#c2c9bd]">{copy.empty}</p>
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
