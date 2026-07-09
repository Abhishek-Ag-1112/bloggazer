// src/pages/admin/AdminDashboard.tsx
import React, { useEffect, useState } from 'react';
import { collection, getCountFromServer, query, where, getDocs, limit, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Users, FileText, Eye, TrendingUp, Mail, Shield, Trash2, EyeOff, FolderOpen, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState({
        users: 0,
        blogs: 0,
        activeUsers: 0,
        publishedBlogs: 0
    });
    const [loading, setLoading] = useState(true);
    const [recentUsers, setRecentUsers] = useState<any[]>([]);
    const [recentBlogs, setRecentBlogs] = useState<any[]>([]);
    const [contactMessages, setContactMessages] = useState<any[]>([]);
    const [categoryStats, setCategoryStats] = useState<Record<string, number>>({});

    const fetchAllData = async () => {
        try {
            const usersColl = collection(db, 'users');
            const blogsColl = collection(db, 'blogs');
            const contactsColl = collection(db, 'contacts');

            // 1. Fetch Counts
            const [usersCount, activeUsersCount, blogsCount, publishedBlogsCount] = await Promise.all([
                getCountFromServer(usersColl),
                getCountFromServer(query(usersColl, where('status', '==', 'active'))),
                getCountFromServer(blogsColl),
                getCountFromServer(query(blogsColl, where('published', '==', true)))
            ]);

            setStats({
                users: usersCount.data().count,
                activeUsers: activeUsersCount.data().count,
                blogs: blogsCount.data().count,
                publishedBlogs: publishedBlogsCount.data().count
            });

            // 2. Fetch Recent Users (limit 5)
            const usersSnap = await getDocs(query(usersColl, limit(5)));
            const fetchedUsers = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
            setRecentUsers(fetchedUsers);

            // 3. Fetch Recent Blogs (limit 5)
            const blogsSnap = await getDocs(query(blogsColl, orderBy('created_at', 'desc'), limit(5)));
            const fetchedBlogs = blogsSnap.docs.map(d => {
                const data = d.data();
                return {
                    id: d.id,
                    ...data,
                    created_at: data.created_at ? data.created_at.toDate().toISOString() : new Date().toISOString()
                };
            });

            // Fetch authors for recent blogs
            const authorIds = [...new Set(fetchedBlogs.map(b => b.author_id))];
            const authorMap = new Map<string, any>();
            if (authorIds.length > 0) {
                const authorsSnap = await getDocs(query(collection(db, 'users'), where('id', 'in', authorIds)));
                authorsSnap.forEach(d => authorMap.set(d.id, d.data()));
            }
            const populatedBlogs = fetchedBlogs.map(b => ({
                ...b,
                author: authorMap.get(b.author_id)
            }));
            setRecentBlogs(populatedBlogs);

            // 4. Fetch Contact Messages (limit 5)
            const contactsSnap = await getDocs(query(contactsColl, orderBy('created_at', 'desc'), limit(5)));
            const fetchedContacts = contactsSnap.docs.map(d => {
                const data = d.data();
                return {
                    id: d.id,
                    ...data,
                    created_at: data.created_at ? data.created_at.toDate().toISOString() : new Date().toISOString()
                };
            });
            setContactMessages(fetchedContacts);

            // 5. Category breakdown stats (calculate from blogs)
            const allBlogsSnap = await getDocs(blogsColl);
            const counts: Record<string, number> = {};
            allBlogsSnap.forEach(d => {
                const cat = d.data().category || 'General';
                counts[cat] = (counts[cat] || 0) + 1;
            });
            setCategoryStats(counts);

        } catch (error) {
            console.error("Error fetching admin stats:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    const togglePublishStatus = async (blog: any) => {
        const newStatus = !blog.published;
        try {
            await updateDoc(doc(db, 'blogs', blog.id), { published: newStatus });
            setRecentBlogs(prev => prev.map(b => b.id === blog.id ? { ...b, published: newStatus } : b));
            toast.success(`Blog ${newStatus ? 'published' : 'unpublished'}`);
        } catch (error) {
            console.error(error);
            toast.error("Failed to update status");
        }
    };

    const toggleUserRole = async (user: any) => {
        const newRole = user.role === 'admin' ? 'user' : 'admin';
        try {
            await updateDoc(doc(db, 'users', user.id), { role: newRole });
            setRecentUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: newRole } : u));
            toast.success(`User role updated to ${newRole}`);
        } catch (error) {
            console.error(error);
            toast.error("Failed to update role");
        }
    };

    const handleDeleteContact = async (contactId: string) => {
        if (!window.confirm("Delete this message?")) return;
        try {
            await deleteDoc(doc(db, 'contacts', contactId));
            setContactMessages(prev => prev.filter(c => c.id !== contactId));
            toast.success("Message deleted");
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete message");
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const statCards = [
        { label: 'Total Users', value: stats.users, icon: Users, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/20' },
        { label: 'Active Users', value: stats.activeUsers, icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/20' },
        { label: 'Total Blogs', value: stats.blogs, icon: FileText, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/20' },
        { label: 'Published', value: stats.publishedBlogs, icon: Eye, color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/20' },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-12">
            <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
                Dashboard Overview
            </h1>

            {/* Counts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((card) => (
                    <div
                        key={card.label}
                        className="group relative overflow-hidden p-6 rounded-2xl 
                                 bg-white/40 dark:bg-gray-800/40 
                                 backdrop-blur-xl border border-white/20 dark:border-gray-700/30
                                 shadow-lg transition-transform hover:-translate-y-1"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />

                        <div className="flex items-center justify-between relative z-10">
                            <div>
                                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{card.label}</p>
                                <p className="text-4xl font-bold mt-2 text-gray-900 dark:text-white">{card.value}</p>
                            </div>
                            <div className={`p-4 rounded-xl shadow-inner ${card.bg}`}>
                                <card.icon className={`w-6 h-6 ${card.color}`} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Category Breakdown & Recent Blogs */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Category Stats */}
                <div className="p-6 rounded-2xl bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 shadow-lg lg:col-span-1">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center space-x-2">
                        <FolderOpen className="w-5 h-5 text-blue-500" />
                        <span>Categories</span>
                    </h2>
                    <div className="space-y-4">
                        {Object.keys(categoryStats).length === 0 ? (
                            <p className="text-gray-500 text-sm">No data available.</p>
                        ) : (
                            Object.entries(categoryStats).map(([cat, count]) => {
                                const percentage = stats.blogs > 0 ? Math.round((count / stats.blogs) * 100) : 0;
                                return (
                                    <div key={cat} className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="font-semibold text-gray-700 dark:text-gray-300">{cat}</span>
                                            <span className="text-gray-900 dark:text-white">{count} ({percentage}%)</span>
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                                            <div 
                                                className="bg-blue-600 h-full rounded-full" 
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Recent Blogs */}
                <div className="p-6 rounded-2xl bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 shadow-lg lg:col-span-2">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center space-x-2">
                        <FileText className="w-5 h-5 text-purple-500" />
                        <span>Recent Blog Posts</span>
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400">
                                    <th className="pb-3">Title</th>
                                    <th className="pb-3">Author</th>
                                    <th className="pb-3">Status</th>
                                    <th className="pb-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-150 dark:divide-gray-750">
                                {recentBlogs.map(blog => (
                                    <tr key={blog.id} className="text-gray-700 dark:text-gray-300">
                                        <td className="py-3 max-w-[180px] truncate font-medium">{blog.title}</td>
                                        <td className="py-3">{blog.author?.full_name || '...'}</td>
                                        <td className="py-3">
                                            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${blog.published ? 'bg-green-100 text-green-800 dark:bg-green-900/30' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30'}`}>
                                                {blog.published ? 'Live' : 'Draft'}
                                            </span>
                                        </td>
                                        <td className="py-3 text-right">
                                            <button 
                                                onClick={() => togglePublishStatus(blog)}
                                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-850 rounded-lg text-gray-500 dark:text-gray-400 hover:text-purple-500 transition-colors"
                                                title={blog.published ? 'Unpublish' : 'Publish'}
                                            >
                                                {blog.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Recent Users & Contact Submissions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                {/* Recent Users */}
                <div className="p-6 rounded-2xl bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 shadow-lg">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center space-x-2">
                        <Users className="w-5 h-5 text-green-500" />
                        <span>Recent Registrations</span>
                    </h2>
                    <div className="space-y-4">
                        {recentUsers.map(user => (
                            <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50/50 dark:bg-gray-900/20 rounded-xl">
                                <div className="flex items-center space-x-3">
                                    <img src={user.avatar_url} className="w-10 h-10 rounded-full bg-gray-200" alt="" />
                                    <div>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">{user.full_name}</p>
                                        <p className="text-xs text-gray-500">{user.email}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => toggleUserRole(user)}
                                    className={`p-2 rounded-lg transition-colors ${user.role === 'admin' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800'}`}
                                    title={user.role === 'admin' ? 'Demote user' : 'Make admin'}
                                >
                                    <Shield className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Contact Submissions */}
                <div className="p-6 rounded-2xl bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 shadow-lg">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center space-x-2">
                        <Mail className="w-5 h-5 text-orange-500" />
                        <span>Support Messages</span>
                    </h2>
                    <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
                        {contactMessages.length === 0 ? (
                            <p className="text-gray-500 text-sm text-center py-12">No messages received.</p>
                        ) : (
                            contactMessages.map(msg => (
                                <div key={msg.id} className="p-4 bg-gray-50/60 dark:bg-gray-900/30 border border-gray-150 dark:border-gray-850 rounded-xl relative group">
                                    <button
                                        onClick={() => handleDeleteContact(msg.id)}
                                        className="absolute top-4 right-4 p-1 text-gray-400 hover:text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                        title="Delete Message"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                    <div className="flex justify-between items-center mb-2">
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">{msg.name}</p>
                                        <span className="text-xs text-gray-400 flex items-center">
                                            <Calendar className="w-3 h-3 mr-1" />
                                            {formatDate(msg.created_at)}
                                        </span>
                                    </div>
                                    <a href={`mailto:${msg.email}`} className="text-xs text-blue-600 dark:text-blue-400 hover:underline mb-2 block font-medium">
                                        {msg.email}
                                    </a>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap mt-2 bg-white/40 dark:bg-gray-950/20 p-2.5 rounded-lg border border-gray-100 dark:border-gray-900">
                                        {msg.message}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
