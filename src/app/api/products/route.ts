import { NextResponse } from 'next/server';
import Product from '@/lib/models/Product';
import connectDB from '@/lib/mongodb';
import { IProduct } from '@/types/product';
import { convertToClientProduct } from '@/lib/converters';
import Category from '@/lib/models/Category';
import PostHistory from '@/lib/models/PostHistory';
import axios from 'axios';

// Kết nối database
await connectDB();

// Cấu hình Facebook từ biến môi trường
const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
const FACEBOOK_PAGE_ID = process.env.FACEBOOK_PAGE_ID;
const FB_API_VERSION = 'v18.0';

// Lớp tạo nội dung
class ContentGenerator {
  private templates = {
    introductions: [
      "Khám phá ngay {productName} - ",
      "{productName} - ",
       "Bạn đã biết đến {productName} chưa? ",
                "Giới thiệu {productName} - ",
                "Đừng bỏ lỡ {productName} - ",
                "{productName} đang chờ bạn khám phá! ",
                "Mới có {productName} - ",
                "Xuất hiện {productName} - ",
                "Trải nghiệm ngay {productName} - ",
                "Cơ hội sở hữu {productName} - ",
                "{productName} là lựa chọn hoàn hảo! ",
                "Đã đến lúc nâng cấp với {productName} - ",
                "{productName} mang đến trải nghiệm mới! ",
                "Bạn sẽ yêu thích {productName} - ",
                "{productName} chính là điều bạn cần! ",
                "Không thể bỏ qua {productName} - ",
                "{productName} làm mới cuộc sống của bạn! ",
                "Phát hiện {productName} - ",
                "{productName} đáng để thử nghiệm! ",
                "Bất ngờ với {productName} - ",
                "{productName} sẽ khiến bạn hài lòng! ",
                "Đón nhận {productName} - ",
                "{productName} thay đổi mọi thứ! ",
                "Trải nghiệm khác biệt với {productName} - ",
                "{productName} là giải pháp tuyệt vời! ",
                "Đã có {productName} - ",
                "Mở ra cùng {productName} - ",
                "{productName} tạo nên sự khác biệt! ",
                "Chào đón {productName} - ",
                "{productName} nâng tầm trải nghiệm! ",
                "Khám phá thế giới mới với {productName} - ",
                "{productName} đem lại cảm hứng mới! ",
                "Sẵn sàng cùng {productName} - ",
                "{productName} làm phong phú cuộc sống! ",
                "Bắt đầu hành trình với {productName} - ",
                "{productName} mở ra những khả năng mới! ",
                "Đột phá cùng {productName} - ",
                "{productName} thổi luồng gió mới! ",
                "Cảm nhận sự khác biệt từ {productName} - ",
                "{productName} là bước tiến mới! ",
                "Khơi nguồn cảm hứng với {productName} - ",
                "{productName} kiến tạo phong cách! ",
                "Đồng hành cùng {productName} - ",
                "{productName} tạo dấu ấn riêng! ",
                "Khẳng định cá tính với {productName} - ",
                "{productName} là sự lựa chọn thông minh! ",
                "Đổi mới mỗi ngày với {productName} - ",
                "{productName} đem đến những giá trị mới! ",
                "Khơi dậy tiềm năng với {productName} - ",
                "{productName} là người bạn đồng hành! ",
                "Sáng tạo không giới hạn với {productName} - ",
                "{productName} truyền cảm hứng! ",
                "Thay đổi tích cực với {productName} - ",
                "{productName} kiến tạo không gian sống! ",
                "Nâng tầm chất lượng với {productName} - ",
                "{productName} đáp ứng mọi nhu cầu! ",
                "Hoàn thiện bản thân với {productName} - ",
                "{productName} là giải pháp hoàn hảo! ",
                "Tận hưởng cuộc sống với {productName} - ",
                "{productName} mang lại niềm vui mỗi ngày! ",
                "Khơi nguồn sáng tạo với {productName} - ",
                "{productName} là điểm nhấn hoàn hảo! ",
                "Đón đầu xu hướng với {productName} - ",
                "{productName} làm nên sự khác biệt! ",
                "Khám phá tiềm năng với {productName} - ",
                "{productName} là bí quyết thành công! ",
                "Tạo dấu ấn cá nhân với {productName} - ",
                "{productName} nâng cao chất lượng sống! ",
                "Đồng hành cùng chất lượng với {productName} - ",
                "{productName} là sự đầu tư xứng đáng! ",
                "Trải nghiệm đẳng cấp với {productName} - ",
                "{productName} kiến tạo phong cách sống! ",
                "Khẳng định đẳng cấp với {productName} - ",
                "{productName} là lựa chọn không thể bỏ qua! ",
                "Mang đến cảm hứng bất tận với {productName} - ",
                "{productName} là người bạn không thể thiếu! ",
                "Đột phá mỗi ngày với {productName} - ",
                "{productName} thay đổi cách bạn sống! ",
                "Khơi dậy đam mê với {productName} - ",
                "{productName} là nguồn cảm hứng vô tận! ",
                "Tận hưởng những khoảnh khắc với {productName} - ",
                "{productName} là giải pháp thông minh! ",
                "Khám phá những điều mới mẻ với {productName} - ",
                "{productName} mang đến trải nghiệm tuyệt vời! ",
                "Đồng hành cùng sự tiện lợi với {productName} - ",
                "{productName} là sự lựa chọn hoàn hảo! ",
                "Nâng tầm không gian sống với {productName} - ",
                "{productName} đem lại sự hài lòng tuyệt đối! ",
                "Khẳng định phong cách với {productName} - ",
                "{productName} là bí quyết của sự thành công! ",
                "Tạo điểm nhấn ấn tượng với {productName} - ",
                "{productName} làm nên sự khác biệt! ",
                "Đón đầu công nghệ với {productName} - ",
                "{productName} là xu hướng của tương lai! ",
                "Khám phá tiện ích vượt trội với {productName} - ",
                "{productName} đáp ứng mọi tiêu chuẩn! ",
                "Trải nghiệm sự hoàn hảo với {productName} - ",
                "{productName} là sự kết hợp hoàn hảo! ",
                "Khơi nguồn cảm hứng sáng tạo với {productName} - ",
                "{productName} là giải pháp tối ưu! ",
                "Đồng hành cùng sự tiện nghi với {productName} - ",
                "{productName} mang lại giá trị bền vững! ",
                "Khẳng định đẳng cấp cùng {productName} - ",
                "{productName} là sự lựa chọn thông thái! ",
                "Tận hưởng cuộc sống trọn vẹn với {productName} - ",
                "{productName} đem đến những trải nghiệm mới lạ! ",
                "Khám phá thế giới đa sắc màu với {productName} - ",
                "{productName} là người bạn đồng hành đáng tin cậy! ",
                "Đột phá giới hạn với {productName} - ",
                "{productName} kiến tạo không gian sống động! ",
                "Nâng tầm phong cách với {productName} - ",
                "{productName} là sự kết hợp hoàn mỹ! ",
                "Khơi dậy tiềm năng sáng tạo với {productName} - ",
                "{productName} mang đến luồng gió mới! "
    ],
    descriptions: [
      "sản phẩm chất lượng cao với thiết kế tinh tế.",
      "lựa chọn hoàn hảo cho nhu cầu hàng ngày của bạn.",
      "giải pháp thông minh cho cuộc sống hiện đại.",
                "sản phẩm đáng tin cậy với hiệu suất vượt trội.",
                "trải nghiệm mới mẻ đang chờ bạn khám phá.",
                "sự kết hợp hoàn hảo giữa tiện ích và thẩm mỹ.",
                "sản phẩm không thể thiếu trong đời sống hằng ngày.",
                "lựa chọn lý tưởng cho phong cách sống của bạn.",
                "điểm nhấn hoàn hảo cho không gian sống.",
                "sản phẩm mang đến sự hài lòng tuyệt đối.",
                "giải pháp tối ưu cho mọi nhu cầu sử dụng.",
                "sản phẩm được thiết kế để phục vụ bạn tốt nhất.",
                "trải nghiệm khác biệt chỉ có ở sản phẩm này.",
                "sự lựa chọn thông minh cho người tiêu dùng.",
                "sản phẩm đáp ứng mọi tiêu chuẩn chất lượng.",
                "phong cách mới cho cuộc sống hiện đại.",
                "sản phẩm đem lại cảm giác thoải mái khi sử dụng.",
                "giải pháp hoàn hảo cho những yêu cầu khắt khe.",
                "sản phẩm được yêu thích bởi nhiều khách hàng.",
                "lựa chọn hàng đầu cho những ai đam mê chất lượng.",
                "sản phẩm tạo nên sự khác biệt rõ rệt.",
                "trải nghiệm đẳng cấp dành cho người dùng.",
                "sự kết hợp hoàn hảo giữa công năng và thẩm mỹ.",
                "sản phẩm mang đến giá trị bền vững theo thời gian.",
                "giải pháp thông minh cho cuộc sống tiện nghi.",
                "sản phẩm được thiết kế với sự chăm chút tỉ mỉ.",
                "lựa chọn không thể bỏ qua cho người sành điệu.",
                "sản phẩm đem lại niềm vui trong mỗi lần sử dụng.",
                "trải nghiệm tuyệt vời chỉ có ở sản phẩm này.",
                "sự lựa chọn hoàn hảo cho mọi lứa tuổi.",
                "sản phẩm tạo nên phong cách riêng biệt.",
                "giải pháp tối ưu cho nhu cầu đa dạng.",
                "sản phẩm được ưa chuộng nhờ chất lượng vượt trội.",
                "lựa chọn lý tưởng cho những ai đề cao tiện ích.",
                "sản phẩm mang đến sự tiện lợi không ngờ.",
                "trải nghiệm mới lạ đang chờ bạn khám phá.",
                "sự kết hợp hoàn mỹ giữa hình thức và nội dung.",
                "sản phẩm đáp ứng mọi mong đợi của khách hàng.",
                "giải pháp hoàn hảo cho cuộc sống năng động.",
                "sản phẩm được thiết kế để phục vụ lâu dài.",
                "lựa chọn hàng đầu cho những ai yêu thích sự hoàn hảo.",
                "sản phẩm tạo nên dấu ấn khó phai.",
                "trải nghiệm khác biệt so với những gì bạn biết.",
                "sự lựa chọn thông minh cho người tiêu dùng hiện đại.",
                "sản phẩm đem lại giá trị vượt trội so với giá thành.",
                "giải pháp tối ưu cho mọi không gian sống.",
                "sản phẩm được chế tác với sự tỉ mỉ cao nhất.",
                "lựa chọn không thể thiếu cho cuộc sống tiện nghi.",
                "sản phẩm mang đến cảm giác hài lòng ngay từ cái nhìn đầu tiên.",
                "trải nghiệm đáng nhớ chỉ có ở sản phẩm này.",
                "sự kết hợp tinh tế giữa truyền thống và hiện đại.",
                "sản phẩm đáp ứng mọi tiêu chuẩn khắt khe nhất.",
                "giải pháp hoàn hảo cho nhu cầu đa dạng.",
                "sản phẩm được ưa chuộng nhờ tính năng vượt trội.",
                "lựa chọn lý tưởng cho những ai đề cao chất lượng.",
                "sản phẩm mang đến sự tiện lợi vượt mong đợi.",
                "trải nghiệm mới mẻ đang chờ bạn khám phá.",
                "sự lựa chọn hoàn hảo cho mọi lứa tuổi.",
                "sản phẩm tạo nên phong cách riêng biệt.",
                "giải pháp tối ưu cho nhu cầu đa dạng.",
                "sản phẩm được ưa chuộng nhờ chất lượng vượt trội.",
                "lựa chọn hàng đầu cho những ai yêu thích sự hoàn hảo.",
                "sản phẩm tạo nên dấu ấn khó phai.",
                "trải nghiệm khác biệt so với những gì bạn biết.",
                "sự lựa chọn thông minh cho người tiêu dùng hiện đại.",
                "sản phẩm đem lại giá trị vượt trội so với giá thành.",
                "giải pháp tối ưu cho mọi không gian sống.",
                "sản phẩm được chế tác với sự tỉ mỉ cao nhất.",
                "lựa chọn không thể thiếu cho cuộc sống tiện nghi.",
                "sản phẩm mang đến cảm giác hài lòng ngay từ cái nhìn đầu tiên.",
                "trải nghiệm đáng nhớ chỉ có ở sản phẩm này.",
                "sự kết hợp tinh tế giữa truyền thống và hiện đại.",
                "sản phẩm đáp ứng mọi tiêu chuẩn khắt khe nhất.",
                "giải pháp hoàn hảo cho nhu cầu đa dạng.",
                "sản phẩm được ưa chuộng nhờ tính năng vượt trội.",
                "lựa chọn lý tưởng cho những ai đề cao chất lượng.",
                "sản phẩm mang đến sự tiện lợi vượt mong đợi."
    ],
    calls_to_action: [
      "Hãy khám phá ngay hôm nay!",
      "Đừng bỏ lỡ cơ hội sở hữu!",
      "Trải nghiệm ngay để cảm nhận sự khác biệt!",
                "Hãy là người đầu tiên sở hữu sản phẩm này!",
                "Khám phá ngay để không phải hối tiếc!",
                "Đây là thời điểm hoàn hảo để trải nghiệm!",
                "Hãy tự mình cảm nhận chất lượng!",
                "Đừng chần chừ, hãy khám phá ngay!",
                "Cơ hội trải nghiệm đang chờ đón bạn!",
                "Hãy làm mới cuộc sống của bạn ngay hôm nay!",
                "Khám phá ngay để thấy sự khác biệt!",
                "Hãy nâng tầm trải nghiệm của bạn!",
                "Đừng bỏ qua sản phẩm tuyệt vời này!",
                "Hãy là người tiên phong trải nghiệm!",
                "Khám phá ngay để không bỏ lỡ cơ hội!",
                "Hãy tận hưởng những giá trị vượt trội!",
                "Đây là lúc để bạn thay đổi!",
                "Hãy mở ra những khả năng mới!",
                "Đừng bỏ qua trải nghiệm đáng giá này!",
                "Hãy khẳng định phong cách của bạn!",
                "Khám phá ngay để cảm nhận sự hoàn hảo!",
                "Hãy làm mới mọi thứ ngay hôm nay!",
                "Đừng bỏ lỡ cơ hội đặc biệt này!",
                "Hãy trải nghiệm sự khác biệt ngay!",
                "Khám phá ngay để thấy điều kỳ diệu!",
                "Hãy nâng cao chất lượng cuộc sống!",
                "Đây là thời điểm lý tưởng để thay đổi!",
                "Hãy mở rộng tầm nhìn của bạn!",
                "Đừng bỏ qua những giá trị tuyệt vời!",
                "Hãy khẳng định đẳng cấp của bạn!",
                "Khám phá ngay để không phải hối hận!",
                "Hãy tận hưởng những tiện ích vượt trội!",
                "Đây là lúc để bạn tỏa sáng!",
                "Hãy khơi nguồn cảm hứng mới!",
                "Đừng bỏ lỡ trải nghiệm đáng nhớ này!",
                "Hãy tạo dấu ấn riêng của bạn!",
                "Khám phá ngay để cảm nhận sự đột phá!",
                "Hãy làm mới bản thân ngay hôm nay!",
                "Đừng bỏ qua cơ hội đặc biệt này!",
                "Hãy trải nghiệm sự hoàn hảo ngay!",
                "Khám phá ngay để thấy sự vượt trội!",
                "Hãy nâng tầm đẳng cấp của bạn!",
                "Đây là thời điểm để bạn tỏa sáng!",
                "Hãy mở ra chân trời mới!",
                "Đừng bỏ qua những tiện ích tuyệt vời!",
                "Hãy khẳng định phong cách độc đáo!",
                "Khám phá ngay để không phải tiếc nuối!",
                "Hãy tận hưởng những giá trị đích thực!",
                "Đây là lúc để bạn thay đổi mọi thứ!",
                "Hãy khơi nguồn sáng tạo mới!",
                "Đừng bỏ lỡ trải nghiệm tuyệt vời này!",
                "Hãy tạo nên sự khác biệt của riêng bạn!",
                "Khám phá ngay để cảm nhận chất lượng!",
                "Hãy làm mới cuộc sống ngay hôm nay!",
                "Đừng bỏ qua cơ hội hiếm có này!",
                "Hãy trải nghiệm sự vượt trội ngay!",
                "Khám phá ngay để thấy điều bất ngờ!",
                "Hãy nâng cao trải nghiệm của bạn!",
                "Đây là thời điểm lý tưởng để đổi mới!",
                "Hãy mở rộng khả năng của bạn!",
                "Đừng bỏ qua những giá trị đặc biệt!",
                "Hãy khẳng định cá tính của bạn!",
                "Khám phá ngay để không phải hối hận!",
                "Hãy tận hưởng những tiện nghi vượt trội!",
                "Đây là lúc để bạn tỏa sáng!",
                "Hãy khơi nguồn cảm hứng sáng tạo!",
                "Đừng bỏ lỡ trải nghiệm đáng giá này!",
                "Hãy tạo dấu ấn cá nhân của bạn!",
                "Khám phá ngay để cảm nhận sự khác biệt!",
                "Hãy làm mới mọi thứ ngay hôm nay!",
                "Đừng bỏ qua cơ hội đặc biệt này!",
                "Hãy trải nghiệm sự hoàn hảo ngay!",
                "Khám phá ngay để thấy sự vượt trội!",
                "Hãy nâng tầm đẳng cấp của bạn!",
                "Đây là thời điểm để bạn tỏa sáng!",
                "Hãy mở ra chân trời mới!",
                "Đừng bỏ qua những tiện ích tuyệt vời!",
                "Hãy khẳng định phong cách độc đáo!",
                "Khám phá ngay để không phải tiếc nuối!",
                "Hãy tận hưởng những giá trị đích thực!",
                "Đây là lúc để bạn thay đổi mọi thứ!",
                "Hãy khơi nguồn sáng tạo mới!",
                "Đừng bỏ lỡ trải nghiệm tuyệt vời này!",
                "Hãy tạo nên sự khác biệt của riêng bạn!"
    ]
  };

