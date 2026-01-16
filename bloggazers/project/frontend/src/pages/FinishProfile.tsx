// src/pages/FinishProfile.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updateUser, checkUsernameUnique } from '../utils/firebaseHelpers';
import toast from 'react-hot-toast';
import { User, Check, ArrowRight, ArrowLeft, Loader2, X } from 'lucide-react';

const FinishProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Data State
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [profession, setProfession] = useState('');
  const [socials, setSocials] = useState({
    twitter: '',
    linkedin: '',
    github: '',
    website: '',
  });

  // Username validation state
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      // Pre-fill full_name from Google data if available
      setFullName(user.full_name || '');
    }
  }, [user]);

  // Debounced username check
  useEffect(() => {
    const handler = setTimeout(async () => {
      if (!username) {
        setUsernameError(null);
        return;
      }
      if (username.length < 3) {
        setUsernameError('Username must be at least 3 characters.');
        return;
      }
      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        setUsernameError('Username can only contain letters, numbers, and underscores.');
        return;
      }

      setIsCheckingUsername(true);
      const isTaken = await checkUsernameUnique(username);
      if (isTaken) {
        setUsernameError('This username is already taken.');
      } else {
        setUsernameError(null);
      }
      setIsCheckingUsername(false);
    }, 500); // 500ms debounce

    return () => {
      clearTimeout(handler);
    };
  }, [username]);


  const handleNextStep = () => {
    if (step === 1 && (usernameError || !username)) {
      toast.error(usernameError || 'Please enter a valid username.');
      return;
    }
    if (step === 2 && !fullName) {
      toast.error('Please enter your full name.');
      return;
    }
    setStep((s) => s + 1);
  };

  const handlePrevStep = () => {
    setStep((s) => s - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    const toastId = toast.loading('Creating your profile...');

    try {
      await updateUser(user.id, {
        username: username.toLowerCase(),
        full_name: fullName,
        phone: phone || '', // Send empty string if not provided
        profession: profession || '',
        socials: {
          twitter: socials.twitter || '',
          linkedin: socials.linkedin || '',
          github: socials.github || '',
          website: socials.website || '',
        },
        status: 'active', // <-- Activate the user!
      });

      toast.success('Profile created successfully! Welcome!', { id: toastId });

      // Refresh user data in context to update the status
      await refreshUser();

      // Navigate to profile page
      navigate('/profile');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to create profile.', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return <Navigate to="/login" />;
  }

  const getUsernameIcon = () => {
    if (isCheckingUsername) return <Loader2 className="w-5 h-5 animate-spin text-gray-400" />;
    if (!username) return null;
    if (usernameError) return <X className="w-5 h-5 text-red-500" />;
    return <Check className="w-5 h-5 text-green-500" />;
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl sm:text-5xl font-bold text-center mb-4">Welcome to Bloggazers!</h1>
        <p className="text-xl text-gray-700 dark:text-blue-100 text-center mb-8">
          Let's set up your profile.
        </p>

        {/* Stepper */}
        <div className="w-full flex justify-center items-center mb-8 space-x-4">
          <span className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>1</span>
          <div className={`h-1 w-1/4 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
          <span className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>2</span>
          <div className={`h-1 w-1/4 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
          <span className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>3</span>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-8">

          {/* --- Step 1: Username --- */}
          <div className={step === 1 ? 'block' : 'hidden'}>
            <h2 className="text-2xl font-bold mb-6">Create your unique username</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Username *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full pl-10 pr-10 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., code_ninja"
                  />
                  <User className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {getUsernameIcon()}
                  </div>
                </div>
                {usernameError && <p className="text-sm text-red-500 mt-1">{usernameError}</p>}
                {!usernameError && !isCheckingUsername && username && <p className="text-sm text-green-500 mt-1">Username is available!</p>}
              </div>
              <button type="button" onClick={handleNextStep} disabled={!!usernameError || isCheckingUsername || !username} className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50">
                <span>Next</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* --- Step 2: Personal Info --- */}
          <div className={step === 2 ? 'block' : 'hidden'}>
            <h2 className="text-2xl font-bold mb-6">Tell us about yourself</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="fullName" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Full Name *</label>
                <input type="text" id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" placeholder="Your full name" />
              </div>
              <div>
                <label htmlFor="profession" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Profession (Optional)</label>
                <input type="text" id="profession" value={profession} onChange={(e) => setProfession(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" placeholder="e.g., Software Developer" />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Phone Number (Optional, Private)</label>
                <input type="tel" id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" placeholder="Your phone number" />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">This will not be displayed on your profile.</p>
              </div>
              <div className="flex justify-between">
                <button type="button" onClick={handlePrevStep} className="flex items-center space-x-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600">
                  <ArrowLeft className="w-5 h-5" />
                  <span>Back</span>
                </button>
                <button type="button" onClick={handleNextStep} disabled={!fullName} className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50">
                  <span>Next</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* --- Step 3: Social Links --- */}
          <div className={step === 3 ? 'block' : 'hidden'}>
            <h2 className="text-2xl font-bold mb-6">Add your social links (Optional)</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="twitter" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Twitter URL</label>
                <input type="url" id="twitter" value={socials.twitter} onChange={(e) => setSocials({ ...socials, twitter: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" placeholder="https://twitter.com/..." />
              </div>
              <div>
                <label htmlFor="linkedin" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">LinkedIn URL</label>
                <input type="url" id="linkedin" value={socials.linkedin} onChange={(e) => setSocials({ ...socials, linkedin: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" placeholder="https://linkedin.com/in/..." />
              </div>
              <div>
                <label htmlFor="github" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">GitHub URL</label>
                <input type="url" id="github" value={socials.github} onChange={(e) => setSocials({ ...socials, github: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" placeholder="https://github.com/..." />
              </div>
              <div>
                <label htmlFor="website" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Personal Website</label>
                <input type="url" id="website" value={socials.website} onChange={(e) => setSocials({ ...socials, website: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" placeholder="https://my-portfolio.com" />
              </div>
              <div className="flex justify-between">
                <button type="button" onClick={handlePrevStep} className="flex items-center space-x-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600">
                  <ArrowLeft className="w-5 h-5" />
                  <span>Back</span>
                </button>
                <button type="submit" disabled={isSubmitting} className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50">
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                  <span>Finish Setup</span>
                </button>
              </div>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};

export default FinishProfile;