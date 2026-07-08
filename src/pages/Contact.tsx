import React, { useState } from 'react';
import { Mail, CheckCircle } from 'lucide-react'; // <-- REMOVED Send
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Save the contact message to Firestore
      await addDoc(collection(db, 'contacts'), {
        name: formData.name,
        email: formData.email,
        message: formData.message,
        created_at: serverTimestamp(),
      });

      // Show success message
      setSubmitted(true);
      setFormData({ name: '', email: '', message: '' }); // Clear form
      setTimeout(() => {
        setSubmitted(false);
      }, 3000);

    } catch (error) {
      console.error('Error submitting contact form:', error);
      alert('Failed to send message. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    // --- MODIFIED: Removed bg-gray-50 dark:bg-gray-950 ---
    <div className="min-h-screen">
      {/* --- MODIFIED: Removed gradient background --- */}
      <div className="text-gray-900 dark:text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Get in Touch</h1>
          <p className="text-xl text-gray-700 dark:text-blue-100">
            Have a question or want to work together?
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Let's Connect
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
              I'm always interested in hearing about new projects, opportunities, or just having a conversation about technology and design. Drop me a message and I'll get back to you as soon as possible.
            </p>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    Email
                  </h3>
                  <a
                    href="mailto:contact@Bloggazers.com"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    contact@Bloggazers.com
                  </a>
                </div>
              </div>

              <div className="p-6 bg-white dark:bg-blue-700/10 rounded-xl border border-gray-200 dark:border-gray-800">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                  What to Expect
                </h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                  <li className="flex items-start">
                    <span className="text-blue-600 dark:text-blue-400 mr-2">✓</span>
                    Response within 24-48 hours
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 dark:text-blue-400 mr-2">✓</span>
                    Professional and friendly communication
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 dark:text-blue-400 mr-2">✓</span>
                    Open to collaboration opportunities
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-blue-700/10 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-8">
            {submitted ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Message Sent!
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Thanks for reaching out. I'll get back to you soon.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-semibold text-gray-900 dark:text-white mb-2"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-gray-900 dark:text-white mb-2"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="your.email@example.com"
                  />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-semibold text-gray-900 dark:text-white mb-2"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Tell me about your project or question..."
                  />
                </div>

                {/* --- THIS IS THE MODIFIED BUTTON --- */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold transition-all duration-200 overflow-hidden shadow-md hover:shadow-lg active:scale-95 disabled:opacity-50 group"
                >
                  <div className="svg-wrapper-1">
                    <div className="svg-wrapper group-hover:animate-[fly-1_0.6s_ease-in-out_infinite_alternate]">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        width="24"
                        height="24"
                        className="w-5 h-5 transition-transform duration-300 ease-in-out group-hover:translate-x-5 group-hover:rotate-45 group-hover:scale-110"
                      >
                        <path fill="none" d="M0 0h24v24H0z"></path>
                        <path
                          fill="currentColor"
                          d="M1.946 9.315c-.522-.174-.527-.455.01-.634l19.087-6.362c.529-.176.832.12.684.638l-5.454 19.086c-.15.529-.455.547-.679.045L12 14l6-8-8 6-8.054-2.685z"
                        ></path>
                      </svg>
                    </div>
                  </div>
                  <span 
                    className="block ml-2 transition-all duration-300 ease-in-out group-hover:translate-x-20"
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </span>
                </button>
                {/* --- END OF MODIFIED BUTTON --- */}
                
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;