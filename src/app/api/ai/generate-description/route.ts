import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

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
const ollamaResponse = await fetch('https://api.lltshop.vn/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'CF-Access-Client-Id': process.env.CF_ACCESS_CLIENT_ID || '',
        'CF-Access-Client-Secret': process.env.CF_ACCESS_CLIENT_SECRET || '',
      },
      body: JSON.stringify({
        model: 'llama3',
        prompt,
        stream: true,
        options: {
          temperature: 0.3,
          top_p: 0.8,
          max_tokens: 600,
        },
      }),
    });

    if (!ollamaResponse.ok || !ollamaResponse.body) {
      const error = await ollamaResponse.text();
      throw new Error(`Lỗi từ Ollama API: ${error}`);
    }

    // ✅ Trả trực tiếp stream về frontend
    return new Response(ollamaResponse.body, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error) {
    console.error('Lỗi khi tạo mô tả:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Lỗi không xác định',
        suggestion: 'Vui lòng thử lại hoặc kiểm tra server AI',
      },
      { status: 500 }
    );
  }
}