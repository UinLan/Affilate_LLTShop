import Category from '@/lib/models/Category';
import connectDB from '@/lib/mongodb';
import { convertToClientCategory } from '@/lib/converters';
// import HomePageClient from '@/components/HomePageClient';
import FeedbackForm from '@/components/FeedbackForm';
import HomeWrapper from '@/components/HomeWrapper';
import Image from 'next/image';
export default async function HomePage() {
  await connectDB();

  const categories = await Category.find().sort({ name: 1 }).exec();
  const clientCategories = categories.map(category =>
    convertToClientCategory(category)
  );

  return (
    <>

  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 overflow-hidden relative">
<div className="absolute top-4 left-4 z-20">
  <Image
    src="/logo_lltshop.jpg"
    alt="LLT Shop Logo"
    width={100}
    height={100}
    className="rounded-full object-contain shadow-md 
               w-14 h-14 sm:w-24 sm:h-24 md:w-28 md:h-28"
    priority
  />
</div>
    {/* Pattern overlay tạo chiều sâu */}
    <div className="absolute inset-0 bg-[url('https://uploads-ssl.webflow.com/627a1044a798e6627445c8d1/627a1045a798e66a3b45c943_noise.png')] opacity-10 mix-blend-overlay pointer-events-none"></div>

    {/* Container chính */}
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
       <HomeWrapper categories={clientCategories} />
         {/* Feedback Section */}
        <div className="mt-16 bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Giúp chúng tôi cải thiện</h2>
          <p className="mb-6 text-gray-600">
            Chúng tôi trân trọng phản hồi của bạn! Vui lòng chia sẻ suy nghĩ của bạn để giúp chúng tôi cải thiện dịch vụ của mình.
          </p>
          <FeedbackForm />
        </div>
      {/* Decorative elements */}
      <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-200 rounded-full filter blur-3xl opacity-30"></div>
      <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-purple-200 rounded-full filter blur-3xl opacity-30"></div>
    </div>
   {/* Footer đồng bộ màu và cỡ chữ */}
<footer className="bg-white py-6 border-t border-gray-200">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-1">
    <p className="text-gray-600 text-base"> {/* Tăng từ text-sm lên text-base */}
      © <span className="text-indigo-600 font-bold">LLTShop.vn</span>. All rights reserved
    </p>
    <p className="text-gray-500 text-base"> {/* Tăng từ text-xs lên text-base */}
      Developed by <span className="text-indigo-600 font-bold">Nguyen Le Kim Lan</span>
    </p>
  </div>
</footer>
  </div>
  </>
);
}