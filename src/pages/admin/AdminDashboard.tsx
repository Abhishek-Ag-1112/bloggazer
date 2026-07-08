// src/pages/admin/AdminDashboard.tsx
import React, { useEffect, useState } from 'react';
import { collection, getCountFromServer, query, where } from 'firebase/firestore';
import { db } from '../../firebase';
import { Users, FileText, Eye, TrendingUp } from 'lucide-react';

const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState({
        users: 0,
        blogs: 0,
        activeUsers: 0,
        publishedBlogs: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const usersColl = collection(db, 'users');
                const blogsColl = collection(db, 'blogs');

                // Total Users
                const usersSnapshot = await getCountFromServer(usersColl);

                // Active Users (Assuming 'status' == 'active')
                const activeUsersQuery = query(usersColl, where('status', '==', 'active'));
                const activeUsersSnapshot = await getCountFromServer(activeUsersQuery);

                // Total Blogs
                const blogsSnapshot = await getCountFromServer(blogsColl);

                // Published Blogs
                const publishedBlogsQuery = query(blogsColl, where('published', '==', true));
                const publishedBlogsSnapshot = await getCountFromServer(publishedBlogsQuery);

                setStats({
                    users: usersSnapshot.data().count,
                    activeUsers: activeUsersSnapshot.data().count,
                    blogs: blogsSnapshot.data().count,
                    publishedBlogs: publishedBlogsSnapshot.data().count
                });
            } catch (error) {
                console.error("Error fetching admin stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const statCards = [
        { label: 'Total Users', value: stats.users, icon: Users, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/20' },
        { label: 'Active Users', value: stats.activeUsers, icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/20' },
        { label: 'Total Blogs', value: stats.blogs, icon: FileText, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/20' },
        { label: 'Published', value: stats.publishedBlogs, icon: Eye, color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/20' },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
                Dashboard Overview
            </h1>

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

            {/* Placeholder for charts or recent activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                <div className="p-8 rounded-2xl bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 shadow-lg min-h-[350px] flex flex-col items-center justify-center text-gray-400">
                    <TrendingUp className="w-16 h-16 mb-4 opacity-50" />
                    <span className="font-medium text-lg">Activity Chart Coming Soon</span>
                </div>
                <div className="p-8 rounded-2xl bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 shadow-lg min-h-[350px] flex flex-col items-center justify-center text-gray-400">
                    <Users className="w-16 h-16 mb-4 opacity-50" />
                    <span className="font-medium text-lg">Recent User Activity</span>
                </div>
            </div>
        </div>
    );

};

export default AdminDashboard;
