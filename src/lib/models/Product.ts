import { Schema, model, models } from 'mongoose';
import { IProduct, IPostingTemplate, IPostHistory } from '@/types/product';

const PostingTemplateSchema = new Schema<IPostingTemplate>({
    name: {
    type: String,
    required: true,
    trim: true
  },
  content: { type: String, required: true },
  imageLayout: { type: String, enum: ['single', 'carousel', 'collage'], required: true }
});

const PostHistorySchema = new Schema<IPostHistory>({
  templateUsed: { type: Schema.Types.ObjectId, ref: 'PostingTemplate' },
  postId: String,
  postTime: { type: Date, default: Date.now },
  performance: {
    likes: Number,
    shares: Number,
    comments: Number
  }
});

const ProductSchema = new Schema<IProduct>({
  tiktokUrl: { type: String, required: true },
  productName: { type: String, required: true },
  description: String,
  price: Number,
  images: { type: [String], required: true },
  postingTemplates: { type: [PostingTemplateSchema], default: [] },
  postedHistory: { type: [PostHistorySchema], default: [] },
  categories: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'Category' 
  }],
}, { 
  timestamps: { 
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  } 
});

export default models.Product || model<IProduct>('Product', ProductSchema);