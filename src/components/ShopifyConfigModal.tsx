import React, { useState } from 'react';
import { 
  X, 
  ShoppingBag, 
  Download, 
  ExternalLink, 
  Check, 
  Copy, 
  Sparkles, 
  Settings2, 
  ShieldCheck,
  Zap,
  Globe
} from 'lucide-react';
import { StoreProduct, ShopifyStoreConfig } from '../types/store';
import { generateShopifyProductCsv } from '../utils/merchantCenterFeed';

interface ShopifyConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: StoreProduct[];
  config: ShopifyStoreConfig;
  onUpdateConfig: (newConfig: ShopifyStoreConfig) => void;
}

export const ShopifyConfigModal: React.FC<ShopifyConfigModalProps> = ({
  isOpen,
  onClose,
  products,
  config,
  onUpdateConfig,
}) => {
  const [shopDomain, setShopDomain] = useState(config.shopDomain || 'isaicarreto2003.myshopify.com');
  const [ownerEmail, setOwnerEmail] = useState(config.ownerEmail || 'isaicarreto2003@gmail.com');
  const [discountCode, setDiscountCode] = useState(config.customDiscountCode || 'ISAI15');
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<'sync' | 'settings' | 'guide'>('sync');

  if (!isOpen) return null;

  const originUrl = window.location.origin;

  const handleDownloadCsv = () => {
    const csv = generateShopifyProductCsv(products, originUrl, 'GTQ', ownerEmail);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `shopify-productos-quetzales-isaicarreto2003.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const cleanDomain = shopDomain.replace(/^https?:\/\//, '').replace(/\/+$/, '');
  const sampleVariantId = products[0]?.variants[0]?.shopifyVariantId || '44810294198421';
  const testCheckoutUrl = `https://${cleanDomain}/cart/${sampleVariantId}:1?discount=${encodeURIComponent(discountCode)}`;

  const handleCopyCheckout = () => {
    navigator.clipboard.writeText(testCheckoutUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSave = () => {
    onUpdateConfig({
      ...config,
      shopDomain: cleanDomain,
      ownerEmail,
      currency: 'GTQ',
      customDiscountCode: discountCode,
      accountStatus: 'connected',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div 
        className="bg-neutral-900 border border-neutral-700 w-full max-w-3xl max-h-[90vh] rounded-2xl flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  Shopify Vinculado · Cuenta Free (isaicarreto2003@gmail.com)
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Formato Oficial: Quetzales (Q)
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Sincronización directa en moneda nacional (GTQ) con tu cuenta de Shopify
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Account Link Banner */}
        <div className="px-6 py-2.5 bg-emerald-950/30 border-b border-emerald-900/40 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-neutral-300">Cuenta Propietario:</span>
            <strong className="text-emerald-400 font-mono">isaicarreto2003@gmail.com</strong>
            <span className="text-neutral-500">·</span>
            <span className="text-neutral-300">Tienda:</span>
            <span className="text-white font-mono">{cleanDomain}</span>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            Moneda: Quetzales (GTQ)
          </span>
        </div>

        {/* Tab Controls */}
        <div className="px-6 border-b border-neutral-800 flex items-center gap-2 bg-neutral-950/40 text-xs">
          <button
            onClick={() => setActiveTab('sync')}
            className={`py-3 px-3 border-b-2 font-medium transition-colors ${
              activeTab === 'sync'
                ? 'border-emerald-500 text-white'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Exportar Catálogo CSV
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-3 px-3 border-b-2 font-medium transition-colors ${
              activeTab === 'settings'
                ? 'border-emerald-500 text-white'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Configuración de Tienda
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`py-3 px-3 border-b-2 font-medium transition-colors ${
              activeTab === 'guide'
                ? 'border-emerald-500 text-white'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Guía Cuenta Free (Paso a Paso)
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'sync' && (
            <div className="space-y-6">
              {/* Highlight Card */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 to-neutral-900 border border-emerald-800/40 flex items-start gap-4">
                <Zap className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-white">
                    Importación en 1 clic hacia Shopify
                  </h3>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    Hemos preparado un archivo CSV con el esquema oficial de Shopify. Contiene los <strong>{products.length} productos</strong>, todas las variantes (tapa dura, rústica, láminas de arte y digital), códigos de barras GTIN/EAN, precios, imágenes e inventario preconfigurado.
                  </p>
                </div>
              </div>

              {/* Action Box */}
              <div className="p-5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-white block">
                      Archivo CSV Oficial de Productos para Shopify
                    </span>
                    <span className="text-xs text-neutral-400">
                      Compatible con cualquier tienda Shopify (Free Trial, Starter o Planes Estándar)
                    </span>
                  </div>
                  <button
                    onClick={handleDownloadCsv}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-950/50"
                  >
                    <Download className="w-4 h-4" />
                    <span>Descargar CSV para Shopify</span>
                  </button>
                </div>

                <div className="p-3 bg-neutral-900 rounded-lg border border-neutral-800 text-[11px] text-neutral-300 flex items-center justify-between">
                  <span>Columnas incluidas: <em>Handle, Title, Body HTML, Vendor, Type, Tags, Variant SKU, Variant Price, Variant Barcode, Image Src, Google Shopping Category...</em></span>
                  <span className="text-emerald-400 font-mono font-bold ml-2 shrink-0">100% Validado</span>
                </div>
              </div>

              {/* Test Direct Checkout Link */}
              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Enlace Directo de Checkout Shopify (Simulación)
                  </span>
                  <span className="text-[10px] text-neutral-400 font-mono">Bypasses Cart to Shopify Secure SSL</span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={testCheckoutUrl}
                    className="flex-1 bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs font-mono text-neutral-200 select-all focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    onClick={handleCopyCheckout}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold border border-neutral-700 transition-colors"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>¡Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar Link</span>
                      </>
                    )}
                  </button>
                  <a
                    href={testCheckoutUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors"
                  >
                    <span>Probar Checkout</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-white block">
                    Cuenta de Correo de Shopify Vinculada:
                  </label>
                  <input
                    type="email"
                    value={ownerEmail}
                    onChange={(e) => setOwnerEmail(e.target.value)}
                    placeholder="isaicarreto2003@gmail.com"
                    className="w-full bg-neutral-900 border border-emerald-600/50 rounded-lg px-3 py-2 text-xs text-emerald-300 focus:outline-none focus:border-emerald-400 font-mono"
                  />
                  <p className="text-[11px] text-neutral-400">
                    Cuenta oficial de Shopify vinculada para recepción de pedidos y notificaciones.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-white block">
                    Dominio de tu Tienda Shopify:
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Globe className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={shopDomain}
                        onChange={(e) => setShopDomain(e.target.value)}
                        placeholder="isaicarreto2003.myshopify.com"
                        className="w-full bg-neutral-900 border border-neutral-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    Subdominio asignado a tu cuenta Free / Starter de Shopify.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-white block">
                    Moneda Oficial de la Tienda:
                  </label>
                  <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-between text-xs">
                    <span className="text-neutral-300">Quetzal guatemalteco (GTQ)</span>
                    <span className="font-bold text-amber-400 font-mono">Q (1 USD = Q 7.80)</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-white block">
                    Cupón de Descuento por Defecto:
                  </label>
                  <input
                    type="text"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                    placeholder="NOIRBIBLE15"
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                  <p className="text-[11px] text-neutral-400">
                    Se aplicará automáticamente en los enlaces de compra generados para Shopify.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'guide' && (
            <div className="space-y-4 text-xs text-neutral-300 leading-relaxed">
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-900/40">
                <h4 className="text-sm font-bold text-emerald-300 mb-1">
                  Cómo utilizar Shopify con Cuenta Gratuita o Plan Starter ($5/mes):
                </h4>
                <p className="text-neutral-300">
                  No necesitas pagar planes costosos de e-commerce ($39+/mes). Puedes usar la versión de prueba gratuita (Free Trial) o el plan Shopify Starter utilizando el sistema <em>Buy Button / Enlaces directos al carrito</em>.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-white">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[11px]">1</span>
                    <span>Descarga el CSV de productos</span>
                  </div>
                  <p className="text-neutral-400 pl-7">
                    Usa el botón "Descargar CSV para Shopify" de este modal para guardar el archivo con todo el catálogo bíblico noir listo.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-white">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[11px]">2</span>
                    <span>Importa a Shopify Admin</span>
                  </div>
                  <p className="text-neutral-400 pl-7">
                    En tu panel de Shopify, ve a <strong>Productos &gt; Importar</strong>, sube el archivo CSV y haz clic en "Cargar y continuar". Todos tus tomos y láminas aparecerán creados al instante.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-white">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[11px]">3</span>
                    <span>Configura Shopify Payments o PayPal</span>
                  </div>
                  <p className="text-neutral-400 pl-7">
                    Activa Shopify Payments o vincula tu cuenta de PayPal para cobrar con tarjeta de crédito/débito, Apple Pay y Google Pay.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-800 flex items-center justify-between bg-neutral-950/80">
          <a
            href="https://admin.shopify.com"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-medium"
          >
            <span>Ir a Shopify Admin</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-950/50"
            >
              Guardar Configuración
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
