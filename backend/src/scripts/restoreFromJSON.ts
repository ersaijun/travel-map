import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs/promises';

dotenv.config();

const ScenicSpotSchema = new mongoose.Schema({
  name: String,
  province: String,
  city: String,
  description: String,
  highlights: [String],
  ticketInfo: {
    price: Number,
    description: String
  },
  openTime: String,
  rating: Number,
  images: [String],
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }
  }
});

const ScenicSpot = mongoose.model('ScenicSpot', ScenicSpotSchema);

async function restoreFromJSON() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/travel-map');
    console.log('MongoDB 连接成功');

    // 清空数据库
    await ScenicSpot.deleteMany({});
    console.log('已清空数据库');

    // 从JSON文件读取数据
    const dataPath = 'c:/work/code/vibe-coding/travel-map/data/scenic-spots-detail-full.json';
    const spotsData = JSON.parse(await fs.readFile(dataPath, 'utf-8'));

    console.log(`准备导入 ${spotsData.length} 个景区`);

    // 批量插入数据
    await ScenicSpot.insertMany(spotsData);
    console.log(`成功导入 ${spotsData.length} 个景区`);

    // 验证导入结果
    const count = await ScenicSpot.countDocuments();
    console.log(`\n数据库中共有 ${count} 个景区`);

  } catch (error) {
    console.error('错误:', error);
  } finally {
    await mongoose.connection.close();
  }
}

restoreFromJSON();
