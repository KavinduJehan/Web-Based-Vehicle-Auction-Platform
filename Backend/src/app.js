import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import morgan from 'morgan';
import routes from './routes/index.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { errorHandler } from './middleware/errorHandler.js';
import config from './config/index.js';

const app = express();

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : [];

app.use(helmet());

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (server-to-server, curl, etc.)
    if (!origin) return callback(null, true);
    // In development, allow any localhost origin
    if (config.env !== 'production' && /^https?:\/\/localhost(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));

// Global limiter — prevents scanning / enumeration of the whole API
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
  skip: () => config.env === 'test',
});
app.use('/api', globalLimiter);

// Brute-force protection on auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
  skip: () => config.env === 'test',
});
app.use('/api/auth', authLimiter);

// Bid spam protection — a real user can't place more than 10 bids per minute
const bidLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many bids, slow down.' },
  skip: () => config.env === 'test',
});
app.use('/api/auctions', bidLimiter);

app.use(express.json({ limit: '50kb' }));
app.use(cookieParser());
if (config.env !== 'test') app.use(morgan(config.logFormat));

app.use('/api', routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
