// src/pages/CategoriesPage.tsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Hash, Heart, Laptop, Paintbrush, Book, BookOpen } from 'lucide-react';

// We'll use the hardcoded categories from your Blogs.tsx page
// and assign icons to them.
const CATEGORIES = [
  { name: 'Technology', icon: Laptop },
  { name: 'Design', icon: Paintbrush },
  { name: 'Lifestyle', icon: Book },
  { name: 'Personal', icon: Heart },
  { name: 'General', icon: Hash },
];

const CategoriesPage: React.FC = () => {
  const navigate = useNavigate();

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
      <div className="text-gray-900 dark:text-white py-16"> {/* <-- MODIFIED */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/blogs"
            className="inline-flex items-center space-x-2 text-blue-600 dark:text-blue-100 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors" // <-- MODIFIED
          >
            <ArrowLeft className="w-5 h-5" />
            <span>All Blogs</span>
          </Link>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Blog Categories
          </h1>
          <p className="text-xl text-gray-700 dark:text-blue-100"> {/* <-- MODIFIED */}
            Explore posts by topic of interest.
          </p>
        </div>
      </div>

      {/* Category List */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-6 sm:p-8">
          <div className="space-y-4">
            {CATEGORIES.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.name}
                  onClick={() => handleCategoryClick(category.name)}
                  className="w-full flex items-center justify-between p-6 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition-all transform hover:scale-[1.02] cursor-pointer text-left"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-xl font-semibold text-gray-900 dark:text-white">
                      {category.name}
                    </span>
                  </div>
                  <ChevronRight className="w-6 h-6 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                </button>
              );
            })}
            
            {/* "All" Category Button */}
            <button
              onClick={() => handleCategoryClick('All')}
              className="w-full flex items-center justify-between p-6 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition-all transform hover:scale-[1.02] cursor-pointer text-left"
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-xl font-semibold text-gray-900 dark:text-white">
                  All Posts
                </span>
              </div>
              <ChevronRight className="w-6 h-6 text-gray-400 dark:text-gray-500 flex-shrink-0" />
            </button>

          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;