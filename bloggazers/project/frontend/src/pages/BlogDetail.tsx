// src/pages/BlogDetail.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Calendar,
  Eye,
  ArrowLeft,
  Twitter,
  Linkedin,
  Facebook,
  MessageCircle,
  Heart,
  CornerDownRight, // <-- ADDED FOR REPLIES
  X, // <-- ADDED FOR CANCEL REPLY
  Edit2, // <-- ADDED FOR EDIT
  Trash2, // <-- ADDED FOR DELETE
  Bookmark // <-- ADDED FOR BOOKMARK
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BlogCard from '../components/BlogCard';
import { Blog, Comment } from '../types';
import {
  fetchBlogBySlug,
  fetchComments,
  fetchBlogs,
  incrementBlogView,
  updateCommentContent, // <-- IMPORT
  deleteCommentsBatch, // <-- IMPORT
  toggleBookmark, // <-- IMPORT
  fetchUser // <-- IMPORT
} from '../utils/firebaseHelpers';
import { db } from '../firebase';
import {
  collection,
  addDoc,
  serverTimestamp,
  where,
  limit,
  orderBy,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
// 1. REMOVE DOMPurify
// import DOMPurify from 'dompurify'; 
// 2. IMPORT ReactMarkdown and remark-gfm
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import PageLoader from '../components/PageLoader'; // <-- IMPORTED LOADER

// --- HELPER FUNCTION TO FORMAT TIME ---
const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  return `${Math.floor(diffInSeconds / 86400)} days ago`;
};


// --- RECURSIVE COMMENT COMPONENT ---
interface CommentItemProps {
  comment: Comment;
  onReplyClick: (comment: { id: string, name: string }) => void;
  onLikeClick: (commentId: string, hasLiked: boolean) => void;
  onEditClick: (comment: Comment) => void;
  onDeleteClick: (comment: Comment) => void;
  onEditSave: (commentId: string) => void;
  onEditCancel: () => void;
  onEditingTextChange: (text: string) => void;
  currentUserId: string | null;
  editingText: string;

