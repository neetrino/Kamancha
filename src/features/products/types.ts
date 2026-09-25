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

export type ProductVariantAxis = {
  id: string;
  title: string;
  values: { id: string; title: string }[];
};

export type ProductVariantOption = {
  attributeId: string;
  valueId: string;
  valueTitle: string;
};

export type ProductVariantChoice = {
  id: string;
  sku: string;
  priceAmount: number;
  listPriceAmount: number;
  compareAtAmount: number | null;
  stockOnHand: number;
  imageUrl: string | null;
  options: ProductVariantOption[];
};

export type ProductVariantSet = {
  axes: ProductVariantAxis[];
  variants: ProductVariantChoice[];
};

export type ProductDetail = CatalogProduct & {
  images: ProductGalleryImage[];
  categories: ProductCategoryRef[];
  additions: ProductModifierChoice[];
  exceptions: ProductModifierChoice[];
  /** Named options such as meat type. The shopper picks one. */
  options: ProductOptionChoice[];
  variantSet: ProductVariantSet | null;
};

export type ProductOptionChoice = {
  id: string;
  title: string;
};

export type ProductModifierChoice = {
  id: string;
  name: string;
  priceAmount: number;
};
