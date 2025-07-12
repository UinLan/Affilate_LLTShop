'use server';

import { NextResponse } from 'next/server';
import Product from '@/lib/models/Product';
import connectDB from '@/lib/mongodb';
import { IProduct } from '@/types/product';
import { convertToClientProduct } from '@/lib/converters';
import Category from '@/lib/models/Category';
import PostHistory from '@/lib/models/PostHistory';
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

// Hàm gọi Ollama để tạo caption tiếng Việt
async function generateFullCaptionWithOllama(product: any): Promise<string> {
  const shopeeInfo = product.shopeeUrl ? `\n\n🔗 LINK MUA NGAY:\n${product.shopeeUrl}` : '';
  
  const prompt = `
Hãy viết một caption tiếng Việt hấp dẫn để đăng Facebook quảng bá sản phẩm với các thông tin sau:

- Tên sản phẩm: ${product.productName}
- Mô tả: ${product.description || 'Không có mô tả chi tiết'}
- Giá bán: ${product.price ? product.price.toLocaleString() + 'đ' : 'Liên hệ'} 
- Khuyến mãi: ${product.discount || 'Đang có ưu đãi hấp dẫn'}

YÊU CẦU:
1. Viết bằng tiếng Việt tự nhiên, thu hút
2. Thêm emoji phù hợp
3. Đặt hashtag ở CUỐI BÀI, sau link (nếu có)
4. Giọng văn kích thích mua hàng
5. LUÔN ĐẶT LINK SHOPEE TRƯỚC HASHTAG NẾU CÓ
6. Không đề cập đến "caption" trong nội dung trả về
7. Đảm bảo cấu trúc: [Nội dung chính] -> [Link] -> [Hashtag]

Cấu trúc mong muốn:
[Nội dung chính]

[Link (nếu có)]

[Hashtag]

Chỉ trả về nội dung hoàn chỉnh, không giải thích thêm.
${shopeeInfo}
`.trim();

  try {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3',
        prompt,
        stream: false
      })
    });

    const data = await response.json();
    return data.response?.trim() || 
      `🔥 ${product.productName} - Sản phẩm chất lượng cao!\n\n💯 Giá chỉ ${product.price ? product.price.toLocaleString() + 'đ' : 'liên hệ'}\n\n✨ ${product.description || 'Đang được ưa chuộng nhất hiện nay'}\n\n🔗 ${product.shopeeUrl || ''}\n\n#khuyenmai #hotdeal #sanphamchatluong`;
  } catch (error) {
    console.error('Lỗi khi tạo caption:', getErrorMessage(error));
    return `🎯 ${product.productName}\n\n🔹 ${product.description || 'Sản phẩm chất lượng cao'}\n\n💰 Giá: ${product.price ? product.price.toLocaleString() + 'đ' : 'Liên hệ'}\n\n🛒 ${product.shopeeUrl || ''}\n\n#sanphammoi #uudai`;
  }
}

