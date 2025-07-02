import Category from '@/lib/models/Category';
import connectDB from '@/lib/mongodb';
import { convertToClientCategory } from '@/lib/converters';
import HomePageClient from '@/components/HomePageClient';

export default async function HomePage() {
  await connectDB();

  const categories = await Category.find().sort({ name: 1 }).exec();
  const clientCategories = categories.map(category =>
    convertToClientCategory(category)
  );

  return (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 overflow-hidden relative">
    {/* Pattern overlay tạo chiều sâu */}
    <div className="absolute inset-0 bg-[url('https://uploads-ssl.webflow.com/627a1044a798e6627445c8d1/627a1045a798e66a3b45c943_noise.png')] opacity-10 mix-blend-overlay pointer-events-none"></div>
    
    {/* Container chính */}
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <HomePageClient categories={clientCategories} />

      {/* Decorative elements */}
      <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-200 rounded-full filter blur-3xl opacity-30"></div>
      <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-purple-200 rounded-full filter blur-3xl opacity-30"></div>
    </div>
  </div>
);
}