import 'dotenv/config';
import mongoose from 'mongoose';
import { ScenicSpot } from '../models/ScenicSpot.js';

async function countSpots() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/travel-map');
  console.log('MongoDB 连接成功');

  const total = await ScenicSpot.countDocuments();
  console.log(`数据库景区总数: ${total}`);

  // 统计各省份景区数量
  const byProvince = await ScenicSpot.aggregate([
    { $group: { _id: '$province', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  
  console.log('\n各省份景区数量:');
  byProvince.forEach(p => console.log(`  ${p._id}: ${p.count}`));

  // 统计有坐标的景区数量
  const withCoords = await ScenicSpot.countDocuments({
    'location.coordinates': { $ne: [0, 0] }
  });
  console.log(`\n有有效坐标的景区: ${withCoords}`);

  await mongoose.disconnect();
}

countSpots();
