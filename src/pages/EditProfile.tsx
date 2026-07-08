import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Save, Camera, User as UserIcon,
  Plus, Trash2, GraduationCap, Briefcase, Award, Lightbulb,
  ChevronDown, ChevronUp
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { updateUser, uploadImage, fetchUser } from '../utils/firebaseHelpers';
import toast from 'react-hot-toast';
import { Education, Experience, Certification, Skill } from '../types';

// Generate unique IDs
const generateId = () => Math.random().toString(36).substring(2, 15);

const EditProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    avatar_url: '',
    twitter: '',
    github: '',
    linkedin: '',
    website: '',
    profession: '',
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Resume data states
  const [education, setEducation] = useState<Education[]>([]);
  const [experience, setExperience] = useState<Experience[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);

  // Collapsible sections state
  const [expandedSections, setExpandedSections] = useState({
    education: true,
    experience: true,
    certifications: true,
    skills: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        const userData = await fetchUser(user.id);
        if (userData) {
          setFormData({
            full_name: userData.full_name || '',
            bio: userData.bio || '',
            avatar_url: userData.avatar_url || '',
            twitter: userData.socials?.twitter || '',
            github: userData.socials?.github || '',
            linkedin: userData.socials?.linkedin || '',
            website: userData.socials?.website || '',
            profession: userData.profession || '',
          });
          setEducation(userData.education || []);
          setExperience(userData.experience || []);
          setCertifications(userData.certifications || []);
          setSkills(userData.skills || []);
        }
      }
      setIsLoading(false);
    };
    loadUserData();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setFormData({ ...formData, avatar_url: URL.createObjectURL(file) });
    }
  };

  // === EDUCATION HANDLERS ===
  const addEducation = () => {
    setEducation([...education, {
      id: generateId(),
      institution: '',
      degree: '',
      field: '',
      startYear: '',
      endYear: '',
      current: false,
      description: ''
    }]);
  };

  const updateEducation = (id: string, field: keyof Education, value: string | boolean) => {
    setEducation(education.map(edu =>
      edu.id === id ? { ...edu, [field]: value } : edu
    ));
  };

  const removeEducation = (id: string) => {
    setEducation(education.filter(edu => edu.id !== id));
  };

  // === EXPERIENCE HANDLERS ===
  const addExperience = () => {
    setExperience([...experience, {
      id: generateId(),
      company: '',
      position: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: ''
    }]);
  };

  const updateExperience = (id: string, field: keyof Experience, value: string | boolean) => {
    setExperience(experience.map(exp =>
      exp.id === id ? { ...exp, [field]: value } : exp
    ));
  };

  const removeExperience = (id: string) => {
    setExperience(experience.filter(exp => exp.id !== id));
  };

  // === CERTIFICATION HANDLERS ===
  const addCertification = () => {
    setCertifications([...certifications, {
      id: generateId(),
      name: '',
      issuer: '',
      issueDate: '',
      expiryDate: '',
      credentialId: '',
      credentialUrl: ''
    }]);
  };

  const updateCertification = (id: string, field: keyof Certification, value: string) => {
    setCertifications(certifications.map(cert =>
      cert.id === id ? { ...cert, [field]: value } : cert
    ));
  };

  const removeCertification = (id: string) => {
    setCertifications(certifications.filter(cert => cert.id !== id));
  };

  // === SKILLS HANDLERS ===
  const addSkill = () => {
    setSkills([...skills, {
      id: generateId(),
      name: '',
      level: 'Intermediate'
    }]);
  };

  const updateSkill = (id: string, field: keyof Skill, value: string) => {
    setSkills(skills.map(skill =>
      skill.id === id ? { ...skill, [field]: value } : skill
    ));
  };

  const removeSkill = (id: string) => {
    setSkills(skills.filter(skill => skill.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    const toastId = toast.loading('Saving profile...');

    try {
      let avatarUrl = formData.avatar_url;

      if (avatarFile) {
        avatarUrl = await uploadImage(avatarFile, 'avatars');
      }

      await updateUser(user.id, {
        full_name: formData.full_name,
        bio: formData.bio,
        avatar_url: avatarUrl,
        profession: formData.profession,
        socials: {
          twitter: formData.twitter,
          github: formData.github,
          linkedin: formData.linkedin,
          website: formData.website,
        },
        education,
        experience,
        certifications,
        skills,
      });

      toast.success('Profile updated successfully!', { id: toastId });
      navigate('/profile');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile.', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors duration-200">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Profile</span>
        </button>

        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="p-8 border-b border-gray-200 dark:border-gray-800">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Profile</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Update your personal information, resume, and public profile.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Avatar Section */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-4">
                Profile Photo
              </label>
              <div className="flex items-center space-x-6">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 ring-4 ring-white dark:ring-gray-900 shadow-lg">
                    {formData.avatar_url ? (
                      <img
                        src={formData.avatar_url}
                        alt="Profile preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <UserIcon className="w-12 h-12" />
                      </div>
                    )}
                  </div>
                  <label
                    htmlFor="avatar-upload"
                    className="absolute bottom-0 right-0 p-1.5 bg-blue-600 text-white rounded-full shadow-lg cursor-pointer hover:bg-blue-700 transition-colors"
                  >
                    <Camera className="w-4 h-4" />
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Upload a new photo
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    JPG, GIF or PNG. Max size of 800K
                  </p>

                  {/* URL Fallback */}
                  <div className="mt-3">
                    <div className="relative flex items-center">
                      <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
                      <span className="flex-shrink-0 mx-2 text-xs text-gray-400">OR URL</span>
                      <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
                    </div>
                    <input
                      type="url"
                      name="avatar_url"
                      value={!avatarFile ? formData.avatar_url : ''}
                      onChange={(e) => {
                        setAvatarFile(null);
                        handleChange(e);
                      }}
                      disabled={!!avatarFile}
                      placeholder="https://example.com/avatar.jpg"
                      className="mt-2 w-full px-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label
                htmlFor="full_name"
                className="block text-sm font-semibold text-gray-900 dark:text-white mb-2"
              >
                Full Name
              </label>
              <input
                type="text"
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Your full name"
              />
            </div>

            {/* Profession */}
            <div>
              <label
                htmlFor="profession"
                className="block text-sm font-semibold text-gray-900 dark:text-white mb-2"
              >
                Profession / Title
              </label>
              <input
                type="text"
                id="profession"
                name="profession"
                value={formData.profession}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="e.g. Software Engineer, Data Scientist, Designer"
              />
            </div>

            {/* Bio */}
            <div>
              <label
                htmlFor="bio"
                className="block text-sm font-semibold text-gray-900 dark:text-white mb-2"
              >
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Tell everyone a little about yourself..."
              />
            </div>

            {/* Social Links */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Social Links</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="twitter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Twitter URL
                  </label>
                  <input
                    type="url"
                    id="twitter"
                    name="twitter"
                    value={formData.twitter}
                    onChange={handleChange}
                    placeholder="https://twitter.com/username"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="github" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    GitHub URL
                  </label>
                  <input
                    type="url"
                    id="github"
                    name="github"
                    value={formData.github}
                    onChange={handleChange}
                    placeholder="https://github.com/username"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    LinkedIn URL
                  </label>
                  <input
                    type="url"
                    id="linkedin"
                    name="linkedin"
                    value={formData.linkedin}
                    onChange={handleChange}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="website" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Website URL
                  </label>
                  <input
                    type="url"
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://yourwebsite.com"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* === EDUCATION SECTION === */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection('education')}
                className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-600 rounded-lg">
                    <GraduationCap className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Education</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{education.length} entries</p>
                  </div>
                </div>
                {expandedSections.education ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </button>

              {expandedSections.education && (
                <div className="p-4 space-y-4 bg-white dark:bg-gray-900">
                  {education.map((edu, index) => (
                    <div key={edu.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-4 bg-gray-50 dark:bg-gray-800/50">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Education #{index + 1}</span>
                        <button
                          type="button"
                          onClick={() => removeEducation(edu.id)}
                          className="p-1.5 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          type="text"
                          value={edu.institution}
                          onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                          placeholder="Institution Name"
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                          placeholder="Degree (e.g., B.Tech, MBA)"
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                        <input
                          type="text"
                          value={edu.field}
                          onChange={(e) => updateEducation(edu.id, 'field', e.target.value)}
                          placeholder="Field of Study"
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={edu.startYear}
                            onChange={(e) => updateEducation(edu.id, 'startYear', e.target.value)}
                            placeholder="Start Year"
                            className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-sm"
                          />
                          <input
                            type="text"
                            value={edu.endYear}
                            onChange={(e) => updateEducation(edu.id, 'endYear', e.target.value)}
                            placeholder="End Year"
                            disabled={edu.current}
                            className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-sm disabled:opacity-50"
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`current-edu-${edu.id}`}
                          checked={edu.current}
                          onChange={(e) => updateEducation(edu.id, 'current', e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor={`current-edu-${edu.id}`} className="text-sm text-gray-600 dark:text-gray-400">
                          Currently studying here
                        </label>
                      </div>

                      <textarea
                        value={edu.description || ''}
                        onChange={(e) => updateEducation(edu.id, 'description', e.target.value)}
                        placeholder="Description (optional)"
                        rows={2}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addEducation}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-blue-500 hover:text-blue-500 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Add Education</span>
                  </button>
                </div>
              )}
            </div>

            {/* === EXPERIENCE SECTION === */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection('experience')}
                className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-900/30 dark:hover:to-emerald-900/30 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-600 rounded-lg">
                    <Briefcase className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Experience</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{experience.length} entries</p>
                  </div>
                </div>
                {expandedSections.experience ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </button>

              {expandedSections.experience && (
                <div className="p-4 space-y-4 bg-white dark:bg-gray-900">
                  {experience.map((exp, index) => (
                    <div key={exp.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-4 bg-gray-50 dark:bg-gray-800/50">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Experience #{index + 1}</span>
                        <button
                          type="button"
                          onClick={() => removeExperience(exp.id)}
                          className="p-1.5 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                          placeholder="Company Name"
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                        <input
                          type="text"
                          value={exp.position}
                          onChange={(e) => updateExperience(exp.id, 'position', e.target.value)}
                          placeholder="Position / Job Title"
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                        <input
                          type="text"
                          value={exp.location || ''}
                          onChange={(e) => updateExperience(exp.id, 'location', e.target.value)}
                          placeholder="Location (optional)"
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={exp.startDate}
                            onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                            placeholder="Start Date"
                            className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-sm"
                          />
                          <input
                            type="text"
                            value={exp.endDate}
                            onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                            placeholder="End Date"
                            disabled={exp.current}
                            className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-sm disabled:opacity-50"
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`current-exp-${exp.id}`}
                          checked={exp.current}
                          onChange={(e) => updateExperience(exp.id, 'current', e.target.checked)}
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        <label htmlFor={`current-exp-${exp.id}`} className="text-sm text-gray-600 dark:text-gray-400">
                          Currently working here
                        </label>
                      </div>

                      <textarea
                        value={exp.description || ''}
                        onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                        placeholder="Job description and responsibilities (optional)"
                        rows={2}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addExperience}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-green-500 hover:text-green-500 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Add Experience</span>
                  </button>
                </div>
              )}
            </div>

            {/* === CERTIFICATIONS SECTION === */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection('certifications')}
                className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 hover:from-amber-100 hover:to-orange-100 dark:hover:from-amber-900/30 dark:hover:to-orange-900/30 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-amber-600 rounded-lg">
                    <Award className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Certifications</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{certifications.length} entries</p>
                  </div>
                </div>
                {expandedSections.certifications ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </button>

              {expandedSections.certifications && (
                <div className="p-4 space-y-4 bg-white dark:bg-gray-900">
                  {certifications.map((cert, index) => (
                    <div key={cert.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-4 bg-gray-50 dark:bg-gray-800/50">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Certification #{index + 1}</span>
                        <button
                          type="button"
                          onClick={() => removeCertification(cert.id)}
                          className="p-1.5 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          type="text"
                          value={cert.name}
                          onChange={(e) => updateCertification(cert.id, 'name', e.target.value)}
                          placeholder="Certification Name"
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                        <input
                          type="text"
                          value={cert.issuer}
                          onChange={(e) => updateCertification(cert.id, 'issuer', e.target.value)}
                          placeholder="Issuing Organization"
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                        <input
                          type="text"
                          value={cert.issueDate}
                          onChange={(e) => updateCertification(cert.id, 'issueDate', e.target.value)}
                          placeholder="Issue Date (e.g., Jan 2024)"
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                        <input
                          type="text"
                          value={cert.expiryDate || ''}
                          onChange={(e) => updateCertification(cert.id, 'expiryDate', e.target.value)}
                          placeholder="Expiry Date (optional)"
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                        <input
                          type="text"
                          value={cert.credentialId || ''}
                          onChange={(e) => updateCertification(cert.id, 'credentialId', e.target.value)}
                          placeholder="Credential ID (optional)"
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                        <input
                          type="url"
                          value={cert.credentialUrl || ''}
                          onChange={(e) => updateCertification(cert.id, 'credentialUrl', e.target.value)}
                          placeholder="Credential URL (optional)"
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addCertification}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-amber-500 hover:text-amber-500 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Add Certification</span>
                  </button>
                </div>
              )}
            </div>

            {/* === SKILLS SECTION === */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection('skills')}
                className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-900/30 dark:hover:to-pink-900/30 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-600 rounded-lg">
                    <Lightbulb className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Skills</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{skills.length} skills</p>
                  </div>
                </div>
                {expandedSections.skills ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </button>

              {expandedSections.skills && (
                <div className="p-4 space-y-4 bg-white dark:bg-gray-900">
                  {skills.map((skill, index) => (
                    <div key={skill.id} className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-gray-400 w-6">{index + 1}.</span>
                      <input
                        type="text"
                        value={skill.name}
                        onChange={(e) => updateSkill(skill.id, 'name', e.target.value)}
                        placeholder="Skill name (e.g., JavaScript, Project Management)"
                        className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                      <select
                        value={skill.level || 'Intermediate'}
                        onChange={(e) => updateSkill(skill.id, 'level', e.target.value)}
                        className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-sm"
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                        <option value="Expert">Expert</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => removeSkill(skill.id)}
                        className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addSkill}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-purple-500 hover:text-purple-500 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Add Skill</span>
                  </button>
                </div>
              )}
            </div>

            {/* Buttons */}
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
                className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                <span>{isSubmitting ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;