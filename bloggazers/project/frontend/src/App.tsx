// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Blogs from './pages/Blogs';
import BlogDetail from './pages/BlogDetail';
import About from './pages/About';
import Contact from './pages/Contact';
import CreateBlog from './pages/CreateBlog';
import Profile from './pages/Profile';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import EditBlog from './pages/EditBlog';
import DotGrid from './components/DotGrid';
import { Toaster } from 'react-hot-toast';
import AuthorPage from './pages/AuthorPage';
import CategoriesPage from './pages/CategoriesPage';
import TagsPage from './pages/TagsPage';
import EditProfile from './pages/EditProfile';
import NavigationLoader from './components/NavigationLoader';

// --- NEW IMPORTS ---
import RegistrationGuard from './components/RegistrationGuard';
import FinishProfile from './pages/FinishProfile';
import Bookmarks from './pages/Bookmarks';
import SearchPage from './pages/SearchPage';
import NotFoundPage from './pages/NotFoundPage';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Security from './pages/Security';

// --- ADMIN IMPORTS ---
import AdminGuard from './components/AdminGuard';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ManageBlogs from './pages/admin/ManageBlogs';
// --- END NEW IMPORTS ---

const AppContent: React.FC = () => {
  const { isDark } = useTheme();

  // --- DYNAMIC TOAST STYLES ---
  const toastOptions = {
    style: {
      border: '1px solid',
      padding: '16px',
      color: isDark ? '#fff' : '#111827', // dark:text-white / text-gray-900
      background: isDark ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)', // dark:bg-gray-800 / bg-white
      borderColor: isDark ? '#4b5563' : '#e5e7eb', // dark:border-gray-600 / border-gray-200
    },
    success: {
      style: {
        borderColor: isDark ? '#166534' : '#bbf7d0', // dark:border-green-800 / border-green-200
      },
    },
    error: {
      style: {
        borderColor: isDark ? '#991b1b' : '#fecaca', // dark:border-red-800 / border-red-200
      },
    },
  };

  return (
    <div className="min-h-screen text-gray-900 dark:text-white relative">

      <div className="fixed inset-0 w-full h-full z-0">
        <DotGrid
          dotSize={2}
          gap={20}
          baseColor={isDark ? "#393342FF" : "#191322FF"}
          activeColor={isDark ? "#5227FF" : "#5227FF"}
          proximity={150}
          shockRadius={250}
          shockStrength={4}
          resistance={750}
          returnDuration={1}
          className=""
        />
      </div>

      <div className="relative z-10">
        <Toaster
          position="top-right"
          toastOptions={toastOptions}
        />
        <Navbar />
        <main className="pt-28">
          <Routes>
            {/* Public route, available to everyone */}
            <Route path="/login" element={<Login />} />

            {/* All other routes are wrapped by the RegistrationGuard */}
            <Route element={<RegistrationGuard />}>

              {/* Public Routes (available to guests and active users) */}
              <Route path="/" element={<Home />} />
              <Route path="/blogs" element={<Blogs />} />
              <Route path="/blog/:slug" element={<BlogDetail />} />
              <Route path="/author/:authorId" element={<AuthorPage />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/tags" element={<TagsPage />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/security" element={<Security />} />

              {/* Protected Routes (require login) */}
              <Route element={<ProtectedRoute />}>
                {/* This is the new, mandatory registration page */}
                <Route path="/finish-profile" element={<FinishProfile />} />

                {/* These routes are only accessible to 'active' users 
                    (due to the guard) */}
                <Route path="/create-blog" element={<CreateBlog />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/profile/edit" element={<EditProfile />} />
                <Route path="/edit-blog/:slug" element={<EditBlog />} />
                <Route path="/bookmarks" element={<Bookmarks />} /> {/* <-- ADDED */}
              </Route>
            </Route>

            {/* Admin Routes */}
            <Route element={<AdminGuard />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<ManageUsers />} />
                <Route path="/admin/blogs" element={<ManageBlogs />} />
              </Route>
            </Route>

            {/* 404 Route - Must be last */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </div >
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <NavigationLoader />
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;