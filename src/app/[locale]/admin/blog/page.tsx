import { notFound } from "next/navigation";

import { listAdminBlogPosts } from "@/features/blog/application/queries";
import { AdminBlogView } from "@/features/blog/ui/AdminBlogView";
import { getStoreBlogSettings } from "@/features/settings/application/queries";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

type AdminBlogPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminBlogPage({ params }: AdminBlogPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = getDictionary(locale);
  const [posts, blogSettings] = await Promise.all([
    listAdminBlogPosts(locale),
    getStoreBlogSettings(),
  ]);

  return (
    <AdminBlogView
      locale={locale}
      posts={posts}
      storefrontEnabled={blogSettings.enabled}
      copy={dictionary.admin}
    />
  );
}
