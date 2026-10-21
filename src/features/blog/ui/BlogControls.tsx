"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Pencil, Trash2 } from "lucide-react";

import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  deleteBlogPostAction,
  toggleBlogPostAction,
} from "@/features/blog/application/manage-blog-lifecycle";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type BlogControlsProps = {
  locale: string;
  postId: string;
  title: string;
  isActive: boolean;
  onEdit: () => void;
  copy: Dictionary["admin"];
};

export function BlogControls({
  locale,
  postId,
  title,
  isActive,
  onEdit,
  copy,
}: BlogControlsProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function run(
    action: () => Promise<{ ok: boolean; error?: { code: string; message: string } }>,
    closeConfirm = false,
  ): void {
    startTransition(async () => {
      setError(null);
      const result = await action();
      if (!result.ok) {
        setError(blogErrorMessage(result.error?.code, copy));
        return;
      }
      if (closeConfirm) {
        setConfirmOpen(false);
      }
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={isPending}
          onClick={onEdit}
          className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50"
          aria-label={copy.blog.editAria.replace("{title}", title)}
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => setConfirmOpen(true)}
          className="rounded p-1.5 text-red-600 hover:bg-red-50 disabled:opacity-50"
          aria-label={copy.blog.deleteAria.replace("{title}", title)}
        >
          <Trash2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          role="switch"
          aria-checked={isActive}
          disabled={isPending}
          onClick={() =>
            run(() =>
              toggleBlogPostAction(locale, { postId, isActive: !isActive }),
            )
          }
          className={`relative ml-1 h-5 w-9 rounded-full transition-colors disabled:opacity-50 ${
            isActive ? "bg-green-500" : "bg-gray-300"
          }`}
          aria-label={
            isActive ? copy.blog.deactivateAria : copy.blog.activateAria
          }
        >
          <span
            className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
              isActive ? "translate-x-4" : "translate-x-0"
            }`}
          />
        </button>
      </div>
      {error ? <p className="text-xs text-red-700">{error}</p> : null}
      <ConfirmDialog
        open={confirmOpen}
        title={copy.confirm.deleteTitle}
        description={copy.confirm.deleteEntity
          .replace("{entity}", copy.confirm.entityLabels.post)
          .replace("{name}", title)}
        confirmLabel={copy.confirm.confirmLabel}
        cancelLabel={copy.confirm.cancelLabel}
        isPending={isPending}
        onClose={() => {
          if (!isPending) setConfirmOpen(false);
        }}
        onConfirm={() =>
          run(() => deleteBlogPostAction(locale, { postId }), true)
        }
      />
    </div>
  );
}

export function blogErrorMessage(
  code: string | undefined,
  copy: Dictionary["admin"],
): string {
  if (code === "IMAGE_REQUIRED") return copy.blog.errors.imageRequired;
  if (code === "VALIDATION_ERROR") return copy.blog.errors.invalid;
  if (code === "NOT_FOUND") return copy.blog.errors.notFound;
  return copy.blog.errors.saveFailed;
}
