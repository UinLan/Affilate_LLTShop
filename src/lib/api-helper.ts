// lib/api-helper.ts
import { NextResponse } from 'next/server';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export function successResponse<T>(data: T, status = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ success: true, data }, { status });
}

export function errorResponse(message: string, status = 400): NextResponse<ApiResponse<null>> {
  return NextResponse.json({ success: false, error: message }, { status });
}

export function serverErrorResponse(error: unknown): NextResponse<ApiResponse<null>> {
  const message = error instanceof Error ? error.message : 'Internal server error';
  return NextResponse.json({ success: false, error: message }, { status: 500 });
}