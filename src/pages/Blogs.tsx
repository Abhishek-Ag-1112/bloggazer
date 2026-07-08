// src/pages/Blogs.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Filter, XCircle, Tag, Search } from 'lucide-react';
import { Blog } from '../types';
import { fetchBlogs } from '../utils/firebaseHelpers';
import { orderBy, where, QueryConstraint, DocumentSnapshot } from 'firebase/firestore';
import { useSearchParams } from 'react-router-dom';
import MagicBento from '../components/MagicBento';
import BlogCardSkeleton from '../components/BlogCardSkeleton';

const ITEMS_PER_PAGE = 9;
const CATEGORIES = ['All', 'Technology', 'Design', 'Lifestyle', 'Personal', 'General'];

const Blogs: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [totalBlogCount, setTotalBlogCount] = useState(0);

  const [searchParams, setSearchParams] = useSearchParams();

  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [selectedTag, setSelectedTag] = useState(searchParams.get('tag') || null);

  const loaderRef = useRef(null);

  useEffect(() => {
    const categoryFromUrl = searchParams.get('category') || 'All';
    const tagFromUrl = searchParams.get('tag') || null;
    setSelectedCategory(categoryFromUrl);
    setSelectedTag(tagFromUrl);
  }, [searchParams]);

  useEffect(() => {
    const getInitialBlogs = async () => {
      setLoading(true);
      setBlogs([]);
      setLastDoc(null);
      setHasMore(true);

      const constraints: QueryConstraint[] = [orderBy('created_at', 'desc')];

      if (selectedCategory !== 'All') {
        constraints.push(where('category', '==', selectedCategory));
      }
      if (selectedTag) {
        constraints.push(where('tags', 'array-contains', selectedTag));
      }

      try {
        const { blogs: newBlogs, lastDoc: newLastDoc } = await fetchBlogs(
          constraints,
          ITEMS_PER_PAGE,
          null
        );

        setBlogs(newBlogs);
        setLastDoc(newLastDoc);
        setTotalBlogCount(newBlogs.length);
        setHasMore(newBlogs.length === ITEMS_PER_PAGE);
      } catch (error) {
        console.error("Error fetching blogs:", error);
      } finally {
        setLoading(false);
      }
    };

    getInitialBlogs();
  }, [selectedCategory, selectedTag]);

  const loadMoreBlogs = useCallback(async () => {
    if (loadingMore || !hasMore || !lastDoc) return;

    setLoadingMore(true);

    const constraints: QueryConstraint[] = [orderBy('created_at', 'desc')];
    if (selectedCategory !== 'All') {
      constraints.push(where('category', '==', selectedCategory));
    }
    if (selectedTag) {
      constraints.push(where('tags', 'array-contains', selectedTag));
    }

    try {
      const { blogs: newBlogs, lastDoc: newLastDoc } = await fetchBlogs(
        constraints,
        ITEMS_PER_PAGE,
        lastDoc
      );

      setBlogs(prevBlogs => [...prevBlogs, ...newBlogs]);
      setLastDoc(newLastDoc);
      setTotalBlogCount(prevCount => prevCount + newBlogs.length);
      setHasMore(newBlogs.length === ITEMS_PER_PAGE);
    } catch (error) {
      console.error("Error loading more blogs:", error);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, lastDoc, selectedCategory, selectedTag]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        if (firstEntry.isIntersecting && hasMore && !loading && !loadingMore) {
          loadMoreBlogs();
        }
      },
      { threshold: 1.0 }
    );

    const currentLoader = loaderRef.current;
    if (currentLoader) {
      observer.observe(currentLoader);
    }

    return () => {
      if (currentLoader) {
        observer.unobserve(currentLoader);
      }
    };
  }, [hasMore, loading, loadingMore, loadMoreBlogs]);

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setSelectedTag(null);
    if (category === 'All') {
      setSearchParams({});
    } else {
      setSearchParams({ category: category });
    }
  };

  const clearTagFilter = () => {
    setSelectedTag(null);
    if (selectedCategory !== 'All') {
      setSearchParams({ category: selectedCategory });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="min-h-screen">
      <div className="text-gray-900 dark:text-white py-16"> {/* <-- MODIFIED */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">All Blogs</h1>
          <p className="text-xl text-gray-700 dark:text-blue-100"> {/* <-- MODIFIED */}
            {loading ? 'Exploring articles...' : `Exploring ${totalBlogCount}${hasMore ? '+' : ''} articles on various topics`}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 space-y-4">

          <div className="flex items-center space-x-2 overflow-x-auto pb-2">
            <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400 flex-shrink-0" />
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => handleCategorySelect(category)}
                disabled={!!selectedTag}
                className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${selectedCategory === category && !selectedTag
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                  } ${!!selectedTag ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {category}
              </button>
            ))}
          </div>

          {selectedTag && (
            <div className="flex items-center justify-start">
              <span className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium">
                <Tag className="w-5 h-5" />
                <span>Filtering by tag: "{selectedTag}"</span>
                <button
                  onClick={clearTagFilter}
                  className="ml-2 p-1 rounded-full hover:bg-blue-700"
                  aria-label="Clear tag filter"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </span>
            </div>
          )}

        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <BlogCardSkeleton key={i} />
            ))}
          </div>
        ) : blogs.length > 0 ? (
          <>
            <MagicBento
              blogs={blogs}
              enableStars={true}
              enableSpotlight={true}
              enableBorderGlow={true}
              enableTilt={true}
              enableMagnetism={true}
              spotlightRadius={300}
              clickEffect={true}
              particleCount={100}
              glowColor="132, 0, 255"
            />
          </>
        ) : (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No blogs found</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your filter criteria
            </p>
          </div>
        )}

        <div ref={loaderRef} className="mt-12">
          {loadingMore && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 3 }).map((_, i) => (
                <BlogCardSkeleton key={i} />
              ))}
            </div>
          )}
        </div>

        {!hasMore && !loading && blogs.length > 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <p>You've reached the end of the line!</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default Blogs;