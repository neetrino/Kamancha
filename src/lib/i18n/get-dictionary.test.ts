import { describe, expect, it } from "vitest";

import { getDictionary } from "@/lib/i18n/get-dictionary";

describe("getDictionary", () => {
  it("merges namespace files into the storefront dictionary shape", () => {
    const dictionary = getDictionary("en");

    expect(dictionary.brand).toBe("Kamancha");
    expect(dictionary.nav.home).toBe("Home");
    expect(dictionary.home.title).toBe("White Shop");
    expect(dictionary.contact.title).toBe("Contact");
    expect(dictionary.cartDrawer.title).toBe("Shopping Cart");
    expect(dictionary.checkout.title).toBe("Checkout");
    expect(dictionary.checkout.giftCard.title).toBe("Gift card code");
    expect(dictionary.checkout.bonus.title).toBe("Bonus balance");
  });

  it("loads Armenian and Russian namespaces", () => {
    expect(getDictionary("hy").nav.home).toBe("Գլխավոր");
    expect(getDictionary("hy").nav.groupOrder).toBe("Խմբային պատվեր");
    expect(getDictionary("ru").nav.home).toBe("Главная");
    expect(getDictionary("ru").nav.groupOrder).toBe("Групповой заказ");
    expect(getDictionary("en").nav.groupOrder).toBe("Group order");
  });

  it("exposes admin.nav.dashboard for all locales", () => {
    expect(getDictionary("en").admin.nav.dashboard).toBe("Dashboard");
    expect(typeof getDictionary("hy").admin.nav.dashboard).toBe("string");
    expect(typeof getDictionary("ru").admin.nav.dashboard).toBe("string");
  });
});
