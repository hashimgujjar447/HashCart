import express, { urlencoded } from 'express';

import cors from 'cors';

import { errorMiddleware } from '../../../packages/error-handler/error-middleware';
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth.route';
import { connectRedis } from '../../../packages/redis/redis';

const app = express();

app.use(
  cors({
    origin: ['http://localhost:3000'],
    allowedHeaders: ['Authorization', 'Content-Type'],
    credentials: true,
  }),
);

app.use(express.json());
app.use(urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());

app.get('/api-auth-health', (req, res) => {
  res.json({ message: 'Auth service is healthy' });
});

app.use('/', authRouter);

app.get('/', (req, res) => {
  res.send({ message: 'Welcome to auth-service!' });
});

app.use(errorMiddleware);

const port = process.env.PORT || 6001;

const startServer = async () => {
  try {
    await connectRedis();
    console.log('Connected to Redis in auth-service');

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
