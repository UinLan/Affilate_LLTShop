import { Document, Types } from 'mongoose';
import { 
  IProduct, 
  IProductClient,
  ICategory,
  ICategoryClient,
  IPostingTemplate,
  IPostHistory
} from '@/types/product';

// Helper function to check if object is ICategory
function isICategory(obj: any): obj is ICategory {
  return obj && 
         typeof obj === 'object' && 
         '_id' in obj && 
         (obj._id instanceof Types.ObjectId || typeof obj._id === 'string');
}

// Helper function to check if object is ObjectId
function isObjectId(obj: any): obj is Types.ObjectId {
  return obj instanceof Types.ObjectId;
}

export function convertToClientCategory(category: ICategory | null): ICategoryClient | null {
  if (!category) return null;
  
  return {
    _id: category._id.toString(),
    name: category.name,
    slug: category.slug,
    description: category.description || undefined,
    image: category.image || undefined,
    createdAt: category.createdAt?.toISOString(),
    updatedAt: category.updatedAt?.toISOString()
  };
}

export function convertToClientProduct(product: IProduct & Document): IProductClient {
  // Process categories that could be ObjectId[], ICategory[], or undefined
  const processCategories = (
    categories?: (Types.ObjectId | ICategory | string)[]
  ): ICategoryClient[] | undefined => {
    if (!categories || categories.length === 0) return undefined;

    // Handle case where categories are strings (already converted)
    if (typeof categories[0] === 'string') {
      return (categories as string[]).map(id => ({
        _id: id,
        name: '',
        slug: '',
        description: undefined,
        image: undefined
      }));
    }

    // Handle case where categories are ObjectId references
    if (isObjectId(categories[0])) {
      return (categories as Types.ObjectId[]).map(cat => ({
        _id: cat.toString(),
        name: '',
        slug: '',
        description: undefined,
        image: undefined
      }));
    }

    // Handle case where categories are populated ICategory documents
    if (isICategory(categories[0])) {
      return (categories as ICategory[]).map(cat => convertToClientCategory(cat)!);
    }

    return undefined;
  };

  // Process posting templates
  const processPostingTemplates = () => {
    if (!product.postingTemplates || product.postingTemplates.length === 0) {
      return undefined;
    }
    return product.postingTemplates.map(template => ({
      name: template.name,
      content: template.content,
      imageLayout: template.imageLayout
    }));
  };

  // Process post history
  const processPostHistory = () => {
    if (!product.postedHistory || product.postedHistory.length === 0) {
      return undefined;
    }
    return product.postedHistory.map(history => ({
      templateUsed: history.templateUsed?.toString(),
      postId: history.postId,
      postTime: history.postTime.toISOString(),
      performance: history.performance
        ? {
            likes: history.performance.likes || 0,
            shares: history.performance.shares || 0,
            comments: history.performance.comments || 0
          }
        : undefined
    }));
  };

  return {
    _id: product._id.toString(),
    shopeeUrl: product.shopeeUrl,
    productName: product.productName,
    description: product.description || undefined,
    price: product.price || undefined,
    images: product.images || [],
    featuredImage: product.featuredImage ?? undefined,
    videoUrl: product.videoUrl || undefined,
    postingTemplates: processPostingTemplates(),
    postedHistory: processPostHistory(),
    categories: processCategories(product.categories),
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt?.toISOString() || product.createdAt.toISOString()
  };
}

// Convert from client to server format (if needed)
export function convertToServerProduct(product: IProductClient): Partial<IProduct> {
  const convertCategories = (categories?: ICategoryClient[]): Types.ObjectId[] | undefined => {
    if (!categories) return undefined;
    return categories.map(c => new Types.ObjectId(c._id));
  };

  return {
    productName: product.productName,
    shopeeUrl: product.shopeeUrl,
    description: product.description,
    price: product.price,
    images: product.images,
    featuredImage: product.featuredImage,
    categories: convertCategories(product.categories),
    postingTemplates: product.postingTemplates || [],
    // postedHistory is typically not modified from client
  };
}