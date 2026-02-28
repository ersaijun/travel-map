import { FastifyInstance } from 'fastify';
import { TravelPlan } from '../models/TravelPlan.js';
import { createContentAuditMiddleware } from '../middleware/contentAudit.js';

interface JwtPayload {
  userId: string;
}

// 内容审核中间件
const contentAudit = createContentAuditMiddleware({
  fields: ['title', 'notes'],
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

export default async function planRoutes(fastify: FastifyInstance) {
  fastify.get('/api/plans', {
    preHandler: async (request, reply) => authPreHandler(request, reply, fastify)
  }, async (request: any, reply) => {
    const plans = await TravelPlan.find({ userId: request.user!.userId })
      .populate('spots.spotId')
      .sort({ createdAt: -1 });
    return plans;
  });

  fastify.get('/api/plans/:id', {
    preHandler: async (request, reply) => authPreHandler(request, reply, fastify)
  }, async (request: any, reply) => {
    const { id } = request.params as { id: string };
    const plan = await TravelPlan.findOne({ 
      _id: id, 
      userId: request.user!.userId 
    }).populate('spots.spotId');
    
    if (!plan) {
      return reply.status(404).send({ error: '行程不存在' });
    }
    return plan;
  });

  fastify.post('/api/plans', {
    preHandler: async (request, reply) => {
      await authPreHandler(request, reply, fastify);
      await contentAudit(request, reply);
    }
  }, async (request: any, reply) => {
    const { title, startDate, endDate, spots } = request.body as {
      title: string;
      startDate: string;
      endDate: string;
      spots: { spotId: string; day: number; order: number; notes?: string }[];
    };

    const plan = await TravelPlan.create({
      userId: request.user!.userId,
      title,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      spots: spots.map(s => ({
        spotId: s.spotId,
        day: s.day,
        order: s.order,
        notes: s.notes || ''
      }))
    });

    return plan;
  });

  fastify.put('/api/plans/:id', {
    preHandler: async (request, reply) => {
      await authPreHandler(request, reply, fastify);
      await contentAudit(request, reply);
    }
  }, async (request: any, reply) => {
    const { id } = request.params as { id: string };
    const { title, startDate, endDate, spots } = request.body as {
      title?: string;
      startDate?: string;
      endDate?: string;
      spots?: { spotId: string; day: number; order: number; notes?: string }[];
    };

    const updateData: Record<string, unknown> = {};
    if (title) updateData.title = title;
    if (startDate) updateData.startDate = new Date(startDate);
    if (endDate) updateData.endDate = new Date(endDate);
    if (spots) updateData.spots = spots.map(s => ({
      spotId: s.spotId,
      day: s.day,
      order: s.order,
      notes: s.notes || ''
    }));

    const plan = await TravelPlan.findOneAndUpdate(
      { _id: id, userId: request.user!.userId },
      updateData,
      { new: true }
    ).populate('spots.spotId');

    if (!plan) {
      return reply.status(404).send({ error: '行程不存在' });
    }
    return plan;
  });

  fastify.delete('/api/plans/:id', {
    preHandler: async (request, reply) => authPreHandler(request, reply, fastify)
  }, async (request: any, reply) => {
    const { id } = request.params as { id: string };
    const plan = await TravelPlan.findOneAndDelete({ 
      _id: id, 
      userId: request.user!.userId 
    });
    
    if (!plan) {
      return reply.status(404).send({ error: '行程不存在' });
    }
    return { message: '删除成功' };
  });

  fastify.post('/api/plans/generate', {
    preHandler: async (request, reply) => authPreHandler(request, reply, fastify)
  }, async (_request, reply) => {
    return reply.status(501).send({ 
      error: 'AI行程生成功能待实现',
      message: '请配置AI大模型API后启用此功能'
    });
  });
}
