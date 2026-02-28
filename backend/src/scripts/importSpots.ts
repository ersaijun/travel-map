import 'dotenv/config';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ScenicSpot } from '../models/ScenicSpot.js';
import { GeoCache } from '../models/GeoCache.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const AMAP_KEY = process.env.AMAP_KEY || '';

/**
 * 获取地理坐标（带缓存）
 * 优先从缓存读取，缓存不存在或过期时调用高德地图API
 */
async function getCoordinates(name: string, city: string): Promise<[number, number] | null> {
  const address = `${city}${name}`;
  
  // 1. 先查缓存
  const cached = await GeoCache.findOne({ address });
  if (cached && cached.coordinates) {
    console.log(`[缓存命中] ${name}`);
    return cached.coordinates;
  }
  
  // 2. 缓存未命中，调用API
  if (!AMAP_KEY) {
    console.log(`未配置高德地图API Key，跳过坐标获取: ${name}`);
    return null;
  }

  try {
    const url = `https://restapi.amap.com/v3/geocode/geo?key=${AMAP_KEY}&address=${encodeURIComponent(address)}`;
    const response = await fetch(url);
    const data = await response.json() as { geocodes?: { location: string }[] };
    
    if (data.geocodes && data.geocodes.length > 0) {
      const location = data.geocodes[0].location;
      const [lng, lat] = location.split(',').map(Number);
      const coordinates: [number, number] = [lng, lat];
      
      // 3. 存入缓存
      await GeoCache.findOneAndUpdate(
        { address },
        { address, coordinates },
        { upsert: true, new: true }
      );
      
      console.log(`[API获取] ${name} [${lng}, ${lat}]`);
      return coordinates;
    }
  } catch (error) {
    console.error(`获取坐标失败: ${name}`, error);
  }
  return null;
}

async function importData() {
  const dataPath = path.join(__dirname, '../../../data/scenic-spots.json');
  const rawData = fs.readFileSync(dataPath, 'utf-8');
  const spots = JSON.parse(rawData);

  console.log(`开始更新 ${spots.length} 个景区坐标...`);

  let updated = 0;
  let skipped = 0;

  for (const spot of spots) {
    const existing = await ScenicSpot.findOne({ name: spot.name, province: spot.province });
    
    // 如果已存在且坐标有效，跳过
    if (existing && existing.location?.coordinates && 
        existing.location.coordinates[0] !== 0 && existing.location.coordinates[1] !== 0) {
      skipped++;
      console.log(`跳过(坐标有效): ${spot.name}`);
      continue;
    }

    const coordinates = await getCoordinates(spot.name, spot.city);
    
    if (existing) {
      // 更新已存在但坐标为空的记录
      if (coordinates) {
        await ScenicSpot.updateOne(
          { _id: existing._id },
          { $set: { location: { type: 'Point', coordinates } } }
        );
        updated++;
        console.log(`更新坐标: ${spot.name} (${spot.province}) [${coordinates[0]}, ${coordinates[1]}]`);
      } else {
        console.log(`坐标获取失败: ${spot.name}`);
      }
    } else {
      // 创建新记录
      await ScenicSpot.create({
        name: spot.name,
        province: spot.province,
        city: spot.city,
        category: spot.category || '其他',
        location: coordinates ? {
          type: 'Point',
          coordinates
        } : {
          type: 'Point',
          coordinates: [0, 0]
        },
        address: '',
        description: '',
        highlights: [],
        ticketInfo: {
          price: 0,
          description: ''
        },
        openTime: '',
        rating: 0,
        images: [],
        wikiUrl: ''
      });
      updated++;
      console.log(`新增: ${spot.name} (${spot.province})`);
    }
    
    if (AMAP_KEY) {
      await new Promise(resolve => setTimeout(resolve, 150));
    }
  }

  console.log(`\n更新完成！`);
  console.log(`- 更新/新增: ${updated}`);
  console.log(`- 跳过: ${skipped}`);
}

async function main() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/travel-map';
  await mongoose.connect(uri);
  console.log('MongoDB 连接成功');

  try {
    await importData();
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB 连接已关闭');
  }
}

main().catch(console.error);
