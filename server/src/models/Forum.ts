import mongoose, { Document, Schema } from 'mongoose';

export interface IForum extends Document {
  title: string;
  description: string;
  category: string;
  isActive: boolean;
  postCount: number;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const forumSchema = new Schema<IForum>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true, index: true },
    isActive: { type: Boolean, default: true },
    postCount: { type: Number, default: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export const Forum = mongoose.model<IForum>('Forum', forumSchema);
