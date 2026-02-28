import 'dotenv/config';
import mongoose from 'mongoose';
import { ScenicSpot } from '../models/ScenicSpot.js';

// 上海市5A景区坐标数据（手动设置）
const shanghaiCoordinates: Record<string, [number, number]> = {
  '东方明珠广播电视塔': [121.4995, 31.2397],
  '上海野生动物园': [121.7055, 31.0584],
  '上海科技馆': [121.5405, 31.2173],
  '中国共产党一大·二大·四大纪念馆景区': [121.4693, 31.2214],
  '西沙明珠湖景区': [121.3544, 31.5234],
};

async function fixCoordinates() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/travel-map');
  console.log('MongoDB 连接成功');

  let updated = 0;

  for (const [name, coordinates] of Object.entries(shanghaiCoordinates)) {
    const result = await ScenicSpot.updateOne(
      { name, province: '上海市' },
      { $set: { location: { type: 'Point', coordinates } } }
    );
    
    if (result.modifiedCount > 0) {
      updated++;
      console.log(`更新坐标: ${name} [${coordinates[0]}, ${coordinates[1]}]`);
    } else {
      console.log(`未找到或无需更新: ${name}`);
    }
  }

  console.log(`\n更新完成！共更新 ${updated} 条记录`);
  await mongoose.disconnect();
}

fixCoordinates();
