import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Sparkles, 
  Search, 
  Filter, 
  ExternalLink, 
  Check, 
  Download, 
  Layers, 
  BookOpen, 
  Image as ImageIcon, 
  ShieldCheck, 
  Star, 
  Tag, 
  Plus, 
  ArrowRight,
  Globe
} from 'lucide-react';
import { StoreProduct, ProductVariant, SupportedCurrency, ShopifyStoreConfig } from '../types/store';
import { CURRENCY_CONFIGS } from '../data/storeProducts';

interface StoreViewProps {
  products: StoreProduct[];
  currency: SupportedCurrency;
  setCurrency: (c: SupportedCurrency) => void;
  onOpenProductDetail: (product: StoreProduct) => void;
  onAddToCart: (product: StoreProduct, variant: ProductVariant, quantity: number) => void;
  onOpenMerchantCenterModal: () => void;
  onOpenShopifyModal: () => void;
  onOpenPublishModal: () => void;
  onOpenCartDrawer: () => void;
  cartCount: number;
}

export const StoreView: React.FC<StoreViewProps> = ({
  products,
  currency,
  setCurrency,
  onOpenProductDetail,
  onAddToCart,
  onOpenMerchantCenterModal,
  onOpenShopifyModal,
  onOpenPublishModal,
  onOpenCartDrawer,
  cartCount,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [addedProductId, setAddedProductId] = useState<string | null>(null);

  const currencyConfig = CURRENCY_CONFIGS[currency];
  const rate = currencyConfig.rateFromUSD;
  const symbol = currencyConfig.symbol;

  // Filter products
  const filteredProducts = products.filter((prod) => {
    const matchesCategory =
      selectedCategory === 'all' || prod.category === selectedCategory;
    const matchesSearch =
      searchQuery === '' ||
      prod.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.biblicalPassage.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleQuickAdd = (e: React.MouseEvent, product: StoreProduct) => {
    e.stopPropagation();
    const primaryVariant = product.variants[0];
    if (primaryVariant) {
      onAddToCart(product, primaryVariant, 1);
      setAddedProductId(product.id);
      setTimeout(() => setAddedProductId(null), 1800);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-neutral-950 overflow-y-auto min-h-0">
      {/* Top Banner / Hero for Store */}
      <section className="relative border-b border-neutral-800 bg-gradient-to-b from-neutral-900 via-neutral-950 to-neutral-950 px-6 py-8 md:py-12 overflow-hidden">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

        <div className="relative max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 text-center md:text-left max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Tienda Oficial de Cómics &amp; Arte Bíblico Noir</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-cinzel text-white tracking-tight leading-tight">
              OBRAS MAESTRAS EN CLAROSCURO
            </h1>

            <p className="text-sm text-neutral-300 leading-relaxed">
              Tomos encuadernados en tapa dura, ediciones de coleccionista y láminas de arte fine art giclée sobre las epopeyas bíblicas más intensas. Totalmente sincronizado con <strong>Google Shopping</strong> y checkout directo en <strong>Shopify</strong>.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2 justify-center md:justify-start">
              <button
                onClick={onOpenMerchantCenterModal}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 text-xs font-semibold transition-all shadow-sm"
              >
                <Globe className="w-3.5 h-3.5 text-blue-400" />
                <span>Google Merchant Feeds &amp; XML</span>
              </button>

              <button
                onClick={onOpenShopifyModal}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold transition-all shadow-sm"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
                <span>Shopify Free Sync (CSV)</span>
              </button>

              <button
                onClick={onOpenPublishModal}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/40 text-amber-300 text-xs font-semibold transition-all shadow-sm"
              >
                <Plus className="w-3.5 h-3.5 text-amber-400" />
                <span>Vender Mi Cómic Actual</span>
              </button>
            </div>
          </div>

          {/* Quick Floating Cart & Currency Card */}
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 shadow-2xl backdrop-blur max-w-xs w-full space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                Tu Bolsa de Compra
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                {cartCount} {cartCount === 1 ? 'artículo' : 'artículos'}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-400">Moneda activa:</span>
              <div className="flex gap-1 flex-wrap justify-end">
                {(['GTQ', 'USD', 'EUR', 'MXN', 'GBP'] as const).map((curr) => (
                  <button
                    key={curr}
                    onClick={() => setCurrency(curr)}
                    className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                      currency === curr
                        ? 'bg-amber-500 text-black shadow-sm font-black ring-1 ring-amber-300'
                        : 'bg-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {curr === 'GTQ' ? 'Q (GTQ)' : curr}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={onOpenCartDrawer}
              className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow-md shadow-amber-950/50 flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Ver Bolsa / Tramitar Pedido</span>
            </button>
          </div>
        </div>
      </section>

      {/* Control Bar: Categories, Search, Filters */}
      <section className="sticky top-0 z-20 bg-neutral-950/90 backdrop-blur-md border-b border-neutral-800 px-6 py-3">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 text-xs">
            {[
              { id: 'all', label: 'Todos' },
              { id: 'books', label: 'Novelas Gráficas (Libros)' },
              { id: 'prints', label: 'Láminas Fine Art Giclée' },
              { id: 'collectibles', label: 'Cofres de Coleccionista' },
              { id: 'digital', label: 'Ediciones Digitales' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-white text-black font-bold shadow-sm'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por título o pasaje..."
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <section className="max-w-6xl mx-auto w-full px-6 py-8 flex-1">
        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-neutral-400 space-y-3">
            <p className="text-sm">No se encontraron productos coincidentes.</p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="text-xs text-amber-400 hover:underline"
            >
              Restablecer filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const primaryVariant = product.variants[0];
              const minPrice = Math.min(...product.variants.map((v) => v.price));
              const maxPrice = Math.max(...product.variants.map((v) => v.price));
              const displayPrice =
                minPrice === maxPrice
                  ? `${symbol}${(minPrice * rate).toFixed(2)}`
                  : `Desde ${symbol}${(minPrice * rate).toFixed(2)}`;

              const isAdded = addedProductId === product.id;

              return (
                <div
                  key={product.id}
                  onClick={() => onOpenProductDetail(product)}
                  className="group bg-neutral-900/70 border border-neutral-800 hover:border-neutral-700 rounded-2xl overflow-hidden flex flex-col shadow-lg hover:shadow-2xl transition-all duration-200 cursor-pointer relative"
                >
                  {/* Cover Artwork */}
                  <div className="relative aspect-[3/4] bg-neutral-950 overflow-hidden">
                    <img
                      src={product.images[0]}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent opacity-80" />

                    {/* Top Badges */}
                    <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-black/80 backdrop-blur border border-white/10 text-amber-300">
                        {product.biblicalPassage}
                      </span>
                      {product.isFeatured && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-600/90 text-white">
                          Edición Lujo
                        </span>
                      )}
                    </div>

                    {/* Bottom overlay with Google Shopping badge */}
                    <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between pointer-events-none text-[10px]">
                      <span className="text-neutral-400 font-mono">
                        {product.variants.length} {product.variants.length === 1 ? 'formato' : 'formatos'}
                      </span>
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span>Google Merchant</span>
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-1 font-cinzel">
                        {product.title}
                      </h3>
                      <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                        {product.subtitle}
                      </p>
                    </div>

                    {/* Star ratings */}
                    <div className="flex items-center gap-1 text-[11px] text-amber-400">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-current" />
                        ))}
                      </div>
                      <span className="text-neutral-300 font-bold ml-1">{product.rating}</span>
                      <span className="text-neutral-500">({product.reviewsCount})</span>
                    </div>

                    {/* Price and Action Row */}
                    <div className="pt-2 border-t border-neutral-800 flex items-center justify-between">
                      <div>
                        <span className="text-xs text-neutral-500 block text-[10px]">Precio:</span>
                        <span className="text-sm font-extrabold text-white font-mono">
                          {displayPrice}
                        </span>
                      </div>

                      <button
                        onClick={(e) => handleQuickAdd(e, product)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                          isAdded
                            ? 'bg-emerald-600 text-white'
                            : 'bg-neutral-800 hover:bg-amber-600 text-neutral-200 hover:text-white border border-neutral-700'
                        }`}
                        title="Añadir a la bolsa"
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-3 h-3" />
                            <span>¡Listo!</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-3 h-3" />
                            <span>Comprar</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Trust & Guarantee Footer Bar */}
      <section className="border-t border-neutral-800 bg-neutral-950 px-6 py-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-white">Impresión Giclée &amp; Encuadernación</h4>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                Tintas pigmentadas UltraChrome de alta densidad sobre papeles certificados libres de ácido.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <Globe className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-white">Vinculado a Google Shopping</h4>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                Feeds XML en vivo con códigos GTIN para indexación en Google Free Product Listings mundiales.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-white">Checkout Seguro por Shopify</h4>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                Procesamiento seguro con encriptación SSL de 256 bits, Apple Pay, Google Pay y tarjetas.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
