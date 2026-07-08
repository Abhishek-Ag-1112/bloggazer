// src/components/BlogCard.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Eye, User, Heart, Edit, Trash2 } from 'lucide-react'; // <-- ADD ICONS
import { Blog } from '../types';

interface BlogCardProps {
  blog: Blog;
  showAdminControls?: boolean; // <-- ADD THIS
  onEdit?: (slug: string) => void;  // <-- ADD THIS
  onDelete?: (id: string) => void; // <-- ADD THIS
}

const BlogCard: React.FC<BlogCardProps> = ({ 
  blog, 
  showAdminControls = false, 
  onEdit, 
  onDelete 
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Stop Link navigation
    e.stopPropagation();
    if (onEdit) onEdit(blog.slug);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Stop Link navigation
    e.stopPropagation();
    if (onDelete) onDelete(blog.id);
  };

  return (
    <article className="group bg-white/65 dark:bg-gray-950/45 rounded-xl overflow-hidden shadow-xl hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-900 flex flex-col">
      <Link to={`/blog/${blog.slug}`} className="block">
        <div className="relative h-48 overflow-hidden">
          <img
            src={blog.cover_image}
            alt={blog.title}
            className="w-full h-full object-cover "
          />
          <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
            {blog.category}
          </div>
        </div>
      </Link>

      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 dark:text-gray-400 mb-3">
          <div className="flex items-center space-x-1">
            <User className="w-4 h-4" />
            <span>{blog.author?.full_name || '...'}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(blog.created_at)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Eye className="w-4 h-4" />
            <span>{blog.views}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Heart className="w-4 h-4" />
            <span>{blog.likes?.length || 0}</span>
          </div>
        </div>

        <Link to={`/blog/${blog.slug}`} className="block">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
            {blog.title}
          </h2>
        </Link>

        <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 flex-grow">
          {blog.excerpt}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {blog.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* --- MODIFY THIS BLOCK --- */}
        <div className="mt-auto flex items-center justify-between">
          <Link
            to={`/blog/${blog.slug}`}
            className="inline-flex items-center text-blue-600 dark:text-blue-400 font-medium hover:underline"
          >
            Read More
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          
          {/* --- ADD THIS BLOCK --- */}
          {showAdminControls && (
            <div className="flex space-x-2">
              <button
                onClick={handleEditClick}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
                aria-label="Edit post"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={handleDeleteClick}
                className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-800 text-red-600 dark:text-red-500 transition-colors"
                aria-label="Delete post"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
          {/* --- END ADDED BLOCK --- */}
        </div>
        {/* --- END MODIFIED BLOCK --- */}

      </div>
    </article>
  );
};

export default BlogCard;