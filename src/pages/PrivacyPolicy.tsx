// src/pages/PrivacyPolicy.tsx
import React from 'react';
import { Shield, Eye, Database, Lock, UserCheck, Mail } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
    return (
        <div className="min-h-screen">
            <div className="text-gray-900 dark:text-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-xl">
                            <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-bold">Privacy Policy</h1>
                    </div>
                    <p className="text-xl text-gray-700 dark:text-blue-100">
                        Your privacy is important to us
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        Last updated: January 1, 2026
                    </p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
                    <div className="p-8 sm:p-12">

                        {/* Introduction */}
                        <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
                            <p className="text-lg text-gray-600 dark:text-gray-300">
                                At AbhiWrites (Bloggazers), we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website.
                            </p>
                        </div>

                        {/* Policy Sections */}
                        <div className="space-y-10">

                            {/* Information We Collect */}
                            <section>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                                        <Database className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        Information We Collect
                                    </h2>
                                </div>
                                <div className="ml-11 space-y-4 text-gray-600 dark:text-gray-300">
                                    <p>We collect information that you provide directly to us, including:</p>
                                    <ul className="list-disc list-inside space-y-2 ml-4">
                                        <li><strong>Account Information:</strong> Name, email address, username, and profile picture when you create an account</li>
                                        <li><strong>Content:</strong> Blog posts, comments, and any other content you submit to our platform</li>
                                        <li><strong>Communications:</strong> Information you provide when contacting us or subscribing to our newsletter</li>
                                        <li><strong>Usage Data:</strong> Information about how you interact with our website, including pages visited and features used</li>
                                    </ul>
                                </div>
                            </section>

                            {/* How We Use Your Information */}
                            <section>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                                        <Eye className="w-6 h-6 text-green-600 dark:text-green-400" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        How We Use Your Information
                                    </h2>
                                </div>
                                <div className="ml-11 space-y-4 text-gray-600 dark:text-gray-300">
                                    <p>We use the information we collect to:</p>
                                    <ul className="list-disc list-inside space-y-2 ml-4">
                                        <li>Provide, maintain, and improve our services</li>
                                        <li>Process and complete transactions</li>
                                        <li>Send you technical notices, updates, and support messages</li>
                                        <li>Respond to your comments, questions, and requests</li>
                                        <li>Personalize your experience on our platform</li>
                                        <li>Monitor and analyze trends, usage, and activities</li>
                                        <li>Detect, investigate, and prevent fraudulent transactions and abuse</li>
                                    </ul>
                                </div>
                            </section>

                            {/* Data Protection */}
                            <section>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                                        <Lock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        Data Protection
                                    </h2>
                                </div>
                                <div className="ml-11 space-y-4 text-gray-600 dark:text-gray-300">
                                    <p>
                                        We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
                                    </p>
                                    <ul className="list-disc list-inside space-y-2 ml-4">
                                        <li>Encryption of data in transit and at rest</li>
                                        <li>Regular security assessments and audits</li>
                                        <li>Access controls and authentication mechanisms</li>
                                        <li>Secure data storage with trusted cloud providers</li>
                                    </ul>
                                </div>
                            </section>

                            {/* Your Rights */}
                            <section>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg">
                                        <UserCheck className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        Your Rights
                                    </h2>
                                </div>
                                <div className="ml-11 space-y-4 text-gray-600 dark:text-gray-300">
                                    <p>You have the right to:</p>
                                    <ul className="list-disc list-inside space-y-2 ml-4">
                                        <li><strong>Access:</strong> Request a copy of your personal data</li>
                                        <li><strong>Rectification:</strong> Request correction of inaccurate data</li>
                                        <li><strong>Erasure:</strong> Request deletion of your personal data</li>
                                        <li><strong>Portability:</strong> Receive your data in a structured, machine-readable format</li>
                                        <li><strong>Objection:</strong> Object to processing of your personal data</li>
                                        <li><strong>Withdraw Consent:</strong> Withdraw consent at any time where we rely on consent</li>
                                    </ul>
                                </div>
                            </section>

                            {/* Cookies */}
                            <section className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                                    Cookies & Tracking
                                </h2>
                                <p className="text-gray-600 dark:text-gray-300 mb-4">
                                    We use cookies and similar tracking technologies to track activity on our website and store certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
                                </p>
                                <p className="text-gray-600 dark:text-gray-300">
                                    We use essential cookies for authentication, preference cookies to remember your settings, and analytics cookies to understand how you use our site.
                                </p>
                            </section>

                            {/* Third-Party Services */}
                            <section>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                    Third-Party Services
                                </h2>
                                <p className="text-gray-600 dark:text-gray-300 mb-4">
                                    We may employ third-party companies and individuals to facilitate our service, provide the service on our behalf, or assist us in analyzing how our service is used. These third parties have access to your personal information only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose.
                                </p>
                                <p className="text-gray-600 dark:text-gray-300">
                                    Our website may use services from Google (Firebase, Analytics), and other trusted providers that have their own privacy policies.
                                </p>
                            </section>

                            {/* Contact Section */}
                            <section className="pt-8 border-t border-gray-200 dark:border-gray-800">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                                        <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        Contact Us
                                    </h2>
                                </div>
                                <p className="text-gray-600 dark:text-gray-300 mb-4 ml-11">
                                    If you have any questions about this Privacy Policy or our data practices, please contact us:
                                </p>
                                <div className="ml-11">
                                    <a
                                        href="/contact"
                                        className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
                                    >
                                        Get in Touch
                                    </a>
                                </div>
                            </section>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
