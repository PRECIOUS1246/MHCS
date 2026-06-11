import mongoose, { Document, Schema } from 'mongoose';

export interface ITimeSlot {
  startTime: string;
  endTime: string;
}

export interface ICounsellorAvailability extends Document {
  counsellorId: mongoose.Types.ObjectId;
  dayOfWeek: number;
  slots: ITimeSlot[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const timeSlotSchema = new Schema<ITimeSlot>(
  {
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
  },
  { _id: false }
);

const counsellorAvailabilitySchema = new Schema<ICounsellorAvailability>(
  {
    counsellorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    dayOfWeek: { type: Number, required: true, min: 0, max: 6 },
    slots: { type: [timeSlotSchema], default: [] },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

counsellorAvailabilitySchema.index({ counsellorId: 1, dayOfWeek: 1 }, { unique: true });

export const CounsellorAvailability = mongoose.model<ICounsellorAvailability>(
  'CounsellorAvailability',
  counsellorAvailabilitySchema
);
