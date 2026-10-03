import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  ShoppingBag, 
  Check, 
  BookOpen, 
  DollarSign, 
  Barcode, 
  Layers, 
  ShieldCheck 
} from 'lucide-react';
import { ComicPage } from '../types/comic';
import { StoreProduct, ProductVariant } from '../types/store';

interface ProductPublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage: ComicPage;
  onPublishProduct: (product: StoreProduct) => void;
}

export const ProductPublishModal: React.FC<ProductPublishModalProps> = ({
  isOpen,
  onClose,
  currentPage,
  onPublishProduct,
}) => {
  const [title, setTitle] = useState(currentPage.title || 'Escena Bíblica Noir');
  const [subtitle, setSubtitle] = useState('Edición Especial de Arte en Claroscuro');
  const [description, setDescription] = useState(
    currentPage.scriptNotes ||
    'Ilustración dramática de novela gráfica bíblica con claroscuro cinemático y trazo de tinta profunda.'
  );
  const [biblicalPassage, setBiblicalPassage] = useState('Pasaje Bíblico');
  const [category, setCategory] = useState<'books' | 'prints' | 'digital'>('prints');

  // Variant Prices in Quetzales (Official Format)
  const [printPrice, setPrintPrice] = useState('295.00'); // ~ Q 295.00
  const [digitalPrice, setDigitalPrice] = useState('75.00'); // ~ Q 75.00
  const [bookPrice, setBookPrice] = useState('195.00'); // ~ Q 195.00

  if (!isOpen) return null;

  // Use the first panel's image or preset fallback
  const previewImage = currentPage.panels[0]?.imageUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1200&q=80';

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();

    const timestamp = Date.now();
    const handle = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Conversion rate to USD base
    const rate = 7.80;
    const basePrintPrice = (parseFloat(printPrice) || 295) / rate;
    const baseBookPrice = (parseFloat(bookPrice) || 195) / rate;
    const baseDigitalPrice = (parseFloat(digitalPrice) || 75) / rate;

    const variants: ProductVariant[] = [];

    // Art print variant
    if (category === 'prints' || category === 'books') {
      variants.push({
        id: `var-custom-print-${timestamp}`,
        title: 'Lámina Fine Art Giclée (18" x 24")',
        format: 'art_print',
        price: basePrintPrice,
        compareAtPrice: basePrintPrice * 1.25,
        sku: `BN-CUSTOM-PRINT-${timestamp.toString().slice(-4)}`,
        gtin: `7501055${Math.floor(100000 + Math.random() * 900000)}`,
        mpn: `CUSTOM-PRINT-${timestamp}`,
        barcode: `7501055${Math.floor(100000 + Math.random() * 900000)}`,
        weightGrams: 300,
        stockQty: 50,
        shopifyVariantId: `44810${Math.floor(100000000 + Math.random() * 900000000)}`,
        requiresShipping: true,
        descriptionSnippet: 'Impresión giclée en papel de algodón de 300g libre de ácido para enmarcar.',
      });
    }

    // Physical comic book variant
    if (category === 'books') {
      variants.push({
        id: `var-custom-book-${timestamp}`,
        title: 'Edición Impresa Prestige Comic-Book',
        format: 'softcover',
        price: baseBookPrice,
        sku: `BN-CUSTOM-BOOK-${timestamp.toString().slice(-4)}`,
        gtin: `7501055${Math.floor(100000 + Math.random() * 900000)}`,
        mpn: `CUSTOM-BOOK-${timestamp}`,
        barcode: `7501055${Math.floor(100000 + Math.random() * 900000)}`,
        weightGrams: 400,
        stockQty: 30,
        shopifyVariantId: `44810${Math.floor(100000000 + Math.random() * 900000000)}`,
        requiresShipping: true,
        descriptionSnippet: 'Tapa rústica con laminado mate y papel couché interior.',
      });
    }

    // Digital PDF download variant
    variants.push({
      id: `var-custom-dig-${timestamp}`,
      title: 'Descarga Digital PDF Ultra-HD 300 DPI',
      format: 'digital_pdf',
      price: baseDigitalPrice,
      sku: `BN-CUSTOM-DIG-${timestamp.toString().slice(-4)}`,
      gtin: `7501055${Math.floor(100000 + Math.random() * 900000)}`,
      mpn: `CUSTOM-DIG-${timestamp}`,
      barcode: `7501055${Math.floor(100000 + Math.random() * 900000)}`,
      weightGrams: 0,
      stockQty: 9999,
      shopifyVariantId: `44810${Math.floor(100000000 + Math.random() * 900000000)}`,
      requiresShipping: false,
      descriptionSnippet: 'Descarga instantánea con licencia de uso personal y lectura digital.',
    });

    const newProduct: StoreProduct = {
      id: `prod-custom-${timestamp}`,
      title,
      handle: handle || `obra-noir-${timestamp}`,
      subtitle,
      description,
      biblicalPassage,
      category,
      googleProductCategory: category === 'prints' ? '500044' : '1064',
      images: [previewImage],
      variants,
      isFeatured: true,
      tags: ['creación original', 'cómic noir', 'arte bíblico', 'isai-carreto', 'isaicarreto2003@gmail.com', 'guatemala', 'quetzales'],
      rating: 5.0,
      reviewsCount: 1,
      author: 'Isai Carreto (isaicarreto2003@gmail.com)',
      illustrator: 'Isai Carreto Studio',
      publisher: 'Isai Carreto - Biblical Noir Studio',
      dimensions: category === 'prints' ? '45.7 x 61.0 cm (18x24")' : '21.0 x 29.7 cm (A4)',
      paperSpecs: 'Fine Art Cotton Rag 300g / Negro Carbón',
      condition: 'new',
      availability: 'in_stock',
      publishDate: new Date().toISOString().split('T')[0],
      customCreatedFromEditor: true,
    };

    onPublishProduct(newProduct);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div 
        className="bg-neutral-900 border border-neutral-700 w-full max-w-2xl max-h-[90vh] rounded-2xl flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                Publicar Página Actual a la Venta
              </h2>
              <p className="text-xs text-neutral-400">
                Convierte tu viñeta o página de cómic en un producto listo para Google Shopping y Shopify
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

        {/* Form Body */}
        <form onSubmit={handlePublish} className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="flex gap-4 items-start p-3.5 rounded-xl bg-neutral-950 border border-neutral-800">
            <img
              src={previewImage}
              alt="Vista previa de viñeta"
              className="w-20 h-24 object-cover rounded-lg bg-neutral-900 border border-neutral-700 shrink-0"
            />
            <div className="space-y-1 text-xs">
              <span className="font-bold text-white block">
                Ilustración Seleccionada del Lienzo Actual
              </span>
              <p className="text-neutral-400 leading-relaxed">
                Se generará automáticamente el archivo de alta resolución, código GTIN/EAN-13 y ficha de Google Merchant Center.
              </p>
              <div className="flex items-center gap-2 pt-1 text-[11px] text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Compatible con Shopify Buy Button y Google Shopping</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-white block">
                Título de la Novela / Obra:
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-white block">
                Subtítulo / Edición:
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-white block">
                Pasaje Bíblico de Referencia:
              </label>
              <input
                type="text"
                value={biblicalPassage}
                onChange={(e) => setBiblicalPassage(e.target.value)}
                placeholder="ej: Salmos 23:4 o Éxodo 14:21"
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-white block">
                Tipo de Producto Principal:
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="prints">Lámina de Arte Fine Art Giclée (Póster Coleccionista)</option>
                <option value="books">Novela Gráfica / Tomo Cómic Impreso</option>
                <option value="digital">Edición Exclusiva Digital PDF</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-white block">
              Sinopsis Comercial y Descripción Artística:
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-3 text-xs text-neutral-200 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Pricing configuration */}
          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
            <span className="text-xs font-bold text-white uppercase tracking-wider block">
              Precios por Variante (Formato Oficial en Quetzales - Q / GTQ):
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(category === 'prints' || category === 'books') && (
                <div className="space-y-1">
                  <label className="text-[11px] text-neutral-400 block">Lámina Fine Art Giclée:</label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-2 text-xs text-amber-400 font-bold">Q</span>
                    <input
                      type="number"
                      step="1"
                      value={printPrice}
                      onChange={(e) => setPrintPrice(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-lg pl-7 pr-2 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              )}

              {category === 'books' && (
                <div className="space-y-1">
                  <label className="text-[11px] text-neutral-400 block">Tomo Físico Impreso:</label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-2 text-xs text-amber-400 font-bold">Q</span>
                    <input
                      type="number"
                      step="1"
                      value={bookPrice}
                      onChange={(e) => setBookPrice(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-lg pl-7 pr-2 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[11px] text-neutral-400 block">Descarga Digital PDF:</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-xs text-amber-400 font-bold">Q</span>
                  <input
                    type="number"
                    step="1"
                    value={digitalPrice}
                    onChange={(e) => setDigitalPrice(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg pl-7 pr-2 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow-md shadow-amber-950/50 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Publicar en Tienda &amp; Google Feeds</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
