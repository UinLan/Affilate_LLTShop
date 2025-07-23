'use server';

import { NextResponse } from 'next/server';
import Product from '@/lib/models/Product';
import connectDB from '@/lib/mongodb';
import { IProduct } from '@/types/product';
import { convertToClientProduct } from '@/lib/converters';
import Category from '@/lib/models/Category';
import PostHistory from '@/lib/models/PostHistory';
import FormData from 'form-data';
import { Readable } from 'stream';
import axios from 'axios';

// Kết nối cơ sở dữ liệu
await connectDB();

// Cấu hình Facebook
const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
const FACEBOOK_PAGE_ID = process.env.FACEBOOK_PAGE_ID;
const FB_API_VERSION = 'v18.0';

// Interface cho lỗi có message
interface ErrorWithMessage {
  message: string;
}

// Kiểm tra nếu error có message
function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return typeof error === 'object' && error !== null && 'message' in error;
}

// Lấy message từ error
function getErrorMessage(error: unknown): string {
  if (isErrorWithMessage(error)) return error.message;
  return 'Unknown error';
}

// Hàm ghi log lỗi
async function logError(message: string): Promise<void> {
  console.error('Error Notification:', message);
  // Có thể thêm logic gửi email/notification ở đây
}

async function uploadImageToFacebook(imageUrl: string): Promise<{ id: string }> {
  try {
    // Tải ảnh từ URL
    const response = await axios.get(imageUrl, { 
      responseType: 'arraybuffer',
      timeout: 10000
    });
    
    // Tạo stream từ buffer
    const imageBuffer = Buffer.from(response.data, 'binary');
    const imageStream = Readable.from(imageBuffer);
    
    // Tạo FormData
    const formData = new FormData();
    formData.append('access_token', FACEBOOK_ACCESS_TOKEN!);
    formData.append('published', 'false');
    formData.append('source', imageStream, {
      filename: 'image.jpg',
      contentType: response.headers['content-type'] || 'image/jpeg',
      knownLength: imageBuffer.length
    });

    // Gửi request
    const uploadResponse = await axios.post(
      `https://graph.facebook.com/${FB_API_VERSION}/${FACEBOOK_PAGE_ID}/photos`,
      formData,
      { 
        headers: {
          ...formData.getHeaders(),
          'Content-Length': formData.getLengthSync()
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        timeout: 30000
      }
    );

    return uploadResponse.data;
  } catch (error) {
    console.error(`Lỗi khi tải ảnh lên Facebook: ${imageUrl}`, getErrorMessage(error));
    throw new Error(`Không thể tải ảnh lên: ${getErrorMessage(error)}`);
  }
}

// Hàm kiểm tra video URL
async function validateVideoUrl(url: string): Promise<{ valid: boolean; size: number; type: string }> {
  try {
    const response = await axios.head(url, { timeout: 5000 });
    
    if (!response.headers['content-type']?.includes('video/')) {
      throw new Error('URL không trỏ đến file video hợp lệ');
    }
    
    return {
      valid: true,
      size: parseInt(response.headers['content-length'] || '0'),
      type: response.headers['content-type']
    };
  } catch (error) {
    console.error('Lỗi kiểm tra video URL:', getErrorMessage(error));
    throw new Error(`Không thể xác minh video URL: ${getErrorMessage(error)}`);
  }
}

// Đăng bài chỉ hình ảnh lên Facebook
async function postImagesToFacebook(caption: string, imageIds: string[]): Promise<{ id: string }> {
  try {
    const postResponse = await axios.post(
      `https://graph.facebook.com/${FB_API_VERSION}/${FACEBOOK_PAGE_ID}/feed`,
      {
        access_token: FACEBOOK_ACCESS_TOKEN,
        message: caption,
        attached_media: imageIds.map(id => ({ media_fbid: id })),
        published: true
      },
      { timeout: 15000 }
    );
    
    return postResponse.data;
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    console.error('Lỗi khi đăng bài hình ảnh lên Facebook:', errorMessage);
    throw new Error(`Lỗi đăng bài hình ảnh: ${errorMessage}`);
  }
}

// Đăng bài chỉ video lên Facebook
async function postVideoToFacebook(caption: string, videoUrl: string): Promise<{ id: string }> {
  try {
    const response = await axios.get(videoUrl, { responseType: 'stream' });
    const contentType = response.headers['content-type'] || 'video/mp4';

    const form = new FormData();
    form.append('access_token', FACEBOOK_ACCESS_TOKEN!);
    form.append('description', caption);
    form.append('file', response.data, {
      filename: 'video.mp4',
      contentType
    });

    const uploadResponse = await axios.post(
      `https://graph.facebook.com/${FB_API_VERSION}/${FACEBOOK_PAGE_ID}/videos`,
      form,
      {
        headers: form.getHeaders(),
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        timeout: 120000
      }
    );

    if (!uploadResponse.data.id) {
      throw new Error('Facebook không trả về video ID');
    }

    return { id: uploadResponse.data.id };
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    console.error('Lỗi khi đăng video lên Facebook:', errorMessage);
    throw new Error(`Lỗi đăng video: ${errorMessage}`);
  }
}

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const populate = searchParams.get('populate');
    const categorySlug = searchParams.get('category');
    const searchTerm = searchParams.get('search')?.trim();
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '8');

    let mongoQuery: any = {};

    if (categorySlug) {
      const category = await Category.findOne({ slug: categorySlug });
      if (category) mongoQuery.categories = category._id;
      else return NextResponse.json({ success: true, data: [], total: 0 }, { status: 200 });
    }

    if (searchTerm) {
      mongoQuery.$or = [
        { productName: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } }
      ];
    }

    // Tạo query cơ bản
    let query = Product.find(mongoQuery)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    // Thêm populate nếu được yêu cầu
    if (populate === 'categories') {
      query = query.populate({ path: 'categories', select: '_id name slug' });
    }

    // Thực hiện song song cả query và count
    const [products, total] = await Promise.all([
      query.exec(),
      Product.countDocuments(mongoQuery)
    ]);

    const clientProducts = products.map(convertToClientProduct);

    return NextResponse.json({ 
      success: true, 
      data: clientProducts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Lỗi khi lấy danh sách sản phẩm' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const productData: Omit<IProduct, 'postedHistory' | 'createdAt'> = await request.json();

    // Validate dữ liệu
    if (!productData.productName || !productData.images || productData.images.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Tên sản phẩm và ít nhất 1 hình ảnh là bắt buộc' },
        { status: 400 }
      );
    }

    // Kiểm tra có postingTemplates không
    if (!productData.postingTemplates || productData.postingTemplates.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng cung cấp tiêu đề bài đăng' },
        { status: 400 }
      );
    }

    // Tạo sản phẩm mới
    const product = new Product({
      ...productData,
      images: productData.images.filter(img => img.trim() !== ''),
      postingTemplates: productData.postingTemplates
    });
    await product.save();

    // Lấy caption từ postingTemplates
    const imageCaption = product.postingTemplates[0]?.content || '';
    let videoCaption = product.postingTemplates[1]?.content || '';

    // Chọn ngẫu nhiên 4 ảnh từ danh sách
    // const selectedImages = product.images
    //   .sort(() => 0.5 - Math.random())
    //   .slice(0, Math.min(product.images.length, 4));
    // Thay vì chọn ngẫu nhiên, sử dụng featuredImage hoặc ảnh đầu tiên
