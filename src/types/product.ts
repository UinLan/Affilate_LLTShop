import { Types, Document } from 'mongoose';

export interface IProductForm {
  shopeeUrl: string;
  productName: string;
  images: string[];
  postingTemplates?: IPostingTemplate[];
}

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

export interface ICategory extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICategoryClient {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IProduct extends Document {
  _id: Types.ObjectId;
  shopeeUrl: string;
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

export interface IProductClient {
  _id: string;
  shopeeUrl: string;
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
  return obj && typeof obj === 'object' && '_id' in obj;
}