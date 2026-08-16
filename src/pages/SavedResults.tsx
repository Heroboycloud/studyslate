import React, { useState } from 'react';
import { useSavedResults } from '../hooks';
import { Chalkdown } from '../lib';
import { SavedResult } from '../types';

const toolIcons: Record<string, string> = {
  mnemonics: '🧠',
  keypoints: '📌',
  questions: '✏️',
  flashcards: '🃏',
  simplify: '✨',
};

const toolNames: Record<string, string> = {
  mnemonics: 'Mnemonic Maker',
  keypoints: 'Key Point Distiller',
  questions: 'Exam Question Generator',
  flashcards: 'Flashcard Forge',
  simplify: 'Concept Simplifier',
};

export function SavedResults() {
  const { results, deleteResult, clearAll, exportResults, importResults } = useSavedResults();
  const [selectedResult, setSelectedResult] = useState<SavedResult | null>(null);
  const [importError, setImportError] = useState<string>('');

  const handleExport = () => {
    exportResults();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importResults(content);
      if (!success) {
        setImportError('Failed to import. Please check the file format.');
      } else {
        setImportError('');
      }
    };
    reader.readAsText(file);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDownloadSingle = (result: SavedResult) => {
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `studyslate-${result.tool}-${result.createdAt}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyContent = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  if (results.length === 0) {
    return (
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-display font-bold text-chalk-white mb-8">
            📚 Saved Results
          </h1>
          
          <div className="bg-chalkboard-dark/50 rounded-xl p-12 border border-chalk-fog/20 text-center">
            <svg className="w-20 h-20 mx-auto mb-6 opacity-50" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="20" y="20" width="60" height="60" rx="8" strokeDasharray="8 4" />
              <path d="M35 40 L65 40" strokeLinecap="round" />
              <path d="M35 55 L65 55" strokeLinecap="round" />
              <path d="M35 70 L55 70" strokeLinecap="round" />
            </svg>
            <p className="font-hand text-2xl text-chalk-fog mb-4">No saved results yet</p>
            <p className="text-chalk-fog/60 mb-6">
              Generate content using any tool and click the Save button to store it here.
            </p>
            <a href="#/" className="btn-primary inline-block">
              Start Creating
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <h1 className="text-3xl font-display font-bold text-chalk-white">
            📚 Saved Results
          </h1>
          
          <div className="flex flex-wrap gap-3">
            <label className="btn-secondary text-sm py-2 px-4 cursor-pointer flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              Import
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>
            <button onClick={handleExport} className="btn-secondary text-sm py-2 px-4 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Export All
            </button>
            <button onClick={clearAll} className="btn-secondary text-sm py-2 px-4 flex items-center gap-2 text-chalk-poppy hover:text-chalk-poppy">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              Clear All
            </button>
          </div>
        </div>

        {importError && (
          <div className="bg-chalk-poppy/20 border border-chalk-poppy rounded-lg p-4 mb-6">
            <p className="text-chalk-poppy text-sm">{importError}</p>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {results.map((result) => (
            <div
              key={result.id}
              className={`bg-chalkboard-dark/50 rounded-xl p-5 border transition-all duration-200 cursor-pointer hover:border-chalk-yellow/50 hover:shadow-lg ${
                selectedResult?.id === result.id ? 'border-chalk-yellow bg-chalkboard-lighter/30' : 'border-chalk-fog/20'
              }`}
              onClick={() => setSelectedResult(result)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{toolIcons[result.tool]}</span>
                  <div>
                    <p className="font-mono text-xs text-chalk-fog uppercase">{toolNames[result.tool]}</p>
                    <p className="font-hand text-lg text-chalk-white truncate max-w-[180px]">{result.topic || 'Untitled'}</p>
                  </div>
                </div>
              </div>
              
              <p className="text-xs text-chalk-fog/60 mb-4">{formatDate(result.createdAt)}</p>
              
              <p className="text-sm text-chalk-fog/80 line-clamp-3 mb-4">
                {result.content.slice(0, 150)}...
              </p>
              
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-chalk-glacier/80 bg-chalk-glacier/10 px-2 py-1 rounded">
                  {result.model.split('/')[1]}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteResult(result.id);
                  }}
                  className="text-chalk-poppy/60 hover:text-chalk-poppy transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Detail View */}
        {selectedResult && (
          <div className="bg-paper-base rounded-xl p-6 shadow-lg border border-chalk-fog/20">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{toolIcons[selectedResult.tool]}</span>
                <div>
                  <p className="font-mono text-xs text-chalk-fog uppercase">{toolNames[selectedResult.tool]}</p>
                  <h2 className="font-hand text-2xl text-paper-ink">{selectedResult.topic || 'Untitled'}</h2>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => handleCopyContent(selectedResult.content)}
                  className="btn-secondary text-sm py-1 px-3 flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  Copy
                </button>
                <button
                  onClick={() => handleDownloadSingle(selectedResult)}
                  className="btn-secondary text-sm py-1 px-3 flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  Download
                </button>
                <button
                  onClick={() => setSelectedResult(null)}
                  className="btn-secondary text-sm py-1 px-3"
                >
                  Close
                </button>
              </div>
            </div>
            
            <div className="prose prose-invert max-w-none text-paper-ink">
              <Chalkdown content={selectedResult.content} />
            </div>
            
            <div className="mt-6 pt-4 border-t border-chalk-fog/20 flex items-center justify-between">
              <p className="text-xs text-chalk-fog/60">
                Created: {formatDate(selectedResult.createdAt)} • Model: {selectedResult.model}
              </p>
              <button
                onClick={() => {
                  deleteResult(selectedResult.id);
                  setSelectedResult(null);
                }}
                className="text-chalk-poppy hover:text-chalk-poppy text-sm flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
