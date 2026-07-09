import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Folder, ArrowLeft, Trash2, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { Blog, ReadingList } from '../types';
import { fetchBlogs } from '../utils/firebaseHelpers';
import BlogCard from '../components/BlogCard';
import PageLoader from '../components/PageLoader';
import toast from 'react-hot-toast';

const ReadingListsPage: React.FC = () => {
  const { user } = useAuth();
  const [lists, setLists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedListId, setExpandedListId] = useState<string | null>(null);

  const getReadingLists = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const q = query(
        collection(db, 'reading_lists'),
        where('user_id', '==', user.id)
      );
      const snap = await getDocs(q);
      const listsData = snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      })) as ReadingList[];

      // Fetch all public blogs to map them
      const { blogs: allBlogs } = await fetchBlogs([], 1000, null);
      const blogMap = new Map<string, Blog>();
      allBlogs.forEach(b => blogMap.set(b.id, b));

      // Map lists with blogs populated
      const listsWithBlogs = listsData.map(list => {
        const blogsInList = (list.blog_ids || [])
          .map(id => blogMap.get(id))
          .filter(Boolean) as Blog[];
        return {
          ...list,
          blogs: blogsInList
        };
      });

      setLists(listsWithBlogs);
    } catch (e) {
      console.error("Error loading reading lists:", e);
      toast.error("Failed to load reading lists.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      getReadingLists();
    }
  }, [user]);

  const handleDeleteList = async (e: React.MouseEvent, listId: string) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this reading list? This cannot be undone.")) return;
    try {
      await deleteDoc(doc(db, 'reading_lists', listId));
      setLists(prev => prev.filter(l => l.id !== listId));
      if (expandedListId === listId) setExpandedListId(null);
      toast.success("Reading list deleted.");
    } catch (e) {
      console.error("Error deleting reading list:", e);
      toast.error("Failed to delete reading list.");
    }
  };

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <Folder className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                My Reading Lists
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {lists.length} {lists.length === 1 ? 'collection' : 'collections'} created
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

        {lists.length === 0 ? (
          <div className="text-center py-20 bg-white/65 dark:bg-gray-950/40 rounded-2xl border border-gray-200 dark:border-gray-800">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-6">
              <Folder className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No reading lists yet
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-8">
              Organize posts into named collections. Create lists and add items from any blog post page.
            </p>
            <Link
              to="/blogs"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Explore Blogs
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {lists.map((list) => {
              const isExpanded = expandedListId === list.id;
              return (
                <div 
                  key={list.id} 
                  className="bg-white/65 dark:bg-gray-950/40 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-md transition-all"
                >
                  <div 
                    onClick={() => setExpandedListId(isExpanded ? null : list.id)}
                    className="p-6 flex items-center justify-between cursor-pointer hover:bg-gray-50/50 dark:hover:bg-gray-900/35 transition-colors select-none"
                  >
                    <div className="flex items-center space-x-4">
                      <Folder className="w-6 h-6 text-blue-500" />
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{list.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {list.blogs.length} {list.blogs.length === 1 ? 'post' : 'posts'} inside
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={(e) => handleDeleteList(e, list.id)}
                        className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-red-500 hover:text-red-600 transition-colors cursor-pointer"
                        title="Delete List"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-6 bg-gray-50/40 dark:bg-gray-900/20 border-t border-gray-100 dark:border-gray-850">
                      {list.blogs.length === 0 ? (
                        <div className="text-center py-8">
                          <BookOpen className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500 dark:text-gray-400">This list is currently empty.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {list.blogs.map((blog: Blog) => (
                            <BlogCard key={blog.id} blog={blog} />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReadingListsPage;
