// src/pages/About.tsx
import React from 'react';
import { Code, Palette, Heart, Coffee } from 'lucide-react';

const About: React.FC = () => {
  return (
    <div className="min-h-screen">
      <div className="text-gray-900 dark:text-white py-16"> {/* <-- MODIFIED */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">About Bloggazers</h1>
          <p className="text-xl text-gray-700 dark:text-blue-100"> {/* <-- MODIFIED */}
            Where technology meets creativity
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="p-8 sm:p-12">

            <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
              <p>
                Welcome to Bloggazers, my personal corner of the internet where I share my thoughts, experiences, and insights on technology, design, and life. This blog is born out of a passion for learning and a desire to share knowledge with others who are on similar journeys.
              </p>

              <p>
                I'm a full-stack developer with a keen eye for design and a love for creating beautiful, functional web applications. Over the years, I've worked with various technologies and frameworks, constantly learning and adapting to the ever-evolving landscape of web development.
              </p>

              <p>
                My writing covers a wide range of topics, from technical tutorials and best practices to personal reflections on career growth and work-life balance. I believe that the best learning happens when we share our experiences, both successes and failures, with others.
              </p>

              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
                What You'll Find Here
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 not-prose mb-8">
                <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <Code className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                      Technical Content
                    </h4>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    In-depth tutorials, coding tips, and explorations of new technologies and frameworks.
                  </p>
                </div>

                <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <Palette className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                      Design Insights
                    </h4>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    UI/UX principles, design trends, and the intersection of aesthetics and functionality.
                  </p>
                </div>

                <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <Heart className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                      Personal Growth
                    </h4>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    Career advice, productivity tips, and reflections on work-life balance.
                  </p>
                </div>

                <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <Coffee className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                      Life & Lifestyle
                    </h4>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    Personal stories, thoughts on culture, and musings on everyday life.
                  </p>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
                My Mission
              </h3>

              <p>
                My goal with Bloggazers is simple: to create content that's both informative and inspiring. I want to help fellow developers level up their skills, encourage creative thinking in problem-solving, and foster a community of lifelong learners.
              </p>

              <p>
                Whether you're a beginner just starting your journey in tech or an experienced developer looking for new perspectives, I hope you'll find something valuable here. Feel free to reach out, share your thoughts, or just say hello. I love connecting with readers and learning from your experiences too.
              </p>
            </div>

            <div className="pt-8 border-t border-gray-200 dark:border-gray-800">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Let's Connect
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                I'm always excited to hear from readers, collaborate on projects, or just have a chat about technology and design. Don't hesitate to reach out!
              </p>
              <a
                href="/contact"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
              >
                Get in Touch
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;