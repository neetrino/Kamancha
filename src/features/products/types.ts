type LocaleTranslation = {
  title: string;
  slug: string;
  description?: string;
  seoTitle?: string;
  seoDescription?: string;
};

export type CatalogProduct = {
  id: string;
  sku: string;
  /** Catalog list price before automatic discount. */
  listPriceAmount: number;
  /** Customer-facing unit price after automatic discount. */
  priceAmount: number;
  compareAtAmount: number | null;
  discountPercent: number | null;
  stockOnHand: number;
  translation: LocaleTranslation;
  imageUrl: string | null;
  /** True when the dish has additions/exceptions to choose on the PDP. */
  hasCustomizationOptions: boolean;
};

export type ProductGalleryImage = {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
};

export type ProductCategoryRef = {
  id: string;
  title: string;
  slug: string;
};

export type ProductDetail = CatalogProduct & {
  images: ProductGalleryImage[];
  categories: ProductCategoryRef[];
  additions: ProductModifierChoice[];
  exceptions: ProductModifierChoice[];
};

export type ProductModifierChoice = {
  id: string;
  name: string;
  priceAmount: number;
};
