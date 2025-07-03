import mongoose, { Document } from 'mongoose';

export interface IPostHistory extends Document {
  productId: mongoose.Types.ObjectId;
  postId: string;
  timestamp: Date;
  caption: string;
  imagesUsed: number;
}

const PostHistorySchema = new mongoose.Schema<IPostHistory>({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  postId: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  caption: { type: String, required: true },
  imagesUsed: { type: Number, required: true }
});

export default mongoose.models.PostHistory || 
  mongoose.model<IPostHistory>('PostHistory', PostHistorySchema);