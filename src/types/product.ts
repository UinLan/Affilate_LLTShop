import { Types, Document } from 'mongoose';

export interface IPostingTemplate {
  name: string;
  content: string;
  imageLayout: 'single' | 'carousel' | 'collage';
}

export interface IPostHistory {
  templateUsed: Types.ObjectId;
  postId?: string;
  postTime: Date;
  performance?: {
    likes?: number;
    shares?: number;
    comments?: number;
  };
}

export interface ICategory {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
}

export interface IProduct extends Document {
  _id: Types.ObjectId;
  tiktokUrl: string;
  productName: string;
  description?: string;
  price?: number;
  images: string[];
  postingTemplates?: IPostingTemplate[];
  postedHistory?: IPostHistory[];
  categories?: Types.ObjectId[] | ICategory[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ICategoryClient {
  _id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface IProductClient {
  _id: string;
  tiktokUrl: string;
  productName: string;
  description?: string;
  price?: number;
  images: string[];
  postingTemplates?: IPostingTemplate[];
  postedHistory?: Array<{
    templateUsed: string;
    postId?: string;
    postTime: string;
    performance?: {
      likes?: number;
      shares?: number;
      comments?: number;
    };
  }>;
  categories?: ICategoryClient[];
  createdAt: string;
  updatedAt: string;
}

export function isICategory(obj: any): obj is ICategory {
  return obj && typeof obj === 'object' && '_id' in obj && 'name' in obj;
}