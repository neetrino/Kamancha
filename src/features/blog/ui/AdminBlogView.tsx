"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  ADMIN_PAGE_SUBTITLE,
  ADMIN_PAGE_TITLE,
} from "@/features/admin/ui/admin-form-classes";
import { ADMIN_BADGE } from "@/features/admin/ui/status-badge";
import type { AdminBlogListItem } from "@/features/blog/application/queries";
import { BlogControls } from "@/features/blog/ui/BlogControls";
import { BlogDrawer } from "@/features/blog/ui/BlogDrawer";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type AdminBlogViewProps = {
  locale: string;
  posts: AdminBlogListItem[];
  copy: Dictionary["admin"];
};

export function AdminBlogView({ locale, posts, copy }: AdminBlogViewProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<AdminBlogListItem | null>(null);
  const countLabel =
    posts.length === 1
      ? copy.blog.count.replace("{count}", "1")
      : copy.blog.countPlural.replace("{count}", String(posts.length));

  function openCreate(): void {
    setEditing(null);
    setDrawerOpen(true);
  }

  function openEdit(post: AdminBlogListItem): void {
    setEditing(post);
    setDrawerOpen(true);
  }

  return (
    <section>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className={ADMIN_PAGE_TITLE}>{copy.blog.title}</h1>
          <p className={`mt-1 ${ADMIN_PAGE_SUBTITLE}`}>{countLabel}</p>
        </div>
        <Button type="button" onClick={openCreate}>
          {copy.blog.createPost}
        </Button>
      </div>
      <div className="space-y-3">
        {posts.map((post) => (
          <Card key={post.id} className="p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 flex-1 gap-3">
                {post.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- admin thumbnail
                  <img
                    src={post.imageUrl}
                    alt=""
                    className="h-16 w-24 shrink-0 rounded-lg border border-gray-200 object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-24 shrink-0 items-center justify-center rounded-lg border border-dashed border-gray-200 text-xs text-gray-400">
                    {copy.blog.noImage}
                  </div>
                )}
                <div className="min-w-0">
                  <button
                    type="button"
                    onClick={() => openEdit(post)}
                    className="text-left font-medium text-gray-900 hover:underline"
                  >
                    {post.title}
                  </button>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span
                      className={`${ADMIN_BADGE} ${
                        post.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {post.isActive ? copy.blog.active : copy.blog.inactive}
                    </span>
                    <span className="truncate text-xs text-gray-500">/blog/{post.slug}</span>
                  </div>
                </div>
              </div>
              <BlogControls
                locale={locale}
                postId={post.id}
                title={post.title}
                isActive={post.isActive}
                onEdit={() => openEdit(post)}
                copy={copy}
              />
            </div>
          </Card>
        ))}
        {posts.length === 0 ? (
          <Card className="p-6">
            <p className="text-center text-sm text-gray-600">{copy.blog.empty}</p>
          </Card>
        ) : null}
      </div>
      <BlogDrawer
        locale={locale}
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setEditing(null);
        }}
        post={editing}
        copy={copy}
      />
    </section>
  );
}
