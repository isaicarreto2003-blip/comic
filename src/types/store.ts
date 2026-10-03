export type ProductFormat = 
  | 'hardcover' 
  | 'softcover' 
  | 'digital_pdf' 
  | 'art_print' 
  | 'collector_box';

export type ProductAvailability = 'in_stock' | 'out_of_stock' | 'preorder';

export interface ProductVariant {
  id: string;
  title: string;
  format: ProductFormat;
  price: number; // in USD base
  compareAtPrice?: number;
  sku: string;
  gtin: string; // 13-digit EAN/GTIN required by Google Merchant Center
  mpn: string; // Manufacturer Part Number
  barcode: string;
  weightGrams: number;
  stockQty: number;
  shopifyVariantId: string;
  requiresShipping: boolean;
  descriptionSnippet?: string;
}

export interface StoreProduct {
  id: string;
  title: string;
  handle: string; // url slug
  subtitle: string;
  description: string;
  biblicalPassage: string;
  category: 'books' | 'digital' | 'prints' | 'collectibles';
  googleProductCategory: string; // e.g. "Media > Books > Comic Books & Graphic Novels" or "1064"
  images: string[];
  variants: ProductVariant[];
  isFeatured?: boolean;
  tags: string[];
  rating: number;
  reviewsCount: number;
  author: string;
  illustrator: string;
  publisher: string;
  isbn?: string;
  pagesCount?: number;
  dimensions?: string; // e.g. "21 x 29.7 cm (A4 Deluxe)"
  paperSpecs?: string; // e.g. "Papel Couché Mate 170g / Tapa Dura Estampada en Foil"
  condition: 'new';
  availability: ProductAvailability;
  publishDate: string;
  customCreatedFromEditor?: boolean;
}

export interface CartItem {
  productId: string;
  variantId: string;
  quantity: number;
  productTitle: string;
  variantTitle: string;
  format: ProductFormat;
  price: number; // In selected currency
  basePriceUSD: number;
  image: string;
  sku: string;
  requiresShipping: boolean;
}

export type SupportedCurrency = 'GTQ' | 'USD' | 'EUR' | 'MXN' | 'GBP';

export interface CurrencyConfig {
  code: SupportedCurrency;
  symbol: string;
  rateFromUSD: number;
  name: string;
}

export interface ShopifyStoreConfig {
  shopDomain: string; // e.g. "isaicarreto2003.myshopify.com"
  ownerEmail: string; // "isaicarreto2003@gmail.com"
  storefrontAccessToken: string;
  buyButtonAppId?: string;
  integrationMode: 'buy_button' | 'direct_checkout' | 'storefront_api';
  testMode: boolean;
  currency: SupportedCurrency;
  accountStatus: 'connected' | 'free_plan' | 'development';
  customDiscountCode?: string;
}

export interface MerchantCenterDiagnosticItem {
  code: string;
  title: string;
  status: 'passed' | 'warning' | 'error';
  message: string;
  countAffected?: number;
}
