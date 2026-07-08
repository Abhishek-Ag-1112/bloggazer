import React, { useEffect } from 'react';
import { FileText } from 'lucide-react';

export const TermsOfService: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="text-gray-900 dark:text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold">Terms of Service</h1>
          </div>
          <p className="text-xl text-gray-700 dark:text-blue-100">
            Last Updated: July 9, 2026
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white/65 dark:bg-gray-950/40 backdrop-blur-md rounded-xl p-8 sm:p-12 shadow-lg border border-gray-200 dark:border-gray-800">
          <div className="prose prose-lg dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 space-y-6">
            
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2">
              1. Agreement to Terms
            </h2>
            <p>
              By accessing or using our website, Bloggazers (the "Site"), you agree to be bound by these Terms of Service ("Terms") and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this Site.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 border-b border-gray-200 dark:border-gray-800 pb-2">
              2. Intellectual Property Rights
            </h2>
            <p>
              Unless otherwise stated, Abhishek and/or its licensors own the intellectual property rights for all material on Bloggazers. All intellectual property rights are reserved. You may access this from Bloggazers for your own personal use subjected to restrictions set in these terms.
            </p>
            <p>You must not:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Republish material from Bloggazers</li>
              <li>Sell, rent or sub-license material from Bloggazers</li>
              <li>Reproduce, duplicate or copy material from Bloggazers</li>
              <li>Redistribute content from Bloggazers</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 border-b border-gray-200 dark:border-gray-800 pb-2">
              3. User Content
            </h2>
            <p>
              In these Terms, "Your Content" shall mean any audio, video, text, images, or other material you choose to display on this Site. By displaying Your Content, you grant Bloggazers a non-exclusive, worldwide, irrevocable, sub-licensable license to use, reproduce, adapt, publish, translate, and distribute it in any and all media.
            </p>
            <p>
              Your Content must be your own and must not be invading any third-party's rights. Bloggazers reserves the right to remove any of Your Content from this website at any time without notice.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 border-b border-gray-200 dark:border-gray-800 pb-2">
              4. Hyperlinking to our Content
            </h2>
            <p>
              Organizations may link to our home page, to publications, or to other Site information so long as the link: (a) is not in any way deceptive; (b) does not falsely imply sponsorship, endorsement or approval of the linking party and its products and/or services; and (c) fits within the context of the linking party’s site.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 border-b border-gray-200 dark:border-gray-800 pb-2">
              5. Disclaimer of Warranties
            </h2>
            <p>
              This Site and its contents are provided "as is" and "as available" without any warranty or representation of any kind, whether express or implied. Bloggazers is a personal blogging platform and does not warrant that the website will be constantly available, or available at all, or that the information on this website is complete, true, accurate, or non-misleading.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 border-b border-gray-200 dark:border-gray-800 pb-2">
              6. Limitation of Liability
            </h2>
            <p>
              In no event shall Abhishek, nor any of its officers, directors, and employees, be held liable for anything arising out of or in any way connected with your use of this Site whether such liability is under contract. Abhishek shall not be held liable for any indirect, consequential, or special liability arising out of or in any way related to your use of this Site.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 border-b border-gray-200 dark:border-gray-800 pb-2">
              7. Governing Law & Jurisdiction
            </h2>
            <p>
              These Terms will be governed by and interpreted in accordance with the laws of the jurisdiction in which the Site owner resides, and you submit to the non-exclusive jurisdiction of the state and federal courts located in that region for the resolution of any disputes.
            </p>

          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
