import { useState, useEffect } from 'react';

export interface SavedResult {
  id: string;
  tool: string;
  topic: string;
  content: string;
  timestamp: number;
  model: string;
}

const STORAGE_KEY = 'studyslate_saved_results';

export function useSavedResults() {
  const [results, setResults] = useState<SavedResult[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setResults(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load saved results', e);
    }
    setIsLoaded(true);
  }, []);

  const saveResult = (tool: string, topic: string, content: string, model: string) => {
    const newResult: SavedResult = {
      id: crypto.randomUUID(),
      tool,
      topic: topic.slice(0, 100),
      content,
      timestamp: Date.now(),
      model,
    };
    
    const updated = [newResult, ...results];
    setResults(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newResult.id;
  };

  const deleteResult = (id: string) => {
    const updated = results.filter(r => r.id !== id);
    setResults(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const clearAll = () => {
    setResults([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const downloadMarkdown = (result: SavedResult) => {
    const blob = new Blob([`# ${result.tool.toUpperCase()}: ${result.topic}\n\n*Generated on ${new Date(result.timestamp).toLocaleString()} using ${result.model}*\n\n---\n\n${result.content}`], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result.tool}-${result.topic.replace(/[^a-z0-9]/gi, '_').slice(0, 30)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return { results, isLoaded, saveResult, deleteResult, clearAll, downloadMarkdown };
}
