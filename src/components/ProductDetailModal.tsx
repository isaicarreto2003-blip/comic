import React, { useState } from 'react';
import { 
  X, 
  ShoppingBag, 
  Check, 
  BookOpen, 
  Sparkles, 
  ShieldCheck, 
  Barcode, 
  Share2, 
  ExternalLink,
  Star
} from 'lucide-react';
import { StoreProduct, ProductVariant, SupportedCurrency, ShopifyStoreConfig } from '../types/store';
import { CURRENCY_CONFIGS } from '../data/storeProducts';

interface ProductDetailModalProps {
  product: StoreProduct | null;
  isOpen: boolean;
  onClose: () => void;
  currency: SupportedCurrency;
  onAddToCart: (product: StoreProduct, variant: ProductVariant, quantity: number) => void;
  shopifyConfig: ShopifyStoreConfig;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
  currency,
  onAddToCart,
  shopifyConfig,
}) => {
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedToast, setAddedToast] = useState(false);

  if (!isOpen || !product) return null;

  const currentVariant = product.variants.find((v) => v.id === selectedVariantId) || product.variants[0];
  const currencyConfig = CURRENCY_CONFIGS[currency];
  const rate = currencyConfig.rateFromUSD;
  const symbol = currencyConfig.symbol;

  const formattedPrice = `${symbol}${(currentVariant.price * rate).toFixed(2)}`;
  const formattedComparePrice = currentVariant.compareAtPrice
    ? `${symbol}${(currentVariant.compareAtPrice * rate).toFixed(2)}`
    : null;

  const handleAddToCart = () => {
    onAddToCart(product, currentVariant, quantity);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2200);
  };

  const handleDirectShopifyBuy = () => {
    const cleanDomain = (shopifyConfig.shopDomain || 'isaicarreto2003.myshopify.com')
      .replace(/^https?:\/\//, '')
      .replace(/\/+$/, '');
    const checkoutUrl = `https://${cleanDomain}/cart/${currentVariant.shopifyVariantId}:${quantity}`;
    window.open(checkoutUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div 
        className="bg-neutral-900 border border-neutral-700 w-full max-w-4xl max-h-[92vh] rounded-2xl flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-3.5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/80">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase tracking-widest">
              {product.category === 'books' ? 'Novela Gráfica' : product.category === 'prints' ? 'Fine Art Print' : 'Edición Digital'}
            </span>
            <span className="text-neutral-500 text-xs font-mono">·</span>
            <span className="text-xs font-medium text-neutral-400">
              {product.biblicalPassage}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left: Gallery & Zoom */}
          <div className="space-y-4">
            <div className="relative aspect-[3/4] bg-neutral-950 rounded-xl overflow-hidden border border-neutral-800 shadow-xl group">
              <img
                src={product.images[selectedImageIndex] || product.images[0]}
                alt={product.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-transparent pointer-events-none" />
              
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                <span className="px-2.5 py-1 rounded bg-black/80 backdrop-blur border border-white/10 text-[11px] font-mono text-neutral-300">
                  {product.dimensions || '21 x 29.7 cm'}
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase">
                  Google Shopping Aprobado
                </span>
              </div>
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`w-16 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImageIndex === idx
                        ? 'border-amber-500 shadow-md'
                        : 'border-neutral-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Trust badge */}
            <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800 text-xs text-neutral-400 space-y-1.5">
              <div className="flex items-center gap-2 text-white font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Garantía de Impresión Editorial &amp; Calidad</span>
              </div>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                Tinta negra carbón de máxima saturación, papel libre de ácido certificado FSC y encuadernación artesanal.
              </p>
            </div>
          </div>

          {/* Right: Details & Buying Options */}
          <div className="space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <h1 className="text-xl font-black text-white font-cinzel tracking-wide leading-tight">
                  {product.title}
                </h1>
                <p className="text-xs text-amber-400 font-medium mt-1">
                  {product.subtitle}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-white">{product.rating}</span>
                  <span className="text-xs text-neutral-500">({product.reviewsCount} reseñas verificadas)</span>
                </div>
              </div>

              {/* Price & Variant Bar */}
              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl font-black text-white font-mono">
                    {formattedPrice}
                  </span>
                  {formattedComparePrice && (
                    <span className="text-sm line-through text-neutral-500 font-mono">
                      {formattedComparePrice}
                    </span>
                  )}
                  <span className="text-[11px] font-bold text-emerald-400 ml-auto uppercase">
                    {currentVariant.stockQty > 0 ? `En Stock (${currentVariant.stockQty} disp.)` : 'Agotado'}
                  </span>
                </div>

                {/* Formats Selector */}
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-neutral-300 block">
                    Selecciona Formato / Edición:
                  </span>
                  <div className="grid grid-cols-1 gap-2">
                    {product.variants.map((variant) => (
                      <button
                        key={variant.id}
                        onClick={() => setSelectedVariantId(variant.id)}
                        className={`p-3 rounded-lg border text-left transition-all flex items-center justify-between ${
                          currentVariant.id === variant.id
                            ? 'bg-neutral-800 border-amber-500/80 text-white shadow-sm'
                            : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <span className="text-xs font-bold block text-white">
                            {variant.title}
                          </span>
                          {variant.descriptionSnippet && (
                            <span className="text-[10px] text-neutral-400 block line-clamp-1">
                              {variant.descriptionSnippet}
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-mono font-bold text-amber-400 shrink-0 ml-3">
                          {symbol}{(variant.price * rate).toFixed(2)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quantity Selector */}
                <div className="flex items-center justify-between pt-2 border-t border-neutral-850 text-xs">
                  <span className="text-neutral-400">Cantidad:</span>
                  <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded-lg p-0.5">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-2 py-1 text-neutral-400 hover:text-white rounded"
                    >
                      -
                    </button>
                    <span className="px-2 font-mono font-bold text-white text-xs">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-2 py-1 text-neutral-400 hover:text-white rounded"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Literary Description */}
              <div className="space-y-1.5 text-xs text-neutral-300 leading-relaxed">
                <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
                  Sinopsis de la Obra:
                </h4>
                <p className="text-neutral-300 leading-relaxed bg-neutral-950/40 p-3 rounded-lg border border-neutral-800/60">
                  {product.description}
                </p>
              </div>

              {/* Technical Specifications for Collectors & Google Merchant */}
              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-[11px] space-y-1.5">
                <div className="flex items-center justify-between text-neutral-400">
                  <span>Código GTIN / EAN-13:</span>
                  <span className="font-mono text-white flex items-center gap-1">
                    <Barcode className="w-3.5 h-3.5 text-neutral-400" />
                    {currentVariant.gtin}
                  </span>
                </div>
                <div className="flex items-center justify-between text-neutral-400">
                  <span>SKU de Editorial:</span>
                  <span className="font-mono text-neutral-200">{currentVariant.sku}</span>
                </div>
                {product.paperSpecs && (
                  <div className="flex items-center justify-between text-neutral-400">
                    <span>Papel &amp; Tinta:</span>
                    <span className="text-neutral-200 text-right truncate max-w-[200px]" title={product.paperSpecs}>
                      {product.paperSpecs}
                    </span>
                  </div>
                )}
                {product.isbn && (
                  <div className="flex items-center justify-between text-neutral-400">
                    <span>ISBN Internacional:</span>
                    <span className="font-mono text-neutral-200">{product.isbn}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2">
              <button
                onClick={handleAddToCart}
                className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-amber-950/40 flex items-center justify-center gap-2"
              >
                {addedToast ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    <span>¡Añadido a la Bolsa!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Añadir {quantity > 1 ? `(${quantity})` : ''} a la Bolsa</span>
                  </>
                )}
              </button>

              <button
                onClick={handleDirectShopifyBuy}
                className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition-colors border border-neutral-700 flex items-center justify-center gap-2"
              >
                <span>Comprar Directamente con Shopify SSL</span>
                <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
