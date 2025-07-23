import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    const response = await fetch('https://api.lltshop.vn/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'CF-Access-Client-Id': process.env.CF_ACCESS_CLIENT_ID || '',
        'CF-Access-Client-Secret': process.env.CF_ACCESS_CLIENT_SECRET || '',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json(); // Parse JSON response
    
    // Trích xuất chỉ phần response từ dữ liệu trả về
    const caption = data.response || '';
    return NextResponse.json({ result: caption });
  } catch (error) {
    console.error('Error generating caption:', error);
    return NextResponse.json(
      { error: 'Failed to generate caption' },
      { status: 500 }
    );
  }
}