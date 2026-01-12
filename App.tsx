
import React, { useState, useCallback, useRef } from 'react';
import { verifyContent } from './services/geminiService';
import { AnalysisResult, DetectorStatus, ContentType } from './types';
import AnalysisDisplay from './components/AnalysisDisplay';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ContentType>('text');
  const [text, setText] = useState<string>('');
  const [media, setMedia] = useState<{ url: string; file: File } | null>(null);
  const [status, setStatus] = useState<DetectorStatus>(DetectorStatus.IDLE);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setMedia({ url, file });
      setResult(null);
    }
  };

  const handleAnalyze = useCallback(async () => {
    setStatus(DetectorStatus.ANALYZING);
    setError(null);
    setResult(null);

    try {
      let analysis: AnalysisResult;
      if (activeTab === 'text') {
        analysis = await verifyContent('text', text);
      } else {
        if (!media) throw new Error("Please upload a file first.");
        
        // Convert file to base64
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(media.file);
        });
        const base64 = await base64Promise;
        analysis = await verifyContent(activeTab, base64, media.file.type);
      }
      setResult(analysis);
      setStatus(DetectorStatus.SUCCESS);
    } catch (err: any) {
      setError(err.message || 'Verification failed.');
      setStatus(DetectorStatus.ERROR);
    }
  }, [activeTab, text, media]);

  const reset = () => {
    setText('');
    setMedia(null);
    setResult(null);
    setStatus(DetectorStatus.IDLE);
    setError(null);
  };

  return (
    <div className="min-h-screen pb-20 bg-[#f4f7fa]">
      <nav className="sticky top-0 z-50 glass-effect border-b border-white/50 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center text-white shadow-xl shadow-indigo-200">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h1 className="text-2xl font-black bg-clip-text text-transparent gradient-bg tracking-tighter">
              VERITEXT AI
            </h1>
          </div>
          <button onClick={reset} className="text-sm font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest">
            New Forensic Scan
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 pt-16">
        <header className="text-center mb-12">
          <h2 className="text-5xl font-black text-slate-900 mb-6 tracking-tight leading-tight">
            Distinguish Reality <br/>from <span className="text-indigo-600">Generative AI</span>
          </h2>
          
          <div className="inline-flex p-1.5 bg-slate-200/50 rounded-2xl gap-1">
            {(['text', 'image', 'video'] as ContentType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setResult(null); }}
                className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  activeTab === tab 
                    ? 'bg-white text-indigo-600 shadow-md' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab.toUpperCase()}
              </button>
            ))}
          </div>
        </header>

        {(status === DetectorStatus.IDLE || status === DetectorStatus.ANALYZING || status === DetectorStatus.ERROR) && (
          <div className="glass-effect p-3 rounded-3xl shadow-2xl border border-white transition-all">
            {activeTab === 'text' ? (
              <textarea
                className="w-full h-72 p-8 text-xl bg-transparent border-none focus:ring-0 placeholder:text-slate-300 text-slate-800 leading-relaxed resize-none"
                placeholder="Paste the writing here for linguistic analysis..."
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            ) : (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-72 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-all group overflow-hidden relative"
              >
                {media ? (
                  activeTab === 'image' ? (
                    <img src={media.url} className="w-full h-full object-contain p-4" alt="preview" />
                  ) : (
                    <video src={media.url} className="w-full h-full object-contain p-4" />
                  )
                ) : (
                  <>
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <p className="text-slate-500 font-bold">Drop your {activeTab} here</p>
                    <p className="text-slate-400 text-sm mt-1">or click to browse files</p>
                  </>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  hidden 
                  accept={activeTab === 'image' ? "image/*" : "video/*"}
                  onChange={handleFileChange}
                />
              </div>
            )}

            <div className="p-4 flex flex-col md:flex-row items-center justify-between border-t border-slate-100 gap-6">
              <div className="text-slate-400 text-sm font-medium italic">
                {activeTab === 'text' 
                  ? `${text.length} characters analyzed` 
                  : media ? `File: ${media.file.name}` : 'Awaiting secure upload'
                }
              </div>
              
              <button
                onClick={handleAnalyze}
                disabled={status === DetectorStatus.ANALYZING || (activeTab === 'text' ? text.length < 50 : !media)}
                className={`w-full md:w-auto px-12 py-4 rounded-2xl font-black text-white shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 ${
                  status === DetectorStatus.ANALYZING || (activeTab === 'text' ? text.length < 50 : !media)
                    ? 'bg-slate-300 cursor-not-allowed'
                    : 'gradient-bg hover:brightness-110'
                }`}
              >
                {status === DetectorStatus.ANALYZING ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    VERIFYING...
                  </div>
                ) : 'RUN FORENSIC SCAN'}
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-8 p-6 bg-rose-50 border border-rose-100 rounded-2xl flex gap-4 text-rose-600 animate-bounce">
            <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="font-bold">{error}</p>
          </div>
        )}

        {status === DetectorStatus.SUCCESS && result && (
          <div className="mt-8">
            <AnalysisDisplay result={result} />
            <div className="mt-16 flex justify-center">
              <button 
                onClick={reset}
                className="px-12 py-5 rounded-2xl bg-white border-2 border-indigo-600 text-indigo-600 font-black hover:bg-indigo-50 transition-all shadow-xl active:scale-95 uppercase tracking-widest"
              >
                Scan Another Item
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="mt-32 border-t border-slate-200 pt-12 text-center text-slate-400 text-sm">
        <div className="flex justify-center gap-8 mb-6 font-bold uppercase tracking-tighter opacity-50">
          <span>Forensic Grade</span>
          <span>Zero Logging</span>
          <span>Multi-modal API</span>
        </div>
        <p>© 2025 VeriText Labs. Powered by Advanced Neural Reasoning.</p>
      </footer>
    </div>
  );
};

export default App;
