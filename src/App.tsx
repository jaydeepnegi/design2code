import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, 
  Code, 
  Eye, 
  Copy, 
  Download, 
  RefreshCw, 
  Zap, 
  Smartphone, 
  Monitor, 
  Check,
  ChevronRight,
  Sparkles,
  Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-markup';
import { convertDesignToCode } from './services/geminiService';

export default function App() {
  const [image, setImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [viewport, setViewport] = useState<'mobile' | 'desktop'>('desktop');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requirements, setRequirements] = useState<string>('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setMimeType(file.type);
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string);
        setGeneratedCode(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/webp': ['.webp']
    },
    multiple: false
  } as any);

  const handleConvert = async () => {
    if (!image) return;
    setIsGenerating(true);
    setError(null);
    try {
      const code = await convertDesignToCode(image, mimeType, requirements, generatedCode || undefined);
      setGeneratedCode(code);
      setActiveTab('preview');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadCode = () => {
    if (generatedCode) {
      const blob = new Blob([generatedCode], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'index.html';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  useEffect(() => {
    if (activeTab === 'code' && generatedCode) {
      Prism.highlightAll();
    }
  }, [activeTab, generatedCode]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans selection:bg-orange-500/30">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-black fill-current" />
            </div>
            <span className="text-xl font-bold tracking-tight">VisionCode</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#" className="text-sm text-white/60 hover:text-white transition-colors">Documentation</a>
            <button className="px-4 py-2 bg-white text-black text-sm font-semibold rounded-full hover:bg-white/90 transition-colors">
              Get Started
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          
          {/* Left Column: Upload & Input */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl font-bold leading-[1.1] tracking-tight">
                Design to Code <br />
                <span className="text-orange-500">in seconds.</span>
              </h1>
              <p className="text-lg text-white/50 max-w-md">
                Upload a screenshot of any UI design and watch as our AI converts it into responsive HTML and Tailwind CSS.
              </p>
            </div>

            <div 
              {...getRootProps()} 
              className={`
                relative aspect-video rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer
                ${isDragActive ? 'border-orange-500 bg-orange-500/5' : 'border-white/10 hover:border-white/20 bg-white/5'}
                overflow-hidden flex flex-col items-center justify-center gap-4 group
              `}
            >
              <input {...getInputProps()} />
              {image ? (
                <>
                  <img src={image} alt="Upload" className="absolute inset-0 w-full h-full object-contain p-4" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <p className="text-sm font-medium">Click or drag to replace</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Upload className="w-8 h-8 text-white/40" />
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-medium">Drop your design here</p>
                    <p className="text-sm text-white/40">PNG, JPG or WebP up to 10MB</p>
                  </div>
                </>
              )}
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-white/60">
                Custom Requirements (Optional)
              </label>
              <textarea
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                placeholder="e.g., 'Use custom CSS instead of Tailwind', 'Make the buttons rounded', 'Add a dark mode toggle'..."
                className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-orange-500/50 transition-colors resize-none custom-scrollbar"
              />
            </div>

            <button
              onClick={handleConvert}
              disabled={!image || isGenerating}
              className={`
                w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all
                ${!image || isGenerating 
                  ? 'bg-white/5 text-white/20 cursor-not-allowed' 
                  : generatedCode 
                    ? 'bg-orange-500/20 text-orange-500 border border-orange-500/30 hover:bg-orange-500/30'
                    : 'bg-orange-500 text-black hover:bg-orange-400'}
                active:scale-[0.98]
              `}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  {generatedCode ? 'Updating Code...' : 'Analyzing Design...'}
                </>
              ) : (
                <>
                  {generatedCode ? <RefreshCw className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                  {generatedCode ? 'Update with Requirements' : 'Generate Code'}
                </>
              )}
            </button>

            {generatedCode && (
              <button
                onClick={() => {
                  setGeneratedCode(null);
                  setRequirements('');
                }}
                className="w-full py-3 rounded-xl font-medium text-white/40 hover:text-white/60 transition-colors text-sm"
              >
                Start Over / New Design
              </button>
            )}

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: Zap, label: "Fast", desc: "Instant generation" },
                { icon: Smartphone, label: "Responsive", desc: "Mobile-first code" },
                { icon: Code, label: "Clean", desc: "Tailwind CSS" }
              ].map((item, i) => (
                <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/5">
                  <item.icon className="w-5 h-5 text-orange-500 mb-2" />
                  <p className="text-sm font-semibold">{item.label}</p>
                  <p className="text-xs text-white/40">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Output */}
          <div className="lg:sticky lg:top-28">
            <div className="bg-[#141414] rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
              <div className="border-b border-white/10 p-4 flex items-center justify-between bg-black/20">
                <div className="flex bg-white/5 rounded-lg p-1">
                  <button
                    onClick={() => setActiveTab('preview')}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'preview' ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white/60'}`}
                  >
                    <Eye className="w-4 h-4" />
                    Preview
                  </button>
                  <button
                    onClick={() => setActiveTab('code')}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'code' ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white/60'}`}
                  >
                    <Code className="w-4 h-4" />
                    Code
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {activeTab === 'preview' && (
                    <div className="flex bg-white/5 rounded-lg p-1 mr-2">
                      <button
                        onClick={() => setViewport('desktop')}
                        className={`p-1.5 rounded-md transition-all ${viewport === 'desktop' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'}`}
                        title="Desktop view"
                      >
                        <Monitor className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setViewport('mobile')}
                        className={`p-1.5 rounded-md transition-all ${viewport === 'mobile' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'}`}
                        title="Mobile view"
                      >
                        <Smartphone className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  <button 
                    onClick={copyToClipboard}
                    disabled={!generatedCode}
                    className="p-2 text-white/40 hover:text-white disabled:opacity-50 transition-colors"
                    title="Copy code"
                  >
                    {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                  </button>
                  <button 
                    onClick={downloadCode}
                    disabled={!generatedCode}
                    className="p-2 text-white/40 hover:text-white disabled:opacity-50 transition-colors"
                    title="Download HTML"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="aspect-[4/5] relative bg-[#0F0F0F]">
                <AnimatePresence mode="wait">
                  {!generatedCode ? (
                    <motion.div 
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex flex-col items-center justify-center text-center p-8"
                    >
                      <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                        <ImageIcon className="w-10 h-10 text-white/10" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">No code generated yet</h3>
                      <p className="text-white/40 max-w-xs">
                        Upload a design and click "Generate Code" to see the magic happen here.
                      </p>
                    </motion.div>
                  ) : activeTab === 'preview' ? (
                    <motion.div 
                      key="preview"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex items-center justify-center p-4 bg-[#1a1a1a]"
                    >
                      <div 
                        className={`bg-white rounded-lg overflow-hidden shadow-2xl transition-all duration-500 ${viewport === 'mobile' ? 'w-[375px] h-[667px]' : 'w-full h-full'}`}
                      >
                        <iframe
                          srcDoc={generatedCode}
                          title="Preview"
                          className="w-full h-full border-none"
                        />
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="code"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 overflow-auto p-6 font-mono text-sm custom-scrollbar"
                    >
                      <pre className="!bg-transparent !m-0">
                        <code className="language-markup">
                          {generatedCode}
                        </code>
                      </pre>
                    </motion.div>
                  )}
                </AnimatePresence>

                {isGenerating && (
                  <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                    <div className="relative w-24 h-24 mb-6">
                      <div className="absolute inset-0 border-4 border-orange-500/20 rounded-full"></div>
                      <div className="absolute inset-0 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Sparkles className="w-8 h-8 text-orange-500 animate-pulse" />
                      </div>
                    </div>
                    <p className="text-lg font-medium text-white animate-pulse">Gemini is coding...</p>
                    <p className="text-sm text-white/40 mt-2">Analyzing layout, styles, and assets</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-white/10 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-orange-500" />
            <span className="font-bold">VisionCode</span>
          </div>
          <p className="text-white/40 text-sm">
            © 2026 VisionCode AI. Powered by Google Gemini.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm text-white/40 hover:text-white transition-colors">Privacy</a>
            <a href="#" className="text-sm text-white/40 hover:text-white transition-colors">Terms</a>
            <a href="#" className="text-sm text-white/40 hover:text-white transition-colors">Twitter</a>
          </div>
        </div>
      </footer>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}
