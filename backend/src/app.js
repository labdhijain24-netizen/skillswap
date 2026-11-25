import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { env } from './config/env.js';
import apiRouter from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const app = express();

/**
 * Global Middleware Configuration
 */
app.use(morgan('dev')); // HTTP request logger
app.use(express.json()); // Body parser for JSON
app.use(express.urlencoded({ extended: true }));

// CORS configuration to allow requests from the Vite frontend
const allowedOrigins = [
  env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, true); // Permissive in development
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  credentials: true,
}));

/**
 * Routes
 */
app.use('/api', apiRouter);

// Root route for convenient quick check
app.get('/', (req, res) => {
  res.json({
    message: 'SkillSwap API Server is running.',
    healthEndpoint: '/api/health',
  });
});

// 404 handler
app.use(notFoundHandler);

// Central error handler
app.use(errorHandler);

export default app;
