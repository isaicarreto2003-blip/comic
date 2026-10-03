import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  ShieldCheck, 
  ExternalLink, 
  Check, 
  Printer, 
  Tag, 
  Sparkles 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CartItem, SupportedCurrency, ShopifyStoreConfig } from '../types/store';
import { CURRENCY_CONFIGS } from '../data/storeProducts';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  currency: SupportedCurrency;
  setCurrency: (c: SupportedCurrency) => void;
  onUpdateQuantity: (variantId: string, delta: number) => void;
  onRemoveItem: (variantId: string) => void;
  onClearCart: () => void;
  shopifyConfig: ShopifyStoreConfig;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  currency,
  setCurrency,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  shopifyConfig,
}) => {
  const [couponCode, setCouponCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [orderConfirmed, setOrderConfirmed] = useState<any | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const currentCurrencyConfig = CURRENCY_CONFIGS[currency];
  const rate = currentCurrencyConfig.rateFromUSD;
  const symbol = currentCurrencyConfig.symbol;

  const subtotalUSD = items.reduce((acc, item) => acc + item.basePriceUSD * item.quantity, 0);
  const subtotal = subtotalUSD * rate;

  const discountAmount = (subtotal * discountPercent) / 100;
  const hasPhysicalItems = items.some((item) => item.requiresShipping);
  const shippingCost = hasPhysicalItems ? (subtotal > 60 * rate ? 0 : 4.99 * rate) : 0;
  const total = Math.max(0, subtotal - discountAmount + shippingCost);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = couponCode.trim().toUpperCase();
    if (!clean) return;

    if (clean === 'ISAI15' || clean === 'NOIRBIBLE15' || clean === shopifyConfig.customDiscountCode?.toUpperCase()) {
      setDiscountPercent(15);
      setAppliedCoupon(clean);
      setCouponError(null);
    } else if (clean === 'APOCALIPSIS10') {
      setDiscountPercent(10);
      setAppliedCoupon(clean);
      setCouponError(null);
    } else {
      setCouponError('Código no válido. Prueba con ISAI15');
    }
  };

  const handleShopifyCheckout = () => {
    if (items.length === 0) return;
    const cleanDomain = (shopifyConfig.shopDomain || 'isaicarreto2003.myshopify.com')
      .replace(/^https?:\/\//, '')
      .replace(/\/+$/, '');

    const cartParams = items
      .map((item) => `${item.variantId}:${item.quantity}`)
      .join(',');

    let checkoutUrl = `https://${cleanDomain}/cart/${cartParams}`;
    const code = appliedCoupon || shopifyConfig.customDiscountCode;
    if (code) {
      checkoutUrl += `?discount=${encodeURIComponent(code)}`;
    }

    window.open(checkoutUrl, '_blank');
  };

  const handleDirectSimulatedOrder = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      const orderId = `BN-${Math.floor(100000 + Math.random() * 900000)}`;
      setOrderConfirmed({
        orderId,
        date: new Date().toLocaleDateString('es-ES', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        total: `${symbol}${total.toFixed(2)} ${currency}`,
        items: [...items],
      });

      // Confetti celebration!
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#e11d48', '#f59e0b', '#10b981', '#3b82f6'],
      });

      onClearCart();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end">
      <div 
        className="w-full max-w-md bg-neutral-900 border-l border-neutral-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/80">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-400" />
            <h2 className="text-sm font-bold text-white tracking-wide">
              Bolsa de Compra Noir
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-800 text-neutral-300">
              {items.reduce((acc, i) => acc + i.quantity, 0)}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Currency Bar */}
        <div className="px-4 py-2.5 bg-neutral-950/60 border-b border-neutral-800 flex items-center justify-between text-xs">
          <span className="text-neutral-400">Moneda de compra:</span>
          <div className="flex items-center gap-1">
            {(['GTQ', 'USD', 'EUR', 'MXN', 'GBP'] as const).map((curr) => (
              <button
                key={curr}
                onClick={() => setCurrency(curr)}
                className={`px-2 py-1 rounded text-[11px] font-bold transition-all ${
                  currency === curr
                    ? 'bg-amber-500 text-black shadow-sm font-black'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {curr === 'GTQ' ? 'Q (GTQ)' : curr}
              </button>
            ))}
          </div>
        </div>

        {/* Order Confirmed Screen */}
        {orderConfirmed ? (
          <div className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-2">
              <Check className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 font-bold">
                ¡Pedido Confirmado con Éxito!
              </span>
              <h3 className="text-lg font-bold text-white">
                Orden #{orderConfirmed.orderId}
              </h3>
              <p className="text-xs text-neutral-400">
                Fecha: {orderConfirmed.date}
              </p>
            </div>

            <div className="w-full p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-left space-y-2 text-xs">
              <div className="flex justify-between border-b border-neutral-850 pb-2">
                <span className="text-neutral-400">Importe Total:</span>
                <span className="font-bold text-white">{orderConfirmed.total}</span>
              </div>
              <div className="flex justify-between border-b border-neutral-850 pb-2">
                <span className="text-neutral-400">Método de Facturación:</span>
                <span className="text-neutral-200">Express Checkout Seguro</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Estado de Envío:</span>
                <span className="text-emerald-400 font-medium">Preparando en Taller de Encuadernación</span>
              </div>
            </div>

            <div className="flex gap-2 w-full">
              <button
                onClick={() => window.print()}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition-colors border border-neutral-700"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Recibo</span>
              </button>
              <button
                onClick={() => {
                  setOrderConfirmed(null);
                  onClose();
                }}
                className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow-md"
              >
                Seguir Explorando
              </button>
            </div>
          </div>
        ) : items.length === 0 ? (
          /* Empty Cart */
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-neutral-400 space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-neutral-800/60 border border-neutral-700/50 flex items-center justify-center text-neutral-500">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-white">Tu bolsa está vacía</h3>
              <p className="text-xs text-neutral-400 max-w-xs">
                Explora los tomos en tapa dura, láminas giclée en blanco y negro o ediciones digitales en la tienda.
              </p>
            </div>
            <button
              onClick={onClose}
              className="mt-2 px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition-colors"
            >
              Ver Catálogo de Productos
            </button>
          </div>
        ) : (
          /* Cart Items List */
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {items.map((item) => (
              <div
                key={item.variantId}
                className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 flex gap-3 group relative"
              >
                <img
                  src={item.image}
                  alt={item.productTitle}
                  className="w-16 h-20 object-cover rounded-lg bg-neutral-900 border border-neutral-800 shrink-0"
                />

                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white line-clamp-1">
                      {item.productTitle}
                    </h4>
                    <span className="text-[11px] text-amber-400 font-medium block">
                      {item.variantTitle}
                    </span>
                    <span className="text-[10px] text-neutral-500 font-mono">
                      SKU: {item.sku}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded-lg p-0.5">
                      <button
                        onClick={() => onUpdateQuantity(item.variantId, -1)}
                        className="p-1 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-mono font-bold px-1.5 text-white">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.variantId, 1)}
                        className="p-1 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-white">
                        {symbol}{((item.basePriceUSD * rate) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onRemoveItem(item.variantId)}
                  className="absolute top-2 right-2 p-1 text-neutral-500 hover:text-rose-400 transition-colors"
                  title="Eliminar de la bolsa"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Footer with Calculations & Checkout */}
        {!orderConfirmed && items.length > 0 && (
          <div className="p-4 border-t border-neutral-800 bg-neutral-950/95 space-y-3">
            {/* Coupon Code Input */}
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Cupón (ej: NOIRBIBLE15)"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-8 pr-2 py-1.5 text-xs text-white uppercase placeholder:normal-case focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
              <button
                type="submit"
                className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold transition-colors border border-neutral-700"
              >
                Aplicar
              </button>
            </form>

            {appliedCoupon && (
              <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-400 flex items-center justify-between">
                <span>Cupón <strong>{appliedCoupon}</strong> aplicado (-{discountPercent}%)</span>
                <button
                  onClick={() => {
                    setAppliedCoupon(null);
                    setDiscountPercent(0);
                  }}
                  className="text-neutral-400 hover:text-white text-[10px]"
                >
                  Quitar
                </button>
              </div>
            )}

            {couponError && (
              <p className="text-[11px] text-rose-400">{couponError}</p>
            )}

            {/* Calculations Breakdown */}
            <div className="space-y-1.5 text-xs pt-1">
              <div className="flex justify-between text-neutral-400">
                <span>Subtotal:</span>
                <span className="font-mono text-neutral-200">{symbol}{subtotal.toFixed(2)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Descuento ({discountPercent}%):</span>
                  <span className="font-mono">-{symbol}{discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-neutral-400">
                <span>Envío Estimado:</span>
                <span className="font-mono text-neutral-200">
                  {shippingCost === 0 ? '¡Gratis!' : `${symbol}${shippingCost.toFixed(2)}`}
                </span>
              </div>

              <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-neutral-800">
                <span>Total a Pagar:</span>
                <span className="font-mono text-amber-400">{symbol}{total.toFixed(2)} {currency}</span>
              </div>
            </div>

            {/* Primary Checkout Actions */}
            <div className="space-y-2 pt-1">
              <button
                onClick={handleShopifyCheckout}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold tracking-wide transition-all shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2"
              >
                <span>Finalizar con Shopify Checkout</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleDirectSimulatedOrder}
                disabled={isProcessing}
                className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition-colors border border-neutral-700 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{isProcessing ? 'Procesando Orden...' : 'Completar Pedido Directo'}</span>
              </button>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-[10px] text-neutral-500 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Sincronizado con Google Shopping &amp; Shopify SSL</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
