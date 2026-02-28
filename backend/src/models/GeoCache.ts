import mongoose from 'mongoose';

export interface IGeoCache extends mongoose.Document {
  address: string;
  coordinates: [number, number];
  createdAt: Date;
  expiresAt: Date;
}

const geoCacheSchema = new mongoose.Schema<IGeoCache>(
  {
    address: { 
      type: String, 
      required: true, 
      unique: true,
      index: true 
    },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: (val: number[]) => val.length === 2,
        message: '坐标必须包含经度和纬度'
      }
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30天后过期
      index: { expires: '30d' } // MongoDB TTL索引，自动删除过期记录
    }
  },
  { timestamps: true }
);

export const GeoCache = mongoose.model<IGeoCache>('GeoCache', geoCacheSchema);
