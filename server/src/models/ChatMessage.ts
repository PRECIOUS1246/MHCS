import mongoose, { Document, Schema } from 'mongoose';

export interface IChatMessage extends Document {
  roomId: string;
  senderId: mongoose.Types.ObjectId;
  senderNickname: string;
  content: string;
  isAnonymous: boolean;
  isModerated: boolean;
  createdAt: Date;
}

const chatMessageSchema = new Schema<IChatMessage>(
  {
    roomId: { type: String, required: true, index: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    senderNickname: { type: String, required: true },
    content: { type: String, required: true, maxlength: 2000 },
    isAnonymous: { type: Boolean, default: true },
    isModerated: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

chatMessageSchema.index({ roomId: 1, createdAt: -1 });

export const ChatMessage = mongoose.model<IChatMessage>('ChatMessage', chatMessageSchema);
