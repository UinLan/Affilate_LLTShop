import { Types } from 'mongoose';

export interface IPostingTemplate {
  name: string;
  content: string;
  imageLayout: 'single' | 'carousel' | 'collage';
}

export interface IPostHistory {
  templateUsed: Types.ObjectId; // Thay đổi từ string sang Types.ObjectId
  postId?: string;
  postTime: Date;
  performance?: {
    likes?: number;
    shares?: number;
    comments?: number;
  };
}

export interface IProduct {
  _id?: Types.ObjectId; // Cập nhật kiểu _id
  tiktokUrl: string;
  productName: string;
  description: string;
  price: number;
  images: string[];
  postingTemplates: IPostingTemplate[];
  postedHistory: IPostHistory[];
  createdAt?: Date;
}