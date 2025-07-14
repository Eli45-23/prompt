'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { predefinedTemplates } from '@/lib/templates';
import { 
  ClipboardCopy, 
  Sparkles, 
  Zap, 
  Star, 
  Wand2, 
  Brain, 
  Lightbulb,
  TrendingUp,
  Palette,
  Camera,
  Music,
  Sun,
  Moon,
  ChevronDown,
  RefreshCw,
  Download,
  Share2,
  Award
} from 'lucide-react';

interface GeneratedPromptData {
  id: string;
  idea: string;
  model: 'veo3' | 'flow' | 'runway' | 'pika';
  assembledPrompt: string;
  timestamp: number;
  isFavorite: boolean;
  qualityScore?: number;
}

interface AIAnalysis {
  score: number;
  feedback: string[];
}

interface RefinementResult {
  refinedPrompt: string;
  alternatives: string[];
  originalPrompt: string;
}

export default function Home() {
  const [idea, setIdea] = useState('');
  const [model, setModel] = useState<'veo3' | 'flow' | 'runway' | 'pika'>('veo3');
  const [loading, setLoading] = useState(false);
  const [assembledPrompt, setAssembledPrompt] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [promptHistory, setPromptHistory] = useState<GeneratedPromptData[]>([]);
  
  // AI-powered features
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [promptAnalysis, setPromptAnalysis] = useState<AIAnalysis | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [refinementAlternatives, setRefinementAlternatives] = useState<string[]>([]);
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  
  // Refs for animations
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

    setAiLoading(true);
    try {
      const response = await fetch('/api/refine', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: assembledPrompt, model }),
      });

      if (!response.ok) {
        throw new Error('Failed to refine prompt');
      }

      const data: RefinementResult = await response.json();
      setAssembledPrompt(data.refinedPrompt);
      setRefinementAlternatives(data.alternatives || []);
      setShowAlternatives(data.alternatives?.length > 0);

      // Update history with refined prompt
      setPromptHistory((prevHistory) => {
        const updatedHistory = prevHistory.map((entry) =>
          entry.assembledPrompt === assembledPrompt
            ? { ...entry, assembledPrompt: data.refinedPrompt, timestamp: Date.now() }
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
      setAiLoading(false);
    }
  };

  const handleExportMarkdown = () => {
    if (!assembledPrompt) return;
    const filename = `prompt_${Date.now()}.md`;
    const markdownContent = `## Prompt for ${idea} (${model})

\`\`\`
${assembledPrompt}
\`\`\`

---

Generated by PromptBuilder on ${new Date().toLocaleString()}
`;
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

  // AI-powered functions
  const fetchSuggestions = useCallback(async (input: string) => {
    if (input.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const response = await fetch('/api/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input }),
      });
      const data = await response.json();
      setSuggestions(data.suggestions || []);
      setShowSuggestions(data.suggestions?.length > 0);
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
    }
  }, []);

  const analyzePrompt = useCallback(async (prompt: string) => {
    if (!prompt) return;

    setAnalyzing(true);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await response.json();
      setPromptAnalysis(data);
    } catch (error) {
      console.error('Failed to analyze prompt:', error);
    } finally {
      setAnalyzing(false);
    }
  }, []);

  const optimizePrompt = useCallback(async () => {
    if (!idea) return;

    setOptimizing(true);
    try {
      const response = await fetch('/api/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea, model, currentPrompt: assembledPrompt }),
      });
      const data = await response.json();
      if (data.optimizedPrompt) {
        setAssembledPrompt(data.optimizedPrompt);
        setPromptAnalysis({ score: data.qualityScore, feedback: data.improvements });
      }
    } catch (error) {
      console.error('Failed to optimize prompt:', error);
    } finally {
      setOptimizing(false);
    }
  }, [idea, model, assembledPrompt]);

  // Debounced suggestions
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSuggestions(idea);
    }, 300);
    return () => clearTimeout(timer);
  }, [idea, fetchSuggestions]);

  // Auto-analyze prompt when it changes
  useEffect(() => {
    if (assembledPrompt) {
      const timer = setTimeout(() => {
        analyzePrompt(assembledPrompt);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [assembledPrompt, analyzePrompt]);

  const favoritePrompts = promptHistory.filter(p => p.isFavorite);

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-cyber-dark via-dark-start to-dark-end relative overflow-hidden">
      {/* Animated Background Effects */}
      <div className="absolute inset-0 bg-mesh opacity-20 animate-gradient-xy"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-neon-green/5 via-neon-blue/5 to-neon-purple/5 animate-pulse"></div>
      
      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-neon-green/30 rounded-full"
            initial={{ x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1920), y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1080) }}
            animate={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1920),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1080),
            }}
            transition={{
              duration: Math.random() * 20 + 10,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>

      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 p-6"
      >
        <nav className="flex justify-between items-center max-w-7xl mx-auto">
          <motion.div 
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-10 h-10 bg-neon-gradient rounded-full flex items-center justify-center animate-pulse-neon">
              <Brain className="w-6 h-6 text-black" />
            </div>
            <h1 className="text-2xl font-cyber font-bold text-transparent bg-clip-text bg-aurora animate-gradient-x">
              AI PromptBuilder
            </h1>
          </motion.div>
          
          <motion.button
            onClick={toggleDarkMode}
            className="p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all duration-300 group"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <AnimatePresence mode="wait">
              {darkMode ? (
                <motion.div
                  key="sun"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Sun className="w-5 h-5 text-neon-green group-hover:text-yellow-400 transition-colors" />
                </motion.div>
              ) : (
                <motion.div
                  key="moon"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Moon className="w-5 h-5 text-neon-blue group-hover:text-purple-400 transition-colors" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </nav>
      </motion.header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pb-20">
        {/* Hero Section */}
        <motion.section 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.h2 
            className="text-6xl md:text-8xl font-cyber font-black text-transparent bg-clip-text bg-aurora mb-6 animate-gradient-x"
            animate={{ 
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] 
            }}
            transition={{ duration: 5, repeat: Infinity }}
          >
            CREATE
          </motion.h2>
          <motion.h3 
            className="text-4xl md:text-6xl font-cyber font-bold text-transparent bg-clip-text bg-neon-gradient mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            AMAZING VIDEO PROMPTS
          </motion.h3>
          <motion.p 
            className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
          >
            Powered by advanced AI, create professional-grade video generation prompts for 
            <span className="text-neon-green font-semibold"> Veo 3</span>,
            <span className="text-neon-blue font-semibold"> Flow</span>,
            <span className="text-neon-purple font-semibold"> Runway</span>, and
            <span className="text-neon-pink font-semibold"> Pika</span>
          </motion.p>
        </motion.section>

        {/* Main Interface */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          {/* Left Panel - Input Controls */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-8"
          >
            {/* AI Idea Input */}
            <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl hover:shadow-neon-green/20 transition-all duration-500">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-neon-gradient rounded-full flex items-center justify-center">
                  <Lightbulb className="w-5 h-5 text-black" />
                </div>
                <h3 className="text-2xl font-cyber font-bold text-white">Video Idea</h3>
              </div>
              
              <div className="relative">
                <motion.input
                  ref={inputRef}
                  type="text"
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  placeholder="Describe your amazing video concept..."
                  className="w-full p-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-400 text-lg focus:outline-none focus:border-neon-green focus:ring-2 focus:ring-neon-green/50 transition-all duration-300"
                  whileFocus={{ scale: 1.02 }}
                  maxLength={100}
                />
                
                {/* AI Suggestions Dropdown */}
                <AnimatePresence>
                  {showSuggestions && suggestions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden z-50"
                    >
                      {suggestions.map((suggestion, index) => (
                        <motion.button
                          key={index}
                          onClick={() => {
                            setIdea(suggestion);
                            setShowSuggestions(false);
                          }}
                          className="w-full p-3 text-left hover:bg-white/10 transition-colors text-gray-300 hover:text-white border-b border-white/10 last:border-b-0"
                          whileHover={{ x: 10 }}
                        >
                          <Sparkles className="w-4 h-4 inline mr-2 text-neon-green" />
                          {suggestion}
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Model Selection */}
            <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-cyber-gradient rounded-full flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-2xl font-cyber font-bold text-white">AI Model</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {['veo3', 'flow', 'runway', 'pika'].map((m) => (
                  <motion.button
                    key={m}
                    onClick={() => setModel(m as any)}
                    className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
                      model === m
                        ? 'bg-neon-gradient border-neon-green text-black font-bold shadow-lg shadow-neon-green/50'
                        : 'bg-white/5 border-white/20 text-white hover:border-neon-green/50'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="text-center">
                      <div className="text-lg font-cyber font-bold">
                        {m.charAt(0).toUpperCase() + m.slice(1)}
                      </div>
                      {model === m && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="flex justify-center mt-2"
                        >
                          <Star className="w-5 h-5" />
                        </motion.div>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Advanced Controls */}
            <motion.div 
              className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl"
              layout
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-aurora rounded-full flex items-center justify-center animate-spin-slow">
                    <Wand2 className="w-5 h-5 text-black" />
                  </div>
                  <h3 className="text-2xl font-cyber font-bold text-white">Style Controls</h3>
                </div>
                <motion.button
                  onClick={() => setShowAlternatives(!showAlternatives)}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  whileHover={{ rotate: 180 }}
                >
                  <ChevronDown className={`w-5 h-5 text-white transition-transform ${showAlternatives ? 'rotate-180' : ''}`} />
                </motion.button>
              </div>
              
              <AnimatePresence>
                {showAlternatives && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-hidden"
                  >
                    {[
                      { label: 'Visual Style', value: visualStyle, setter: setVisualStyle, icon: Palette },
                      { label: 'Camera Movement', value: cameraMovement, setter: setCameraMovement, icon: Camera },
                      { label: 'Background', value: background, setter: setBackground, icon: Camera },
                      { label: 'Lighting & Mood', value: lightingMood, setter: setLightingMood, icon: Sun },
                      { label: 'Audio Cues', value: audioCues, setter: setAudioCues, icon: Music },
                      { label: 'Color Palette', value: colorPalette, setter: setColorPalette, icon: Palette },
                    ].map((control, index) => (
                      <motion.div
                        key={control.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="space-y-2"
                      >
                        <label className="flex items-center space-x-2 text-sm font-medium text-gray-300">
                          <control.icon className="w-4 h-4 text-neon-green" />
                          <span>{control.label}:</span>
                        </label>
                        <input
                          type="text"
                          value={control.value}
                          onChange={(e) => control.setter(e.target.value)}
                          className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-neon-green transition-all duration-300"
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <motion.button
                onClick={generateLivePrompt}
                disabled={loading || !idea}
                className="flex-1 py-4 px-8 bg-neon-gradient hover:bg-aurora text-black font-cyber font-bold text-lg rounded-2xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(0, 255, 135, 0.5)" }}
                whileTap={{ scale: 0.95 }}
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Generating...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <Brain className="w-5 h-5" />
                    <span>Generate Prompt</span>
                  </div>
                )}
              </motion.button>
              
              <motion.button
                onClick={optimizePrompt}
                disabled={optimizing || !assembledPrompt}
                className="py-4 px-6 bg-white/10 hover:bg-white/20 text-white font-cyber font-bold rounded-2xl border border-white/20 hover:border-neon-blue transition-all duration-300 disabled:opacity-50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {optimizing ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <TrendingUp className="w-5 h-5" />
                )}
              </motion.button>
            </div>
          </motion.div>

          {/* Right Panel - Output & Analysis */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-y-8"
          >
            {/* Generated Prompt Display */}
            <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-neon-gradient rounded-full flex items-center justify-center animate-pulse">
                    <Sparkles className="w-5 h-5 text-black" />
                  </div>
                  <h3 className="text-2xl font-cyber font-bold text-white">Generated Prompt</h3>
                </div>
                
                {promptAnalysis && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center space-x-2 bg-white/10 rounded-full px-4 py-2"
                  >
                    <Award className="w-5 h-5 text-neon-green" />
                    <span className="text-lg font-bold text-white">
                      {promptAnalysis.score}/100
                    </span>
                  </motion.div>
                )}
              </div>
              
              <div className="relative min-h-[300px]">
                <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-2xl"
                    >
                      <div className="text-center">
                        <RefreshCw className="w-12 h-12 text-neon-green animate-spin mx-auto mb-4" />
                        <p className="text-neon-green font-cyber text-lg">AI is crafting your prompt...</p>
                      </div>
                    </motion.div>
                  ) : assembledPrompt ? (
                    <motion.div
                      key="prompt"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="relative"
                    >
                      <pre className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap font-mono bg-black/20 p-6 rounded-2xl border border-white/10">
                        {assembledPrompt}
                      </pre>
                      
                      <motion.button
                        onClick={() => handleCopyClick(assembledPrompt)}
                        className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors group"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <ClipboardCopy className="w-5 h-5 text-white group-hover:text-neon-green transition-colors" />
                      </motion.button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="placeholder"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 flex items-center justify-center text-center"
                    >
                      <div>
                        <Brain className="w-16 h-16 text-gray-600 mx-auto mb-4 animate-float" />
                        <p className="text-gray-400 text-lg">Start typing your idea to see AI-generated prompts...</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              {/* Action Buttons */}
              {assembledPrompt && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-wrap gap-3 mt-6"
                >
                  <motion.button
                    onClick={handleRefineClick}
                    disabled={aiLoading}
                    className="flex items-center space-x-2 px-4 py-2 bg-neon-blue/20 hover:bg-neon-blue/30 text-neon-blue border border-neon-blue/50 rounded-full transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Wand2 className="w-4 h-4" />
                    <span>{aiLoading ? 'Refining...' : 'AI Refine'}</span>
                  </motion.button>
                  
                  <motion.button
                    onClick={handleExportMarkdown}
                    className="flex items-center space-x-2 px-4 py-2 bg-neon-green/20 hover:bg-neon-green/30 text-neon-green border border-neon-green/50 rounded-full transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Download className="w-4 h-4" />
                    <span>Export</span>
                  </motion.button>
                  
                  <motion.button
                    onClick={handleShareLink}
                    className="flex items-center space-x-2 px-4 py-2 bg-neon-purple/20 hover:bg-neon-purple/30 text-neon-purple border border-neon-purple/50 rounded-full transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share</span>
                  </motion.button>
                </motion.div>
              )}
            </div>

            {/* AI Analysis */}
            {promptAnalysis && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl"
              >
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-aurora rounded-full flex items-center justify-center">
                    <Brain className="w-5 h-5 text-black" />
                  </div>
                  <h3 className="text-2xl font-cyber font-bold text-white">AI Analysis</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-300">Quality Score:</span>
                    <div className="flex-1 bg-white/10 rounded-full h-3 overflow-hidden">
                      <motion.div
                        className="h-full bg-neon-gradient"
                        initial={{ width: 0 }}
                        animate={{ width: `${promptAnalysis.score}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </div>
                    <span className="text-2xl font-bold text-white">{promptAnalysis.score}/100</span>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-lg font-semibold text-white mb-3">Feedback:</h4>
                    {promptAnalysis.feedback.map((feedback, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start space-x-3 p-3 bg-white/5 rounded-xl"
                      >
                        <Lightbulb className="w-5 h-5 text-neon-green flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300">{feedback}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Enhanced Template Library */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h3 className="text-4xl font-cyber font-bold text-transparent bg-clip-text bg-neon-gradient mb-4">
              Template Library
            </h3>
            <p className="text-gray-400 text-lg">Professional templates to get you started</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {predefinedTemplates.map((template, index) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 group cursor-pointer"
                whileHover={{ scale: 1.02, y: -5 }}
                onClick={() => loadTemplate(template)}
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-neon-gradient rounded-full flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-black" />
                  </div>
                  <h4 className="text-xl font-cyber font-bold text-white group-hover:text-neon-green transition-colors">
                    {template.name}
                  </h4>
                </div>
                
                <p className="text-gray-400 mb-4 leading-relaxed">{template.description}</p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500">Idea:</span>
                    <span className="text-gray-300">{template.idea}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500">Model:</span>
                    <span className="text-neon-green font-semibold">{template.model.toUpperCase()}</span>
                  </div>
                </div>
                
                <motion.div
                  className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="w-full py-2 px-4 bg-neon-gradient text-black font-bold text-center rounded-xl">
                    Load Template
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* History & Favorites */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h3 className="text-4xl font-cyber font-bold text-transparent bg-clip-text bg-aurora mb-4">
              Your Creations
            </h3>
            <p className="text-gray-400 text-lg">History and favorite prompts</p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Favorites */}
            <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-neon-gradient rounded-full flex items-center justify-center">
                  <Star className="w-5 h-5 text-black" />
                </div>
                <h4 className="text-2xl font-cyber font-bold text-white">
                  Favorites ({favoritePrompts.length})
                </h4>
              </div>
              
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {favoritePrompts.length === 0 ? (
                  <div className="text-center py-8">
                    <Star className="w-16 h-16 text-gray-600 mx-auto mb-4 animate-float" />
                    <p className="text-gray-400">No favorites yet. Star your best prompts!</p>
                  </div>
                ) : (
                  favoritePrompts.map((prompt) => (
                    <motion.div
                      key={prompt.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all duration-300 group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-white font-semibold">{prompt.idea}</p>
                          <p className="text-neon-green text-sm">{prompt.model.toUpperCase()}</p>
                        </div>
                        <div className="flex space-x-2">
                          <motion.button
                            onClick={() => toggleFavorite(prompt.id)}
                            className="text-yellow-400 hover:text-yellow-300"
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.8 }}
                          >
                            <Star className="w-5 h-5 fill-current" />
                          </motion.button>
                          <motion.button
                            onClick={() => handleCopyClick(prompt.assembledPrompt)}
                            className="text-gray-400 hover:text-white"
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.8 }}
                          >
                            <ClipboardCopy className="w-5 h-5" />
                          </motion.button>
                        </div>
                      </div>
                      <p className="text-gray-400 text-sm line-clamp-3 font-mono">
                        {prompt.assembledPrompt}
                      </p>
                    </motion.div>
                  ))
                )}
              </div>
            </div>

            {/* Recent History */}
            <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-cyber-gradient rounded-full flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 text-white" />
                </div>
                <h4 className="text-2xl font-cyber font-bold text-white">
                  Recent ({promptHistory.length})
                </h4>
              </div>
              
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {promptHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <Brain className="w-16 h-16 text-gray-600 mx-auto mb-4 animate-float" />
                    <p className="text-gray-400">No prompts yet. Create your first one!</p>
                  </div>
                ) : (
                  promptHistory.map((prompt) => (
                    <motion.div
                      key={prompt.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all duration-300 group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-white font-semibold">{prompt.idea}</p>
                          <div className="flex items-center space-x-2">
                            <p className="text-neon-blue text-sm">{prompt.model.toUpperCase()}</p>
                            {prompt.qualityScore && (
                              <span className="text-xs bg-neon-green/20 text-neon-green px-2 py-1 rounded-full">
                                {prompt.qualityScore}/100
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <motion.button
                            onClick={() => toggleFavorite(prompt.id)}
                            className={`${prompt.isFavorite ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-400'}`}
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.8 }}
                          >
                            <Star className={`w-5 h-5 ${prompt.isFavorite ? 'fill-current' : ''}`} />
                          </motion.button>
                          <motion.button
                            onClick={() => handleCopyClick(prompt.assembledPrompt)}
                            className="text-gray-400 hover:text-white"
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.8 }}
                          >
                            <ClipboardCopy className="w-5 h-5" />
                          </motion.button>
                        </div>
                      </div>
                      <p className="text-gray-400 text-sm line-clamp-3 font-mono">
                        {prompt.assembledPrompt}
                      </p>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </div>
        </motion.section>
      </main>
    </div>
  );
}