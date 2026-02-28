import mongoose from 'mongoose';

export interface IScenicSpot extends mongoose.Document {
  name: string;
  province: string;
  city: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  address: string;
  description: string;
  highlights: string[];
  category: string;
  ticketInfo: {
    price: number;
    description: string;
  };
  openTime: string;
  rating: number;
  images: string[];
  wikiUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

const scenicSpotSchema = new mongoose.Schema<IScenicSpot>(
  {
    name: { type: String, required: true, index: true },
    province: { type: String, required: true, index: true },
    city: { type: String, required: true },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true }
    },
    address: { type: String, default: '' },
    description: { type: String, default: '' },
    highlights: { type: [String], default: [] },
    category: { type: String, default: '其他' },
    ticketInfo: {
      price: { type: Number, default: 0 },
      description: { type: String, default: '' }
    },
    openTime: { type: String, default: '' },
    rating: { type: Number, default: 0 },
    images: { type: [String], default: [] },
    wikiUrl: { type: String, default: '' }
  },
  { timestamps: true }
);

scenicSpotSchema.index({ location: '2dsphere' });

export const ScenicSpot = mongoose.model<IScenicSpot>('ScenicSpot', scenicSpotSchema);
