// lib/services/facebookPoster.ts
import { IProduct } from '@/types/product';

export const triggerPythonService = async (productId: string): Promise<void> => {
  try {
    // Gọi API endpoint của Python service
    const response = await fetch('http://localhost:5000/process-product', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ productId }),
    });

    if (!response.ok) {
      throw new Error('Python service error');
    }

    console.log('Python service triggered successfully');
  } catch (error) {
    console.error('Error triggering Python service:', error);
    throw error;
  }
};

export const generatePostVariations = async (product: IProduct): Promise<string[]> => {
  // Có thể tích hợp với AI service để sinh nội dung
  return [
    `🔥 ${product.productName} chỉ với ${product.price}!\n\n${product.description}`,
    `Bạn đang tìm ${product.productName}?\n\n💯 Chất lượng tốt\n💰 Giá chỉ ${product.price}\n\n${product.description}`
  ];
};