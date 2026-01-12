
import React from 'react';
import { AnalysisResult } from '../types';

interface AnalysisDisplayProps {
  result: AnalysisResult;
}

const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ result }) => {
  const getScoreColor = (score: number) => {
    if (score < 30) return 'text-emerald-600';
    if (score < 70) return 'text-amber-600';
    return 'text-rose-600';
  };

  const copyReport = () => {
    const report = `
VeriText AI Detection Report
----------------------------
Verdict: ${result.verdict}
AI Probability: ${result.score}%
Summary: ${result.summary}

Key Findings:
${result.highlights.map(h => `- [${h.type.toUpperCase()}] ${h.text}: ${h.reason}`).join('\n')}
    `.trim();
    navigator.clipboard.writeText(report);
    alert('Full report copied to clipboard!');
  };

  return (
    <div className="space-y-8 animate-in fade-in zoom-in duration-500">
      <div className="glass-effect p-8 rounded-3xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 border border-white/40">
        <div className="text-center md:text-left flex-1">
          <div className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-bold mb-4 tracking-widest uppercase">
            Detection Identity: Secure
          </div>
          <h2 className="text-5xl font-black mb-2 tracking-tight">
            <span className={getScoreColor(result.score)}>{result.score}%</span>
          </h2>
          <p className="text-2xl font-bold text-slate-800">
            {result.verdict}
          </p>
        </div>
        
        <div className="flex flex-col items-center gap-4">
          <button 
            onClick={copyReport}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all font-semibold text-slate-700 shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m-3 8h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            Copy Full Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 glass-effect p-8 rounded-2xl border border-white/20 shadow-lg">
          <h3 className="text-sm font-black uppercase text-slate-400 mb-4 tracking-tighter">Forensic Summary</h3>
          <p className="text-slate-700 text-lg leading-relaxed">{result.summary}</p>
        </div>
        
        <div className="space-y-4">
          {result.details.complexity !== undefined && (
            <div className="glass-effect p-5 rounded-2xl border border-white/20">
              <p className="text-xs font-bold text-slate-400 uppercase mb-2">Pattern Complexity</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full" style={{ width: `${result.details.complexity}%` }}></div>
                </div>
                <span className="text-sm font-black">{result.details.complexity}%</span>
              </div>
            </div>
          )}
          {result.details.artifactRating !== undefined && (
            <div className="glass-effect p-5 rounded-2xl border border-white/20">
              <p className="text-xs font-bold text-slate-400 uppercase mb-2">Artifact Detection</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-full" style={{ width: `${result.details.artifactRating}%` }}></div>
                </div>
                <span className="text-sm font-black">{result.details.artifactRating}%</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="glass-effect p-8 rounded-2xl border border-white/20 shadow-lg">
        <h3 className="text-sm font-black uppercase text-slate-400 mb-6 tracking-tighter">Analysis Highlights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {result.highlights.map((h, i) => (
            <div key={i} className="p-5 bg-white/50 rounded-xl border border-slate-100 group hover:border-indigo-200 transition-colors">
              <p className="text-slate-900 font-bold mb-2">"{h.text}"</p>
              <p className="text-sm text-slate-500 leading-snug">{h.reason}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalysisDisplay;
