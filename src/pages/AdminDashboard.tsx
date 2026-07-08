import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  limit 
} from 'firebase/firestore';
import { deleteBlog } from '../utils/firebaseHelpers';
import { Blog, User, Comment } from '../types';
import { Users, FileText, MessageSquare, ShieldAlert, Trash2, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminDashboard: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [activeTab, setActiveTab] = useState<'blogs' | 'comments' | 'users'>('blogs');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Users
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const fetchedUsers = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as User[];
      setUsers(fetchedUsers);

      const userMap = new Map<string, User>();
      fetchedUsers.forEach(u => userMap.set(u.id, u));

      // 2. Fetch Blogs
      const blogsSnapshot = await getDocs(query(collection(db, 'blogs'), orderBy('created_at', 'desc')));
      const fetchedBlogs = blogsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          created_at: data.created_at ? data.created_at.toDate().toISOString() : new Date().toISOString(),
          updated_at: data.updated_at ? data.updated_at.toDate().toISOString() : new Date().toISOString(),
          author: userMap.get(data.author_id)
        };
      }) as Blog[];
      setBlogs(fetchedBlogs);

      // 3. Fetch Comments
      const commentsSnapshot = await getDocs(query(collection(db, 'comments'), orderBy('created_at', 'desc'), limit(100)));
      const fetchedComments = commentsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          created_at: data.created_at ? data.created_at.toDate().toISOString() : new Date().toISOString(),
          edited_at: data.edited_at ? data.edited_at.toDate().toISOString() : null,
          user: userMap.get(data.user_id)
        };
      }) as Comment[];
      setComments(fetchedComments);

    } catch (error) {
      console.error("Error loading admin data: ", error);
      toast.error("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTogglePublish = async (blog: Blog) => {
    const nextPublishedState = !blog.published;
    const toastId = toast.loading('Updating publish status...');
    try {
      await updateDoc(doc(db, 'blogs', blog.id), {
        published: nextPublishedState
      });
      setBlogs(prev => prev.map(b => b.id === blog.id ? { ...b, published: nextPublishedState } : b));
      toast.success(nextPublishedState ? 'Post published!' : 'Post unpublished!', { id: toastId });
    } catch (e) {
      console.error(e);
      toast.error('Failed to update post.', { id: toastId });
    }
  };

  const handleDeleteBlog = async (blogId: string) => {
    if (!window.confirm("Are you sure you want to delete this post and all its comments? This cannot be undone.")) return;
    const toastId = toast.loading('Deleting blog post...');
    try {
      await deleteBlog(blogId);
      setBlogs(prev => prev.filter(b => b.id !== blogId));
      setComments(prev => prev.filter(c => c.blog_id !== blogId));
      toast.success('Post deleted successfully.', { id: toastId });
    } catch (e) {
      console.error(e);
      toast.error('Failed to delete post.', { id: toastId });
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm("Are you sure you want to delete this comment? This cannot be undone.")) return;
    const toastId = toast.loading('Deleting comment...');
    try {
      await deleteDoc(doc(db, 'comments', commentId));
      setComments(prev => prev.filter(c => c.id !== commentId));
      toast.success('Comment deleted.', { id: toastId });
    } catch (e) {
      console.error(e);
      toast.error('Failed to delete comment.', { id: toastId });
    }
  };

  const handleToggleUserRole = async (targetUser: User) => {
    const nextRole = targetUser.role === 'admin' ? 'user' : 'admin';
    if (!window.confirm(`Are you sure you want to change this user's role to ${nextRole}?`)) return;
    const toastId = toast.loading('Updating user role...');
    try {
      await updateDoc(doc(db, 'users', targetUser.id), {
        role: nextRole
      });
      setUsers(prev => prev.map(u => u.id === targetUser.id ? { ...u, role: nextRole } : u));
      toast.success(`User role updated to ${nextRole}.`, { id: toastId });
    } catch (e) {
      console.error(e);
      toast.error('Failed to update user role.', { id: toastId });
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="text-gray-900 dark:text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-red-100 dark:bg-red-950/50 rounded-lg">
              <ShieldAlert className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold">Admin Moderation</h1>
          </div>
          <p className="text-xl text-gray-700 dark:text-blue-100">
            Monitor and manage posts, comments, and users.
          </p>
        </div>
      </div>

      {/* Main Panel */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white/65 dark:bg-gray-950/40 backdrop-blur-md rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
          
          {/* Tab Headers */}
          <div className="flex border-b border-gray-200 dark:border-gray-800">
            <button
              onClick={() => setActiveTab('blogs')}
              className={`flex items-center space-x-2 px-6 py-4 font-semibold text-lg border-b-2 transition-all cursor-pointer
                ${activeTab === 'blogs' 
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400' 
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
              <FileText className="w-5 h-5" />
              <span>Blogs ({blogs.length})</span>
            </button>
            
            <button
              onClick={() => setActiveTab('comments')}
              className={`flex items-center space-x-2 px-6 py-4 font-semibold text-lg border-b-2 transition-all cursor-pointer
                ${activeTab === 'comments' 
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400' 
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
              <MessageSquare className="w-5 h-5" />
              <span>Comments ({comments.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center space-x-2 px-6 py-4 font-semibold text-lg border-b-2 transition-all cursor-pointer
                ${activeTab === 'users' 
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400' 
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
              <Users className="w-5 h-5" />
              <span>Users ({users.length})</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6 sm:p-8">
            {loading ? (
              <p className="text-center text-gray-700 dark:text-gray-300 py-12">Loading moderation records...</p>
            ) : (
              <div>
                
                {/* --- BLOGS TAB --- */}
                {activeTab === 'blogs' && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 font-medium">
                          <th className="py-4 px-2">Title</th>
                          <th className="py-4 px-2">Author</th>
                          <th className="py-4 px-2">Category</th>
                          <th className="py-4 px-2">Status</th>
                          <th className="py-4 px-2">Views</th>
                          <th className="py-4 px-2 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {blogs.map(blog => (
                          <tr key={blog.id} className="border-b border-gray-100 dark:border-gray-800/50 hover:bg-gray-50/20 dark:hover:bg-gray-900/10">
                            <td className="py-4 px-2 font-medium text-gray-900 dark:text-white max-w-xs truncate">
                              <a href={`/blog/${blog.slug}`} target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-blue-500">
                                {blog.title}
                              </a>
                            </td>
                            <td className="py-4 px-2 text-gray-600 dark:text-gray-400">{blog.author?.full_name || 'Unknown'}</td>
                            <td className="py-4 px-2 text-gray-600 dark:text-gray-400">{blog.category}</td>
                            <td className="py-4 px-2">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                ${blog.published 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200' 
                                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200'}`}>
                                {blog.published ? 'Published' : 'Draft'}
                              </span>
                            </td>
                            <td className="py-4 px-2 text-gray-600 dark:text-gray-400">{blog.views}</td>
                            <td className="py-4 px-2 text-right space-x-2">
                              <button
                                onClick={() => handleTogglePublish(blog)}
                                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                                title={blog.published ? 'Unpublish Post' : 'Publish Post'}
                              >
                                {blog.published ? <XCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                              </button>
                              <button
                                onClick={() => handleDeleteBlog(blog.id)}
                                className="p-2 rounded-lg bg-red-100 hover:bg-red-200 dark:bg-red-950/40 dark:hover:bg-red-950 text-red-600 dark:text-red-400 transition-colors"
                                title="Delete Post"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* --- COMMENTS TAB --- */}
                {activeTab === 'comments' && (
                  <div className="space-y-4">
                    {comments.length === 0 ? (
                      <p className="text-center text-gray-500 py-12">No comments to moderate.</p>
                    ) : (
                      comments.map(comment => (
                        <div key={comment.id} className="p-4 bg-gray-50/50 dark:bg-gray-900/20 border border-gray-100 dark:border-gray-800/80 rounded-lg flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center space-x-2 mb-2">
                              <img src={comment.user?.avatar_url} alt={comment.user?.full_name} className="w-6 h-6 rounded-full" />
                              <span className="font-semibold text-gray-900 dark:text-white">{comment.user?.full_name || 'Anonymous'}</span>
                              <span className="text-xs text-gray-500">
                                {new Date(comment.created_at).toLocaleDateString()} at {new Date(comment.created_at).toLocaleTimeString()}
                              </span>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300">{comment.content}</p>
                          </div>
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="p-2 rounded-lg bg-red-100 hover:bg-red-200 dark:bg-red-950/40 dark:hover:bg-red-950 text-red-600 dark:text-red-400 transition-colors self-center flex-shrink-0"
                            title="Delete Comment"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* --- USERS TAB --- */}
                {activeTab === 'users' && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 font-medium">
                          <th className="py-4 px-2">Name</th>
                          <th className="py-4 px-2">Username</th>
                          <th className="py-4 px-2">Email</th>
                          <th className="py-4 px-2">Role</th>
                          <th className="py-4 px-2 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map(u => (
                          <tr key={u.id} className="border-b border-gray-100 dark:border-gray-800/50 hover:bg-gray-50/20 dark:hover:bg-gray-900/10">
                            <td className="py-4 px-2 font-medium text-gray-900 dark:text-white flex items-center space-x-2">
                              <img src={u.avatar_url} alt={u.full_name} className="w-8 h-8 rounded-full" />
                              <span>{u.full_name}</span>
                            </td>
                            <td className="py-4 px-2 text-gray-600 dark:text-gray-400">@{u.username || 'unset'}</td>
                            <td className="py-4 px-2 text-gray-600 dark:text-gray-400">{u.email}</td>
                            <td className="py-4 px-2">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                ${u.role === 'admin' 
                                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200' 
                                  : 'bg-gray-100 text-gray-800 dark:bg-gray-850 dark:text-gray-200'}`}>
                                {u.role === 'admin' ? 'Admin' : 'User'}
                              </span>
                            </td>
                            <td className="py-4 px-2 text-right">
                              <button
                                onClick={() => handleToggleUserRole(u)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-semibold border transition-colors cursor-pointer
                                  ${u.role === 'admin'
                                    ? 'border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                                    : 'border-blue-500 hover:bg-blue-600 text-blue-600 dark:text-blue-400 hover:text-white dark:hover:text-white'}`}
                              >
                                {u.role === 'admin' ? 'Demote' : 'Promote Admin'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
