import 'dotenv/config';
import express, { urlencoded } from 'express';
import cors from 'cors';
import { errorMiddleware } from '../../../packages/error-handler/error-middleware';
import cookieParser from 'cookie-parser';
import { connectRedis } from '../../../packages/redis/redis';
import productRoute from './routes/product.route';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './swagger-output.json';

const app = express();

app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
    ],
    allowedHeaders: ['Authorization', 'Content-Type'],
    credentials: true,
  }),
);

app.use(express.json({ limit: '50mb' }));
app.use(urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

app.get('/api-product-health', (req, res) => {
  res.json({ message: 'Product service is healthy' });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/docs-json', (req, res) => {
  res.json(swaggerDocument);
});

app.use('/', productRoute);

app.get('/', (req, res) => {
  res.send({ message: 'Welcome to product-service!' });
});

app.use(errorMiddleware);

const port = process.env.PORT || 6002;

const startServer = async () => {
  try {
    await connectRedis();
    console.log('Connected to Redis in product-service');

    const server = app.listen(port, () => {
      console.log(`Listening at http://localhost:${port}`);
      console.log(`Swagger docs available at http://localhost:${port}/api-docs`);
    });
    server.on('error', console.error);
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
    process.exit(1);
  }
};

startServer();
