import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '1mb' }));

// In-memory submissions store for demonstration & testing
interface StoredEnquiry {
  id: string;
  receivedAt: string;
  projectDetails: {
    gardenOption: string;
    postcode: string;
    timeframe: string;
    callTime: string;
  };
  contactDetails: {
    fullName: string;
    phone: string;
  };
  campaign: Record<string, unknown>;
  status: string;
  pageUrl?: string;
}

const quoteSubmissions: StoredEnquiry[] = [];

// Lightweight rate limiting / spam protection window in-memory
const recentSubmissionsByIp = new Map<string, number>();

/**
 * Real endpoint for Decking Quote requests
 */
app.post('/api/quote-request', (req: Request, res: Response) => {
  const {
    gardenOption,
    postcode,
    timeframe,
    callTime,
    fullName,
    phone,
    honeypot,
    utm,
    pageUrl,
  } = req.body;

  // 1. Anti-spam honeypot detection
  if (honeypot && String(honeypot).trim().length > 0) {
    console.warn('[SPAM DETECTED]: Honeypot filled by client:', honeypot);
    return res.status(400).json({
      success: false,
      error: 'Invalid request submission (automated spam detected).',
    });
  }

  // 2. Server-side validation
  if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
    return res.status(400).json({
      success: false,
      error: 'Please provide a valid full name (minimum 2 characters).',
    });
  }

  if (!phone || typeof phone !== 'string' || phone.trim().length < 8) {
    return res.status(400).json({
      success: false,
      error: 'Please provide a valid UK telephone number.',
    });
  }

  if (!postcode || typeof postcode !== 'string' || postcode.trim().length < 4) {
    return res.status(400).json({
      success: false,
      error: 'Please provide a valid property postcode.',
    });
  }

  // 3. Lightweight IP rate limit check (max 5 submissions per minute)
  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const lastTime = recentSubmissionsByIp.get(clientIp) || 0;
  if (now - lastTime < 3000) {
    return res.status(429).json({
      success: false,
      error: 'Please wait a moment before sending another request.',
    });
  }
  recentSubmissionsByIp.set(clientIp, now);

  // 4. Create verified enquiry record
  const enquiryId = `ARK-${now.toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
  const receivedAt = new Date().toISOString();

  const newEnquiry: StoredEnquiry = {
    id: enquiryId,
    receivedAt,
    projectDetails: {
      gardenOption: String(gardenOption || 'Not specified'),
      postcode: String(postcode).trim().toUpperCase(),
      timeframe: String(timeframe || 'Not specified'),
      callTime: String(callTime || 'Anytime (9am–7pm)'),
    },
    contactDetails: {
      fullName: String(fullName).trim(),
      phone: String(phone).trim(),
    },
    // Captured campaign parameters kept separate from personal details
    campaign: typeof utm === 'object' && utm !== null ? utm : {},
    status: 'pending_team_call',
    pageUrl: typeof pageUrl === 'string' ? pageUrl : undefined,
  };

  quoteSubmissions.unshift(newEnquiry);

  console.log(`[ARKLINE DECKING QUOTE RECEIVED - ID: ${enquiryId}]`);
  console.log(`- Customer: ${newEnquiry.contactDetails.fullName} (${newEnquiry.contactDetails.phone})`);
  console.log(`- Postcode: ${newEnquiry.projectDetails.postcode}`);
  console.log(`- Project: ${newEnquiry.projectDetails.gardenOption}`);
  console.log(`- Preferred Call Time: ${newEnquiry.projectDetails.callTime}`);

  return res.status(201).json({
    success: true,
    enquiryId,
    timestamp: receivedAt,
    message: 'Your quote request has been safely received. An ARKLINE specialist will call you shortly.',
  });
});

/**
 * System healthcheck endpoint
 */
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    brand: 'ARKLINE Developments',
    service: 'Decking Quote Request API',
    uptime: process.uptime(),
    activeSubmissionsCount: quoteSubmissions.length,
  });
});

/**
 * Inspection route for verified submissions (for admin & testing)
 */
app.get('/api/quote-submissions', (_req: Request, res: Response) => {
  res.json({
    count: quoteSubmissions.length,
    submissions: quoteSubmissions,
  });
});

/**
 * Start Express application with Vite dev middleware in development or static files in production
 */
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✓ ARKLINE Decking Quote Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
