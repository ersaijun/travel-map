import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

/**
 * API限流中间件 - 防止恶意请求和成本失控
 * 默认限制：每分钟60次请求
 */
export function createRateLimiter(options: {
  windowMs?: number;
  max?: number;
  message?: string;
} = {}) {
  const windowMs = options.windowMs || 60000;
  const max = options.max || 60;
  const message = options.message || '请求过于频繁，请稍后再试';

  return async (request: FastifyRequest, reply: FastifyReply) => {
    const ip = request.ip || 'unknown';
    const key = `${ip}:${request.url}`;
    const now = Date.now();

    if (!store[key] || now > store[key].resetTime) {
      store[key] = {
        count: 1,
        resetTime: now + windowMs
      };
    } else {
      store[key].count++;
    }

    const remaining = Math.max(0, max - store[key].count);
    
    reply.header('X-RateLimit-Limit', max);
    reply.header('X-RateLimit-Remaining', remaining);
    reply.header('X-RateLimit-Reset', store[key].resetTime);

    if (store[key].count > max) {
      return reply.status(429).send({
        error: message,
        retryAfter: Math.ceil((store[key].resetTime - now) / 1000)
      });
    }
  };
}

/**
 * 高德地图API专用限流器 - 更严格的限制
 * 限制：每分钟10次，每天1000次
 */
export function createAmapRateLimiter() {
  const minuteStore: RateLimitStore = {};
  const dayStore: RateLimitStore = {};
  
  const minuteMax = 10;
  const dayMax = 1000;

  return async (request: FastifyRequest, reply: FastifyReply) => {
    const ip = request.ip || 'unknown';
    const now = Date.now();
    const dayKey = `${ip}:amap:${new Date().toDateString()}`;
    const minuteKey = `${ip}:amap:minute`;

    if (!minuteStore[minuteKey] || now > minuteStore[minuteKey].resetTime) {
      minuteStore[minuteKey] = { count: 1, resetTime: now + 60000 };
    } else {
      minuteStore[minuteKey].count++;
    }

    if (!dayStore[dayKey]) {
      dayStore[dayKey] = { count: 1, resetTime: now + 86400000 };
    } else {
      dayStore[dayKey].count++;
    }

    if (minuteStore[minuteKey].count > minuteMax) {
      return reply.status(429).send({
        error: '高德地图API请求过于频繁，请1分钟后再试',
        retryAfter: 60
      });
    }

    if (dayStore[dayKey].count > dayMax) {
      return reply.status(429).send({
        error: '今日高德地图API调用次数已达上限，请明天再试',
        retryAfter: 86400
      });
    }

    reply.header('X-Amap-Limit-Minute', minuteMax);
    reply.header('X-Amap-Remaining-Minute', Math.max(0, minuteMax - minuteStore[minuteKey].count));
    reply.header('X-Amap-Limit-Day', dayMax);
    reply.header('X-Amap-Remaining-Day', Math.max(0, dayMax - dayStore[dayKey].count));
  };
}

/**
 * 定期清理过期的限流记录，避免内存泄漏
 */
export function cleanupRateLimitStore() {
  const now = Date.now();
  for (const key in store) {
    if (now > store[key].resetTime) {
      delete store[key];
    }
  }
}

setInterval(cleanupRateLimitStore, 60000);
