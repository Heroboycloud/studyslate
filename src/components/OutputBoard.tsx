import { AiStatus } from '../types';
import { Chalkdown } from '../lib';

interface OutputBoardProps {
  status: AiStatus;
  output: string;
  error?: string;
  onCopy?: () => void;
  onAgain?: () => void;
  onClear?: () => void;
  onRegenerate?: () => void;
  onSave?: () => void;
  onDownload?: () => void;
  saved?: boolean;
}

export function OutputBoard({
  status,
  output,
  error,
  onCopy,
  onAgain,
  onClear,
  onRegenerate,
  onSave,
  onDownload,
  saved = false,
}: OutputBoardProps) {
  const isEmpty = status === 'idle';
  const isLoading = status === 'loading' || status === 'streaming';
  const isDone = status === 'done';
  const isError = status === 'error';
  
  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 min-h-[400px] text-white relative overflow-hidden shadow-2xl border border-cyan-500/30 backdrop-blur-sm">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
      
      {/* Empty state */}
      {isEmpty && (
        <div className="h-full flex flex-col items-center justify-center text-slate-400">
          <div className="w-20 h-20 mb-6 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center border border-cyan-500/30 shadow-lg shadow-cyan-500/20">
            <svg className="w-10 h-10 text-cyan-400" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3">
              <circle cx="50" cy="50" r="40" strokeDasharray="8 4" />
              <path d="M35 45 L50 55 L65 40" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="font-display text-xl font-semibold text-white mb-2">Your output will appear here</p>
          <p className="text-slate-400 text-sm">Fill in the form and click Generate to get started</p>
        </div>
      )}

      {/* Loading state - modern spinner */}
      {isLoading && !output && (
        <div className="h-full flex flex-col items-center justify-center">
          <div className="relative mb-6">
            <div className="w-16 h-16 border-4 border-slate-700 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-cyan-500 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="font-display text-lg font-semibold text-white">Generating your answer...</p>
          <p className="text-slate-400 text-sm mt-1">This may take a few seconds</p>
        </div>
      )}

      {/* Streaming/Done state */}
      {(isLoading || isDone) && output && (
        <div className="relative">
          <div className={`prose prose-invert prose-lg max-w-none ${isLoading ? 'animate-pulse' : ''} bg-slate-800/50 rounded-xl p-6 border border-slate-700/50`}>
            <Chalkdown content={output} />
          </div>
          
          {isDone && (
            <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t border-slate-700/50">
              <button onClick={onCopy} className="group flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-all duration-200 border border-slate-600 hover:border-cyan-500/50 shadow-md hover:shadow-cyan-500/20">
                <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                <span className="font-medium">Copy</span>
              </button>
              <button onClick={onAgain} className="group flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-all duration-200 border border-slate-600 hover:border-purple-500/50 shadow-md hover:shadow-purple-500/20">
                <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                <span className="font-medium">Again</span>
              </button>
              <button onClick={onClear} className="group flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-red-900/30 text-white rounded-lg transition-all duration-200 border border-slate-600 hover:border-red-500/50 shadow-md hover:shadow-red-500/20">
                <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                <span className="font-medium">Clear</span>
              </button>
              {onSave && (
                <button onClick={onSave} className={`group flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-200 shadow-md ${saved ? 'bg-green-900/40 border-green-500/50 text-green-400 hover:bg-green-900/50' : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 hover:border-cyan-500/50 hover:shadow-cyan-500/20'}`}>
                  <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill={saved ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                  <span className="font-medium">{saved ? 'Saved' : 'Save'}</span>
                </button>
              )}
              {onDownload && (
                <button onClick={onDownload} className="group flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg transition-all duration-200 border border-cyan-500/30 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50">
                  <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  <span className="font-medium">Download MD</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="h-full flex flex-col items-center justify-center">
          <div className="bg-red-900/20 border border-red-500/50 rounded-2xl p-8 max-w-md text-center shadow-xl shadow-red-500/10">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <p className="text-red-400 font-semibold text-lg mb-2">Generation Failed</p>
            <p className="text-slate-400 text-sm mb-6">{error}</p>
            {onRegenerate && (
              <button onClick={onRegenerate} className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white rounded-xl transition-all duration-200 font-medium shadow-lg shadow-red-500/30 hover:shadow-red-500/50 mx-auto">
                <svg className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                Try Again
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
