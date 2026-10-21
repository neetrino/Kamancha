import type { BlogTranslationsJson } from "@/db/schema/blog";
import { locales, type Locale } from "@/lib/i18n/config";

const HY: Record<string, string> = {
  ա: "a",
  բ: "b",
  գ: "g",
  դ: "d",
  ե: "e",
  զ: "z",
  է: "e",
  ը: "y",
  թ: "t",
  ժ: "zh",
  ի: "i",
  լ: "l",
  խ: "kh",
  ծ: "ts",
  կ: "k",
  հ: "h",
  ձ: "dz",
  ղ: "gh",
  ճ: "ch",
  մ: "m",
  յ: "y",
  ն: "n",
  շ: "sh",
  ո: "o",
  չ: "ch",
  պ: "p",
  ջ: "j",
  ռ: "r",
  ս: "s",
  վ: "v",
  տ: "t",
  ր: "r",
  ց: "ts",
  ւ: "v",
  փ: "p",
  ք: "k",
  օ: "o",
  ֆ: "f",
  և: "ev",
};

const RU: Record<string, string> = {
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  е: "e",
  ё: "e",
  ж: "zh",
  з: "z",
  и: "i",
  й: "y",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "kh",
  ц: "ts",
  ч: "ch",
  ш: "sh",
  щ: "shch",
  ъ: "",
  ы: "y",
  ь: "",
  э: "e",
  ю: "yu",
  я: "ya",
};

/** Latin URL slug from a title (Armenian, Russian, or Latin). */
export function slugifyTitle(value: string): string {
  const lowered = value.trim().toLowerCase().replaceAll("ու", "u");
  const mapped = [...lowered]
    .map((char) => HY[char] ?? RU[char] ?? char)
    .join("");
  return mapped
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Address field while typing: a slug, with a trailing hyphen after a separator. */
export function slugifyAddressDraft(value: string): string {
  const keepHyphen = /[\s_-]$/.test(value);
  const slug = slugifyTitle(value);
  if (!slug) {
    return "";
  }

  return keepHyphen ? `${slug}-` : slug;
}

/** Locale copy, then hy → en → ru. */
export function pickBlogCopy(
  translations: BlogTranslationsJson,
  locale: Locale,
): BlogTranslationsJson[Locale] | null {
  const order = [locale, ...locales.filter((item) => item !== locale)];
  for (const key of order) {
    const copy = translations[key];
    if (copy?.title.trim() && copy.body.trim()) {
      return copy;
    }
  }
  return null;
}
