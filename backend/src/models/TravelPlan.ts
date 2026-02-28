import mongoose from 'mongoose';

export interface ITravelPlan extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  startDate: Date;
  endDate: Date;
  spots: {
    spotId: mongoose.Types.ObjectId;
    day: number;
    order: number;
    notes: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const travelPlanSchema = new mongoose.Schema<ITravelPlan>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    spots: [
      {
        spotId: { type: mongoose.Schema.Types.ObjectId, ref: 'ScenicSpot', required: true },
        day: { type: Number, required: true },
        order: { type: Number, required: true },
        notes: { type: String, default: '' }
      }
    ]
  },
  { timestamps: true }
);

export const TravelPlan = mongoose.model<ITravelPlan>('TravelPlan', travelPlanSchema);
