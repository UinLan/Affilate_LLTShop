import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Feedback from '@/lib/models/Feedback';
import axios from 'axios';

export async function POST(request: Request) {
  await connectDB();

  try {
    const { name, email, message, rating, recaptchaToken } = await request.json();

    // Verify reCAPTCHA token
    const recaptchaSecret = process.env.GOOGLE_RECAPTCHA_SECRET_KEY;
    const recaptchaUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaSecret}&response=${recaptchaToken}`;

    const recaptchaResponse = await axios.post(recaptchaUrl);
    const recaptchaData = recaptchaResponse.data;

    if (!recaptchaData.success || recaptchaData.score < 0.5) {
      return NextResponse.json(
        { error: 'reCAPTCHA verification failed' },
        { status: 400 }
      );
    }

    // Create new feedback
    const feedback = new Feedback({
      name,
      email,
      message,
      rating
    });

    await feedback.save();

    return NextResponse.json(
      { message: 'Feedback submitted successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}