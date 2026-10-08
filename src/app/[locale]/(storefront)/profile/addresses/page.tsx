import { notFound } from "next/navigation";

import { listCheckoutDeliveryOptions } from "@/features/delivery/application/queries";
import { listCustomerAddresses } from "@/features/profile/application/address-queries";
import { ProfileAddressesView } from "@/features/profile/ui/ProfileAddressesView";
import { requireUser } from "@/lib/auth/policies";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

type AddressesPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AddressesPage({ params }: AddressesPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const user = await requireUser(locale);
  const dictionary = getDictionary(locale);
  const [addressRows, zones] = await Promise.all([
    listCustomerAddresses(user.id),
    listCheckoutDeliveryOptions(locale),
  ]);
  const copy = dictionary.profile.addressBook;

  return (
    <ProfileAddressesView
      locale={locale}
      addresses={addressRows}
      zones={zones.map((zone) => ({ id: zone.id, label: zone.label }))}
      labels={{
        title: dictionary.profile.addresses,
        addNew: copy.addNew,
        defaultBadge: copy.defaultBadge,
        setDefault: copy.setDefault,
        edit: copy.edit,
        delete: copy.delete,
        deleteConfirm: copy.deleteConfirm,
        noAddresses: copy.noAddresses,
        formAddTitle: copy.formAddTitle,
        formEditTitle: copy.formEditTitle,
        line1: copy.line1,
        addressPlaceholder: dictionary.checkout.placeholders.address,
        community: dictionary.checkout.form.deliveryLocation,
        selectCommunity: dictionary.checkout.form.selectLocation,
        isDefault: copy.isDefault,
        cancel: dictionary.profile.cancel,
        add: copy.add,
        update: copy.update,
        saving: dictionary.profile.saving,
      }}
    />
  );
}