 private emojiPatterns: Record<string, string[]> = {
  excited: ["🔥", "✨", "🎉", "🚀", "💫", "🌟", "⚡", "🌈"],
  happy: ["😍", "🥰", "😊", "👍", "👌", "🤩", "😎", "🙌"],
  shopping: ["🛍️", "🛒", "💰", "💳", "🎁", "👜", "👛", "🪙"],
  trending: ["📈", "🏆", "💯", "⭐", "🎯", "🔝", "🏅", "👑"],
  quality: ["✅", "🔄", "⚙️", "🔧", "🛠️", "📐", "🧰", "🔨"],
  lifestyle: ["🏡", "🌿", "☕", "📚", "🎨", "🎼", "🏖️", "⛺"]
};
  private hashtagGroups = [
    ["shopee", "xuHuong", "sanPhamHot"],
    ["dealHot", "shopTre", "muaSam"],
    ["mustHave", "bestSeller", "top1"],
    ["chinhHang", "chatLuong", "uyTin"],
    ["tietKiem", "giaTot", "khuyenMai"],
    ["noiBat", "danhGiaCao", "yeuThich"],
    ["phoBien", "banChay", "hotTrend"],
    ["moiRaMat", "docDao", "sangTao"],
    ["tienLoi", "deSuDung", "thongMinh"],
    ["phongCach", "thoiTrang", "hienDai"]
  ];

