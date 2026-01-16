// src/types/index.ts
import { Timestamp } from "firebase/firestore";

export interface SocialLinks {
  twitter?: string;
  linkedin?: string;
  github?: string;
  website?: string;
}

// --- RESUME-RELATED INTERFACES ---
export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startYear: string;
  endYear: string;
  current?: boolean;
  description?: string;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  location?: string;
  startDate: string;
  endDate: string;
  current?: boolean;
  description?: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
}

export interface Skill {
  id: string;
  name: string;
  level?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
}

export interface User {
  id: string; // This will be the Firebase Auth UID
  email: string;
  full_name: string;
  avatar_url: string;
  bio: string;

  // --- PROFILE FIELDS ---
  username: string; // Unique, user-chosen handle
  phone?: string; // Private, not shown publicly
  profession?: string;
  socials?: SocialLinks;
  status: 'pending' | 'active'; // To track profile completion
  role: 'user' | 'admin'; // <-- ADD THIS
  bookmarks?: string[]; // Array of blog IDs

  // --- RESUME FIELDS ---
  education?: Education[];
  experience?: Experience[];
  certifications?: Certification[];
  skills?: Skill[];
}

// Helper type for Firestore timestamps
interface FirestoreTimestamps {
  created_at: Timestamp;
  updated_at: Timestamp;
}

// Base Blog type stored in Firestore
export interface BlogBase extends FirestoreTimestamps {
  id: string; // Document ID
  author_id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  cover_image: string;
  category: string;
  tags: string[];
  views: number;
  published: boolean;
  likes: string[]; // <-- ADD THIS
}

// Blog type used in the app, with author details populated
export interface Blog extends Omit<BlogBase, 'created_at' | 'updated_at'> {
  author?: User; // Author data will be joined
  created_at: string; // Converted to ISO string for easier use
  updated_at: string; // Converted to ISO string for easier use
}

// Base Comment type stored in Firestore
export interface CommentBase {
  id: string; // Document ID
  blog_id: string;
  user_id: string;
  content: string;
  created_at: Timestamp;
  parentId: string | null; // <-- ADD THIS
  likes: string[];         // <-- ADD THIS
  edited_at: Timestamp | null; // <-- ADD THIS
}

// Comment type used in the app, with user details populated
export interface Comment extends Omit<CommentBase, 'created_at' | 'edited_at'> {
  user?: User; // User data will be joined
  created_at: string; // Converted to ISO string
  edited_at: string | null; // <-- ADD THIS
  children?: Comment[]; // <-- ADD THIS (for client-side nesting)
}

export interface ContactMessage {
  name: string;
  email: string;
  message: string;
  created_at: Timestamp;
}