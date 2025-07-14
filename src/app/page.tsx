'use client';

import { useState } from 'react';

export default function Home() {
  const [idea, setIdea] = useState('');
  const [model, setModel] = useState<'veo3' | 'flow'>('veo3');
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setPrompt('');

    try {
      const response = await fetch('/api/prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idea, model }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate prompt');
      }

      const data = await response.json();
      setPrompt(data.assembledPrompt);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">PromptBuilder</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-lg">
        <div className="flex items-center border-b border-teal-500 py-2">
          <input
            className="appearance-none bg-transparent border-none w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none"
            type="text"
            placeholder="Describe your video idea..."
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            maxLength={100}
            required
          />
          <button
            className="flex-shrink-0 bg-teal-500 hover:bg-teal-700 border-teal-500 hover:border-teal-700 text-sm border-4 text-white py-1 px-2 rounded"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Generating...' : 'Generate Prompt'}
          </button>
        </div>
        <div className="flex items-center mt-4">
          <span className="mr-2">Model:</span>
          <label className="mr-4">
            <input
              type="radio"
              name="model"
              value="veo3"
              checked={model === 'veo3'}
              onChange={() => setModel('veo3')}
            />
            <span className="ml-1">Veo 3</span>
          </label>
          <label>
            <input
              type="radio"
              name="model"
              value="flow"
              checked={model === 'flow'}
              onChange={() => setModel('flow')}
            />
            <span className="ml-1">Flow</span>
          </label>
        </div>
      </form>
      {prompt && (
        <div className="w-full max-w-lg mt-8">
          <h2 className="text-2xl font-bold mb-4">Generated Prompt</h2>
          <div className="bg-gray-100 p-4 rounded">
            <p className="text-gray-800">{prompt}</p>
            <button
              className="text-sm text-gray-500 hover:text-gray-700 mt-2"
              onClick={() => navigator.clipboard.writeText(prompt)}
            >
              Copy to Clipboard
            </button>
          </div>
        </div>
      )}
    </main>
  );
}