  // --- MODIFIED PROPS ---
  isLikingCommentId: string | null; // Pass global liking state
  editingCommentId: string | null;  // Pass global editing state
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  onReplyClick,
  onLikeClick,
  onEditClick,
  onDeleteClick,
  onEditSave,
  onEditCancel,
  onEditingTextChange,
  currentUserId,
  editingText,
  isLikingCommentId,
  editingCommentId
}) => {

  const hasLiked = useMemo(() => {
    if (!comment.likes || !currentUserId) return false;
    return comment.likes.includes(currentUserId);
  }, [comment.likes, currentUserId]);

  const isOwner = currentUserId === comment.user_id;
  const canEdit = isOwner && comment.edited_at === null;

  // --- MODIFIED LOGIC ---
  // Each component checks if IT is the one being liked or edited
  const isLiking = isLikingCommentId === comment.id;
  const isEditing = editingCommentId === comment.id;

  return (
    <div className="flex space-x-4">
      <img
        src={comment.user?.avatar_url}
        alt={comment.user?.full_name}
        className="w-10 h-10 rounded-full flex-shrink-0"
      />
      <div className="flex-1">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <p className="font-semibold text-gray-900 dark:text-white">
              {comment.user?.full_name}
            </p>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {formatRelativeTime(comment.created_at)}
            </span>
            {comment.edited_at && (
              <span className="text-xs text-gray-500 dark:text-gray-400"> (edited)</span>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editingText}
                onChange={(e) => onEditingTextChange(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onEditSave(comment.id)}
                  className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                >
                  Save
                </button>
                <button
                  onClick={onEditCancel}
                  className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-700 dark:text-gray-300 mb-2 whitespace-pre-wrap">{comment.content}</p>
          )}
        </div>

        {/* Comment Actions (Like/Reply/Edit/Delete) */}
        {!isEditing && (
          <div className="flex items-center space-x-4 mt-2">
            <button
              onClick={() => onLikeClick(comment.id, hasLiked)}
              // Disable ALL like buttons if ANY like is in progress
              disabled={!currentUserId || isLikingCommentId !== null}
              className={`flex items-center space-x-1 text-sm ${isLiking ? 'text-red-500 animate-pulse' : (hasLiked ? 'text-red-600' : 'text-gray-500 dark:text-gray-400')
                } hover:text-red-600 dark:hover:text-red-400 disabled:opacity-50`}
              aria-label="Like comment"
            >
              <Heart className={`w-4 h-4 ${hasLiked ? 'fill-current' : ''}`} />
              <span>{comment.likes?.length || 0}</span>
            </button>
            {currentUserId && (
              <button
                onClick={() => onReplyClick({ id: comment.id, name: comment.user?.full_name || 'User' })}
                className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                aria-label="Reply to comment"
              >
                <CornerDownRight className="w-4 h-4" />
                <span>Reply</span>
              </button>
            )}
            {canEdit && (
              <button
                onClick={() => onEditClick(comment)}
                className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400"
                aria-label="Edit comment"
              >
                <Edit2 className="w-4 h-4" />
                <span>Edit</span>
              </button>
            )}
            {isOwner && (
              <button
                onClick={() => onDeleteClick(comment)}
                className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                aria-label="Delete comment"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            )}
          </div>
        )}

        {/* Render Children (Replies) */}
        {comment.children && comment.children.length > 0 && (
          <div className="space-y-6 mt-6 pl-8 border-l-2 border-gray-200 dark:border-gray-700">
            {comment.children.map((child) => (
              <CommentItem
                key={child.id}
                comment={child}
                onReplyClick={onReplyClick}
                onLikeClick={onLikeClick}
                onEditClick={onEditClick}
                onDeleteClick={onDeleteClick}
                onEditSave={onEditSave}
                onEditCancel={onEditCancel}
                onEditingTextChange={onEditingTextChange}
                currentUserId={currentUserId}
                editingText={editingText}

                // --- MODIFIED: Pass down global state ---
                isLikingCommentId={isLikingCommentId}
                editingCommentId={editingCommentId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};


const BlogDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [comments, setComments] = useState<Comment[]>([]); // <-- FLAT LIST
  const [newComment, setNewComment] = useState('');
  const [relatedBlogs, setRelatedBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLiking, setIsLiking] = useState(false);

  // --- NEW STATE FOR REPLIES AND COMMENT LIKES ---
  const [replyTo, setReplyTo] = useState<{ id: string, name: string } | null>(null);
  const [isLikingComment, setIsLikingComment] = useState<string | null>(null);
  // --- NEW STATE FOR EDITING ---
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState('');

  // --- BOOKMARK STATE ---
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isBookmarking, setIsBookmarking] = useState(false);

  // Check if the current user has liked this post
  const hasLiked = useMemo(() => {
    if (!blog || !user) return false;
    return blog.likes?.includes(user.id);
  }, [blog, user]);

  // --- USEMEMO TO CREATE NESTED COMMENT TREE ---
  const nestedComments = useMemo(() => {
    const nest = (list: Comment[]): Comment[] => {
      const map = new Map<string, Comment>();
      const roots: Comment[] = [];

      list.forEach(comment => {
        comment.children = []; // Ensure children array exists
        map.set(comment.id, comment);
      });

      list.forEach(comment => {
        if (comment.parentId) {
          const parent = map.get(comment.parentId);
          if (parent) {
            parent.children?.push(comment);
          } else {
            // This case handles if a parent is somehow missing (e.g., deleted)
            roots.push(comment);
          }
        } else {
          roots.push(comment);
        }
      });
      return roots;
    };
    return nest(comments);
  }, [comments]);


  useEffect(() => {
    const getBlogData = async () => {
      if (!slug) return;

      setLoading(true);
      setBlog(null);
      setComments([]);
      setRelatedBlogs([]);

      const foundBlog = await fetchBlogBySlug(slug); // <-- Reverted call

      if (foundBlog) {

        // --- VIEW COUNT FIX ---
        const viewKey = `viewed_${foundBlog.id}`;
        const hasViewed = sessionStorage.getItem(viewKey);

        if (!hasViewed) {
          // Optimistically update UI for view count
          setBlog({ ...foundBlog, views: foundBlog.views + 1 });
          // Trigger "fire-and-forget" view increment in DB
          incrementBlogView(foundBlog.id);
          // Mark as viewed in this session
          sessionStorage.setItem(viewKey, 'true');
        } else {
          // Just set the blog data without incrementing
          setBlog(foundBlog);
        }
        // --- END VIEW COUNT FIX ---

        // Fetch comments and related blogs
        const relatedConstraints = [
          where('category', '==', foundBlog.category),
          where('slug', '!=', foundBlog.slug),
          orderBy('slug'), // Required for '!='
          orderBy('created_at', 'desc'),
          limit(3)
        ];

        const [foundComments, related] = await Promise.all([
          fetchComments(foundBlog.id),
          fetchBlogs(relatedConstraints, 3)
        ]);

        setComments(foundComments); // <-- SET FLAT LIST
        setRelatedBlogs(related.blogs);

        // Check bookmark status
        if (user) {
          const userData = await fetchUser(user.id);
          if (userData && userData.bookmarks?.includes(foundBlog.id)) {
            setIsBookmarked(true);
          } else {
            setIsBookmarked(false);
          }
        }
      }
      setLoading(false);
    };

    getBlogData();
  }, [slug]); // <-- Reverted dependencies

  // 3. REMOVE THE useMemo for cleanHtml
  // const cleanHtml = useMemo(() => { ... }, [blog?.content]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim() || !blog) return;

    const commentToSave = {
      blog_id: blog.id,
      user_id: user.id,
      content: newComment,
      created_at: serverTimestamp(),
      parentId: replyTo?.id || null, // <-- SET PARENT ID
      likes: [],                       // <-- SET INITIAL LIKES
      edited_at: null                  // <-- SET INITIAL EDIT STATE
    };

    try {
      const docRef = await addDoc(collection(db, 'comments'), commentToSave);
      const optimisticComment: Comment = {
        id: docRef.id,
        blog_id: blog.id,
        user_id: user.id,
        user: user,
        content: newComment,
        created_at: new Date().toISOString(),
        parentId: replyTo?.id || null, // <-- ADDED
        likes: [],                       // <-- ADDED
        edited_at: null,                 // <-- ADDED
        children: []                     // <-- ADDED
      };
      // Add to flat list, useMemo will re-nest
      setComments([optimisticComment, ...comments]);
      setNewComment('');
      setReplyTo(null); // <-- CLEAR REPLY STATE
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  const handleLike = async () => {
    if (!user || !blog || isLiking) return;

    setIsLiking(true);
    const blogRef = doc(db, 'blogs', blog.id);

    try {
      if (hasLiked) {
        // UNLIKE
        setBlog(prevBlog => prevBlog ? ({
          ...prevBlog,
          likes: prevBlog.likes.filter(id => id !== user.id)
        }) : null);
        await updateDoc(blogRef, {
          likes: arrayRemove(user.id)
        });
      } else {
        // LIKE
        setBlog(prevBlog => prevBlog ? ({
          ...prevBlog,
          likes: [...(prevBlog.likes || []), user.id]
        }) : null);
        await updateDoc(blogRef, {
          likes: arrayUnion(user.id)
        });
      }
    } catch (error) {
      console.error("Error updating like status:", error);
      const refetchedBlog = await fetchBlogBySlug(blog.slug);
      setBlog(refetchedBlog);
    } finally {
      setIsLiking(false);
    }
  };

  const handleBookmark = async () => {
    if (!user || !blog || isBookmarking) return;

    setIsBookmarking(true);
    try {
      // Optimistic update
      setIsBookmarked(!isBookmarked);

      await toggleBookmark(user.id, blog.id, isBookmarked);

    } catch (error) {
      console.error("Error toggling bookmark:", error);
      // Revert on error
      setIsBookmarked(!isBookmarked);
    } finally {
      setIsBookmarking(false);
    }
  };

  // --- NEW FUNCTION TO LIKE COMMENTS ---
  const handleCommentLike = async (commentId: string, hasLiked: boolean) => {
    if (!user || !blog || isLikingComment) return;

    setIsLikingComment(commentId);
    const commentRef = doc(db, 'comments', commentId);

    try {
      // Optimistic state update
      setComments(prevComments =>
        prevComments.map(c => {
          if (c.id === commentId) {
            return {
              ...c,
              likes: hasLiked
                ? c.likes.filter(id => id !== user.id)
                : [...(c.likes || []), user.id]
            };
          }
          return c;
        })
      );

      // Firestore update
      if (hasLiked) {
        await updateDoc(commentRef, { likes: arrayRemove(user.id) });
      } else {
        await updateDoc(commentRef, { likes: arrayUnion(user.id) });
      }

    } catch (error) {
      console.error("Error updating comment like status:", error);
      // Revert optimistic update on error
      setComments(prevComments =>
        prevComments.map(c => {
          if (c.id === commentId) {
            return {
              ...c,
              likes: hasLiked
                ? [...(c.likes || []), user.id] // Add it back
                : c.likes.filter(id => id !== user.id) // Remove it
            };
          }
          return c;
        })
      );
    } finally {
      setIsLikingComment(null);
    }
  };

  // --- HANDLERS FOR EDITING ---
  const handleEditClick = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditingCommentText(comment.content);
    setReplyTo(null); // Cancel any active reply
  };

  const handleEditCancel = () => {
    setEditingCommentId(null);
    setEditingCommentText('');
  };

  const handleEditSave = async (commentId: string) => {
    if (!editingCommentText.trim()) return;

    try {
      // Optimistic update
      setComments(prev =>
        prev.map(c =>
          c.id === commentId
            ? { ...c, content: editingCommentText, edited_at: new Date().toISOString() }
            : c
        )
      );

      // Reset state
      setEditingCommentId(null);
      setEditingCommentText('');

      // Firebase update
      await updateCommentContent(commentId, editingCommentText);

    } catch (error) {
      console.error("Error updating comment:", error);
      // TODO: Add error handling (e.g., revert optimistic update)
    }
  };

  // --- HANDLER FOR DELETING ---
  const handleDeleteClick = async (comment: Comment) => {
    if (!window.confirm("Are you sure you want to delete this comment and all its replies? This action cannot be undone.")) {
      return;
    }

    // 1. Find all descendant IDs
    const getDescendantIds = (parentId: string, allComments: Comment[]): string[] => {
      const children = allComments.filter(c => c.parentId === parentId);
      let ids: string[] = [];
      for (const child of children) {
        ids = [...ids, child.id, ...getDescendantIds(child.id, allComments)];
      }
      return ids;
    };
    const allIdsToDelete = [comment.id, ...getDescendantIds(comment.id, comments)];

    try {
      // 2. Optimistic update (remove from state)
      setComments(prev => prev.filter(c => !allIdsToDelete.includes(c.id)));

      // 3. Call batch delete helper
      await deleteCommentsBatch(allIdsToDelete);

    } catch (error) {
      console.error("Error deleting comments:", error);
      // TODO: Add error handling (e.g., refetch comments)
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // --- IMPLEMENTED SHARE BUTTONS ---
  const shareOnTwitter = () => {
    const shareUrl = window.location.href;
    const shareTitle = blog?.title || "Check out this blog post";
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`, '_blank');
  };
  const shareOnLinkedIn = () => {
    const shareUrl = window.location.href;
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank');
  };
  const shareOnFacebook = () => {
    const shareUrl = window.location.href;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
  };
  // --- END SHARE BUTTONS ---

  if (loading) {
    return <PageLoader />;
  }

  if (!blog) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Blog not found</h2>
          <Link to="/blogs" className="text-blue-600 dark:text-blue-400 hover:underline">
            Back to all blogs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          to="/blogs"
          className="inline-flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:underline mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Blogs</span>
        </Link>

        <div className="bg-white/65 dark:bg-gray-950/40 rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-800">
          <img
            src={blog.cover_image}
            alt={blog.title}
            className="w-full h-96 object-cover"
          />

          <div className="p-8">
            <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-medium mb-4 inline-block">
              {blog.category}
            </span>

            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              {blog.title}
            </h1>

            <div className="flex flex-wrap gap-4 items-center justify-between mb-8 pb-8 border-b border-gray-200 dark:border-gray-800">

              <Link
                to={`/author/${blog.author_id}`}
                className="flex items-center space-x-3 group"
                title={`View all posts by ${blog.author?.full_name}`}
              >
                <img
                  src={blog.author?.avatar_url}
                  alt={blog.author?.full_name}
                  className="w-12 h-12 rounded-full group-hover:ring-4 group-hover:ring-blue-600/50 transition-all"
                />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {blog.author?.full_name}
                  </p>
                  <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(blog.created_at)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Eye className="w-4 h-4" />
                      <span>{blog.views} views</span>
                    </div>
                  </div>
                </div>
              </Link>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleLike}
                  disabled={!user || isLiking}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors
                    ${!user ? 'cursor-not-allowed opacity-70' : 'hover:bg-red-100 dark:hover:bg-red-900'}
                    ${hasLiked ? 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}
                  `}
                  aria-label="Like post"
                >
                  <Heart className={`w-5 h-5 ${hasLiked ? 'fill-current' : ''}`} />
                  <span className="font-medium">{blog.likes?.length || 0}</span>
                </button>
                <button
                  onClick={handleBookmark}
                  disabled={!user || isBookmarking}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors
                    ${!user ? 'cursor-not-allowed opacity-70' : 'hover:bg-yellow-100 dark:hover:bg-yellow-900'}
                    ${isBookmarked ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}
                  `}
                  aria-label="Bookmark post"
                >
                  <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
                </button>
                <button
                  onClick={shareOnTwitter}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-blue-900 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  aria-label="Share on Twitter"
                >
                  <Twitter className="w-5 h-5" />
                </button>
                <button
                  onClick={shareOnLinkedIn}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-blue-900 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  aria-label="Share on LinkedIn"
                >
                  <Linkedin className="w-5 h-5" />
                </button>
                <button
                  onClick={shareOnFacebook}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-blue-900 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  aria-label="Share on Facebook"
                >
                  <Facebook className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* --- 4. REPLACE dangerouslySetInnerHTML WITH ReactMarkdown --- */}
            <div className="prose prose-lg dark:prose-invert max-w-none mb-8">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {blog.content}
              </ReactMarkdown>
            </div>
            {/* --- END OF REPLACEMENT --- */}

            <div className="flex flex-wrap gap-2 mb-8">
              {blog.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* --- Comments Section --- */}
        <div className="mt-12 bg-white/65 dark:bg-gray-950/40 rounded-xl p-8 shadow-lg border border-gray-200 dark:border-gray-800">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center space-x-2">
            <MessageCircle className="w-6 h-6" />
            <span>Comments ({comments.length})</span>
          </h2>

          {user ? (
            <form onSubmit={handleCommentSubmit} className="mb-8">
              {/* --- REPLY-TO INDICATOR --- */}
              {replyTo && (
                <div className="flex items-center justify-between p-2 px-3 mb-2 bg-gray-100 dark:bg-gray-950/40 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Replying to <strong>{replyTo.name}</strong>
                  </p>
                  <button
                    onClick={() => setReplyTo(null)}
                    className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                    aria-label="Cancel reply"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={replyTo ? 'Write your reply...' : 'Share your thoughts...'}
                rows={4}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/65 dark:bg-gray-950/40 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
              <button
                type="submit"
                disabled={!newComment.trim()}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {replyTo ? 'Post Reply' : 'Post Comment'}
              </button>
            </form>
          ) : (
            <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-950/40 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-gray-600 dark:text-gray-400">
                Please <Link to="/login" className="text-blue-600 hover:underline">sign in</Link> to leave a comment
              </p>
            </div>
          )}

          {/* --- RENDER NESTED COMMENTS --- */}
          <div className="space-y-6">
            {nestedComments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                onReplyClick={(c) => setReplyTo(c)}
                onLikeClick={handleCommentLike}
                onEditClick={handleEditClick}
                onDeleteClick={handleDeleteClick}
                onEditSave={handleEditSave}
                onEditCancel={handleEditCancel}
                onEditingTextChange={setEditingCommentText}
                currentUserId={user?.id || null}
                editingText={editingCommentText}

                // --- MODIFIED: Pass down global state ---
                isLikingCommentId={isLikingComment}
                editingCommentId={editingCommentId}
              />
            ))}
          </div>
        </div>

        {/* --- Related Posts --- */}
        {relatedBlogs.length > 0 && (
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
              Related Posts
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedBlogs.map((relatedBlog) => (
                <BlogCard key={relatedBlog.id} blog={relatedBlog} />
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  );
};

export default BlogDetail;