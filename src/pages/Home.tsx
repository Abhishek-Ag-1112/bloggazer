// src/pages/Home.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, TrendingUp, Users } from 'lucide-react';
import BlogCard from '../components/BlogCard';
import { Blog } from '../types';
import { fetchBlogs } from '../utils/firebaseHelpers';
import { orderBy, limit } from 'firebase/firestore';
import RotatingText from '../components/RotatingText';
import TextType from '../components/TextType';

// --- InkBottleScene import is REMOVED ---

const Home: React.FC = () => {
  const [featuredBlogs, setFeaturedBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getBlogs = async () => {
      setLoading(true);
      // Get 3 most recent blogs
      const constraints = [
        orderBy('created_at', 'desc'),
        limit(3)
      ];
      // Note: Updated fetchBlogs call per our previous fix
      const { blogs } = await fetchBlogs(constraints, 3, null);
      setFeaturedBlogs(blogs);
      setLoading(false);
    };

    getBlogs();
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden">

      <div>

        {/* This section is now just for text. 
        The 3D scene is already running in the background from App.tsx.
      */}
        <section className="relative text-gray-900 dark:text-white overflow-hidden py-8"> {/* <-- MODIFIED */}

          {/* This 'z-10' ensures your text appears over the background scene */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
            <div className="text-center">

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 animate-fade-in flex flex-wrap justify-center items-center">
                <span>Welcome to&nbsp;</span>
                <RotatingText
                  texts={['Bloggazers', 'World of Ideas', 'Your Creative Space', 'Daily Insights', 'Tech & Beyond', 'Trending Stories', 'Lifestyle Hub.']}
                  mainClassName="px-2 sm:px-2 md:px-3 text-blue-600 overflow-hidden py-0.5 sm:py-1 md:py-2 justify-center rounded-lg"
                  staggerFrom={"first"}
                  initial={{ y: "100%" }}
                  animate={{ y: "0%", opacity: 1 }}
                  exit={{ y: "-120%" }}
                  staggerDuration={0.025}
                  splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
                  transition={{ type: "spring", damping: 45, stiffness: 400 }}
                  rotationInterval={2200}
                />
              </h1>

              <TextType
                as="p"
                text={[
                  'Exploring the intersection of technology, creativity, and human experience - where every line of code meets a spark of imagination.',
                  'Bloggazers is where stories about design, tech, and thought leadership come alive - connecting curiosity with creativity in every post.',
                  'Discover insights that blend logic with emotion, pixels with passion, and technology with timeless human creativity.',
                  'Step into a space where code becomes art, words become movement, and inspiration never stops flowing.',
                  'Unfolding stories that redefine the way we think about technology, culture, and the creative mind behind every idea.',
                  'From experiments in web design to reflections on digital life - Bloggazers captures the rhythm of modern creativity.',
                  'Your go-to space for deep dives into the future of design, innovation, and the evolving connection between humans and technology.',
                  'We gaze at blogs not just to read - but to feel, imagine, and reimagine what’s possible through the digital lens.',
                  'A creative hub for thinkers, makers, and dreamers shaping the next wave of storytelling through tech and design.',
                  'Join me on an ever-evolving journey through ideas, innovation, and inspiration - from web trends to life lessons that shape our digital world.',
                ]}
                className="text-xl sm:text-2xl text-gray-700 dark:text-blue-100 mb-8 max-w-3xl mx-auto animate-fade-in-delay h-24 sm:h-16" // <-- MODIFIED
                typingSpeed={50}
                deletingSpeed={30}
                pauseDuration={2500}
                loop={true}
                cursorCharacter=" █"
                cursorClassName="text-gray-700 dark:text-blue-100" // Match cursor color to text // <-- MODIFIED
              />

              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 animate-fade-in-delay-2">
                <Link
                  to="/blogs"
                  className="group px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-all transform hover:scale-105 shadow-lg flex items-center space-x-2"
                >
                  <span>Read Blogs</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/about"
                  className="px-8 py-4 bg-transparent border-2 border-gray-900 dark:border-white text-gray-900 dark:text-white rounded-lg font-semibold hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-blue-600 transition-all transform hover:scale-105" // <-- MODIFIED
                >
                  About Me
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* --- The 3D scene div that was here is now REMOVED --- */}

        {/* --- Features Section (Your existing code) --- */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-white/5 dark:bg-gray-900/5 rounded-xl dark:border-gray-800/5">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
                <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Quality Content</h3>
              <p className="text-gray-600 dark:text-gray-400">
                In-depth articles on technology, design, and personal growth
              </p>
            </div>

            <div className="text-center p-8 bg-white/5 dark:bg-gray-900/5 rounded-xl dark:border-gray-800/5">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
                <TrendingUp className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Always Learning</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Stay updated with the latest trends and best practices
              </p>
            </div>

            <div className="text-center p-8 bg-white/5 dark:bg-gray-900/5 rounded-xl dark:border-gray-800/5">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
                <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Community Driven</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Join discussions and connect with like-minded individuals
              </p>
            </div>
          </div>
        </section>

        {/* --- Featured Posts Section (Your existing code) --- */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Featured Posts</h2>
              <p className="text-gray-600 dark:text-gray-400">Check out our latest and greatest articles</p>
            </div>
            <Link
              to="/blogs"
              className="hidden sm:flex items-center space-x-2 text-blue-600 dark:text-blue-400 font-semibold hover:underline"
            >
              <span>View All</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {loading ? (
            <p className="text-center text-gray-600 dark:text-gray-400">Loading blogs...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredBlogs.map((blog) => (
                <BlogCard key={blog.id} blog={blog} />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/blogs"
              className="inline-flex items-center space-x-2 px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
            >
              <span>Explore All Blogs</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>

        {/* --- Newsletter Section --- */}
        <section className="text-gray-900 dark:text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 sm:p-12 text-center">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Subscribe to Newsletter</h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Get the latest posts delivered right to your inbox. Stay updated with new articles and insights.
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  const emailInput = form.elements.namedItem('newsletter-email') as HTMLInputElement;
                  if (emailInput.value.trim()) {
                    // Simulate subscription
                    alert('Thanks for subscribing!');
                    emailInput.value = '';
                  }
                }}
                className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto"
              >
                <input
                  type="email"
                  name="newsletter-email"
                  placeholder="Enter your email"
                  className="flex-1 px-6 py-3 rounded-lg text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-2 border-transparent focus:border-white focus:ring-0 focus:outline-none transition-colors"
                  required
                />
                <button
                  type="submit"
                  className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors shadow-lg"
                >
                  Subscribe
                </button>
              </form>
              <p className="text-sm text-blue-100 mt-4 opacity-75">
                No spam, unsubscribe at any time.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;