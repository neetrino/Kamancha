import { notFound } from "next/navigation";

import { getDeliverySettings } from "@/features/delivery/application/get-delivery-settings";
import { AdminDeliveryView } from "@/features/delivery/ui/AdminDeliveryView";
import { isLocale } from "@/lib/i18n/config";

type AdminDeliveryPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminDeliveryPage({
  params,
}: AdminDeliveryPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const settings = await getDeliverySettings();

  return <AdminDeliveryView locale={locale} settings={settings} />;
}
