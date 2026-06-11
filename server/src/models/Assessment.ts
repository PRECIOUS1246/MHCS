import mongoose, { Document, Schema } from 'mongoose';
import { AssessmentType, RiskLevel } from '../types';

export interface IAssessment extends Document {
  userId?: mongoose.Types.ObjectId;
  type: AssessmentType;
  answers: number[];
  score: number;
  riskLevel: RiskLevel;
  recommendations: string[];
  isAnonymous: boolean;
  createdAt: Date;
}

const assessmentSchema = new Schema<IAssessment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    type: { type: String, enum: ['phq9', 'gad7'], required: true },
    answers: { type: [Number], required: true },
    score: { type: Number, required: true },
    riskLevel: {
      type: String,
      enum: ['low', 'moderate', 'high', 'critical'],
      required: true,
    },
    recommendations: { type: [String], default: [] },
    isAnonymous: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

assessmentSchema.index({ userId: 1, createdAt: -1 });
assessmentSchema.index({ riskLevel: 1 });

export const Assessment = mongoose.model<IAssessment>('Assessment', assessmentSchema);
