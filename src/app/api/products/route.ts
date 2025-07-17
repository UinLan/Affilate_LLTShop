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

// Hàm gọi Ollama để tạo caption tiếng Việt
async function generateFullCaptionWithOllama(product: any): Promise<string> {
  const shopeeInfo = product.shopeeUrl ? `\n\n🔗 LINK MUA NGAY:\n${product.shopeeUrl}` : '';
  
  const prompt = `
Hãy viết một bài quảng cáo tiếng Việt hấp dẫn để đăng Facebook với các thông tin sau:

THÔNG TIN SẢN PHẨM:

- Tên sản phẩm: ${product.productName}

YÊU CẦU:
1. Viết bằng tiếng Việt tự nhiên, thu hút, giọng văn kích thích mua hàng
2. Thêm emoji phù hợp ở các vị trí thích hợp
3. LUÔN đặt link Shopee (nếu có) ở cuối bài, trước phần hashtag
4. Hashtag đặt ở phần cuối cùng, sau link (nếu có)
5. Không đề cập đến "caption" hay "bài quảng cáo" trong nội dung
6. Tự nhiên, không lặp lại cấu trúc quá cứng nhắc

CẤU TRÚC MONG MUỐN:
[Nội dung chính giới thiệu sản phẩm]
[Link mua hàng]
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
      `${product.productName} - Sản phẩm chất lượng cao!\n\n💯 Giá chỉ ${product.price ? product.price.toLocaleString() + 'đ' : 'liên hệ'}\n\n✨ ${product.description || 'Đang được ưa chuộng nhất hiện nay'}\n\n🔗 ${product.shopeeUrl || ''}\n\n#khuyenmai #hotdeal #sanphamchatluong`;
  } catch (error) {
    console.error('Lỗi khi tạo caption:', getErrorMessage(error));
    return `${product.productName}\n\n🔹 ${product.description || 'Sản phẩm chất lượng cao'}\n\n💰 Giá: ${product.price ? product.price.toLocaleString() + 'đ' : 'Liên hệ'}\n\n🛒 ${product.shopeeUrl || ''}\n\n#sanphammoi #uudai`;
  }
}


async function uploadImageToFacebook(imageUrl: string): Promise<{ id: string }> {
  try {
    // Tải ảnh từ URL
    const response = await axios.get(imageUrl, { 
      responseType: 'arraybuffer',
      timeout: 10000 // Thêm timeout để tránh treo quá lâu
    });
    
    // Tạo stream từ buffer
    const imageBuffer = Buffer.from(response.data, 'binary');
    const imageStream = Readable.from(imageBuffer);
    
    // Tạo FormData
    const formData = new FormData();
    formData.append('access_token', FACEBOOK_ACCESS_TOKEN!);
    formData.append('published', 'false');
    
    // Thêm ảnh vào formData dưới dạng stream
    formData.append('source', imageStream, {
      filename: 'image.jpg',
      contentType: response.headers['content-type'] || 'image/jpeg',
      knownLength: imageBuffer.length // Thêm thông tin về kích thước file
    });

    // Gửi request với headers phù hợp
    const uploadResponse = await axios.post(
      `https://graph.facebook.com/${FB_API_VERSION}/${FACEBOOK_PAGE_ID}/photos`,
      formData,
      { 
        headers: {
          ...formData.getHeaders(),
          'Content-Length': formData.getLengthSync() // Thêm header Content-Length
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        timeout: 30000 // Tăng timeout cho upload
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
    // Bước 1: Tải video từ URL về dưới dạng stream
    const response = await axios.get(videoUrl, { responseType: 'stream' });
    const contentType = response.headers['content-type'] || 'video/mp4';

    const form = new FormData();
    form.append('access_token', FACEBOOK_ACCESS_TOKEN!);
    form.append('description', caption);
    form.append('file', response.data, {
      filename: 'video.mp4',
      contentType
    });

    // Bước 2: Upload video lên Facebook qua form-data
    const uploadResponse = await axios.post(
      `https://graph.facebook.com/${FB_API_VERSION}/${FACEBOOK_PAGE_ID}/videos`,
      form,
      {
        headers: form.getHeaders(),
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        timeout: 120000 // timeout tăng lên để tránh lỗi với video lớn
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

    // Lưu lịch sử đăng bài
    const postHistories = [];

    // Trường hợp 1: Chỉ có hình ảnh - đăng 1 bài post hình ảnh
    const imagePostResult = await postImagesToFacebook(
      caption,
      uploadedImages.map(img => img.id)
    );
    postHistories.push(new PostHistory({
      productId: product._id,
      postId: imagePostResult.id,
      caption,
      imagesUsed: uploadedImages.length,
      videoUsed: false,
      timestamp: new Date()
    }));

    // Trường hợp 2: Có cả video - đăng thêm 1 bài post video riêng
    if (product.videoUrl && product.videoUrl.trim() !== '') {
      try {
        const videoPostResult = await postVideoToFacebook(caption, product.videoUrl);
        postHistories.push(new PostHistory({
          productId: product._id,
          postId: videoPostResult.id,
          caption,
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
          isVideo: post.videoUsed
        })),
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