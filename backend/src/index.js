import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import http from 'http';
import { connectDB } from './config/database.js';
import categoryRoutes from './routes/categories.js';
import productRoutes from './routes/products.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import orderRoutes, { stripeWebhookHandler } from './routes/orders.js';
import adminRoutes from './routes/admin.js';
import bannerRoutes from './routes/banner.js';
import imageRoutes from './routes/images.js';
import contactRoutes from './routes/contact.js';
import Banner from './models/Banner.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Socket.IO setup with CORS
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());

app.post('/api/orders/webhook', express.raw({ type: 'application/json' }), stripeWebhookHandler);

app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Glowora API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/banner', bannerRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/contact', contactRoutes);

connectDB();

// Socket.IO real-time banner updates using MongoDB change streams
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Watch Banner collection for changes and broadcast to all connected clients
async function setupBannerChangeStream() {
  try {
    const bannerCollection = Banner.collection;
    const changeStream = bannerCollection.watch([
      { $match: { 'operationType': { $in: ['insert', 'update', 'replace'] }, 'fullDocument.singleton': true } },
    ]);

    changeStream.on('change', async (change) => {
      try {
        const banner = await Banner.findOne({ singleton: true });
        if (banner) {
          const v = banner.updatedAt ? banner.updatedAt.getTime() : Date.now();
          const imageUrl = banner.imageData ? `/api/images/banner/hero?v=${v}` : null;
          const promoImageUrl = banner.promoImageData ? `/api/images/banner/promo?v=${v}` : null;
          
          io.emit('banner-updated', { imageUrl, promoImageUrl, updatedAt: banner.updatedAt });
          console.log('Broadcasting banner update:', { imageUrl, promoImageUrl });
        }
      } catch (err) {
        console.error('Error in change stream handler:', err.message);
      }
    });

    changeStream.on('error', (err) => {
      console.error('Change stream error:', err.message);
      // Reconnect after 5 seconds
      setTimeout(setupBannerChangeStream, 5000);
    });
  } catch (err) {
    console.error('Failed to setup banner change stream:', err.message);
    setTimeout(setupBannerChangeStream, 5000);
  }
}

// Start change stream listener after DB connects
setTimeout(setupBannerChangeStream, 2000);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
