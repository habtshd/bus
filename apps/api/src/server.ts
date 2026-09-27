import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import stationsRoutes from './routes/stations.routes';
import fleetRoutes from './routes/fleet.routes';
import tripsRoutes from './routes/trips.routes';
import bookingsRoutes from './routes/bookings.routes';
import ticketsRoutes from './routes/tickets.routes';
import manifestRoutes from './routes/manifest.routes';
import analyticsRoutes from './routes/analytics.routes';
import agentRoutes from './routes/agent.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/stations', stationsRoutes);
app.use('/api/fleet', fleetRoutes);
app.use('/api/trips', tripsRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/tickets', ticketsRoutes);
app.use('/api/manifest', manifestRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/agent', agentRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Ethiopian Intercity Bus Platform API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🚍 Ethiopian Bus Platform API running on http://localhost:${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
});

export default app;
