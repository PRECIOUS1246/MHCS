import mongoose, { Document, Schema } from 'mongoose';

export interface IMoodRecord extends Document {
  userId: mongoose.Types.ObjectId;
  mood: number;
  emoji: string;
  note?: string;
  tags?: string[];
  createdAt: Date;
}

const moodRecordSchema = new Schema<IMoodRecord>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    mood: { type: Number, required: true, min: 1, max: 10 },
    emoji: { type: String, required: true },
    note: { type: String, maxlength: 2000 },
    tags: { type: [String], default: [] },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

moodRecordSchema.index({ userId: 1, createdAt: -1 });

export const MoodRecord = mongoose.model<IMoodRecord>('MoodRecord', moodRecordSchema);
