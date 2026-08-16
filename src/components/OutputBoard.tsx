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
    <div className="bg-paper-base rounded-xl p-6 min-h-[400px] text-paper-ink relative overflow-hidden shadow-lg border border-chalk-fog/20">
      {/* Empty state */}
      {isEmpty && (
        <div className="h-full flex flex-col items-center justify-center text-chalk-fog/60">
          <svg className="w-16 h-16 mb-4 opacity-50" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="50" cy="50" r="40" strokeDasharray="8 4" />
            <path d="M35 45 L50 55 L65 40" strokeLinecap="round" />
          </svg>
          <p className="font-hand text-xl">Your output will appear here</p>
          <p className="text-sm mt-2">Fill in the form and click Generate</p>
        </div>
      )}

      {/* Loading state - chalk dots */}
      {isLoading && !output && (
        <div className="h-full flex flex-col items-center justify-center">
          <div className="chalk-dots mb-4">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <p className="font-hand text-lg text-chalk-fog">Chalking out your answer...</p>
        </div>
      )}

      {/* Streaming/Done state */}
      {(isLoading || isDone) && output && (
        <div className="relative">
          <div className={`prose prose-invert max-w-none ${isLoading ? 'caret' : ''}`}>
            <Chalkdown content={output} />
          </div>
          
          {isDone && (
            <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-chalk-fog/20">
              <button onClick={onCopy} className="btn-secondary text-sm py-1 px-3 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                Copy
              </button>
              <button onClick={onAgain} className="btn-secondary text-sm py-1 px-3 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                Again
              </button>
              <button onClick={onClear} className="btn-secondary text-sm py-1 px-3 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                Clear
              </button>
              {onSave && (
                <button onClick={onSave} className={`btn-secondary text-sm py-1 px-3 flex items-center gap-1 ${saved ? 'bg-chalk-mint/30 border-chalk-mint' : ''}`}>
                  <svg className="w-4 h-4" fill={saved ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                  {saved ? 'Saved' : 'Save'}
                </button>
              )}
              {onDownload && (
                <button onClick={onDownload} className="btn-secondary text-sm py-1 px-3 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  Download
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="h-full flex flex-col items-center justify-center">
          <div className="bg-chalk-poppy/20 border border-chalk-poppy rounded-lg p-6 max-w-md text-center">
            <p className="text-chalk-poppy font-semibold mb-2">Oops! Something went wrong</p>
            <p className="text-chalk-fog text-sm mb-4">{error}</p>
            {onRegenerate && (
              <button onClick={onRegenerate} className="btn-primary text-sm">
                🔄 Regenerate
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
