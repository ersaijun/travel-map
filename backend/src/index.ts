import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { connectDB } from './config/database.js';
import spotRoutes from './routes/spot.js';
import userRoutes from './routes/user.js';
import planRoutes from './routes/plan.js';
import shareRoutes from './routes/share.js';
import { createRateLimiter } from './middleware/rateLimiter.js';

const fastify = Fastify({
  logger: true
});

await fastify.register(cors, {
  origin: true
});

await fastify.register(jwt, {
  secret: process.env.JWT_SECRET || 'default-secret'
});

// 全局限流中间件 - 每分钟60次请求
const rateLimiter = createRateLimiter({ windowMs: 60000, max: 60 });
fastify.addHook('onRequest', rateLimiter);

await connectDB();

await fastify.register(spotRoutes);
await fastify.register(userRoutes);
await fastify.register(planRoutes);
await fastify.register(shareRoutes);

fastify.get('/', async () => {
  return { message: '中国5A景区全揽 API', version: '1.0.0' };
});

const start = async () => {
  try {
    await connectDB();
    await fastify.listen({ port: Number(process.env.PORT) || 3000, host: '0.0.0.0' });
    console.log(`Server running at http://localhost:${process.env.PORT || 3000}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
