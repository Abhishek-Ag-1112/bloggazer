import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchBookmarkedBlogs } from '../utils/firebaseHelpers';
import { Blog } from '../types';
import BlogCard from '../components/BlogCard';
import PageLoader from '../components/PageLoader';

const Bookmarks: React.FC = () => {
    const { user } = useAuth();
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getBookmarks = async () => {
            if (!user) return;
            setLoading(true);
            try {
                const bookmarkedBlogs = await fetchBookmarkedBlogs(user.id);
                setBlogs(bookmarkedBlogs);
            } catch (error) {
                console.error("Error fetching bookmarks:", error);
            } finally {
                setLoading(false);
            }
        };

        getBookmarks();
    }, [user]);

    if (loading) {
        return <PageLoader />;
    }

    return (
        <div className="min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl">
                            <Bookmark className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                My Bookmarks
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                {blogs.length} {blogs.length === 1 ? 'saved post' : 'saved posts'}
                            </p>
                        </div>
                    </div>

                    <Link
                        to="/blogs"
                        className="flex items-center space-x-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Blogs</span>
                    </Link>
                </div>

                {blogs.length === 0 ? (
                    <div className="text-center py-20 bg-white/65 dark:bg-gray-950/40 rounded-2xl border border-gray-200 dark:border-gray-800">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-6">
                            <Bookmark className="w-8 h-8 text-gray-400" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            No bookmarks yet
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-8">
                            Save interesting posts to read them later. Look for the bookmark icon on any blog post.
                        </p>
                        <Link
                            to="/blogs"
                            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                        >
                            Explore Blogs
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {blogs.map((blog) => (
                            <BlogCard key={blog.id} blog={blog} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Bookmarks;
