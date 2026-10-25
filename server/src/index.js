import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import gamesRoutes from './routes/games.routes.js';
import pricingRoutes from './routes/pricing.routes.js';
import bookingsRoutes from './routes/bookings.routes.js';
import adminRoutes from './routes/admin.routes.js';
import aiRoutes from './routes/ai.routes.js';
import { initFirebase } from './config/firebase.js';

dotenv.config();

// Initialize Firebase configuration
const { isReal } = initFirebase();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(morgan('dev'));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/games', gamesRoutes);
app.use('/api/pricing', pricingRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'Bandhilki PS5 Gaming Zone Backend API',
    firebaseMode: isReal ? 'Cloud Firestore (Production)' : 'Local Memory Store (Development)',
    timestamp: new Date().toISOString()
  });
});

// Root route
app.get('/', (req, res) => {
  res.send('🎮 Bandhilki PS5 Gaming Zone API is running. Check /api/health for system status.');
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 Bandhilki PS5 API Server active on http://localhost:${PORT}`);
  console.log(`🎮 Mode: ${isReal ? 'Firebase Live Production' : 'Local In-Memory Development'}`);
  console.log(`⚡ Ready for bookings, AI recommendations & admin tasks`);
  console.log(`=======================================================`);
});
