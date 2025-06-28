import { Schema, model, models, Document } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const CategorySchema = new Schema<ICategory>({
  name: { 
    type: String, 
    required: true,
    unique: true,
    trim: true
  },
  slug: { 
    type: String, 
    required: true,
    unique: true,
    trim: true
  },
  description: { 
    type: String 
  },
  image: {
    type: String
  }
}, {
  timestamps: true
});

// Chỉ thêm index nếu thực sự cần
if (!CategorySchema.indexes().some(idx => Object.keys(idx[0]).includes('slug'))) {
  CategorySchema.index({ slug: 1 }, { unique: true });
}

export default models.Category || model<ICategory>('Category', CategorySchema);