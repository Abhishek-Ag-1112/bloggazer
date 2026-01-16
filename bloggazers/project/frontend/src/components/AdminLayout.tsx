// src/components/AdminLayout.tsx
import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    FileText,
    Menu,
    X,
    LogOut,
    Home
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const AdminLayout: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();
    const { signOut } = useAuth();
    const { isDark } = useTheme();

    const navigation = [
        { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { name: 'Users', href: '/admin/users', icon: Users },
        { name: 'Blogs', href: '/admin/blogs', icon: FileText },
    ];

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    // Matches the App.tsx background logic roughly, assuming DotGrid is behind everything in <App />
    // However, since AdminLayout is an <Outlet> child of <App>, the background from <App> might already be visible 
    // IF AdminLayout was transparent. But AdminLayout has 'bg-gray-900' etc.
    // We should make AdminLayout transparent or semi-transparent to let the global DotGrid show through, OR re-implement it.
    // Given App.tsx structure: 
    // <div className="min-h-screen ... relative">
    //    <div className="fixed inset-0 ... z-0"><DotGrid ... /></div>
    //    <div className="relative z-10"> ... <Routes> ... </Routes> ... </div>
    // </div>
    // So the DotGrid is ALREADY background. We just need to remove the opaque background from AdminLayout.

    return (
        <div className="min-h-screen flex relative"> {/* Removed bg-gray-900/bg-gray-50 to let App's DotGrid show */}

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden backdrop-blur-sm"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar with Glassmorphism */}
            <aside
                className={`fixed top-0 left-0 z-50 h-screen w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:block
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                ${isDark
                        ? 'bg-gray-950/75 border-r border-white/10'
                        : 'bg-white/75 border-r border-gray-200/50'}
                backdrop-blur-xl
                `}
            >
                <div className="h-full flex flex-col">
                    {/* Sidebar Header */}
                    <div className={`h-20 flex items-center px-6 border-b ${isDark ? 'border-white/10' : 'border-gray-200/50'}`}>
                        <div className="flex items-center space-x-3">
                            <img src="/Bloggs.png" alt="Logo" className="h-8 w-auto" />
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                                Admin
                            </span>
                        </div>
                        <button
                            className="ml-auto lg:hidden p-2 rounded-md hover:bg-gray-100/10"
                            onClick={() => setSidebarOpen(false)}
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
                        <div className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4 px-4">
                            Main Menu
                        </div>
                        {navigation.map((item) => {
                            const isActive = location.pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group
                                    ${isActive
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                            : 'hover:bg-gray-100/50 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}
                                    `}
                                    onClick={() => setSidebarOpen(false)}
                                >
                                    <item.icon className={`w-5 h-5 mr-3 transition-colors ${isActive ? 'text-white' : 'group-hover:text-blue-500'}`} />
                                    <span className="font-medium">{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Sidebar Footer */}
                    <div className={`p-4 border-t ${isDark ? 'border-white/10' : 'border-gray-200/50'} space-y-2`}>
                        <Link
                            to="/"
                            className="flex items-center px-4 py-3 rounded-xl transition-colors hover:bg-gray-100/50 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400"
                        >
                            <Home className="w-5 h-5 mr-3" />
                            <span className="font-medium">Back to Site</span>
                        </Link>
                        <button
                            onClick={signOut}
                            className="w-full flex items-center px-4 py-3 rounded-xl transition-colors hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                        >
                            <LogOut className="w-5 h-5 mr-3" />
                            <span className="font-medium">Logout</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Mobile Header */}
                <header className={`lg:hidden h-16 flex items-center justify-between px-4 border-b ${isDark ? 'border-white/10 bg-gray-950/80' : 'border-gray-200 bg-white/80'} backdrop-blur-md sticky top-0 z-30`}>
                    <span className="font-bold text-lg">Admin Panel</span>
                    <button onClick={toggleSidebar} className="p-2 -mr-2">
                        <Menu className="w-6 h-6" />
                    </button>
                </header>

                <main className="flex-1 overflow-y-auto p-4 lg:p-8 relative scroll-smooth">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
