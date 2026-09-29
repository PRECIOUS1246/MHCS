import mongoose, { Document, Schema } from 'mongoose';

export interface IChatMessage extends Document {
  roomId: string;
  senderId: mongoose.Types.ObjectId;
  senderNickname: string;
  content: string;
  media?: {
    fileId: string;
    mimeType: string;
    originalName: string;
    size: number;
  };
  isAnonymous: boolean;
  isModerated: boolean;
  createdAt: Date;
}

const chatMessageSchema = new Schema<IChatMessage>(
  {
    roomId: { type: String, required: true, index: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    senderNickname: { type: String, required: true },
    content: { type: String, default: '', maxlength: 2000 },
    media: {
      fileId: { type: String },
      mimeType: { type: String },
      originalName: { type: String },
      size: { type: Number },
    },
    isAnonymous: { type: Boolean, default: true },
    isModerated: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

chatMessageSchema.index({ roomId: 1, createdAt: -1 });

export const ChatMessage = mongoose.model<IChatMessage>('ChatMessage', chatMessageSchema);
