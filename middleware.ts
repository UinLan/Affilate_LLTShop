import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL!);
const RATE_LIMIT = 5; // Số lần cho phép
const WINDOW_SECONDS = 60; // Thời gian tính giới hạn (60 giây)

export default withAuth(
  async function middleware(req) {
    const url = req.nextUrl;

    // ✅ Áp dụng rate limit cho các đường dẫn nhạy cảm
    const rateLimitPaths = ['/admin/login', '/api/auth'];

    if (rateLimitPaths.some((path) => url.pathname.startsWith(path))) {
      const forwardedFor = req.headers.get('x-forwarded-for');
      const ip = forwardedFor?.split(',')[0]?.trim() || 'unknown';
      const key = `rate-limit:${ip}`;
      const current = await redis.incr(key);

      if (current === 1) {
        await redis.expire(key, WINDOW_SECONDS);
      }

      if (current > RATE_LIMIT) {
        return new NextResponse(
          JSON.stringify({ error: 'Too many requests, please try again later.' }),
          {
            status: 429,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
    }

    // ✅ Kiểm tra quyền admin cho trang /admin
    if (
      url.pathname.startsWith('/admin') &&
      req.nextauth.token?.role !== 'admin'
    ) {
      return NextResponse.rewrite(new URL('/auth/unauthorized', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: '/admin/login',
      error: '/auth/error',
    },
  }
);

// ✅ Xác định rõ những route áp dụng middleware
export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
    '/api/auth/:path*',
    '/admin/login',
  ],
};
