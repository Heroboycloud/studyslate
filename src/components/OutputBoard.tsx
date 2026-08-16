import React from 'react';
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
}

export function OutputBoard({
  status,
  output,
  error,
  onCopy,
  onAgain,
  onClear,
  onRegenerate,
}: OutputBoardProps) {
  const isEmpty = status === 'idle';
  const isLoading = status === 'loading' || status === 'streaming';
  const isDone = status === 'done';
  const isError = status === 'error';

  return (
    <div className="bg-paper-base rounded-xl p-6 min-h-[400px] text-paper-ink relative overflow-hidden">
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
          
          {isDone && onCopy && onAgain && onClear && (
            <div className="flex gap-2 mt-6 pt-4 border-t border-chalk-fog/20">
              <button onClick={onCopy} className="btn-secondary text-sm py-1 px-3">
                📋 Copy
              </button>
              <button onClick={onAgain} className="btn-secondary text-sm py-1 px-3">
                🔄 Again
              </button>
              <button onClick={onClear} className="btn-secondary text-sm py-1 px-3">
                🗑 Clear
              </button>
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
