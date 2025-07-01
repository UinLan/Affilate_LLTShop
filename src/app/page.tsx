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

  return <HomePageClient categories={clientCategories} />;
}
