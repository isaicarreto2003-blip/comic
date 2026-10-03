import express from 'express';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '25mb' }));

// Initialize GoogleGenAI SDK with required headers
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Import product catalog & feed generators for Google Merchant Center and Shopify
import { INITIAL_PRODUCTS } from './src/data/storeProducts.ts';
import {
  generateGoogleMerchantXml,
  generateGoogleMerchantTsv,
  generateShopifyProductCsv,
} from './src/utils/merchantCenterFeed.ts';

// In-memory products store allowing user to publish comic pages as products
let storeProducts = [...INITIAL_PRODUCTS];

// Endpoint: AI-assisted Script, Dialogue & Dramatic Direction for Biblical Noir
app.post('/api/gemini/suggest-script', async (req, res) => {
  try {
    const { sceneTitle, characterName, passageContext, moodTone } = req.body;

    const prompt = `Actúa como un veterano director y guionista de novelas gráficas cinematográficas estilo Frank Miller (Sin City / 300) y Gustave Doré.
Tu tarea es generar el guion y diálogos para una escena de cómic noir de contexto bíblico.
Detalles de la escena:
- Título/Pasaje: ${sceneTitle || 'David frente a Goliat'}
- Personaje principal: ${characterName || 'David'}
- Contexto bíblico: ${passageContext || 'El valle de Ela, ejércitos paralizados por el miedo, el gigante desafiando a los ejércitos del Dios viviente'}
- Tono visual/emocional: ${moodTone || 'Noir oscuro, lluvia torrencial, sombras profundas, monólogo interior descarnado'}

Devuelve ÚNICAMENTE un objeto JSON válido con la siguiente estructura:
{
  "captionNarration": "Texto de narración tipo caja noir (monólogo interior o narrador cínico y solemne, 1-2 frases potentes)",
  "characterDialogue": "Línea de diálogo icónica del personaje principal",
  "adversaryDialogue": "Línea de diálogo amenazante del adversario o voz de la duda",
  "soundEffect": "Onomatopeya épica estilo cómic (ej: ¡KRRR-BOOOM!, ¡ZZHWIP!, ¡THUUUM!)",
  "visualPrompt": "Descripción visual detallada en inglés optimizada para generación de viñeta noir con sombras profundas, claroscuro y estética de novela gráfica",
  "panelLayoutIdea": "Recomendación de encuadre (ej: Plano contrapicado dramático con sombras densas y lluvia cortante)",
  "bibleReference": "Libro y versículo clave correspondiente"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.8,
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error generating script suggestion:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Error al generar guión con IA',
    });
  }
});

// Endpoint: AI Noir Image Generation for Comic Panels
app.post('/api/gemini/generate-panel-image', async (req, res) => {
  try {
    const { prompt, aspectRatio = '4:3', noirFilter = 'classic-noir' } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Se requiere un prompt descriptivo.' });
    }

    // Enhance prompt with biblical noir graphic novel artistic specifications
    const enhancedPrompt = `Biblical noir graphic novel comic panel illustration, high contrast black and white chiaroscuro, heavy ink lines and deep shadow hatching, Frank Miller Sin City style, cinematic composition, dramatic volumetric rim lighting, gritty ink textures, epic biblical moment: ${prompt}. Pure comic ink art, masterwork graphic novel.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite-image',
      contents: {
        parts: [
          {
            text: enhancedPrompt,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio as any,
        },
      },
    });

    // Iterate through candidates and parts to find the image
    let imageUrl = '';
    const candidate = response.candidates?.[0];
    if (candidate?.content?.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData?.data) {
          const mimeType = part.inlineData.mimeType || 'image/png';
          imageUrl = `data:${mimeType};base64,${part.inlineData.data}`;
          break;
        }
      }
    }

    if (!imageUrl) {
      throw new Error('No se generó imagen en la respuesta del modelo');
    }

    return res.json({ success: true, imageUrl });
  } catch (error: any) {
    console.error('Error in generate-panel-image:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Error al generar ilustración noir',
    });
  }
});

