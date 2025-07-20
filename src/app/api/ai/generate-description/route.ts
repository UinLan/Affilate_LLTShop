import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const { currentDescription } = await request.json();

    if (!currentDescription || currentDescription.trim().length < 20) {
      return NextResponse.json(
        { error: 'Nội dung mô tả quá ngắn hoặc không có' },
        { status: 400 }
      );
    }

    // Prompt được tối ưu với yêu cầu rõ ràng hơn
    const prompt = `
    Hãy tóm tắt và định dạng lại mô tả sản phẩm sau bằng TIẾNG VIỆT theo yêu cầu:
    - PHẢI dùng tiếng Việt
    - Bắt đầu trực tiếp bằng nội dung, không có dòng giới thiệu
    - Mở đầu bằng 1-2 câu mô tả ngắn gọn
    - Trình bày theo các phần rõ ràng
    - Dùng dấu "-" cho các gạch đầu dòng
    - Tiêu đề phần KHÔNG dùng bất kỳ ký tự đặc biệt nào (như ** hay --)
    - Viết hoa chữ cái đầu của tiêu đề phần
    - Giữ nguyên thông tin quan trọng
    - Ưu tiên thông tin kỹ thuật và lợi ích sản phẩm
    
    Nội dung cần xử lý:
    ${currentDescription}
    `;

    const ollamaResponse = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3',
        prompt,
        stream: false,
        options: {
          temperature: 0.3,
          top_p: 0.8,
          max_tokens: 600,
        }
      }),
    });

    if (!ollamaResponse.ok) {
      const error = await ollamaResponse.text();
      throw new Error(`Lỗi Ollama API: ${error}`);
    }

    const result = await ollamaResponse.json();
    let description = result.response.trim();

    // Xử lý kết quả triệt để hơn
    description = description.replace(/^"+|"+$/g, '');
    description = description.replace(/\\n/g, '\n');
    // Loại bỏ các cụm giới thiệu và đảm bảo tiếng Việt
    description = description.replace(/^(Here is|Đây là|Kết quả|Here's the|Output).*?\n+/i, '');
    description = description.replace(/^.*formatted output.*?\n+/i, '');
    description = description.replace(/^\n+/, '');
    // Loại bỏ tất cả các ký tự format tiêu đề
    description = description.replace(/^[*\-~=]{2}(.*?)[*\-~=]{2}/gm, '$1'); // Bỏ ** -- ~~ ==
    // Chuẩn hóa khoảng cách dòng
    description = description.replace(/\n\n+/g, '\n\n');

    // Kiểm tra và chuyển đổi sang tiếng Việt nếu cần
    const vietnameseRatio = (description.match(/[àáảãạăắằẳẵặâấầẩẫậđèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵ]/gi) || []).length / description.length;
    
    if (vietnameseRatio < 0.1) {
      throw new Error('Kết quả không phải tiếng Việt');
    }

    return NextResponse.json({ description });
  } catch (error) {
    console.error('Lỗi khi tạo mô tả:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Không thể định dạng mô tả',
        suggestion: 'Vui lòng thử lại với nội dung khác'
      },
      { status: 500 }
    );
  }
}