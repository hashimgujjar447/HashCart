import 'dotenv/config';
import express, { urlencoded } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { errorMiddleware } from '../../../packages/error-handler/error-middleware';
import { connectRedis } from '../../../packages/redis/redis';
import orderRoute from './routes/order.route';

const app = express();

app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
    ],
    allowedHeaders: ['Authorization', 'Content-Type', 'stripe-signature'],
    credentials: true,
  }),
);

app.use(
  express.json({
    limit: '50mb',
    verify: (req: any, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

app.get('/api-order-health', (req, res) => {
  res.json({ message: 'Order service is healthy' });
});

app.use('/', orderRoute);

app.use(errorMiddleware);

const port = process.env.PORT || 6004;

const startServer = async () => {
  try {
    await connectRedis();
    console.log(`Connected to Redis in order-service`);

    const server = app.listen(port, () => {
      console.log(`Order service listening at http://localhost:${port}`);
    });
    server.on('error', console.error);
  } catch (error) {
    console.error('Failed to connect to Redis in order-service:', error);
    process.exit(1);
  }
};

startServer();
