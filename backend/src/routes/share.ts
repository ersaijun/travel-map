import { FastifyInstance } from 'fastify';
import { ShareRecord } from '../models/ShareRecord.js';
import { User } from '../models/User.js';
import { createContentAuditMiddleware } from '../middleware/contentAudit.js';

interface JwtPayload {
  userId: string;
}

// 内容审核中间件
const contentAudit = createContentAuditMiddleware({
  fields: ['shareImage'],
  blockOnHighRisk: true
});

const authPreHandler = async (request: any, reply: any, fastify: FastifyInstance) => {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return reply.status(401).send({ error: '未登录' });
    }
    const token = authHeader.replace('Bearer ', '');
    request.user = fastify.jwt.verify<JwtPayload>(token);
  } catch {
    return reply.status(401).send({ error: 'token无效' });
  }
};

// 分享频率限制中间件
const shareRateLimit = new Map<string, { count: number; resetTime: number }>();

const shareRateLimitMiddleware = async (request: any, reply: any, fastify: FastifyInstance) => {
  const userId = request.user?.userId;
  if (!userId) {
    return reply.status(401).send({ error: '未登录' });
  }

  const key = `share:${userId}`;
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000; // 24小时

  // 重置计数（每天重置）
  if (!shareRateLimit.has(key) || now > shareRateLimit.get(key)!.resetTime + oneDay) {
    shareRateLimit.set(key, { count: 0, resetTime: now });
  }

  const limit = shareRateLimit.get(key)!;

  // 检查是否超限
  if (limit.count >= 5) {
    return reply.status(429).send({ 
      error: '今日分享次数已达上限',
      remaining: 5 - limit.count,
      resetTime: limit.resetTime + oneDay
    });
  }

  // 增加计数
  limit.count++;
  shareRateLimit.set(key, limit);

  // 继续处理请求
};

export default async function shareRoutes(fastify: FastifyInstance) {
  // 创建分享记录
  fastify.post('/api/share/achievement', {
    preHandler: async (request, reply) => {
      await authPreHandler(request, reply, fastify);
      await contentAudit(request, reply);
      await shareRateLimitMiddleware(request, reply, fastify);
    }
  }, async (request: any, reply: any) => {
    const userId = request.user!.userId;
    const user = await User.findById(userId);

    if (!user) {
      return reply.status(404).send({ error: '用户不存在' });
    }

    // 获取用户收藏的景区数量
    const spotCount = user.favorites?.length || 0;

    // 计算百分比
    const percentage = Math.round((spotCount / 358) * 100);

    // 生成分享记录
    const shareRecord = await ShareRecord.create({
      userId,
      spotCount,
      totalSpots: 358,
      percentage,
      shareChannel: request.body.shareChannel || 'link',
      shareImage: request.body.shareImage || null
    });

    return reply.send({
      message: '分享成功',
      data: shareRecord
    });
  });

  // 获取分享历史
  fastify.get('/api/share/history', {
    preHandler: async (request, reply) => authPreHandler(request, reply, fastify)
  }, async (request: any, reply: any) => {
    const userId = request.user!.userId;
    
    const records = await ShareRecord.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50); // 最近50条记录

    return reply.send({
      data: records,
      total: records.length
    });
  });

  // 获取分享统计
  fastify.get('/api/share/stats', {
    preHandler: async (request, reply) => authPreHandler(request, reply, fastify)
  }, async (request: any, reply: any) => {
    const userId = request.user!.userId;
    
    // 获取最新的分享记录
    const latestRecord = await ShareRecord.findOne({ userId })
      .sort({ createdAt: -1 });

    if (!latestRecord) {
      return reply.send({
        spotCount: 0,
        totalSpots: 358,
        percentage: 0,
        shareCount: 0
      });
    }

    // 统计总分享次数
    const totalShares = await ShareRecord.countDocuments({ userId });

    return reply.send({
      spotCount: latestRecord.spotCount,
      totalSpots: latestRecord.totalSpots,
      percentage: latestRecord.percentage,
      shareCount: totalShares
    });
  });

  // 删除分享记录
  fastify.delete('/api/share/:id', {
    preHandler: async (request, reply) => authPreHandler(request, reply, fastify)
  }, async (request: any, reply: any) => {
    const { id } = request.params as { id: string };
    const userId = request.user!.userId;

    const record = await ShareRecord.findOne({ _id: id, userId });
    
    if (!record) {
      return reply.status(404).send({ error: '分享记录不存在' });
    }

    // 验证权限（只能删除自己的记录）
    if (record.userId.toString() !== userId) {
      return reply.status(403).send({ error: '无权删除' });
    }

    await ShareRecord.findByIdAndDelete(id);

    return reply.send({ message: '删除成功' });
  });
}
