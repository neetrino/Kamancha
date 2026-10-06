import {
  TidioChatLoader,
  type TidioVisitor,
} from "@/components/layout/TidioChatLoader";
import { getCurrentUser } from "@/lib/auth/session";
import type { Locale } from "@/lib/i18n/config";

const TIDIO_PUBLIC_KEY_PATTERN = /^[a-z0-9]+$/i;

type TidioChatProps = {
  locale: Locale;
};

async function getTidioVisitor(): Promise<TidioVisitor | null> {
  const user = await getCurrentUser();

  if (!user || user.status !== "ACTIVE") {
    return null;
  }

  return {
    distinct_id: user.id,
    email: user.email,
    name: `${user.firstName} ${user.lastName}`.trim(),
  };
}

/**
 * Loads the Tidio live chat widget when `NEXT_PUBLIC_TIDIO_PUBLIC_KEY` is set.
 * Signed-in customers are identified so Tidio does not ask for their email.
 * Tidio falls back to its default language when `locale` has no translation.
 */
export async function TidioChat({ locale }: TidioChatProps) {
  const publicKey = process.env.NEXT_PUBLIC_TIDIO_PUBLIC_KEY?.trim();

  if (!publicKey || !TIDIO_PUBLIC_KEY_PATTERN.test(publicKey)) {
    return null;
  }

  const visitor = await getTidioVisitor();

  return (
    <TidioChatLoader publicKey={publicKey} locale={locale} visitor={visitor} />
  );
}