const selectedImages = product.featuredImage 
  ? [product.featuredImage, ...product.images.filter((img: string) => img !== product.featuredImage).slice(0, 3)]
  : product.images.slice(0, 4);

    // Tải ảnh lên Facebook
    const uploadedImages = [];
    for (const imageUrl of selectedImages) {
      try {
        const uploadResult = await uploadImageToFacebook(imageUrl);
        uploadedImages.push(uploadResult);
      } catch (error) {
        console.error(`Lỗi khi tải ảnh lên ${imageUrl}:`, getErrorMessage(error));
        await logError(`Lỗi tải ảnh ${imageUrl}: ${getErrorMessage(error)}`);
      }
    }

    if (uploadedImages.length === 0) {
      throw new Error('Không thể tải lên bất kỳ hình ảnh nào');
    }

    // Lưu lịch sử đăng bài
    const postHistories = [];

    // Đăng bài hình ảnh
    const imagePostResult = await postImagesToFacebook(
      imageCaption,
      uploadedImages.map(img => img.id)
    );
    postHistories.push(new PostHistory({
      productId: product._id,
      postId: imagePostResult.id,
      caption: imageCaption,
      imagesUsed: uploadedImages.length,
      videoUsed: false,
      timestamp: new Date()
    }));

    // Nếu có video và có caption video, đăng video
    if (product.videoUrl && product.videoUrl.trim() !== '' && videoCaption) {
      try {
        const videoPostResult = await postVideoToFacebook(videoCaption, product.videoUrl);
        postHistories.push(new PostHistory({
          productId: product._id,
          postId: videoPostResult.id,
          caption: videoCaption,
          imagesUsed: 0,
          videoUsed: true,
          timestamp: new Date()
        }));
      } catch (error) {
        console.error('Lỗi khi đăng video:', getErrorMessage(error));
        await logError(`Lỗi video: ${getErrorMessage(error)}`);
      }
    }

    // Lưu tất cả lịch sử đăng bài
    await PostHistory.insertMany(postHistories);

    // Cập nhật sản phẩm
    product.lastPosted = new Date();
    await product.save();

    return NextResponse.json({ 
      success: true, 
      data: {
        product: convertToClientProduct(product),
        posts: postHistories.map(post => ({
          postId: post.postId,
          isVideo: post.videoUsed,
          caption: post.caption
        })),
        imageCaption,
        videoCaption: product.videoUrl && videoCaption ? videoCaption : undefined,
        imagesUploaded: uploadedImages.length,
        videoUploaded: !!product.videoUrl && !!videoCaption
      },
      message: 'Đăng sản phẩm lên Facebook thành công'
    }, { status: 201 });
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    console.error('Lỗi khi tạo sản phẩm:', errorMessage);
    return NextResponse.json({ 
      success: false, 
      error: errorMessage || 'Đã xảy ra lỗi khi tạo sản phẩm',
      stack: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined
    }, { status: 500 });
  }
}