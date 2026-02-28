import { FastifyInstance } from 'fastify';
import { User } from '../models/User.js';
import { ScenicSpot } from '../models/ScenicSpot.js';
import { TravelPlan } from '../models/TravelPlan.js';

interface JwtPayload {
  userId: string;
}

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

export default async function userRoutes(fastify: FastifyInstance) {
  fastify.post('/api/auth/wechat', async (request, reply) => {
    const { code } = request.body as { code: string };
    
    if (!code) {
      return reply.status(400).send({ error: '缺少code参数' });
    }

    return reply.status(501).send({ 
      error: '微信登录功能待实现',
      message: '请在微信开放平台注册应用后配置相关参数'
    });
  });

  fastify.post('/api/auth/qq', async (request, reply) => {
    const { code } = request.body as { code: string };
    
    if (!code) {
      return reply.status(400).send({ error: '缺少code参数' });
    }

    return reply.status(501).send({ 
      error: 'QQ登录功能待实现',
      message: '请在QQ互联平台注册应用后配置相关参数'
    });
  });

  fastify.post('/api/auth/dev-login', async (request, reply) => {
    const { nickname } = request.body as { nickname?: string };
    
    let user = await User.findOne({ openid: 'dev-user' });
    
    if (!user) {
      user = await User.create({
        openid: 'dev-user',
        loginType: 'wechat',
        nickname: nickname || '测试用户',
        avatar: ''
      });
    }

    const token = fastify.jwt.sign({ userId: user._id.toString() });
    
    return {
      token,
      user: {
        id: user._id,
        nickname: user.nickname,
        avatar: user.avatar
      }
    };
  });

  fastify.get('/api/user/profile', {
    preHandler: async (request, reply) => authPreHandler(request, reply, fastify)
  }, async (request: any, reply) => {
    const user = await User.findById(request.user!.userId).populate('favorites');
    if (!user) {
      return reply.status(404).send({ error: '用户不存在' });
    }
    return user;
  });

  fastify.post('/api/user/favorites', {
    preHandler: async (request, reply) => authPreHandler(request, reply, fastify)
  }, async (request: any, reply) => {
    const { spotId } = request.body as { spotId: string };
    
    const spot = await ScenicSpot.findById(spotId);
    if (!spot) {
      return reply.status(404).send({ error: '景区不存在' });
    }

    const user = await User.findById(request.user!.userId);
    if (!user) {
      return reply.status(404).send({ error: '用户不存在' });
    }

    if (user.favorites.includes(spot._id)) {
      return reply.status(400).send({ error: '已收藏该景区' });
    }

    user.favorites.push(spot._id);
    await user.save();

    return { message: '收藏成功' };
  });

  fastify.delete('/api/user/favorites/:spotId', {
    preHandler: async (request, reply) => authPreHandler(request, reply, fastify)
  }, async (request: any, reply) => {
    const { spotId } = request.params as { spotId: string };
    
    const user = await User.findById(request.user!.userId);
    if (!user) {
      return reply.status(404).send({ error: '用户不存在' });
    }

    user.favorites = user.favorites.filter(id => id.toString() !== spotId);
    await user.save();

    return { message: '取消收藏成功' };
  });

  // 用户数据删除接口 - 符合《个人信息保护法》和GDPR要求
  fastify.delete('/api/user/account', {
    preHandler: async (request, reply) => authPreHandler(request, reply, fastify)
  }, async (request: any, reply) => {
    const user = await User.findById(request.user!.userId);
    if (!user) {
      return reply.status(404).send({ error: '用户不存在' });
    }

    // 删除用户的所有行程数据
    await TravelPlan.deleteMany({ userId: request.user!.userId });
    
    // 删除用户账号
    await User.findByIdAndDelete(request.user!.userId);

    return { 
      message: '账号已注销，所有数据已删除',
      deletedAt: new Date().toISOString()
    };
  });

  // 用户数据导出接口 - 符合GDPR数据可携带权要求
  fastify.get('/api/user/data-export', {
    preHandler: async (request, reply) => authPreHandler(request, reply, fastify)
  }, async (request: any, reply) => {
    const user = await User.findById(request.user!.userId).populate('favorites');
    if (!user) {
      return reply.status(404).send({ error: '用户不存在' });
    }

    const plans = await TravelPlan.find({ userId: request.user!.userId }).populate('spots.spotId');

    const userData = {
      profile: {
        nickname: user.nickname,
        avatar: user.avatar,
        createdAt: user.createdAt
      },
      favorites: user.favorites,
      travelPlans: plans,
      exportedAt: new Date().toISOString()
    };

    reply.header('Content-Disposition', `attachment; filename="user-data-${user._id}.json"`);
    return userData;
  });
}
