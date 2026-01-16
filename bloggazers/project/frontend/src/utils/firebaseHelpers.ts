import {
  collection,
  doc,
  updateDoc,
  query,
  where,
  getDocs,
  increment,
  deleteDoc,
  writeBatch,
  serverTimestamp,
  limit,
  startAfter,
  orderBy,
  getDoc,
  arrayUnion,
  arrayRemove,
  documentId,
  DocumentSnapshot,
  DocumentData,
  QueryConstraint,
  addDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, Timestamp, storage } from '../firebase';
import { Blog, BlogBase, User, Comment, CommentBase } from '../types';

// --- User Helpers ---

/**
 * Updates a user document in Firestore.
 */
export const updateUser = async (id: string, data: Partial<User>) => {
  if (!id) return;
  const userDocRef = doc(db, 'users', id);
  await updateDoc(userDocRef, data);
};

/**
 * Fetches a single user by ID.
 */
export const fetchUser = async (id: string): Promise<User | null> => {
  if (!id) return null;
  const userDoc = await getDoc(doc(db, 'users', id));
  if (userDoc.exists()) {
    return { id: userDoc.id, ...userDoc.data() } as User;
  }
  return null;
};

/**
 * Fetches multiple user documents from a list of IDs.
 */
export const fetchUsers = async (ids: string[]): Promise<Map<string, User>> => {
  const userMap = new Map<string, User>();
  const uniqueIds = [...new Set(ids)];
  if (uniqueIds.length === 0) return userMap;

  const idBatches = [];
  for (let i = 0; i < uniqueIds.length; i += 10) {
    idBatches.push(uniqueIds.slice(i, i + 10));
  }

  for (const batch of idBatches) {
    const usersQuery = query(collection(db, 'users'), where('id', 'in', batch));
    const usersSnapshot = await getDocs(usersQuery);
    usersSnapshot.forEach((userDoc) => {
      userMap.set(userDoc.id, { id: userDoc.id, ...userDoc.data() } as User);
    });
  }
  return userMap;
};

/**
 * Checks if a username already exists in the 'users' collection.
 * Returns true if the username is taken, false otherwise.
 */
export const checkUsernameUnique = async (username: string): Promise<boolean> => {
  if (!username) return true; // Don't allow empty usernames

  try {
    const q = query(
      collection(db, 'users'),
      where('username', '==', username.toLowerCase()),
      limit(1)
    );
    const snapshot = await getDocs(q);
    return !snapshot.empty; // If snapshot is NOT empty, the name is taken
  } catch (error) {
    console.error("Error checking username:", error);
    return true; // Fail safe: assume it's taken if there's an error
  }
};

// --- Data Conversion Helpers ---

/**
 * Converts a Firestore blog document to the app's Blog type.
 */
export const docToBlog = (doc: DocumentSnapshot<DocumentData>): Blog => {
  const data = doc.data() as BlogBase;
  return {
    ...data,
    id: doc.id,
    created_at: (data.created_at as Timestamp).toDate().toISOString(),
    updated_at: (data.updated_at as Timestamp).toDate().toISOString(),
  };
};

/**
 * Converts a Firestore comment document to the app's Comment type.
 */
export const docToComment = (doc: DocumentSnapshot<DocumentData>): Comment => {
  const data = doc.data() as CommentBase;
  return {
    ...data,
    id: doc.id,
    created_at: (data.created_at as Timestamp).toDate().toISOString(),
    edited_at: data.edited_at ? (data.edited_at as Timestamp).toDate().toISOString() : null,
  };
};

// --- Blog Fetching ---

/**
 * Fetches a list of blogs based on given constraints and populates author data.
 * NOW INCLUDES PAGINATION.
 */
export const fetchBlogs = async (
  constraints: QueryConstraint[],
  limitNum: number,
  lastDoc: DocumentSnapshot | null = null
): Promise<{ blogs: Blog[], lastDoc: DocumentSnapshot | null }> => {

  const queryConstraints = [
    ...constraints,
    limit(limitNum)
  ];

  if (lastDoc) {
    queryConstraints.push(startAfter(lastDoc));
  }

  const blogsQuery = query(collection(db, 'blogs'), ...queryConstraints);
  const blogsSnapshot = await getDocs(blogsQuery);

  if (blogsSnapshot.empty) return { blogs: [], lastDoc: null };

  const authorIds = [
    ...new Set(blogsSnapshot.docs.map((d) => (d.data() as BlogBase).author_id)),
  ];

  const authorMap = await fetchUsers(authorIds);

  const blogs = blogsSnapshot.docs.map((blogDoc) => {
    const blog = docToBlog(blogDoc);
    blog.author = authorMap.get(blog.author_id);
    return blog;
  });

  // Get the last visible document for pagination
  const newLastDoc = blogsSnapshot.docs[blogsSnapshot.docs.length - 1];

  return { blogs, lastDoc: newLastDoc || null };
};

/**
 * Fetches a single blog by its slug and populates author data.
 */
export const fetchBlogBySlug = async (
  slug: string
): Promise<Blog | null> => {
  const q = query(collection(db, 'blogs'), where('slug', '==', slug), limit(1));
  const snapshot = await getDocs(q);

  if (snapshot.empty) return null;

  const blogDoc = snapshot.docs[0];
  const blog = docToBlog(blogDoc);

  blog.author = await fetchUser(blog.author_id);
  return blog;
};

