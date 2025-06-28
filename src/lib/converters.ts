import { Document, Types } from 'mongoose';
import { 
  IProduct, 
  IProductClient, 
  ICategoryClient,
  ICategory,
  isICategory 
} from '@/types/product';

export function convertToClientProduct(product: IProduct & Document): IProductClient {
  // Xử lý categories với type safety
  const processCategories = (
    categories?: (Types.ObjectId | ICategory)[]
  ): ICategoryClient[] | undefined => {
    if (!categories) return undefined;

    return categories.map(cat => {
      if (isICategory(cat)) {
        return {
          _id: cat._id.toString(),
          name: cat.name,
          slug: cat.slug,
          description: cat.description
        };
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