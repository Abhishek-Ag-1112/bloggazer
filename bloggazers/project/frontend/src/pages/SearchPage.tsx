import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, ArrowLeft } from 'lucide-react';
import { Blog } from '../types';
import { fetchBlogs } from '../utils/firebaseHelpers';
import { orderBy, QueryConstraint } from 'firebase/firestore';
import BlogCard from '../components/BlogCard';
import BlogCardSkeleton from '../components/BlogCardSkeleton';

const SearchPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const performSearch = async () => {
            setLoading(true);
            try {
                // Note: This is a temporary client-side search implementation.
                // For production scaling, integrate Algolia or ElasticSearch.
                const constraints: QueryConstraint[] = [orderBy('created_at', 'desc')];
                // Fetch a larger batch to filter client-side
                const { blogs: allBlogs } = await fetchBlogs(constraints, 100, null);

                if (query.trim()) {
                    const searchTerms = query.toLowerCase().split(' ');
                    const filtered = allBlogs.filter(blog => {
                        const titleMatch = searchTerms.every(term => blog.title.toLowerCase().includes(term));
                        const contentMatch = searchTerms.every(term => blog.excerpt?.toLowerCase().includes(term));
                        const tagMatch = blog.tags?.some(tag => searchTerms.some(term => tag.toLowerCase().includes(term)));
                        return titleMatch || contentMatch || tagMatch;
                    });
                    setBlogs(filtered);
                } else {
                    setBlogs([]);
                }
            } catch (error) {
                console.error("Error searching blogs:", error);
            } finally {
                setLoading(false);
            }
        };

        performSearch();
    }, [query]);

    return (
        <div className="min-h-screen">
            <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <Link
                        to="/blogs"
                        className="inline-flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>Back to Blogs</span>
                    </Link>

                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                            <Search className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                Search Results
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                {loading ? 'Searching...' : `Found ${blogs.length} results for "${query}"`}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <BlogCardSkeleton key={i} />
                        ))}
                    </div>
                ) : blogs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {blogs.map((blog) => (
                            <BlogCard key={blog.id} blog={blog} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-6">
                            <Search className="w-8 h-8 text-gray-400" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            No results found
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                            We couldn't find any posts matching "{query}". Try checking for typos or using different keywords.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchPage;
