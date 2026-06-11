import mongoose, { Document, Schema } from 'mongoose';

export interface IForumPost extends Document {
  forumId: mongoose.Types.ObjectId;
  authorId?: mongoose.Types.ObjectId;
  anonymousName: string;
  title: string;
  content: string;
  isAnonymous: boolean;
  likes: number;
  reports: number;
  isModerated: boolean;
  isHidden: boolean;
  parentId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const forumPostSchema = new Schema<IForumPost>(
  {
    forumId: { type: Schema.Types.ObjectId, ref: 'Forum', required: true, index: true },
    authorId: { type: Schema.Types.ObjectId, ref: 'User' },
    anonymousName: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true, maxlength: 5000 },
    isAnonymous: { type: Boolean, default: true },
    likes: { type: Number, default: 0 },
    reports: { type: Number, default: 0 },
    isModerated: { type: Boolean, default: false },
    isHidden: { type: Boolean, default: false },
    parentId: { type: Schema.Types.ObjectId, ref: 'ForumPost' },
  },
  { timestamps: true }
);

forumPostSchema.index({ forumId: 1, createdAt: -1 });

export const ForumPost = mongoose.model<IForumPost>('ForumPost', forumPostSchema);
