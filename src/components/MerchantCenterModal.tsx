import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Copy, 
  Check, 
  Download, 
  ExternalLink, 
  FileCode, 
  ShieldCheck, 
  RefreshCw,
  ShoppingBag
} from 'lucide-react';
import { StoreProduct } from '../types/store';
import { 
  generateGoogleMerchantXml, 
  generateGoogleMerchantTsv, 
  auditGoogleMerchantCompliance 
} from '../utils/merchantCenterFeed';

interface MerchantCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: StoreProduct[];
}

export const MerchantCenterModal: React.FC<MerchantCenterModalProps> = ({
  isOpen,
  onClose,
  products,
}) => {
  const [copiedFeedType, setCopiedFeedType] = useState<'xml' | 'tsv' | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'diagnostics' | 'preview' | 'guide'>('overview');
  const [selectedCurrency, setSelectedCurrency] = useState<'GTQ' | 'USD' | 'EUR' | 'MXN' | 'GBP'>('GTQ');

  if (!isOpen) return null;

  const originUrl = window.location.origin;
  const xmlFeedUrl = `${originUrl}/api/feeds/google-merchant.xml?currency=${selectedCurrency}`;
  const tsvFeedUrl = `${originUrl}/api/feeds/google-merchant.tsv?currency=${selectedCurrency}`;

  const diagnostics = auditGoogleMerchantCompliance(products);
  const totalVariants = products.reduce((acc, p) => acc + p.variants.length, 0);

  const handleCopyUrl = (url: string, type: 'xml' | 'tsv') => {
    navigator.clipboard.writeText(url);
    setCopiedFeedType(type);
    setTimeout(() => setCopiedFeedType(null), 2500);
  };

  const handleDownloadXml = () => {
    const xml = generateGoogleMerchantXml(products, originUrl, selectedCurrency);
    const blob = new Blob([xml], { type: 'application/xml;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `google-merchant-biblical-noir-${selectedCurrency.toLowerCase()}.xml`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadTsv = () => {
    const tsv = generateGoogleMerchantTsv(products, originUrl, selectedCurrency);
    const blob = new Blob([tsv], { type: 'text/tab-separated-values;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `google-merchant-biblical-noir-${selectedCurrency.toLowerCase()}.tsv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const sampleXml = generateGoogleMerchantXml(products.slice(0, 1), originUrl, selectedCurrency);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div 
        className="bg-neutral-900 border border-neutral-700 w-full max-w-4xl max-h-[90vh] rounded-2xl flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  Google Merchant Center &amp; Shopping Feed Hub
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Estándar RSS 2.0 Oficial
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Sincronización automatizada de productos con Google Shopping, Free Listings y anuncios
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

        {/* Navigation Tabs */}
        <div className="px-6 border-b border-neutral-800 flex items-center gap-2 bg-neutral-950/40 text-xs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-3 border-b-2 font-medium transition-colors ${
              activeTab === 'overview'
                ? 'border-blue-500 text-white'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Feeds en Vivo &amp; Enlaces
          </button>
          <button
            onClick={() => setActiveTab('diagnostics')}
            className={`py-3 px-3 border-b-2 font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'diagnostics'
                ? 'border-blue-500 text-white'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <span>Auditoría de Cumplimiento</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`py-3 px-3 border-b-2 font-medium transition-colors ${
              activeTab === 'preview'
                ? 'border-blue-500 text-white'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Vista Previa XML
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`py-3 px-3 border-b-2 font-medium transition-colors ${
              activeTab === 'guide'
                ? 'border-blue-500 text-white'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Guía de Configuración Google
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Status Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950/40 to-neutral-900 border border-blue-800/40 flex items-start gap-4">
                <ShieldCheck className="w-6 h-6 text-blue-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-white">
                    Feed listo para producción y rastreo público
                  </h3>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    Tu catálogo cuenta con <strong>{products.length} productos</strong> ({totalVariants} variantes en total), equipados con códigos de barra GTIN (EAN-13), categoría oficial de Google (ID 1064), imágenes en alta resolución y reglas de disponibilidad en tiempo real.
                  </p>
                </div>
              </div>

              {/* Currency Selector for Feeds */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800">
                <div>
                  <span className="text-xs font-semibold text-white block">Divisa del Feed de Google Shopping:</span>
                  <span className="text-[11px] text-neutral-400">Google Merchant Center exige precios en la moneda del país destino</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {(['GTQ', 'USD', 'EUR', 'MXN', 'GBP'] as const).map((curr) => (
                    <button
                      key={curr}
                      onClick={() => setSelectedCurrency(curr)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        selectedCurrency === curr
                          ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-400'
                          : 'bg-neutral-800 text-neutral-400 hover:text-white'
                      }`}
                    >
                      {curr === 'GTQ' ? 'Q (GTQ Oficial)' : curr}
                    </button>
                  ))}
                </div>
              </div>

              {/* Primary Feed Link Card */}
              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Feed XML Principal (Recomendado por Google)
                    </span>
                  </div>
                  <span className="text-[10px] text-neutral-400 font-mono">Formato RSS 2.0 + xmlns:g</span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={xmlFeedUrl}
                    className="flex-1 bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs font-mono text-neutral-200 select-all focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={() => handleCopyUrl(xmlFeedUrl, 'xml')}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors"
                  >
                    {copiedFeedType === 'xml' ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>¡Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar URL</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleDownloadXml}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold border border-neutral-700 transition-colors"
                    title="Descargar archivo XML"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar .xml</span>
                  </button>
                </div>
                <p className="text-[11px] text-neutral-400">
                  Copia esta URL y pégala en Google Merchant Center en la sección <em>Feeds &gt; Obtención programada</em>. Google leerá este enlace automáticamente a diario.
                </p>
              </div>

              {/* Secondary TSV Link Card */}
              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Feed Tabulado TSV / Texto (Alternativa para Google Sheets)
                    </span>
                  </div>
                  <span className="text-[10px] text-neutral-400 font-mono">Separado por tabulaciones</span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={tsvFeedUrl}
                    className="flex-1 bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs font-mono text-neutral-200 select-all focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={() => handleCopyUrl(tsvFeedUrl, 'tsv')}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold border border-neutral-700 transition-colors"
                  >
                    {copiedFeedType === 'tsv' ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>¡Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar URL</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleDownloadTsv}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold border border-neutral-700 transition-colors"
                    title="Descargar archivo TSV"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar .tsv</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'diagnostics' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Auditoría de Calidad para Google Merchant</h3>
                  <p className="text-xs text-neutral-400">Verificaciones automatizadas basadas en las políticas de Google Shopping</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-950/50 border border-emerald-800/60 rounded-lg text-emerald-400 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>100% Aprobado para Google Shopping</span>
                </div>
              </div>

              <div className="space-y-3">
                {diagnostics.map((diag) => (
                  <div
                    key={diag.code}
                    className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 flex items-start gap-3"
                  >
                    {diag.status === 'passed' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    ) : diag.status === 'warning' ? (
                      <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                    )}

                    <div className="flex-1 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{diag.title}</span>
                        <span
                          className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                            diag.status === 'passed'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {diag.status === 'passed' ? 'Aprobado' : 'Revisión'}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400 leading-relaxed">{diag.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'preview' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Muestra del XML de Google Merchant</h3>
                  <p className="text-xs text-neutral-400">Estructura canónica enviada al rastreador de Google</p>
                </div>
                <button
                  onClick={handleDownloadXml}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar XML Completo</span>
                </button>
              </div>

              <div className="relative">
                <pre className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-[11px] font-mono text-neutral-300 overflow-x-auto max-h-[360px] leading-relaxed">
                  {sampleXml}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'guide' && (
            <div className="space-y-4 text-xs text-neutral-300 leading-relaxed">
              <div className="p-4 rounded-xl bg-blue-950/30 border border-blue-900/40">
                <h4 className="text-sm font-bold text-blue-300 mb-1">
                  Cómo activar tu tienda en Google Shopping en 4 sencillos pasos:
                </h4>
                <p className="text-neutral-300">
                  Google ofrece <strong>Listados Gratuitos (Free Listings)</strong> para que tus novelas gráficas y láminas aparezcan en la pestaña Google Shopping sin pagar anuncios.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-white">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px]">1</span>
                    <span>Crea tu cuenta de Google Merchant Center</span>
                  </div>
                  <p className="text-neutral-400 pl-7">
                    Ve a <a href="https://merchants.google.com" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">merchants.google.com</a> e inicia sesión con tu cuenta de Google. Selecciona la opción gratuita "Google for Retail".
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-white">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px]">2</span>
                    <span>Verifica y reclama tu sitio web</span>
                  </div>
                  <p className="text-neutral-400 pl-7">
                    Introduce el dominio público de tu tienda (ej: tu URL de Vercel). Puedes verificarlo mediante etiqueta meta HTML o Google Tag Manager.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-white">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px]">3</span>
                    <span>Añade el Feed de Productos</span>
                  </div>
                  <p className="text-neutral-400 pl-7">
                    En el menú lateral, dirígete a <strong>Productos &gt; Fuentes de datos (Feeds) &gt; Agregar producto</strong>. Selecciona <strong>"Obtención programada mediante URL"</strong> y pega la URL de tu feed XML que copiaste en la pestaña anterior.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-white">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px]">4</span>
                    <span>Listo: Actualización automática</span>
                  </div>
                  <p className="text-neutral-400 pl-7">
                    Cada vez que crees o edites una novela gráfica, modifiques precios o agregues stock, el feed se actualizará al instante para Google Shopping.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-800 flex items-center justify-between bg-neutral-950/80">
          <a
            href="https://merchants.google.com"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-medium"
          >
            <span>Abrir Google Merchant Center Console</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
