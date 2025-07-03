import type { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { getUserByEmail } from '@/lib/db';

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        pin: { label: "PIN", type: "password" },
        recaptchaToken: { label: "reCAPTCHA Token", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password || !credentials?.pin || !credentials?.recaptchaToken) {
          throw new Error('Vui lòng điền đầy đủ thông tin và xác minh reCAPTCHA');
        }

        // Verify reCAPTCHA token
        const recaptchaResponse = await fetch(
          `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.GOOGLE_RECAPTCHA_SECRET_KEY}&response=${credentials.recaptchaToken}`,
          {
            method: 'POST',
          }
        );

        const recaptchaData = await recaptchaResponse.json();

        if (!recaptchaData.success) {
          throw new Error('Xác minh reCAPTCHA thất bại');
        }

        const user = await getUserByEmail(credentials.email);
        if (!user) throw new Error('Thông tin đăng nhập không đúng');

        const passwordMatch = await compare(credentials.password, user.password);
        const pinMatch = await compare(credentials.pin, user.pin);

        if (!passwordMatch || !pinMatch) {
          throw new Error('Thông tin đăng nhập không đúng');
        }

        return { id: user._id.toString(), email: user.email, role: user.role };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role;
      }
      return session;
    }
  },
  pages: {
    signIn: '/admin/login',
    error: '/auth/error',
  },
  secret: process.env.NEXTAUTH_SECRET,
};