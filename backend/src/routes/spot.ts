import { FastifyInstance } from 'fastify';
import { ScenicSpot } from '../models/ScenicSpot.js';

export default async function spotRoutes(fastify: FastifyInstance) {
  fastify.get('/api/spots', async (request, reply) => {
    const { province, city, category, page = 1, limit = 20 } = request.query as {
      province?: string;
      city?: string;
      category?: string;
      page?: number;
      limit?: number;
    };

    const filter: Record<string, unknown> = {};
    if (province) filter.province = province;
    if (city) filter.city = city;
    if (category) filter.category = category;

    const skip = (Number(page) - 1) * Number(limit);
    const spots = await ScenicSpot.find(filter)
      .skip(skip)
      .limit(Number(limit))
      .sort({ province: 1, city: 1, name: 1 });

    const total = await ScenicSpot.countDocuments(filter);

    return {
      data: spots,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    };
  });

  fastify.get('/api/spots/provinces', async () => {
    const provinces = await ScenicSpot.aggregate([
      { $group: { _id: '$province', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
      { $project: { province: '$_id', count: 1, _id: 0 } }
    ]);
    return provinces;
  });

  fastify.get('/api/spots/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const spot = await ScenicSpot.findById(id);
    if (!spot) {
      return reply.status(404).send({ error: '景区不存在' });
    }
    return spot;
  });

  fastify.get('/api/spots/search/:keyword', async (request, reply) => {
    const { keyword } = request.params as { keyword: string };
    const spots = await ScenicSpot.find({
      $or: [
        { name: { $regex: keyword, $options: 'i' } },
        { city: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } }
      ]
    }).limit(20);
    return spots;
  });
}
