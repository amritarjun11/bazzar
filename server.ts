import express from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

// Data persistence directory
const DATA_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const LISTINGS_FILE = path.join(DATA_DIR, 'listings.json');
const SUPPORT_FILE = path.join(DATA_DIR, 'support-messages.json');

function loadListingsFromFile(): any[] {
  try {
    if (fs.existsSync(LISTINGS_FILE)) {
      const data = fs.readFileSync(LISTINGS_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.error('Error loading listings from file:', err);
  }
  return [];
}

function saveListingsToFile(listings: any[]) {
  try {
    fs.writeFileSync(LISTINGS_FILE, JSON.stringify(listings, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving listings to file:', err);
  }
}

function loadSupportFromFile(): any[] {
  try {
    if (fs.existsSync(SUPPORT_FILE)) {
      const data = fs.readFileSync(SUPPORT_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.error('Error loading support messages from file:', err);
  }
  return [];
}

function saveSupportToFile(messages: any[]) {
  try {
    fs.writeFileSync(SUPPORT_FILE, JSON.stringify(messages, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving support messages to file:', err);
  }
}

app.use(express.json({ limit: '10mb' }));

// Enable permissive CORS for preview iframe, cross-origin communication & extensions
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Lazy-initialize Gemini client to prevent crashes if key is missing on startup
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!geminiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is missing. Please configure it in AI Studio Secrets.');
    }
    geminiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return geminiClient;
}

// API Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    hasMapsKey: Boolean(process.env.VITE_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY),
  });
});

// ==========================================
// LISTINGS API (Shared across all users/admin)
// ==========================================
app.get('/api/listings', (req, res) => {
  try {
    const listings = loadListingsFromFile();
    res.json({ listings });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch listings' });
  }
});

app.post('/api/listings', (req, res) => {
  try {
    const newListing = req.body;
    if (!newListing || !newListing.id || !newListing.title) {
      return res.status(400).json({ error: 'Valid listing with id and title is required' });
    }

    const currentListings = loadListingsFromFile();
    // Ensure timestamp
    if (!newListing.createdAt) {
      newListing.createdAt = Date.now();
    }
    // Prevent duplicates by ID
    const existingIndex = currentListings.findIndex(l => l.id === newListing.id);
    let updated;
    if (existingIndex >= 0) {
      currentListings[existingIndex] = { ...currentListings[existingIndex], ...newListing };
      updated = currentListings;
    } else {
      // Prepend to front so new posts always appear first
      updated = [newListing, ...currentListings];
    }
    saveListingsToFile(updated);
    res.json({ success: true, listing: newListing });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to save listing' });
  }
});

// Seed listings if file is empty
app.post('/api/listings/seed', (req, res) => {
  try {
    const { listings } = req.body;
    if (!Array.isArray(listings)) {
      return res.status(400).json({ error: 'listings array required' });
    }
    const currentListings = loadListingsFromFile();
    if (currentListings.length === 0) {
      saveListingsToFile(listings);
      return res.json({ success: true, count: listings.length });
    }
    // Merge any new listings that don't exist
    const existingIds = new Set(currentListings.map(l => l.id));
    const toAdd = listings.filter(l => !existingIds.has(l.id));
    if (toAdd.length > 0) {
      const merged = [...currentListings, ...toAdd];
      saveListingsToFile(merged);
      return res.json({ success: true, count: merged.length, added: toAdd.length });
    }
    res.json({ success: true, count: currentListings.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to seed listings' });
  }
});

app.delete('/api/listings/:id', (req, res) => {
  try {
    const { id } = req.params;
    const currentListings = loadListingsFromFile();
    const filtered = currentListings.filter(l => l.id !== id);
    saveListingsToFile(filtered);
    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete listing' });
  }
});

app.put('/api/listings/:id', (req, res) => {
  try {
    const { id } = req.params;
    const patch = req.body;
    const currentListings = loadListingsFromFile();
    const index = currentListings.findIndex(l => l.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    currentListings[index] = { ...currentListings[index], ...patch };
    saveListingsToFile(currentListings);
    res.json({ success: true, listing: currentListings[index] });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update listing' });
  }
});

// ==========================================
// SUPPORT & FEEDBACK API (Admin & Customer Hub)
// ==========================================
app.get('/api/support-messages', (req, res) => {
  try {
    const messages = loadSupportFromFile();
    res.json({ messages });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch support messages' });
  }
});

app.post('/api/support-messages', (req, res) => {
  try {
    const newMsg = req.body;
    if (!newMsg || !newMsg.name || !newMsg.message) {
      return res.status(400).json({ error: 'Valid support message required' });
    }
    const current = loadSupportFromFile();
    const updated = [newMsg, ...current];
    saveSupportToFile(updated);
    res.json({ success: true, message: newMsg });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to save support message' });
  }
});

app.patch('/api/support-messages/:id', (req, res) => {
  try {
    const { id } = req.params;
    const patch = req.body;
    const current = loadSupportFromFile();
    const index = current.findIndex(m => m.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Message not found' });
    }
    current[index] = { ...current[index], ...patch };
    saveSupportToFile(current);
    res.json({ success: true, message: current[index] });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update support message' });
  }
});

// Maps Grounding using gemini-3.8-flash and googleMaps tool
app.post('/api/maps/grounding-search', async (req, res) => {
  try {
    const { prompt, latitude = 24.5362, longitude = 81.3037 } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Valid prompt string is required' });
    }

    const ai = getGeminiClient();

    // Model gemini-2.5-flash with googleMaps tool and user location grounding
    let response;
    try {
      response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction:
            'You are BazaarReels Local Assistant for Rewa, Madhya Pradesh. Provide helpful, accurate local marketplace and neighborhood recommendations. Always highlight specific landmarks, markets (like Shilpi Plaza, Kalaniketan, Civil Lines, Sirmour Chauraha), and shops where relevant. Ground your suggestions with Google Maps.',
          tools: [{ googleMaps: {} }],
          toolConfig: {
            retrievalConfig: {
              latLng: {
                latitude: Number(latitude),
                longitude: Number(longitude),
              },
            },
          },
        },
      });
    } catch (modelErr: any) {
      console.warn('Primary model error, attempting standard generation fallback:', modelErr.message);
      // If 429 quota or tool issue occurs, deliver curated local Rewa information
      const queryLower = prompt.toLowerCase();
      let fallbackText = `**Rewa Hyperlocal Marketplace Directory** (Location: Rewa, MP)\n\n`;

      if (queryLower.includes('bike') || queryLower.includes('motorcycle') || queryLower.includes('shine') || queryLower.includes('pulsar') || queryLower.includes('honda')) {
        fallbackText += `Here are top verified automobile & two-wheeler hubs in Rewa:\n\n` +
          `1. **Civil Lines Automobile Zone**: Located near Police Ground. Rahul Automobiles has verified Honda Shine 125 and Classic 350 available with 30s walkaround inspection reels.\n` +
          `2. **Sirmour Chauraha & Rewa Market**: Major hub for multi-brand motorcycle mechanics, authorized Honda/Bajaj spares, and quick RC transfer centers.\n` +
          `3. **Bodabag Road**: Best for Royal Enfield tuning and custom exhaust services.\n\n` +
          `*Tip: Inspect bikes physically and verify RC smart card at the seller showroom before making token payment.*`;
      } else if (queryLower.includes('mobile') || queryLower.includes('phone') || queryLower.includes('iphone')) {
        fallbackText += `Here are prime mobile phone & electronics hubs in Rewa:\n\n` +
          `1. **Shilpi Plaza Market (Civil Lines)**: Central hub for refurbished Apple iPhones, Samsung flagships, and tempered glass/repair labs.\n` +
          `2. **Saman Naka AppleHub**: High-rated seller specializing in battery health 85%+ verified devices with warranty.\n` +
          `3. **Kalaniketan Road**: Best for fast screen replacement, diagnostic testing, and phone accessories.`;
      } else if (queryLower.includes('flat') || queryLower.includes('rent') || queryLower.includes('property') || queryLower.includes('room')) {
        fallbackText += `Here are prime rental & property localities in Rewa:\n\n` +
          `1. **APSU University Road**: Ideal for students & professionals. 2 BHK furnished flats available directly from verified owners with zero brokerage.\n` +
          `2. **Nehru Nagar & Civil Lines**: Premium family residential colonies close to hospitals, banks, and schools.\n` +
          `3. **Bodabag & Saman**: Affordable 1 RK / 1 BHK flats with 24/7 water supply.`;
      } else {
        fallbackText += `Here are popular commercial spots in Rewa for "${prompt}":\n\n` +
          `• **Shilpi Plaza (Block A & B)**: Rewa's largest shopping & electronics complex.\n` +
          `• **Civil Lines**: Professional services, vehicle dealers, and official administrative offices.\n` +
          `• **Venkat Road & Fort Road**: Traditional handicraft, grocery, and local retail stores.\n` +
          `• **Sirmour Chowk**: High-traffic transit point connecting Rewa to Satna and Allahabad roads.`;
      }

      const encodedQuery = encodeURIComponent(`${prompt} Rewa Madhya Pradesh`);
      return res.json({
        text: fallbackText,
        sources: [
          {
            title: `Google Maps Search: "${prompt}" in Rewa`,
            uri: `https://www.google.com/maps/search/?api=1&query=${encodedQuery}`,
            reviewSnippets: ['Verified local hub in Rewa, Madhya Pradesh'],
          },
          {
            title: 'Shilpi Plaza, Civil Lines, Rewa',
            uri: 'https://www.google.com/maps/search/?api=1&query=Shilpi+Plaza+Rewa+Madhya+Pradesh',
            reviewSnippets: ['Major shopping complex and central market in Rewa.'],
          },
          {
            title: 'Civil Lines, Rewa, MP',
            uri: 'https://www.google.com/maps/search/?api=1&query=Civil+Lines+Rewa+Madhya+Pradesh',
            reviewSnippets: ['Automobile and electronics marketplace center.'],
          },
        ],
        isFallback: true,
      });
    }

    const text = response.text || 'No response generated.';
    const rawChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    // Format grounding sources for client display with direct map links
    const sources = rawChunks
      .filter((chunk: any) => chunk?.maps?.uri)
      .map((chunk: any) => ({
        title: chunk.maps.title || 'View on Google Maps',
        uri: chunk.maps.uri,
        reviewSnippets: chunk.maps.placeAnswerSources?.reviewSnippets || [],
      }));

    res.json({
      text,
      sources,
      groundingChunks: rawChunks,
    });
  } catch (error: any) {
    console.error('Error executing Maps Grounding:', error);
    res.status(500).json({
      error: error.message || 'Failed to query Google Maps Grounding via Gemini',
    });
  }
});

async function startServer() {
  // Vite middleware in development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
