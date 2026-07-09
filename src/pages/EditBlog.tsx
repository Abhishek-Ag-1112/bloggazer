import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { fetchBlogBySlug } from '../utils/firebaseHelpers';
import { Blog, User } from '../types';
import ReactMde from 'react-mde'; // <-- 1. IMPORT
import ReactMarkdown from 'react-markdown'; // <-- 2. IMPORT

const EditBlog: React.FC = () => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    coverImage: '',
    category: 'Technology',
    tags: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  // 3. ADD STATE FOR TAB
  const [selectedTab, setSelectedTab] = useState<'write' | 'preview'>('write');

  // --- CO-AUTHORS STATE ---
  const [coAuthors, setCoAuthors] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);

  // Search users for co-author matching
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    const searchUsers = async () => {
      try {
        const { query, collection, where, getDocs, limit } = await import('firebase/firestore');
        const q = query(
          collection(db, 'users'),
          where('username', '>=', searchQuery.toLowerCase()),
          where('username', '<=', searchQuery.toLowerCase() + '\uf8ff'),
          limit(5)
        );
        const snap = await getDocs(q);
        const matches = snap.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as User))
          .filter(u => u.id !== user?.id && !coAuthors.some(existing => existing.id === u.id));
        setSearchResults(matches);
      } catch (e) {
        console.error("Error searching users:", e);
      }
    };
    const timer = setTimeout(searchUsers, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, coAuthors, user]);

  const handleAddCoAuthor = (targetUser: User) => {
    setCoAuthors([...coAuthors, targetUser]);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleRemoveCoAuthor = (id: string) => {
    setCoAuthors(coAuthors.filter(u => u.id !== id));
  };

  useEffect(() => {
    if (!slug) {
      navigate('/');
      return;
    }

    const getBlog = async () => {
      setLoading(true);
      const foundBlog = await fetchBlogBySlug(slug);

      if (!foundBlog) {
        alert('Blog not found!');
        navigate('/profile');
        return;
      }

      if (foundBlog.author_id !== user?.id) {
        alert('You are not authorized to edit this blog.');
        navigate('/profile');
        return;
      }

      setBlog(foundBlog);
      setCoAuthors(foundBlog.co_authors || []);
      setFormData({
        title: foundBlog.title,
        content: foundBlog.content, // This content is now Markdown
        excerpt: foundBlog.excerpt,
        coverImage: foundBlog.cover_image,
        category: foundBlog.category,
        tags: foundBlog.tags.join(', '),
      });
      setLoading(false);
    };

    if (user) {
      getBlog();
    }
  }, [slug, user, navigate]);

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !blog) return;

    setIsSubmitting(true);

    const newSlug = formData.title
      .toLowerCase()
      .trim()
      .replace(/[\s\W-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const blogRef = doc(db, 'blogs', blog.id);

    try {
      await updateDoc(blogRef, {
        title: formData.title,
        slug: newSlug,
        content: formData.content, // Save the Markdown content
        excerpt: formData.excerpt,
        cover_image: formData.coverImage,
        category: formData.category,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
        co_author_ids: coAuthors.map(u => u.id), // Store co-author user IDs
        updated_at: serverTimestamp(),
      });
      alert('Blog updated successfully!');
      navigate(`/blog/${newSlug}`); 
    } catch (error) {
      console.error('Error updating blog:', error);
      alert('Failed to update blog. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // 4. HANDLER FOR MARKDOWN EDITOR
  const handleContentChange = (value: string) => {
    setFormData({ ...formData, content: value });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading blog data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="text-gray-900 dark:text-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-gray-700 dark:text-blue-100 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <h1 className="text-4xl sm:text-5xl font-bold">Edit Blog Post</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-8">
          <div className="space-y-6">
            
            {/* Title (Unchanged) */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-semibold text-gray-900 dark:text-white mb-2"
              >
                Blog Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-lg font-medium"
                placeholder="Enter your blog title"
              />
            </div>

            {/* Co-Authors Selection */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-250 dark:border-gray-750">
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Co-authors (Collaborators)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search registered user by username..."
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-850 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
                
                {/* Search Results Dropdown */}
                {searchResults.length > 0 && (
                  <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto">
                    {searchResults.map(match => (
                      <button
                        key={match.id}
                        type="button"
                        onClick={() => handleAddCoAuthor(match)}
                        className="w-full flex items-center space-x-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-850 text-left transition-colors cursor-target"
                      >
                        <img src={match.avatar_url} alt={match.full_name} className="w-8 h-8 rounded-full" />
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{match.full_name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">@{match.username}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected Co-Authors Chips */}
              {coAuthors.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {coAuthors.map(author => (
                    <div
                      key={author.id}
                      className="flex items-center space-x-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 rounded-full border border-blue-100 dark:border-blue-900/50"
                    >
                      <img src={author.avatar_url} alt={author.full_name} className="w-5 h-5 rounded-full" />
                      <span className="text-sm font-medium">{author.full_name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCoAuthor(author.id)}
                        className="text-xs hover:text-red-500 font-bold transition-colors cursor-pointer pl-1"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Excerpt (Unchanged) */}
            <div>
              <label
                htmlFor="excerpt"
                className="block text-sm font-semibold text-gray-900 dark:text-white mb-2"
              >
                Short Description *
              </label>
              <input
                type="text"
                id="excerpt"
                name="excerpt"
                value={formData.excerpt}
                onChange={handleChange}
                required
                maxLength={200}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Brief description (max 200 characters)"
              />
            </div>

            {/* Cover Image (Unchanged) */}
            <div>
              <label
                htmlFor="coverImage"
                className="block text-sm font-semibold text-gray-900 dark:text-white mb-2"
              >
                Cover Image URL *
              </label>
              <input
                type="url"
                id="coverImage"
                name="coverImage"
                value={formData.coverImage}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            {/* Category and Tags (Unchanged) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-semibold text-gray-900 dark:text-white mb-2"
                >
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                >
                  <option value="Technology">Technology</option>
                  <option value="Design">Design</option>
                  <option value="Lifestyle">Lifestyle</option>
                  <option value="Personal">Personal</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="tags"
                  className="block text-sm font-semibold text-gray-900 dark:text-white mb-2"
                >
                  Tags
                </label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="React, JavaScript, Web Dev"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Separate tags with commas
                </p>
              </div>
            </div>

            {/* --- 5. REPLACE THE TEXTAREA WITH ReactMde --- */}
            <div>
              <label
                htmlFor="content"
                className="block text-sm font-semibold text-gray-900 dark:text-white mb-2"
              >
                Content *
              </label>
              <div className="prose dark:prose-invert max-w-none">
                <ReactMde
                  value={formData.content}
                  onChange={handleContentChange}
                  selectedTab={selectedTab}
                  onTabChange={setSelectedTab}
                  generateMarkdownPreview={(markdown) => // <-- UPDATED THIS
                    Promise.resolve(
                      <div className="prose dark:prose-invert p-5">
                        <ReactMarkdown>
                          {markdown}
                        </ReactMarkdown>
                      </div>
                    )
                  }
                  childProps={{
                    writeButton: {
                      tabIndex: -1
                    },
                    previewButton: {
                      tabIndex: -1
                    },
                    textArea: {
                      required: true,
                      rows: 16
                      // <-- className removed
                    }
                  }}
                />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Supports Markdown formatting.
              </p>
            </div>
            {/* --- END OF REPLACEMENT --- */}

            {/* Buttons (Unchanged) */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-800">
              <button
                type="button"
                onClick={() => navigate(-1)}
                disabled={isSubmitting}
                className="px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                <span>{isSubmitting ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBlog;