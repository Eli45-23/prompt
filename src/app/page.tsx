'use client';

import { useState, useEffect, useCallback } from 'react';
import { predefinedTemplates } from '@/lib/templates';
import { ClipboardCopy } from 'lucide-react'; // Import ClipboardCopy icon

interface GeneratedPromptData {
  id: string;
  idea: string;
  model: 'veo3' | 'flow' | 'runway' | 'pika';
  assembledPrompt: string;
  timestamp: number;
  isFavorite: boolean;
}

export default function Home() {
  const [idea, setIdea] = useState('');
  const [model, setModel] = useState<'veo3' | 'flow' | 'runway' | 'pika'>('veo3');
  const [loading, setLoading] = useState(false);
  const [assembledPrompt, setAssembledPrompt] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [promptHistory, setPromptHistory] = useState<GeneratedPromptData[]>([]);

  // Customizable prompt fragments
  const [visualStyle, setVisualStyle] = useState('cinematic');
  const [cameraMovement, setCameraMovement] = useState('slow dolly in');
  const [background, setBackground] = useState('a neutral, out-of-focus background');
  const [lightingMood, setLightingMood] = useState('dramatic, with a single key light');
  const [audioCues, setAudioCues] = useState('a subtle, ambient soundtrack');
  const [colorPalette, setColorPalette] = useState('a muted, desaturated color palette');
  const [negativePrompts, setNegativePrompts] = useState('blurry, low-quality, cartoonish');

  // Load dark mode preference and prompt history from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode');
      if (savedMode === 'true') {
        setDarkMode(true);
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      const savedHistory = localStorage.getItem('promptHistory');
      if (savedHistory) {
        setPromptHistory(JSON.parse(savedHistory));
      }

      // Register service worker
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
              console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
              console.log('SW registration failed: ', registrationError);
            });
        });
      }
    }
  }, []);

  // Toggle dark mode and save preference
  const toggleDarkMode = () => {
    setDarkMode((prevMode) => {
      const newMode = !prevMode;
      if (typeof window !== 'undefined') {
        localStorage.setItem('darkMode', String(newMode));
        if (newMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
      return newMode;
    });
  };

  const generateLivePrompt = useCallback(async () => {
    if (!idea) {
      setAssembledPrompt('');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idea,
          model,
          visualStyle,
          cameraMovement,
          background,
          lightingMood,
          audioCues,
          colorPalette,
          negativePrompts,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate prompt');
      }

      const data = await response.json();
      setAssembledPrompt(data.assembledPrompt);

      // Add to history
      const newPromptEntry: GeneratedPromptData = {
        id: Date.now().toString(), // Simple unique ID
        idea,
        model,
        assembledPrompt: data.assembledPrompt,
        timestamp: Date.now(),
        isFavorite: false,
      };
      setPromptHistory((prevHistory) => {
        const updatedHistory = [newPromptEntry, ...prevHistory.slice(0, 9)]; // Keep last 10
        if (typeof window !== 'undefined') {
          localStorage.setItem('promptHistory', JSON.stringify(updatedHistory));
        }
        return updatedHistory;
      });

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [idea, model, visualStyle, cameraMovement, background, lightingMood, audioCues, colorPalette, negativePrompts]);

  useEffect(() => {
    const handler = setTimeout(() => {
      generateLivePrompt();
    }, 500); // Debounce for 500ms

    return () => {
      clearTimeout(handler);
    };
  }, [generateLivePrompt]);

  const handleCopyClick = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const toggleFavorite = (id: string) => {
    setPromptHistory((prevHistory) => {
      const updatedHistory = prevHistory.map((prompt) =>
        prompt.id === id ? { ...prompt, isFavorite: !prompt.isFavorite } : prompt
      );
      if (typeof window !== 'undefined') {
        localStorage.setItem('promptHistory', JSON.stringify(updatedHistory));
      }
      return updatedHistory;
    });
  };

  const handleRefineClick = async () => {
    if (!assembledPrompt) return;

    setLoading(true);
    try {
      const response = await fetch('/api/refine', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: assembledPrompt }),
      });

      if (!response.ok) {
        throw new Error('Failed to refine prompt');
      }

      const data = await response.json();
      setAssembledPrompt(data.refinedPrompt);

      // Update history with refined prompt
      setPromptHistory((prevHistory) => {
        const updatedHistory = prevHistory.map((entry) =>
          entry.assembledPrompt === assembledPrompt
            ? { ...entry, assembledPrompt: data.refinedPrompt, timestamp: Date.now() } // Update the last generated prompt
            : entry
        );
        if (typeof window !== 'undefined') {
          localStorage.setItem('promptHistory', JSON.stringify(updatedHistory));
        }
        return updatedHistory;
      });

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportMarkdown = () => {
    if (!assembledPrompt) return;
    const filename = `prompt_${Date.now()}.md`;
    const markdownContent = `## Prompt for ${idea} (${model})\n\n```\n${assembledPrompt}\n```\n\n---\n\nGenerated by PromptBuilder on ${new Date().toLocaleString()}\n`;
    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShareLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      alert('Current page URL copied to clipboard!');
    }
  };

  const loadTemplate = (template: typeof predefinedTemplates[0]) => {
    setIdea(template.idea);
    setModel(template.model);
    setVisualStyle(template.visualStyle);
    setCameraMovement(template.cameraMovement);
    setBackground(template.background);
    setLightingMood(template.lightingMood);
    setAudioCues(template.audioCues);
    setColorPalette(template.colorPalette);
    setNegativePrompts(template.negativePrompts);
  };

  const favoritePrompts = promptHistory.filter(p => p.isFavorite);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 lg:p-24 bg-dark-gradient text-gray-100 transition-colors duration-300">
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-full bg-white/20 backdrop-blur-sm text-white focus:outline-none focus:ring-2 focus:ring-green-400"
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
      </div>

      <div className="relative w-full max-w-6xl bg-black/30 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-6 lg:p-10 flex flex-col items-center">
        <h1 className="text-5xl font-extrabold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-400">
          PromptBuilder
        </h1>

        <div className="flex flex-col lg:flex-row w-full gap-8">
          {/* Controls Section */}
          <section className="flex-1 p-4 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4 text-white">Video Idea</h2>
            <div className="mb-4">
              <input
                className="w-full p-3 bg-white/20 placeholder-gray-300 text-white rounded-lg px-4 py-2 shadow-inner focus:outline-none focus:ring-2 focus:ring-green-400"
                type="text"
                placeholder="Describe your video idea... (e.g., a cat playing with yarn)"
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                maxLength={100}
                required
              />
            </div>

            <h2 className="text-2xl font-semibold mb-4 mt-6 text-white">Model & Style</h2>
            <div className="flex items-center mb-4 flex-wrap gap-2">
              <span className="mr-4 text-lg text-white">Model:</span>
              {[ 'veo3', 'flow', 'runway', 'pika' ].map((m) => (
                <label key={m} className={`flex items-center cursor-pointer px-4 py-2 rounded-full transition-all duration-200
                  ${model === m ? 'bg-gradient-to-r from-green-400 to-teal-400 text-black font-bold' : 'bg-white/20 hover:bg-white/30 text-white'}`}>
                  <input
                    type="radio"
                    name="model"
                    value={m}
                    checked={model === m}
                    onChange={() => setModel(m as 'veo3' | 'flow' | 'runway' | 'pika')}
                    className="hidden"
                  />
                  <span className="ml-2">{m.charAt(0).toUpperCase() + m.slice(1)}</span>
                </label>
              ))}
            </div>

            <h2 className="text-2xl font-semibold mb-4 mt-6 text-white">Prompt Adjustments</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="visualStyle" className="block text-sm font-medium text-gray-200">Visual Style:</label>
                <input
                  id="visualStyle"
                  type="text"
                  value={visualStyle}
                  onChange={(e) => setVisualStyle(e.target.value)}
                  className="mt-1 block w-full p-2 bg-white/20 placeholder-gray-300 text-white rounded-lg px-4 py-2 shadow-inner focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>
              <div>
                <label htmlFor="cameraMovement" className="block text-sm font-medium text-gray-200">Camera Movement:</label>
                <input
                  id="cameraMovement"
                  type="text"
                  value={cameraMovement}
                  onChange={(e) => setCameraMovement(e.target.value)}
                  className="mt-1 block w-full p-2 bg-white/20 placeholder-gray-300 text-white rounded-lg px-4 py-2 shadow-inner focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>
              <div>
                <label htmlFor="background" className="block text-sm font-medium text-gray-200">Background:</label>
                <input
                  id="background"
                  type="text"
                  value={background}
                  onChange={(e) => setBackground(e.target.value)}
                  className="mt-1 block w-full p-2 bg-white/20 placeholder-gray-300 text-white rounded-lg px-4 py-2 shadow-inner focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>
              <div>
                <label htmlFor="lightingMood" className="block text-sm font-medium text-gray-200">Lighting & Mood:</label>
                <input
                  id="lightingMood"
                  type="text"
                  value={lightingMood}
                  onChange={(e) => setLightingMood(e.target.value)}
                  className="mt-1 block w-full p-2 bg-white/20 placeholder-gray-300 text-white rounded-lg px-4 py-2 shadow-inner focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>
              <div>
                <label htmlFor="audioCues" className="block text-sm font-medium text-gray-200">Audio Cues:</label>
                <input
                  id="audioCues"
                  type="text"
                  value={audioCues}
                  onChange={(e) => setAudioCues(e.target.value)}
                  className="mt-1 block w-full p-2 bg-white/20 placeholder-gray-300 text-white rounded-lg px-4 py-2 shadow-inner focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>
              <div>
                <label htmlFor="colorPalette" className="block text-sm font-medium text-gray-200">Color Palette:</label>
                <input
                  id="colorPalette"
                  type="text"
                  value={colorPalette}
                  onChange={(e) => setColorPalette(e.target.value)}
                  className="mt-1 block w-full p-2 bg-white/20 placeholder-gray-300 text-white rounded-lg px-4 py-2 shadow-inner focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>
              <div>
                <label htmlFor="negativePrompts" className="block text-sm font-medium text-gray-200">Negative Prompts:</label>
                <input
                  id="negativePrompts"
                  type="text"
                  value={negativePrompts}
                  onChange={(e) => setNegativePrompts(e.target.value)}
                  className="mt-1 block w-full p-2 bg-white/20 placeholder-gray-300 text-white rounded-lg px-4 py-2 shadow-inner focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>
            </div>
            <button
              className="mt-8 w-full py-3 rounded-full bg-gradient-to-r from-green-400 to-teal-400 text-black font-bold text-lg
                transform hover:-translate-y-0.5 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-black/20"
              onClick={generateLivePrompt}
              disabled={loading}
            >
              {loading ? 'Generating...' : 'Generate Prompt'}
            </button>
          </section>

          {/* Prompt Preview Box */}
          <section className="flex-1 bg-white/10 backdrop-blur-md text-white p-6 rounded-xl border border-white/20 shadow-lg relative">
            <h2 className="text-2xl font-semibold mb-4 text-white">Generated Prompt Preview</h2>
            <div className="relative min-h-[300px]">
              {loading && idea ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10 rounded-xl">
                  <p className="text-green-400 font-medium text-lg">Generating...</p>
                </div>
              ) : null}
              <p className="font-mono whitespace-pre-wrap text-gray-200 text-sm">
                {assembledPrompt || 'Start typing your idea and adjusting parameters to see the prompt preview...'}
              </p>
              {assembledPrompt && (
                <button
                  className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/20 transition-colors"
                  onClick={() => handleCopyClick(assembledPrompt)}
                  title="Copy to Clipboard"
                >
                  <ClipboardCopy className="w-6 h-6 text-white" />
                </button>
              )}
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full transition-colors"
                onClick={handleRefineClick}
                disabled={loading}
              >
                {loading ? 'Refining...' : 'Refine'}
              </button>
              <button
                className="text-sm bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full transition-colors"
                onClick={handleExportMarkdown}
                title="Export as Markdown"
              >
                Export MD
              </button>
              <button
                className="text-sm bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full transition-colors"
                onClick={handleShareLink}
                title="Copy Shareable Link"
              >
                Share Link
              </button>
            </div>
          </section>
        </div>

        {/* Template Library Section */}
        <section className="w-full mt-8 p-6 bg-black/30 backdrop-blur-md border border-white/20 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-semibold mb-4 text-white">Template Library</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {predefinedTemplates.map((template) => (
              <div key={template.id} className="p-4 bg-white/10 border border-white/20 rounded-md">
                <h3 className="text-xl font-medium mb-2 text-white">{template.name}</h3>
                <p className="text-gray-300 text-sm mb-2">{template.description}</p>
                <p className="text-sm text-gray-400">**Idea:** {template.idea}</p>
                <p className="text-sm text-gray-400">**Model:** {template.model}</p>
                <button
                  onClick={() => loadTemplate(template)}
                  className="mt-3 text-sm bg-gradient-to-r from-green-400 to-teal-400 hover:from-green-500 hover:to-teal-500 text-black font-bold px-3 py-1 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-black/20"
                >
                  Load Template
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* History and Favorites Section */}
        <section className="w-full mt-8 p-6 bg-black/30 backdrop-blur-md border border-white/20 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-semibold mb-4 text-white">History & Favorites</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Favorites */}
            <div>
              <h3 className="text-xl font-medium mb-2 text-white">Favorites ({favoritePrompts.length})</h3>
              {favoritePrompts.length === 0 ? (
                <p className="text-gray-400">No favorite prompts yet. Click the ⭐ to add one!</p>
              ) : (
                <div className="space-y-3">
                  {favoritePrompts.map((prompt) => (
                    <div key={prompt.id} className="p-3 bg-white/10 border border-white/20 rounded-md relative">
                      <p className="text-sm text-gray-200">**Idea:** {prompt.idea} ({prompt.model})</p>
                      <p className="text-sm text-gray-300 whitespace-pre-wrap mt-1 font-mono">{prompt.assembledPrompt}</p>
                      <div className="absolute top-2 right-2 flex space-x-2">
                        <button
                          onClick={() => toggleFavorite(prompt.id)}
                          className="text-yellow-400 hover:text-yellow-300"
                          title="Toggle Favorite"
                        >
                          ⭐
                        </button>
                        <button
                          onClick={() => handleCopyClick(prompt.assembledPrompt)}
                          className="text-gray-400 hover:text-gray-300"
                          title="Copy to Clipboard"
                        >
                          📋
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* History */}
            <div>
              <h3 className="text-xl font-medium mb-2 text-white">Recent History ({promptHistory.length})</h3>
              {promptHistory.length === 0 ? (
                <p className="text-gray-400">No recent prompts. Generate one to see it here!</p>
              ) : (
                <div className="space-y-3">
                  {promptHistory.map((prompt) => (
                    <div key={prompt.id} className="p-3 bg-white/10 border border-white/20 rounded-md relative">
                      <p className="text-sm text-gray-200">**Idea:** {prompt.idea} ({prompt.model})</p>
                      <p className="text-sm text-gray-300 whitespace-pre-wrap mt-1 font-mono">{prompt.assembledPrompt}</p>
                      <div className="absolute top-2 right-2 flex space-x-2">
                        <button
                          onClick={() => toggleFavorite(prompt.id)}
                          className={`text-yellow-400 hover:text-yellow-300 ${prompt.isFavorite ? '' : 'opacity-40'}`}
                          title="Toggle Favorite"
                        >
                          ⭐
                        </button>
                        <button
                          onClick={() => handleCopyClick(prompt.assembledPrompt)}
                          className="text-gray-400 hover:text-gray-300"
                          title="Copy to Clipboard"
                        >
                          📋
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}