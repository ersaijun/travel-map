import mongoose from 'mongoose';

export interface IShareRecord extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  spotCount: number;
  totalSpots: number;
  percentage: number;
  shareImage?: string;
  shareChannel: 'wechat' | 'qq' | 'link';
  createdAt: Date;
  updatedAt: Date;
}

const shareRecordSchema = new mongoose.Schema<IShareRecord>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    spotCount: {
      type: Number,
      required: true,
      default: 0
    },
    totalSpots: {
      type: Number,
      required: true,
      default: 358 // 中国5A景区总数
    },
    percentage: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      max: 100
    },
    shareImage: {
      type: String,
      default: null
    },
    shareChannel: {
      type: String,
      enum: ['wechat', 'qq', 'link'],
      default: 'link'
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    indexes: [
      { userId: 1, createdAt: -1 }, // 复合索引，查询用户分享历史
      { shareChannel: 1 } // 单字段索引，按渠道统计
    ]
  }
);

export const ShareRecord = mongoose.model('ShareRecord', shareRecordSchema);

export default ShareRecord;
