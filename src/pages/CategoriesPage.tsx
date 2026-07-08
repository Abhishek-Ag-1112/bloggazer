// src/pages/CategoriesPage.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Hash, Heart, Laptop, Paintbrush, Book, BookOpen } from 'lucide-react';
import { db } from '../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

const CATEGORIES_META = [
  { name: 'Technology', icon: Laptop },
  { name: 'Design', icon: Paintbrush },
  { name: 'Lifestyle', icon: Book },
  { name: 'Personal', icon: Heart },
  { name: 'General', icon: Hash },
];

interface CategoryWithCount {
  name: string;
  icon: any;
  count: number;
}

const CategoriesPage: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const fetchCategoryCounts = async () => {
      try {
        // Query only published blogs
        const q = query(collection(db, 'blogs'), where('published', '==', true));
        const snap = await getDocs(q);
        const blogs = snap.docs.map(doc => doc.data());
        
        // Count blogs per category
        const counts: Record<string, number> = {};
        blogs.forEach(blog => {
          const cat = blog.category || 'General';
          counts[cat] = (counts[cat] || 0) + 1;
        });

        // Map and filter only categories with >= 1 post
        const activeCategories = CATEGORIES_META.map(cat => ({
          name: cat.name,
          icon: cat.icon,
          count: counts[cat.name] || 0
        })).filter(cat => cat.count > 0);

        setCategories(activeCategories);
        setTotalCount(blogs.length);
      } catch (error) {
        console.error("Error fetching category counts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryCounts();
  }, []);

  const handleCategoryClick = (categoryName: string) => {
    if (categoryName === 'All') {
      navigate('/blogs');
    } else {
      navigate(`/blogs?category=${categoryName}`);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="text-gray-900 dark:text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/blogs"
            className="inline-flex items-center space-x-2 text-blue-600 dark:text-blue-100 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>All Blogs</span>
          </Link>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Blog Categories
          </h1>
          <p className="text-xl text-gray-700 dark:text-blue-100">
            Explore posts by topic of interest.
          </p>
        </div>
      </div>

      {/* Category List */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-6 sm:p-8">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
            </div>
          ) : (
            <div className="space-y-4">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.name}
                    onClick={() => handleCategoryClick(category.name)}
                    className="w-full flex items-center justify-between p-6 rounded-lg bg-gray-50/50 dark:bg-gray-850 hover:bg-gray-100/50 dark:hover:bg-gray-800 border border-gray-200/50 dark:border-gray-750 transition-all transform hover:scale-[1.01] cursor-pointer text-left"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                        <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <span className="text-xl font-semibold text-gray-900 dark:text-white block">
                          {category.name}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                          {category.count} {category.count === 1 ? 'post' : 'posts'}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-6 h-6 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                  </button>
                );
              })}
              
              {/* "All" Category Button */}
              {totalCount > 0 && (
                <button
                  onClick={() => handleCategoryClick('All')}
                  className="w-full flex items-center justify-between p-6 rounded-lg bg-gray-50/50 dark:bg-gray-850 hover:bg-gray-100/50 dark:hover:bg-gray-800 border border-gray-200/50 dark:border-gray-750 transition-all transform hover:scale-[1.01] cursor-pointer text-left"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                      <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <span className="text-xl font-semibold text-gray-900 dark:text-white block">
                        All Posts
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                        {totalCount} total posts
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-6 h-6 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                </button>
              )}

              {categories.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No categories found. Published blogs will appear here.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;