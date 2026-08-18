import { useState } from 'react';
import { useRoute } from '../hooks';
import { useSavedResults, SavedResult } from '../hooks/useSavedResults';
import { Chalkdown } from '../lib/chalkdown';

export function SavedResults() {
  const { navigate } = useRoute();
  const { results, isLoaded, deleteResult, clearAll, downloadMarkdown } = useSavedResults();

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getToolIcon = (tool: string) => {
    switch (tool) {
      case 'mnemonics': return '🧠';
      case 'keypoints': return '📌';
      case 'questions': return '❓';
      case 'flashcards': return '🃏';
      case 'simplify': return '✨';
      default: return '📚';
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading saved results...</div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
        <div className="w-24 h-24 mb-6 rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center border border-slate-700 shadow-xl">
          <svg className="w-12 h-12 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </div>
        <h2 className="text-2xl font-display font-bold text-white mb-2">No saved results yet</h2>
        <p className="text-slate-400 text-center mb-6 max-w-md">
          Generate content using any tool and click the Save button to store it here for later access.
        </p>
        <button onClick={() => navigate('/')} className="btn-primary px-6 py-3">
          Start Creating
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-2">Saved Results</h1>
          <p className="text-slate-400">Your personal study library ({results.length} items)</p>
        </div>
        <button
          onClick={clearAll}
          className="px-4 py-2 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded-lg transition-all duration-200 border border-red-500/30 hover:border-red-500/50 text-sm font-medium"
        >
          Clear All
        </button>
      </div>

      <div className="grid gap-4">
        {results.map((result) => (
          <SavedResultCard
            key={result.id}
            result={result}
            onDelete={() => deleteResult(result.id)}
            onDownload={() => downloadMarkdown(result)}
            formatDate={formatDate}
            getToolIcon={getToolIcon}
          />
        ))}
      </div>
    </div>
  );
}

function SavedResultCard({
  result,
  onDelete,
  onDownload,
  formatDate,
  getToolIcon,
}: {
  result: SavedResult;
  onDelete: () => void;
  onDownload: () => void;
  formatDate: (ts: number) => string;
  getToolIcon: (tool: string) => string;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl border border-slate-700/50 overflow-hidden shadow-lg hover:shadow-xl hover:border-cyan-500/30 transition-all duration-300">
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            <div className="text-4xl">{getToolIcon(result.tool)}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-xs font-medium uppercase tracking-wide">
                  {result.tool}
                </span>
                <span className="text-slate-500 text-sm">{formatDate(result.timestamp)}</span>
                <span className="text-slate-600 text-sm">•</span>
                <span className="text-slate-500 text-sm">{result.model}</span>
              </div>
              <h3 className="text-lg font-semibold text-white truncate mb-2">{result.topic}</h3>
              <p className="text-slate-400 text-sm line-clamp-2">
                {result.content.slice(0, 200)}{result.content.length > 200 ? '...' : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white"
              title={isExpanded ? 'Collapse' : 'Expand'}
            >
              <svg className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <button
              onClick={onDownload}
              className="p-2 hover:bg-cyan-900/30 rounded-lg transition-colors text-cyan-400 hover:text-cyan-300"
              title="Download as Markdown"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
            <button
              onClick={onDelete}
              className="p-2 hover:bg-red-900/30 rounded-lg transition-colors text-red-400 hover:text-red-300"
              title="Delete"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="p-6 bg-slate-800/30">
          <div className="prose prose-invert max-w-none">
            <Chalkdown content={result.content} />
          </div>
        </div>
      )}
    </div>
  );
}