  generateHashtags() {
    const selectedGroups = this.hashtagGroups
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
    const flatTags = selectedGroups.flat();
    const uniqueTags = [...new Set(flatTags)].slice(0, 9);
    return uniqueTags.map(tag => `#${tag}`).join(' ');
  }

  generateEmojiSequence() {
    const moods = Object.keys(this.emojiPatterns);
    const randomMood = moods[Math.floor(Math.random() * moods.length)];
    const emojis = this.emojiPatterns[randomMood];
    return emojis
      .sort(() => 0.5 - Math.random())
      .slice(0, 2)
      .join(' ');
  }

  generateCaption(product: any) {
    const productName = product.productName || "Sản phẩm chất lượng";
    const shopeeUrl = product.shopeeUrl || "";

    const intro = this.templates.introductions[
      Math.floor(Math.random() * this.templates.introductions.length)
    ].replace('{productName}', productName);
    
    const desc = this.templates.descriptions[
      Math.floor(Math.random() * this.templates.descriptions.length)
    ];
    
    const cta = this.templates.calls_to_action[
      Math.floor(Math.random() * this.templates.calls_to_action.length)
    ];
    
    const emoji = this.generateEmojiSequence();
    const hashtags = this.generateHashtags();

    const captionParts = [
      intro + desc,
      cta,
      emoji,
      hashtags
    ];

    if (shopeeUrl) {
      captionParts.push(`\n\nXem ngay: ${shopeeUrl}`);
    }

    return captionParts.join('\n\n');
  }
}

