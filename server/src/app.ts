import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import metricsRoutes from './routes/metrics.routes';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import logger from './utils/logger';
import { collectDefaultMetrics, register } from "prom-client";
const client = require("prom-client");
import { httpRequestDurationMilliseconds, metricsEmitter } from "./utils/metrics.util";

// More robust path resolution for swagger.yaml
const swaggerPath = path.join(process.cwd(), 'swagger.yaml');
const swaggerDocument = YAML.load(swaggerPath);

dotenv.config();

const app = express();

// CORS configuration - must specify origin when using credentials
// Always includes localhost:3000 for local development
// In development, also allows any localhost port for flexibility
// FRONTEND_URL env var is used for Vercel/production origins
const getCorsOrigin = () => {
  const allowedOrigins: string[] = ['http://localhost:3000'];
  
  const frontendUrl = process.env.FRONTEND_URL;
  if (frontendUrl) {
    // Support multiple origins (comma-separated)
    if (frontendUrl.includes(',')) {
      const envOrigins = frontendUrl.split(',').map(url => url.trim());
      allowedOrigins.push(...envOrigins);
    } else {
      allowedOrigins.push(frontendUrl.trim());
    }
  }
  
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  // Return a function that checks if origin is allowed
  return (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // In development, allow any localhost port
    if (isDevelopment && /^http:\/\/localhost:\d+$/.test(origin)) {
      return callback(null, true);
    }
    
    // Reject all other origins
    callback(new Error('Not allowed by CORS'));
  };
};

const corsOptions = {
  origin: getCorsOrigin(),
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '25mb' }));

// Cookie parser for session management
// Express 5.x doesn't have built-in cookie parsing, so we parse manually
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (req.headers.cookie) {
    req.cookies = {};
    req.headers.cookie.split(';').forEach((cookie: string) => {
      const parts = cookie.trim().split('=');
      if (parts.length === 2 && parts[0] && parts[1]) {
        req.cookies[parts[0]] = decodeURIComponent(parts[1]);
      }
    });
  } else {
    req.cookies = {};
  }
  next();
});

// Serve static files (like style.css, images, etc.)
app.use(express.static(path.join(__dirname, '../public')));

app.get('/', (req: express.Request, res: express.Response) => {
  res.sendFile(path.join(__dirname, '../public/html/index.html'));
});

// Health check endpoint
app.get('/health', (req: express.Request, res: express.Response) => {
  console.log('✅ /health hit');
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

//For default metrics
collectDefaultMetrics({ prefix: "dynamic_signer_verifier_server_" });

app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    //check if req.route and req.route.path exist before using them
    if (req.route && req.route.path) {
      httpRequestDurationMilliseconds.labels(req.method, req.route.path, res.statusCode.toString()).observe(duration);
    } else {
      httpRequestDurationMilliseconds.labels(req.method, "unknown_route", res.statusCode.toString()).observe(duration);
    }
  });

  next();
});

// pass the p-limit
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  (req as any).prometheus = client;
  (req as any).metricsEmitter = metricsEmitter;
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/metrics', metricsRoutes);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Error handling middleware (must be after routes)
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  // Handle AppError instances
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message || 'An error occurred',
      message: err.message,
    });
  }

  // Handle validation errors
  if (err.errors) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      message: err.message || 'Invalid request data',
    });
  }

  // Handle unexpected errors
  logger.error('Unexpected error:', err);
  return res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred',
  });
});

app.use((req: express.Request, res: express.Response) => {
  res.status(404).sendFile(path.join(__dirname, '../public/html/404.html'));
});

export default app;
