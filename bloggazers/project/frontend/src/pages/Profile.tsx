// src/pages/Profile.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail, Calendar, Edit, FileText, Github, Linkedin, Twitter,
  Link as LinkIcon, Share2, Copy, Check, GraduationCap, Briefcase,
  Award, Lightbulb, MapPin, ExternalLink, LogOut, UserPlus
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Blog } from '../types';
import { fetchBlogs, deleteBlog } from '../utils/firebaseHelpers';
import { where, orderBy } from 'firebase/firestore';
import BlogCard from '../components/BlogCard';
import BlogCardSkeleton from '../components/BlogCardSkeleton';

const Profile: React.FC = () => {
  const { user, signOut, signIn } = useAuth();
  const navigate = useNavigate();
  const [userBlogs, setUserBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  // Get the profile URL for sharing
  const profileUrl = `${window.location.origin}/author/${user?.id}`;
  const shareText = `Check out ${user?.full_name}'s profile on Bloggazers!`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const handleShare = (platform: string) => {
    let shareUrl = '';

    switch (platform) {
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + profileUrl)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(profileUrl)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}`;
        break;
      case 'instagram':
        handleCopyLink();
        toast.success('Link copied! Open Instagram and paste in your story or bio.');
        setShowShareMenu(false);
        return;
      default:
        return;
    }

    window.open(shareUrl, '_blank', 'width=600,height=400');
    setShowShareMenu(false);
  };

  useEffect(() => {
    if (user) {
      const getBlogs = async () => {
        setLoading(true);
        const constraints = [
          where('author_id', '==', user.id),
          orderBy('created_at', 'desc'),
        ];

        const { blogs } = await fetchBlogs(constraints, 100, null);
        setUserBlogs(blogs);
        setLoading(false);
      };

      getBlogs();
    }
  }, [user]);

  const handleEdit = (slug: string) => {
    navigate(`/edit-blog/${slug}`);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this blog? This action cannot be undone.')) {
      try {
        await deleteBlog(id);
        setUserBlogs(prevBlogs => prevBlogs.filter(blog => blog.id !== id));
        alert('Blog deleted successfully.');
      } catch (error) {
        console.error("Error deleting blog: ", error);
        alert('Failed to delete blog.');
      }
    }
  };

  // Helper to get skill level color
  const getSkillLevelColor = (level?: string) => {
    switch (level) {
      case 'Expert':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
      case 'Advanced':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      case 'Intermediate':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case 'Beginner':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  // Check if user has any resume data
  const hasResumeData = user && (
    (user.education && user.education.length > 0) ||
    (user.experience && user.experience.length > 0) ||
    (user.certifications && user.certifications.length > 0) ||
    (user.skills && user.skills.length > 0)
  );

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Please sign in to view your profile
          </h2>
          <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:underline">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  const socials = user.socials;

  return (
    <div className="min-h-screen">
      {/* Profile Header */}
      <div className="text-gray-900 dark:text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <img
              src={user.avatar_url}
              alt={user.full_name}
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-blue-600 flex-shrink-0"
            />
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-2">
                <h1 className="text-4xl sm:text-5xl font-bold">
                  {user.full_name}
                </h1>

                {/* Edit Profile Button */}
                <Link
                  to="/profile/edit"
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit Profile</span>
                </Link>

                {/* Sign Out Button */}
                <button
                  onClick={() => {
                    signOut();
                    navigate('/');
                  }}
                  className="inline-flex items-center space-x-1 px-3 py-1.5 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>

                {/* Switch Account Button */}
                <button
                  onClick={() => {
                    signOut();
                    setTimeout(() => signIn(), 500);
                  }}
                  className="inline-flex items-center space-x-1 px-3 py-1.5 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700 transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Switch Account</span>
                </button>
              </div>

              {/* Username and Profession */}
              {user.username && (
                <p className="text-xl text-blue-600 dark:text-blue-400 font-medium">
                  @{user.username}
                </p>
              )}
              {user.profession && (
                <p className="text-lg text-gray-700 dark:text-blue-100 mt-1">
                  {user.profession}
                </p>
              )}
              {user.bio && (
                <p className="text-lg text-gray-700 dark:text-blue-100 my-3">{user.bio}</p>
              )}

              {/* Info/Socials Block */}
              <div className="flex items-center flex-wrap gap-x-4 gap-y-2 text-gray-600 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <Mail className="w-4 h-4" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <FileText className="w-4 h-4" />
                  <span>{loading ? '...' : userBlogs.length} Posts</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Joined Jan 2024</span>
                </div>

                {/* Social Links */}
                {socials?.github && socials.github.trim() && (
                  <a href={socials.github} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-1 hover:text-blue-600 dark:hover:text-blue-400">
                    <Github className="w-4 h-4" />
                    <span>GitHub</span>
                  </a>
                )}
                {socials?.linkedin && socials.linkedin.trim() && (
                  <a href={socials.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-1 hover:text-blue-600 dark:hover:text-blue-400">
                    <Linkedin className="w-4 h-4" />
                    <span>LinkedIn</span>
                  </a>
                )}
                {socials?.twitter && socials.twitter.trim() && (
                  <a href={socials.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-1 hover:text-blue-600 dark:hover:text-blue-400">
                    <Twitter className="w-4 h-4" />
                    <span>Twitter</span>
                  </a>
                )}
                {socials?.website && socials.website.trim() && (
                  <a href={socials.website} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-1 hover:text-blue-600 dark:hover:text-blue-400">
                    <LinkIcon className="w-4 h-4" />
                    <span>Website</span>
                  </a>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-4 flex flex-wrap gap-3">
                {/* Write New Blog Button */}
                <Link
                  to="/create-blog"
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  <span>Write New Blog</span>
                </Link>

                {/* Share Profile Button */}
                <div className="relative">
                  <button
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-medium hover:from-pink-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share Profile</span>
                  </button>

                  {/* Share Dropdown */}
                  {showShareMenu && (
                    <div className="absolute left-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
                      <div className="p-2 space-y-1">
                        <button
                          onClick={() => handleShare('whatsapp')}
                          className="w-full flex items-center space-x-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center">
                            <span className="text-white text-xs font-bold">W</span>
                          </div>
                          <span className="text-gray-700 dark:text-gray-200">WhatsApp</span>
                        </button>
                        <button
                          onClick={() => handleShare('twitter')}
                          className="w-full flex items-center space-x-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <Twitter className="w-6 h-6 text-gray-900 dark:text-white" />
                          <span className="text-gray-700 dark:text-gray-200">Twitter / X</span>
                        </button>
                        <button
                          onClick={() => handleShare('linkedin')}
                          className="w-full flex items-center space-x-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <Linkedin className="w-6 h-6 text-blue-700" />
                          <span className="text-gray-700 dark:text-gray-200">LinkedIn</span>
                        </button>
                        <button
                          onClick={() => handleShare('facebook')}
                          className="w-full flex items-center space-x-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                            <span className="text-white text-xs font-bold">f</span>
                          </div>
                          <span className="text-gray-700 dark:text-gray-200">Facebook</span>
                        </button>
                        <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                        <button
                          onClick={handleCopyLink}
                          className="w-full flex items-center space-x-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          {copied ? <Check className="w-6 h-6 text-green-500" /> : <Copy className="w-6 h-6 text-gray-500" />}
                          <span className="text-gray-700 dark:text-gray-200">{copied ? 'Copied!' : 'Copy Link'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Resume First, Then Blogs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* === RESUME SECTIONS === */}
        {hasResumeData && (
          <div className="space-y-4">
            {/* Skills Section */}
            {user.skills && user.skills.length > 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-5">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Lightbulb className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Skills</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {user.skills.map((skill) => (
                    <span
                      key={skill.id}
                      className={`px-4 py-2 rounded-full text-sm font-medium ${getSkillLevelColor(skill.level)}`}
                    >
                      {skill.name}
                      {skill.level && (
                        <span className="ml-2 opacity-75">• {skill.level}</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Experience Section */}
            {user.experience && user.experience.length > 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-5">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <Briefcase className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Experience</h3>
                </div>
                <div className="space-y-6">
                  {user.experience.map((exp, index) => (
                    <div key={exp.id} className="relative pl-6 border-l-2 border-green-200 dark:border-green-800">
                      <div className="absolute -left-2 top-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
                      <div className="space-y-1">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {exp.position}
                        </h4>
                        <p className="text-green-600 dark:text-green-400 font-medium">{exp.company}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</span>
                          </span>
                          {exp.location && (
                            <span className="flex items-center space-x-1">
                              <MapPin className="w-3 h-3" />
                              <span>{exp.location}</span>
                            </span>
                          )}
                        </div>
                        {exp.description && (
                          <p className="text-gray-600 dark:text-gray-400 mt-2">{exp.description}</p>
                        )}
                      </div>
                      {index < user.experience!.length - 1 && <div className="h-6"></div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education Section */}
            {user.education && user.education.length > 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-5">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <GraduationCap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Education</h3>
                </div>
                <div className="space-y-6">
                  {user.education.map((edu, index) => (
                    <div key={edu.id} className="relative pl-6 border-l-2 border-blue-200 dark:border-blue-800">
                      <div className="absolute -left-2 top-0 w-4 h-4 bg-blue-500 rounded-full border-2 border-white dark:border-gray-900"></div>
                      <div className="space-y-1">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {edu.degree} in {edu.field}
                        </h4>
                        <p className="text-blue-600 dark:text-blue-400 font-medium">{edu.institution}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{edu.startYear} - {edu.current ? 'Present' : edu.endYear}</span>
                        </p>
                        {edu.description && (
                          <p className="text-gray-600 dark:text-gray-400 mt-2">{edu.description}</p>
                        )}
                      </div>
                      {index < user.education!.length - 1 && <div className="h-6"></div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications Section */}
            {user.certifications && user.certifications.length > 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-5">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                    <Award className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Certifications</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {user.certifications.map((cert) => (
                    <div key={cert.id} className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                      <h4 className="font-semibold text-gray-900 dark:text-white">{cert.name}</h4>
                      <p className="text-amber-600 dark:text-amber-400 text-sm">{cert.issuer}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Issued: {cert.issueDate}
                        {cert.expiryDate && ` • Expires: ${cert.expiryDate}`}
                      </p>
                      {cert.credentialId && (
                        <p className="text-xs text-gray-400 mt-2">ID: {cert.credentialId}</p>
                      )}
                      {cert.credentialUrl && (
                        <a
                          href={cert.credentialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1 text-sm text-blue-600 dark:text-blue-400 hover:underline mt-2"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>View Credential</span>
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty Resume State - Only show for profile owner */}
        {!hasResumeData && (
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-8 text-center">
            <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Add your professional details
            </h4>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Showcase your skills, experience, education, and certifications
            </p>
            <Link
              to="/profile/edit"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <Edit className="w-4 h-4" />
              <span>Add Resume Details</span>
            </Link>
          </div>
        )}

        {/* === BLOGS SECTION === */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            My Blogs
          </h2>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <BlogCardSkeleton />
              <BlogCardSkeleton />
              <BlogCardSkeleton />
            </div>
          ) : userBlogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {userBlogs.map((blog) => (
                <BlogCard
                  key={blog.id}
                  blog={blog}
                  showAdminControls={true}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                No blogs yet
              </h4>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Start sharing your thoughts and ideas with the world
              </p>
              <Link
                to="/create-blog"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                <Edit className="w-5 h-5" />
                <span>Create Your First Blog</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close share menu */}
      {showShareMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowShareMenu(false)}
        />
      )}
    </div>
  );
};

export default Profile;