// Hàm upload ảnh lên Facebook
async function uploadImageToFacebook(imageUrl: string) {
  try {
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const imageBuffer = Buffer.from(response.data, 'binary');
    
    // Create a Blob from the Buffer
    const blob = new Blob([imageBuffer], { type: response.headers['content-type'] || 'image/jpeg' });
    
    const formData = new FormData();
    formData.append('access_token', FACEBOOK_ACCESS_TOKEN!);
    formData.append('source', blob, 'image.jpg'); // Provide a filename
    formData.append('published', 'false');

    const uploadResponse = await axios.post(
      `https://graph.facebook.com/${FB_API_VERSION}/${FACEBOOK_PAGE_ID}/photos`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return uploadResponse.data;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

// Hàm đăng bài lên Facebook
async function postToFacebook(caption: string, imageIds: string[]) {
  try {
    const attachedMedia = imageIds.map(id => ({
      media_fbid: id
    }));

    const response = await axios.post(
      `https://graph.facebook.com/${FB_API_VERSION}/${FACEBOOK_PAGE_ID}/feed`,
      {
        access_token: FACEBOOK_ACCESS_TOKEN,
        message: caption,
        attached_media: JSON.stringify(attachedMedia),
        published: true
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error posting to Facebook:', error);
    throw error;
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const populate = searchParams.get('populate');
    const categorySlug = searchParams.get('category');
    const searchTerm = searchParams.get('search')?.trim();

    let mongoQuery: any = {};

    // Nếu có category
    if (categorySlug) {
      const category = await Category.findOne({ slug: categorySlug });
      if (category) {
        mongoQuery.categories = category._id;
      } else {
        return NextResponse.json({ success: true, data: [] }, { status: 200 });
      }
    }

    // Nếu có từ khóa tìm kiếm
    if (searchTerm) {
      mongoQuery.$or = [
        { productName: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } }
      ];
    }

    let query = Product.find(mongoQuery).sort({ createdAt: -1 });

    if (populate === 'categories') {
      query = query.populate({
        path: 'categories',
        select: '_id name slug'
      });
    }

    const products = await query.exec();
    const clientProducts = products.map(convertToClientProduct);

    return NextResponse.json({ success: true, data: clientProducts }, { status: 200 });
  } catch (error) {
    const err = error as Error;
    console.error('API Error:', err);
    return NextResponse.json(
      { success: false, error: err.message, data: [] },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const productData: Omit<IProduct, 'postedHistory' | 'createdAt'> = await request.json();
    
    // Create new product
    const product = new Product({
      ...productData,
      postingTemplates: productData.postingTemplates || []
    });

    await product.save();

    // Generate content and post to Facebook
    const contentGen = new ContentGenerator();
    const caption = contentGen.generateCaption(product);

    // Select random images (1-4)
    const images = product.images || [];
    const selectedImages = images
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.min(images.length, 4));

    // Upload images to Facebook
    const uploadedImages = [];
    for (const imageUrl of selectedImages) {
      try {
        const uploadResult = await uploadImageToFacebook(imageUrl);
        uploadedImages.push(uploadResult);
      } catch (error) {
        console.error(`Failed to upload image ${imageUrl}:`, error);
      }
    }

    if (uploadedImages.length === 0) {
      // Still save product even if Facebook post fails
      return NextResponse.json(
        { 
          success: true, 
          product,
          warning: 'Product created but no images were uploaded to Facebook' 
        }, 
        { status: 200 }
      );
    }

    // Post to Facebook
    const postResult = await postToFacebook(
      caption,
      uploadedImages.map(img => img.id)
    );

    // Save post history
    const postHistory = new PostHistory({
      productId: product._id,
      postId: postResult.id,
      caption,
      imagesUsed: uploadedImages.length,
      timestamp: new Date()
    });
    await postHistory.save();

    // Update product with last posted time
    product.lastPosted = new Date();
    await product.save();

    return NextResponse.json(
      { 
        success: true, 
        product,
        postId: postResult.id 
      }, 
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}