// src/pages/admin/ManageBlogs.tsx
import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, limit, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Blog } from '../../types';
import toast from 'react-hot-toast';
import { Search, Trash2, Eye, EyeOff, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const ManageBlogs: React.FC = () => {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, 'blogs'), orderBy('created_at', 'desc'), limit(50));
            const snapshot = await getDocs(q);
            const blogList = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    // Handle timestamp conversion if needed, but assuming data mirrors Blog type sort of
                } as unknown as Blog;
            });
            setBlogs(blogList);
        } catch (error) {
            console.error("Error fetching blogs:", error);
            toast.error("Failed to load blogs");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteBlog = async (blogId: string) => {
        if (!window.confirm("Are you sure you want to delete this blog?")) return;

        try {
            await deleteDoc(doc(db, 'blogs', blogId));
            setBlogs(prev => prev.filter(b => b.id !== blogId));
            toast.success("Blog deleted");
        } catch (error) {
            console.error("Error deleting blog:", error);
            toast.error("Failed to delete blog");
        }
    };

    const togglePublishStatus = async (blog: Blog) => {
        const newStatus = !blog.published;
        try {
            await updateDoc(doc(db, 'blogs', blog.id), { published: newStatus });
            setBlogs(prev => prev.map(b => b.id === blog.id ? { ...b, published: newStatus } : b));
            toast.success(`Blog ${newStatus ? 'published' : 'unpublished'}`);
        } catch (error) {
            console.error("Error updating blog status:", error);
            toast.error("Failed to update status");
        }
    };

    const filteredBlogs = blogs.filter(blog =>
        blog.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <h1 className="text-2xl font-bold">Manage Blogs</h1>
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search blogs..."
                        className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-gray-500 dark:text-gray-400">Title</th>
                                <th className="px-6 py-4 font-semibold text-gray-500 dark:text-gray-400">Category</th>
                                <th className="px-6 py-4 font-semibold text-gray-500 dark:text-gray-400">Stats</th>
                                <th className="px-6 py-4 font-semibold text-gray-500 dark:text-gray-400">Status</th>
                                <th className="px-6 py-4 font-semibold text-gray-500 dark:text-gray-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading blogs...</td>
                                </tr>
                            ) : filteredBlogs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No blogs found</td>
                                </tr>
                            ) : (
                                filteredBlogs.map((blog) => (
                                    <tr key={blog.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-6 py-4 max-w-xs truncate">
                                            <Link to={`/blog/${blog.slug}`} className="font-medium hover:text-purple-500">
                                                {blog.title}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4">
                                            {blog.category}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {blog.views || 0} views
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                        ${blog.published ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'}
                      `}>
                                                {blog.published ? 'Published' : 'Draft'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <Link
                                                to={`/blog/${blog.slug}`}
                                                target="_blank"
                                                className="inline-block p-2 text-gray-400 hover:text-blue-500 transition-colors"
                                                title="View Live"
                                            >
                                                <ExternalLink className="w-5 h-5" />
                                            </Link>
                                            <button
                                                onClick={() => togglePublishStatus(blog)}
                                                className="p-2 text-gray-400 hover:text-green-500 transition-colors"
                                                title={blog.published ? "Unpublish" : "Publish"}
                                            >
                                                {blog.published ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                            <button
                                                onClick={() => handleDeleteBlog(blog.id)}
                                                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                                title="Delete Blog"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ManageBlogs;