// --- Comment Fetching ---

/**
 * Fetches all comments for a blog and populates user data for each.
 */
export const fetchComments = async (
  blogId: string
): Promise<Comment[]> => {
  const commentsQuery = query(
    collection(db, 'comments'),
    where('blog_id', '==', blogId),
    orderBy('created_at', 'desc')
  );
  const commentsSnapshot = await getDocs(commentsQuery);

  if (commentsSnapshot.empty) return [];

  const userIds = [
    ...new Set(commentsSnapshot.docs.map((d) => (d.data() as CommentBase).user_id)),
  ];

  const userMap = await fetchUsers(userIds);

  const comments = commentsSnapshot.docs.map((commentDoc) => {
    const comment = docToComment(commentDoc);
    comment.user = userMap.get(comment.user_id);
    return comment;
  });

  return comments;
};

// --- Blog Modification ---

/**
 * Increments the view count for a blog post.
 */
export const incrementBlogView = async (blogId: string) => {
  if (!blogId) return;
  const blogRef = doc(db, 'blogs', blogId);
  try {
    await updateDoc(blogRef, {
      views: increment(1)
    });
  } catch (error) {
    console.error("Error incrementing view count:", error);
  }
};

/**
 * Deletes a blog post and its associated comments.
 */
export const deleteBlog = async (blogId: string) => {
  if (!blogId) return;

  // 1. Delete the blog document
  const blogRef = doc(db, 'blogs', blogId);
  await deleteDoc(blogRef);

  // 2. Query and delete all associated comments
  const commentsQuery = query(collection(db, 'comments'), where('blog_id', '==', blogId));
  const commentsSnapshot = await getDocs(commentsQuery);

  const deletePromises = commentsSnapshot.docs.map((commentDoc) =>
    deleteDoc(doc(db, 'comments', commentDoc.id))
  );
  await Promise.all(deletePromises);
};

// --- Comment Modification ---

/**
 * Updates a comment's content and marks it as edited.
 */
export const updateCommentContent = async (commentId: string, newContent: string) => {
  const commentRef = doc(db, 'comments', commentId);
  await updateDoc(commentRef, {
    content: newContent,
    edited_at: serverTimestamp()
  });
};

/**
 * Deletes multiple comments in a single batch.
 */
export const deleteCommentsBatch = async (commentIds: string[]) => {
  if (commentIds.length === 0) return;
  const batch = writeBatch(db);
  commentIds.forEach(id => {
    const docRef = doc(db, 'comments', id);
    batch.delete(docRef);
  });
  await batch.commit();
};

// --- Bookmark Helpers ---

/**
 * Toggles a bookmark for a user.
 * Adds the blogId to the user's bookmarks if not present, removes it if it is.
 */
export const toggleBookmark = async (userId: string, blogId: string, isBookmarked: boolean) => {
  const userRef = doc(db, 'users', userId);

  if (isBookmarked) {
    // Remove bookmark
    await updateDoc(userRef, {
      bookmarks: arrayRemove(blogId)
    });
  } else {
    // Add bookmark
    await updateDoc(userRef, {
      bookmarks: arrayUnion(blogId)
    });
  }
};

/**
 * Fetches the list of blogs bookmarked by a user.
 */
export const fetchBookmarkedBlogs = async (userId: string): Promise<Blog[]> => {
  const userDoc = await getDoc(doc(db, 'users', userId));
  if (!userDoc.exists()) return [];

  const userData = userDoc.data() as User;
  const bookmarkIds = userData.bookmarks || [];

  if (bookmarkIds.length === 0) return [];

  // Firestore 'in' query is limited to 10 items. We need to batch if more.
  // Re-using the logic from fetchUsers but for blogs
  const blogs: Blog[] = [];
  const idBatches = [];
  for (let i = 0; i < bookmarkIds.length; i += 10) {
    idBatches.push(bookmarkIds.slice(i, i + 10));
  }

  for (const batch of idBatches) {
    const blogsQuery = query(collection(db, 'blogs'), where(documentId(), 'in', batch));
    const blogsSnapshot = await getDocs(blogsQuery);

    // We need to fetch authors for these blogs too
    const authorIds = [...new Set(blogsSnapshot.docs.map(d => (d.data() as BlogBase).author_id))];
    const authorMap = await fetchUsers(authorIds);

    blogsSnapshot.forEach((blogDoc) => {
      const blog = docToBlog(blogDoc);
      blog.author = authorMap.get(blog.author_id);
      blogs.push(blog);
    });
  }

  return blogs;
};

// --- Image Upload Helper ---

/**
 * Uploads an image to Firebase Storage and returns the download URL.
 * @param file The file to upload.
 * @param path The storage path (e.g., 'blog-covers' or 'avatars').
 * @returns Promise<string> The download URL of the uploaded image.
 */
export const uploadImage = async (file: File, path: string): Promise<string> => {
  // Create a unique filename to prevent collisions
  const timestamp = Date.now();
  const uniqueName = `${timestamp}_${file.name}`;
  const storageRef = ref(storage, `${path}/${uniqueName}`);

  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);
  return downloadURL;
};