// Tải ảnh lên Facebook
async function uploadImageToFacebook(imageUrl: string): Promise<{ id: string }> {
  try {
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const imageBuffer = Buffer.from(response.data, 'binary');
    const blob = new Blob([imageBuffer], { type: response.headers['content-type'] || 'image/jpeg' });

    const formData = new FormData();
    formData.append('access_token', FACEBOOK_ACCESS_TOKEN!);
    formData.append('source', blob, 'image.jpg');
    formData.append('published', 'false');

    const uploadResponse = await axios.post(
      `https://graph.facebook.com/${FB_API_VERSION}/${FACEBOOK_PAGE_ID}/photos`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );

    return uploadResponse.data;
  } catch (error) {
    console.error(`Lỗi khi tải ảnh lên Facebook: ${imageUrl}`, getErrorMessage(error));
    throw error;
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

// Đăng bài lên Facebook
async function postToFacebook(
  caption: string, 
  imageIds: string[], 
  videoUrl?: string
): Promise<{ id: string; video_uploaded: boolean }> {
  try {
    let attachedMedia = imageIds.map(id => ({ media_fbid: id }));
    
    if (videoUrl && videoUrl.trim() !== '') {
      try {
        // Bước 1: Kiểm tra video URL
        const videoInfo = await validateVideoUrl(videoUrl);
        
        // Bước 2: Tạo video container
        const initResponse = await axios.post(
          `https://graph.facebook.com/${FB_API_VERSION}/${FACEBOOK_PAGE_ID}/videos`,
          {
            access_token: FACEBOOK_ACCESS_TOKEN,
            upload_phase: 'start',
            file_size: videoInfo.size,
            file_url: videoUrl,
            published: false,
            description: caption
          },
          { timeout: 10000 }
        );

        if (!initResponse.data.video_id) {
          throw new Error('Không thể khởi tạo upload video');
        }

        const videoId = initResponse.data.video_id;

        // Bước 3: Transfer video từ URL
        await axios.post(
          `https://graph.facebook.com/${FB_API_VERSION}/${videoId}`,
          {
            access_token: FACEBOOK_ACCESS_TOKEN,
            upload_phase: 'transfer',
            start_offset: 0,
            end_offset: videoInfo.size,
            file_url: videoUrl
          },
          { timeout: 30000 }
        );

        // Bước 4: Hoàn tất upload
        await axios.post(
          `https://graph.facebook.com/${FB_API_VERSION}/${videoId}`,
          {
            access_token: FACEBOOK_ACCESS_TOKEN,
            upload_phase: 'finish',
            description: caption,
            published: true
          },
          { timeout: 10000 }
        );

        attachedMedia.push({ media_fbid: videoId });
        
        console.log(`Đã upload video thành công: ${videoId}`);
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        console.error('Lỗi khi đăng video:', errorMessage);
        await logError(`Lỗi video: ${errorMessage}`);
      }
    }

    // Đăng bài với media đã chuẩn bị
    const postResponse = await axios.post(
      `https://graph.facebook.com/${FB_API_VERSION}/${FACEBOOK_PAGE_ID}/feed`,
      {
        access_token: FACEBOOK_ACCESS_TOKEN,
        message: caption,
        attached_media: attachedMedia,
        published: true
      },
      { timeout: 15000 }
    );
    
    return {
      ...postResponse.data,
      video_uploaded: !!videoUrl
    };
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    console.error('Lỗi khi đăng bài lên Facebook:', errorMessage);
    throw new Error(`Lỗi đăng bài: ${errorMessage}`);
  }
}

// API GET - Lấy danh sách sản phẩm
export async function GET(request: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const populate = searchParams.get('populate');
    const categorySlug = searchParams.get('category');
    const searchTerm = searchParams.get('search')?.trim();

    let mongoQuery: any = {};

    if (categorySlug) {
      const category = await Category.findOne({ slug: categorySlug });
      if (category) mongoQuery.categories = category._id;
      else return NextResponse.json({ success: true, data: [] }, { status: 200 });
    }

    if (searchTerm) {
      mongoQuery.$or = [
        { productName: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } }
      ];
    }

    let query = Product.find(mongoQuery).sort({ createdAt: -1 });
    if (populate === 'categories') {
      query = query.populate({ path: 'categories', select: '_id name slug' });
    }

    const products = await query.exec();
    const clientProducts = products.map(convertToClientProduct);

    return NextResponse.json({ success: true, data: clientProducts }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Lỗi khi lấy danh sách sản phẩm' }, 
      { status: 500 }
    );
  }
}

// API POST - Tạo sản phẩm mới và đăng lên Facebook
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

    const product = new Product({
      ...productData,
      postingTemplates: productData.postingTemplates || []
    });

    await product.save();

    // Tạo caption với cấu trúc mới
    let caption = await generateFullCaptionWithOllama(product);

    // Đảm bảo cấu trúc đúng nếu AI không tuân thủ
    if (product.shopeeUrl && !caption.includes(product.shopeeUrl)) {
      caption = `${caption}\n\n🔗 ${product.shopeeUrl}\n\n#khuyenmai #hotdeal`;
    }

    // Chuẩn hóa lại các dòng trống
    caption = caption.replace(/\n{3,}/g, '\n\n');

    // Chọn ngẫu nhiên 4 ảnh từ danh sách
    const selectedImages = (product.images || [])
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.min(product.images.length, 4));

    // Tải ảnh lên Facebook
    const uploadedImages = [];
    for (const imageUrl of selectedImages) {
      try {
        const uploadResult = await uploadImageToFacebook(imageUrl);
        uploadedImages.push(uploadResult);
      } catch (error) {
        console.error(`Lỗi khi tải ảnh lên ${imageUrl}:`, getErrorMessage(error));
      }
    }

    if (uploadedImages.length === 0) {
      throw new Error('Không thể tải lên bất kỳ hình ảnh nào');
    }

    // Đăng bài lên Facebook (cả ảnh và video nếu có)
    const postResult = await postToFacebook(
      caption,
      uploadedImages.map(img => img.id),
      product.videoUrl
    );

    // Lưu lịch sử đăng bài
    const postHistory = new PostHistory({
      productId: product._id,
      postId: postResult.id,
      caption,
      imagesUsed: uploadedImages.length,
      videoUsed: !!product.videoUrl,
      timestamp: new Date()
    });
    await postHistory.save();

    // Cập nhật sản phẩm
    product.lastPosted = new Date();
    await product.save();

    return NextResponse.json({ 
      success: true, 
      data: {
        product: convertToClientProduct(product),
        postId: postResult.id,
        caption,
        imagesUploaded: uploadedImages.length,
        videoUploaded: !!product.videoUrl
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