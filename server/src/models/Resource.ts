import mongoose, { Document, Schema } from 'mongoose';

export interface IResource extends Document {
  title: string;
  description: string;
  type: 'article' | 'video' | 'guide' | 'strategy' | 'emergency';
  content?: string;
  url?: string;
  tags: string[];
  isPublished: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const resourceSchema = new Schema<IResource>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    type: {
      type: String,
      enum: ['article', 'video', 'guide', 'strategy', 'emergency'],
      required: true,
    },
    content: { type: String },
    url: { type: String },
    tags: { type: [String], default: [] },
    isPublished: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

resourceSchema.index({ title: 'text', description: 'text', tags: 'text' });

export const Resource = mongoose.model<IResource>('Resource', resourceSchema);
