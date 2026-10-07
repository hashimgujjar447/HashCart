/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import express, { urlencoded } from 'express';
import * as path from 'path';
import cors from 'cors';
import proxy from 'express-http-proxy';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { errorMiddleware } from '../../../packages/error-handler/error-middleware';
import cookieParser from 'cookie-parser';
import { connectRedis } from '../../../packages/redis/redis';

const app = express();

app.use(
  cors({
    origin: ['http://localhost:3000'],
    allowedHeaders: ['Authorization', 'Content-Type'],
    credentials: true,
  }),
);

app.use(morgan('dev'));
app.use(express.json());
app.use(urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

app.set('trust proxy', 1);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: (req: any) => (req.user ? 1000 : 100),
  message: { error: 'Too many requests please try again later!' },
  standardHeaders: true,
  legacyHeaders: true,
  keyGenerator: (req: any) => req.ip,
});

app.use(limiter);

app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.get('/api-gateway-health', (req, res) => {
  res.send({ message: 'Welcome to api-gateway!' });
});

app.use('/auth', proxy('http://localhost:6001'));

app.use(errorMiddleware);

const port = process.env.PORT || 8080;

const startServer = async () => {
  try {
    await connectRedis();

    console.log('Connected to Redis');

    const server = app.listen(port, () => {
      console.log(`Listening at http://localhost:${port}`);
    });

    server.on('error', console.error);
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
    process.exit(1);
  }
};

startServer();
