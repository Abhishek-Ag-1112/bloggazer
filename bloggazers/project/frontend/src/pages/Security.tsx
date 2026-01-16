// src/pages/Security.tsx
import React from 'react';
import { ShieldCheck, Lock, Server, Key, AlertTriangle, CheckCircle } from 'lucide-react';

const Security: React.FC = () => {
    return (
        <div className="min-h-screen">
            <div className="text-gray-900 dark:text-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-xl">
                            <ShieldCheck className="w-8 h-8 text-green-600 dark:text-green-400" />
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-bold">Security</h1>
                    </div>
                    <p className="text-xl text-gray-700 dark:text-blue-100">
                        How we keep your data safe and secure
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
                                At AbhiWrites (Bloggazers), security is at the core of everything we do. We employ industry-leading security practices to ensure your data remains protected at all times. This page outlines our security measures and commitment to keeping your information safe.
                            </p>
                        </div>

                        {/* Security Features Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                            <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                                        <Lock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                        End-to-End Encryption
                                    </h3>
                                </div>
                                <p className="text-gray-600 dark:text-gray-400">
                                    All data transmitted between your browser and our servers is encrypted using TLS 1.3, the latest encryption standard.
                                </p>
                            </div>

                            <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                                        <Server className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                        Secure Infrastructure
                                    </h3>
                                </div>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Our platform is hosted on secure, enterprise-grade cloud infrastructure with 24/7 monitoring and automatic threat detection.
                                </p>
                            </div>

                            <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                                        <Key className="w-6 h-6 text-green-600 dark:text-green-400" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                        Secure Authentication
                                    </h3>
                                </div>
                                <p className="text-gray-600 dark:text-gray-400">
                                    We use secure OAuth 2.0 authentication with trusted providers, ensuring your credentials are never exposed.
                                </p>
                            </div>

                            <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg">
                                        <CheckCircle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                        Regular Audits
                                    </h3>
                                </div>
                                <p className="text-gray-600 dark:text-gray-400">
                                    We conduct regular security audits and vulnerability assessments to identify and address potential risks.
                                </p>
                            </div>
                        </div>

                        {/* Security Practices */}
                        <div className="space-y-10">

                            <section>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                    Our Security Practices
                                </h2>
                                <div className="space-y-4 text-gray-600 dark:text-gray-300">
                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                                        <p><strong>Data Encryption at Rest:</strong> All stored data is encrypted using AES-256 encryption, ensuring your information remains secure even in storage.</p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                                        <p><strong>Secure Session Management:</strong> Sessions are managed securely with automatic timeouts and secure cookie handling.</p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                                        <p><strong>Input Validation:</strong> All user inputs are validated and sanitized to prevent injection attacks and XSS vulnerabilities.</p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                                        <p><strong>Rate Limiting:</strong> API rate limiting is implemented to prevent abuse and protect against DDoS attacks.</p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                                        <p><strong>Automated Backups:</strong> Regular automated backups ensure data recovery in case of any incidents.</p>
                                    </div>
                                </div>
                            </section>

                            {/* Responsible Disclosure */}
                            <section className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                                <div className="flex items-center gap-3 mb-4">
                                    <AlertTriangle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                        Responsible Disclosure
                                    </h2>
                                </div>
                                <p className="text-gray-600 dark:text-gray-300 mb-4">
                                    We take security vulnerabilities seriously. If you discover a security issue, we encourage you to report it responsibly. Please contact us directly with details of the vulnerability.
                                </p>
                                <p className="text-gray-600 dark:text-gray-300">
                                    We appreciate the security research community's efforts in helping us maintain a secure platform and will acknowledge valid reports.
                                </p>
                            </section>

                            {/* Account Security Tips */}
                            <section>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                    Keeping Your Account Secure
                                </h2>
                                <p className="text-gray-600 dark:text-gray-300 mb-4">
                                    While we implement robust security measures, you also play a crucial role in keeping your account secure. Here are some tips:
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Use Strong Passwords</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Create unique, complex passwords and consider using a password manager.</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Be Cautious of Phishing</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">We will never ask for your password via email. Be wary of suspicious links.</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Keep Software Updated</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Keep your browser and devices updated with the latest security patches.</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Log Out on Shared Devices</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Always log out when using public or shared computers.</p>
                                    </div>
                                </div>
                            </section>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Security;
