import mongoose, { Document, Schema } from 'mongoose';
import { RiskLevel } from '../types';

export interface IAlert extends Document {
  userId?: mongoose.Types.ObjectId;
  assessmentId?: mongoose.Types.ObjectId;
  type: 'assessment' | 'mood' | 'manual' | 'system';
  riskLevel: RiskLevel;
  message: string;
  isResolved: boolean;
  resolvedBy?: mongoose.Types.ObjectId;
  resolvedAt?: Date;
  createdAt: Date;
}

const alertSchema = new Schema<IAlert>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    assessmentId: { type: Schema.Types.ObjectId, ref: 'Assessment' },
    type: {
      type: String,
      enum: ['assessment', 'mood', 'manual', 'system'],
      required: true,
    },
    riskLevel: {
      type: String,
      enum: ['low', 'moderate', 'high', 'critical'],
      required: true,
    },
    message: { type: String, required: true },
    isResolved: { type: Boolean, default: false },
    resolvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    resolvedAt: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

alertSchema.index({ isResolved: 1, riskLevel: 1, createdAt: -1 });

export const Alert = mongoose.model<IAlert>('Alert', alertSchema);
