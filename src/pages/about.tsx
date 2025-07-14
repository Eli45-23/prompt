
// src/pages/about.tsx

import React from 'react';
import { GetStaticProps } from 'next';

interface AboutProps {
  buildDate: string;
}

const AboutPage: React.FC<AboutProps> = ({ buildDate }) => {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 lg:p-24 bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-300">
      <h1 className="text-4xl font-bold mb-8 text-center">About PromptBuilder</h1>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md max-w-2xl text-center">
        <p className="text-lg mb-4">
          PromptBuilder is an innovative web application designed to empower creators by generating optimized video prompts for various AI models like Google Veo 3, Flow, Runway, and Pika.
        </p>
        <p className="text-lg mb-4">
          Our goal is to streamline the creative process, allowing users to focus on their vision while the application handles the intricacies of prompt engineering best practices.
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          This page was statically generated on: {buildDate}
        </p>
      </div>
    </main>
  );
};

export const getStaticProps: GetStaticProps<AboutProps> = async () => {
  const buildDate = new Date().toLocaleString();
  return {
    props: {
      buildDate,
    },
  };
};

export default AboutPage;
