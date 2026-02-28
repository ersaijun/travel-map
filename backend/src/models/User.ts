import mongoose from 'mongoose';

export interface IUser extends mongoose.Document {
  openid: string;
  unionid?: string;
  loginType: 'wechat' | 'qq';
  nickname: string;
  avatar: string;
  favorites: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    openid: { type: String, required: true, unique: true },
    unionid: { type: String },
    loginType: { type: String, enum: ['wechat', 'qq'], required: true },
    nickname: { type: String, default: '游客' },
    avatar: { type: String, default: '' },
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ScenicSpot' }]
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', userSchema);
