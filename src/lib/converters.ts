import { Document, Types } from 'mongoose';
import { 
  IProduct, 
  IProductClient,
  ICategory,
  ICategoryClient
} from '@/types/product';

export function convertToClientCategory(category: ICategory): ICategoryClient {
  return {
    _id: category._id.toString(),
    name: category.name,
    slug: category.slug,
    description: category.description,
    image: category.image,
    createdAt: category.createdAt?.toISOString(),
    updatedAt: category.updatedAt?.toISOString()
  };
}

export function convertToClientProduct(product: IProduct & Document): IProductClient {
  const processCategories = (categories?: (Types.ObjectId | ICategory)[]): ICategoryClient[] | undefined => {
    if (!categories) return undefined;
    
    return categories.map(cat => {
      if (isICategory(cat)) {
        return convertToClientCategory(cat);
      }
      return {
        _id: cat.toString(),
        name: '',
        slug: '',
        description: undefined
      };
    });
  };

  return {
    _id: product._id.toString(),
    tiktokUrl: product.tiktokUrl,
    productName: product.productName,
    description: product.description,
    price: product.price,
    images: product.images,
    postingTemplates: product.postingTemplates,
    postedHistory: product.postedHistory?.map(history => ({
      templateUsed: history.templateUsed.toString(),
      postId: history.postId,
      postTime: history.postTime.toISOString(),
      performance: history.performance
    })),
    categories: processCategories(product.categories),
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt?.toISOString() || product.createdAt.toISOString()
  };
}

function isICategory(obj: any): obj is ICategory {
  return obj && typeof obj === 'object' && '_id' in obj && obj._id instanceof Types.ObjectId;
}