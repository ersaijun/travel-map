import 'dotenv/config';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ScenicSpot } from '../models/ScenicSpot.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function importDetails() {
  const dataPath = path.join(__dirname, '../../../data/scenic-spots-detail-full.json');
  const rawData = fs.readFileSync(dataPath, 'utf-8');
  const spotsDetail = JSON.parse(rawData);

  console.log(`开始更新 ${spotsDetail.length} 个景区详细信息...`);

  let updated = 0;
  let notFound = 0;

  for (const detail of spotsDetail) {
    // 根据名称和省份查找景区
    const existing = await ScenicSpot.findOne({ 
      name: detail.name, 
      province: detail.province 
    });
    
    if (!existing) {
      // 尝试模糊匹配（名称可能略有差异）
      const fuzzyMatch = await ScenicSpot.findOne({
        name: { $regex: detail.name.replace(/[（）\(\)景区旅游区风景名胜区]/g, ''), $options: 'i' },
        province: detail.province
      });
      
      if (!fuzzyMatch) {
        notFound++;
        console.log(`未找到匹配: ${detail.name} (${detail.province})`);
        continue;
      }
      
      // 更新模糊匹配的记录
      await ScenicSpot.updateOne(
        { _id: fuzzyMatch._id },
        {
          $set: {
            description: detail.description,
            highlights: detail.highlights,
            ticketInfo: detail.ticketInfo,
            openTime: detail.openTime,
            rating: detail.rating,
            images: detail.images
          }
        }
      );
      updated++;
      console.log(`更新成功(模糊匹配): ${fuzzyMatch.name} -> ${detail.name}`);
      continue;
    }

    // 更新详细信息
    await ScenicSpot.updateOne(
      { _id: existing._id },
      {
        $set: {
          description: detail.description,
          highlights: detail.highlights,
          ticketInfo: detail.ticketInfo,
          openTime: detail.openTime,
          rating: detail.rating,
          images: detail.images
        }
      }
    );
    updated++;
    console.log(`更新成功: ${detail.name}`);
  }

  console.log(`\n更新完成！`);
  console.log(`- 成功更新: ${updated}`);
  console.log(`- 未找到匹配: ${notFound}`);
}

async function main() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/travel-map';
  await mongoose.connect(uri);
  console.log('MongoDB 连接成功');

  try {
    await importDetails();
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB 连接已关闭');
  }
}

main().catch(console.error);
