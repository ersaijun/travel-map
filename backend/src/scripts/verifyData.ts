import 'dotenv/config';
import mongoose from 'mongoose';
import { ScenicSpot } from '../models/ScenicSpot.js';

async function verify() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/travel-map');
  console.log('MongoDB 连接成功');

  const total = await ScenicSpot.countDocuments();
  console.log(`景区总数: ${total}`);

  // 统计各省份景区数量
  const byProvince = await ScenicSpot.aggregate([
    { $group: { _id: '$province', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  
  console.log('\n各省份景区数量:');
  byProvince.forEach(p => console.log(`  ${p._id}: ${p.count}`));

  // 检查坐标为0的景区
  const invalidCoords = await ScenicSpot.find({
    'location.coordinates': [0, 0]
  });
  
  if (invalidCoords.length > 0) {
    console.log('\n坐标无效的景区:');
    invalidCoords.forEach(s => console.log(`  ${s.name} (${s.province})`));
  } else {
    console.log('\n所有景区坐标有效！');
  }

  // 检查上海市景区
  const shanghai = await ScenicSpot.find({ province: '上海市' });
  console.log('\n上海市景区:');
  shanghai.forEach(s => {
    const coords = s.location?.coordinates || [0, 0];
    console.log(`  ${s.name}: [${coords[0]}, ${coords[1]}]`);
  });

  await mongoose.disconnect();
}

verify();
