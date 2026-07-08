import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase'; // <-- RESTORED
import ReactMde from 'react-mde'; // <-- RESTORED
import ReactMarkdown from 'react-markdown'; // <-- RESTORED
import { uploadImage } from '../utils/firebaseHelpers';

const CreateBlog: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    coverImage: '',
    category: 'Technology',
    tags: '',
  });
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null); // <-- NEW STATE
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'write' | 'preview'>('write');

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);

    try {
      let coverImageUrl = formData.coverImage;

      // Upload image if a file is selected
      if (coverImageFile) {
        coverImageUrl = await uploadImage(coverImageFile, 'blog-covers');
      }

      const slug = formData.title
        .toLowerCase()
        .trim()
        .replace(/[\s\W-]+/g, '-')
        .replace(/^-+|-+$/g, '');

      await addDoc(collection(db, 'blogs'), {
        author_id: user.id,
        title: formData.title,
        slug: slug,
        content: formData.content,
        excerpt: formData.excerpt,
        cover_image: coverImageUrl, // Use the uploaded URL or existing string
        category: formData.category,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
        views: 0,
        published: true,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
        likes: [],
      });
      alert('Blog created successfully!');
      navigate('/blogs');
    } catch (error) {
      console.error('Error creating blog:', error);
      alert('Failed to create blog. Please try again.');
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

  const handleContentChange = (value: string) => {
    setFormData({ ...formData, content: value });
  };

  // New handler for file input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverImageFile(file);
      // Create a fake URL for preview
      setFormData({ ...formData, coverImage: URL.createObjectURL(file) });
    }
  };

  const suggestedImages = [
    'https://images.pexels.com/photos/11035471/pexels-photo-11035471.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/1166643/pexels-photo-1166643.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/270404/pexels-photo-270404.jpeg?auto=compress&cs=tinysrgb&w=1200',
  ];

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
          <h1 className="text-4xl sm:text-5xl font-bold">Create New Blog</h1>
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
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {formData.excerpt.length}/200 characters
              </p>
            </div>

            {/* Cover Image - UPDATED */}
            <div>
              <label
                className="block text-sm font-semibold text-gray-900 dark:text-white mb-2"
              >
                Cover Image *
              </label>

              <div className="space-y-4">
                {/* File Input */}
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500 dark:text-gray-400
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100
                      dark:file:bg-gray-800 dark:file:text-blue-400
                    "
                  />
                  <p className="text-xs text-gray-500 mt-1">Upload an image from your device</p>
                </div>

                {/* OR URL Input */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-2 bg-white dark:bg-gray-900 text-sm text-gray-500">Or use a URL</span>
                  </div>
                </div>

                <input
                  type="url"
                  name="coverImage"
                  value={!coverImageFile ? formData.coverImage : ''} // Clear if file selected
                  onChange={(e) => {
                    setCoverImageFile(null); // Clear file if URL typed
                    handleChange(e);
                  }}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="https://example.com/image.jpg"
                  disabled={!!coverImageFile}
                />
              </div>

              <div className="mt-3">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Or choose from suggestions:
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {suggestedImages.map((url, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        setCoverImageFile(null);
                        setFormData({ ...formData, coverImage: url });
                      }}
                      className={`relative h-20 rounded-lg overflow-hidden border-2 transition-all ${formData.coverImage === url && !coverImageFile
                        ? 'border-blue-600 ring-2 ring-blue-500'
                        : 'border-gray-300 dark:border-gray-700 hover:border-blue-400'
                        }`}
                    >
                      <img src={url} alt={`Option ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {formData.coverImage && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Preview:
                  </p>
                  <img
                    src={formData.coverImage}
                    alt="Cover preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              )}
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
                  generateMarkdownPreview={(markdown) =>
                    Promise.resolve(
                      <div className="prose dark:prose-invert p-5">
                        <ReactMarkdown>{markdown}</ReactMarkdown>
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
                      placeholder: "Write your blog content here... Supports Markdown!",
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
                <span>{isSubmitting ? 'Publishing...' : 'Publish Blog'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBlog;