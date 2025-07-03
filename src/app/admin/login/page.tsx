'use client';

import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!recaptchaToken) {
      setError('Vui lòng xác minh reCAPTCHA');
      return;
    }

    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
      pin,
      recaptchaToken, // Thêm recaptchaToken vào payload
    });

    if (result?.error) {
      setError(result.error);
      // Reset reCAPTCHA khi có lỗi
      recaptchaRef.current?.reset();
      setRecaptchaToken(null);
    } else {
      router.push('/admin');
    }
  };

  const onRecaptchaChange = (token: string | null) => {
    setRecaptchaToken(token);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">Admin Login</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="w-full px-3 py-2 border rounded"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="w-full px-3 py-2 border rounded"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="pin">
              Mã PIN
            </label>
            <input
              type="password"
              id="pin"
              className="w-full px-3 py-2 border rounded"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={process.env.NEXT_PUBLIC_GOOGLE_RECAPTCHA_SITE_KEY!}
              onChange={onRecaptchaChange}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            disabled={!recaptchaToken}
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}