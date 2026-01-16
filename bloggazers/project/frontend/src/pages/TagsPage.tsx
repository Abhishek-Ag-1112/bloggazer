// src/pages/TagsPage.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchBlogs } from '../utils/firebaseHelpers';
import { orderBy } from 'firebase/firestore';
import { ArrowLeft, Tag } from 'lucide-react';

const TagsPage: React.FC = () => {
  const [tagCounts, setTagCounts] = useState<Map<string, number>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getTags = async () => {
      setLoading(true);
      // Fetch all blogs to aggregate tags
      const constraints = [orderBy('created_at', 'desc')];
      const { blogs } = await fetchBlogs(constraints, 1000, null);

      // Process and count all tags
      const tagMap = new Map<string, number>();
      for (const blog of blogs) {
        for (const tag of blog.tags) {
          const formattedTag = tag.trim();
          if (formattedTag) {
            tagMap.set(formattedTag, (tagMap.get(formattedTag) || 0) + 1);
          }
        }
      }

      // Sort tags by count (most frequent first)
      const sortedTags = new Map(
        [...tagMap.entries()].sort((a, b) => b[1] - a[1])
      );
      
      setTagCounts(sortedTags);
      setLoading(false);
    };

    getTags();
  }, []);

  // Helper to determine font size for tag cloud effect
  const getFontSize = (count: number) => {
    if (count > 10) return 'text-3xl';
    if (count > 5) return 'text-2xl';
    if (count > 2) return 'text-xl';
    return 'text-lg';
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
            Blog Tags
          </h1>
          <p className="text-xl text-gray-700 dark:text-blue-100"> {/* <-- MODIFIED */}
            Explore {tagCounts.size} topics from all posts.
          </p>
        </div>
      </div>

      {/* Tag Cloud */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-8 sm:p-12">
          {loading ? (
            <p className="text-center text-gray-700 dark:text-gray-300">Loading tags...</p>
          ) : (
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
              {[...tagCounts.entries()].map(([tag, count]) => (
                <Link
                  key={tag}
                  to={`/blogs?tag=${encodeURIComponent(tag)}`}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-110
                    bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300
                    hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500
                    ${getFontSize(count)}`}
                >
                  <Tag className="w-4 h-4" />
                  <span>{tag}</span>
                  <span className="text-xs px-2 py-0.5 bg-white dark:bg-gray-700 rounded-full">
                    {count}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TagsPage;