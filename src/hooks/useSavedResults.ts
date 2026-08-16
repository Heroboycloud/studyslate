import { useState, useCallback } from 'react';
import { SavedResult, ToolType } from '../types';

const STORAGE_KEY = 'studyslate_saved_results';

export function useSavedResults() {
  const [results, setResults] = useState<SavedResult[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const saveResult = useCallback((tool: ToolType, topic: string, content: string, model: string) => {
    const newResult: SavedResult = {
      id: crypto.randomUUID(),
      tool,
      topic: topic.slice(0, 100),
      content,
      createdAt: Date.now(),
      model,
    };
    
    setResults(prev => {
      const updated = [newResult, ...prev];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
    
    return newResult;
  }, []);

  const deleteResult = useCallback((id: string) => {
    setResults(prev => {
      const updated = prev.filter(r => r.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearAll = useCallback(() => {
    setResults([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const exportResults = useCallback(() => {
    const dataStr = JSON.stringify(results, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `studyslate-export-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [results]);

  const importResults = useCallback((jsonString: string) => {
    try {
      const imported = JSON.parse(jsonString) as SavedResult[];
      if (Array.isArray(imported)) {
        setResults(imported);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(imported));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  return {
    results,
    saveResult,
    deleteResult,
    clearAll,
    exportResults,
    importResults,
  };
}