// Helper to determine public app URL
function getPublicAppUrl(req: express.Request): string {
  if (process.env.APP_URL) {
    return process.env.APP_URL;
  }
  const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
  const host = req.headers['x-forwarded-host'] || req.get('host') || 'localhost:3000';
  return `${protocol}://${host}`;
}

// ==========================================
// GOOGLE MERCHANT CENTER & GOOGLE SHOPPING FEEDS
// ==========================================

// Official RSS 2.0 XML Feed with xmlns:g="http://base.google.com/ns/1.0"
app.get('/api/feeds/google-merchant.xml', (req, res) => {
  const baseUrl = getPublicAppUrl(req);
  const currency = (req.query.currency as string) || 'GTQ'; // Default official format: Quetzales
  const xml = generateGoogleMerchantXml(storeProducts, baseUrl, currency);

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=1800, s-maxage=3600');
  res.setHeader('Access-Control-Allow-Origin', '*');
  return res.send(xml);
});

// Official TSV / Tab-delimited feed for Google Merchant Center
app.get(['/api/feeds/google-merchant.tsv', '/api/feeds/google-merchant.csv'], (req, res) => {
  const baseUrl = getPublicAppUrl(req);
  const currency = (req.query.currency as string) || 'GTQ';
  const tsv = generateGoogleMerchantTsv(storeProducts, baseUrl, currency);

  res.setHeader('Content-Type', 'text/tab-separated-values; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=1800, s-maxage=3600');
  res.setHeader('Access-Control-Allow-Origin', '*');
  return res.send(tsv);
});

// ==========================================
// SHOPIFY INTEGRATION (FREE ACCOUNT / CSV IMPORT)
// ==========================================

// Official Shopify Products CSV export format for 1-click import into free/starter stores
app.get('/api/feeds/shopify-products.csv', (req, res) => {
  const baseUrl = getPublicAppUrl(req);
  const currency = (req.query.currency as string) || 'GTQ';
  const email = (req.query.email as string) || 'isaicarreto2003@gmail.com';
  const csv = generateShopifyProductCsv(storeProducts, baseUrl, currency, email);

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="shopify-biblical-noir-quetzales.csv"');
  res.setHeader('Access-Control-Allow-Origin', '*');
  return res.send(csv);
});

// Generate direct Shopify cart checkout link
app.post('/api/shopify/checkout-link', (req, res) => {
  try {
    const { shopDomain, items, discountCode } = req.body;
    const cleanDomain = (shopDomain || 'isaicarreto2003.myshopify.com')
      .replace(/^https?:\/\//, '')
      .replace(/\/+$/, '');

    // Form format: https://store.myshopify.com/cart/{variant_id}:{quantity},{variant_id}:{quantity}
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'No items provided for checkout.' });
    }

    const cartParams = items
      .map((item: any) => `${item.variantId || '44810294198421'}:${item.quantity || 1}`)
      .join(',');

    let checkoutUrl = `https://${cleanDomain}/cart/${cartParams}`;
    if (discountCode) {
      checkoutUrl += `?discount=${encodeURIComponent(discountCode)}`;
    }

    return res.json({
      success: true,
      checkoutUrl,
      shopDomain: cleanDomain,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// STORE PRODUCTS API (CRUD & PAGE-TO-PRODUCT)
// ==========================================

// Get all products
app.get('/api/store/products', (_req, res) => {
  return res.json({
    success: true,
    total: storeProducts.length,
    products: storeProducts,
  });
});

// Add new product (e.g., publish comic page as store item)
app.post('/api/store/products', (req, res) => {
  try {
    const newProduct = req.body;
    if (!newProduct.title || !newProduct.variants || newProduct.variants.length === 0) {
      return res.status(400).json({ error: 'Se requiere título y al menos una variante de precio.' });
    }

    // Assign unique ID and handle if missing
    if (!newProduct.id) {
      newProduct.id = `prod-custom-${Date.now()}`;
    }
    if (!newProduct.handle) {
      newProduct.handle = newProduct.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    // Prepend to catalog so it appears first
    storeProducts = [newProduct, ...storeProducts];

    return res.json({
      success: true,
      product: newProduct,
      total: storeProducts.length,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Serve frontend with Vite middleware in dev or static files in prod
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Biblical Noir Comic Studio running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
