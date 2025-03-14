import { useState, useCallback } from 'react';
import { HistoryEntry } from '../types';

/**
 * Custom hook to manage undo/redo history
 */
export const useHistory = (initialPattern: string[][]) => {
  const [history, setHistory] = useState<HistoryEntry[]>([{
    pattern: initialPattern,
    timestamp: Date.now()
  }]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Add pattern to history
  const addToHistory = useCallback((pattern: string[][]) => {
    // Create a deep copy of the pattern
    const patternCopy = pattern.map(row => [...row]);
    
    // If we're not at the end of the history, remove future states
    setHistory(prevHistory => {
      if (historyIndex < prevHistory.length - 1) {
        const newHistory = prevHistory.slice(0, historyIndex + 1);
        return [...newHistory, {
          pattern: patternCopy,
          timestamp: Date.now()
        }];
      } else {
        return [...prevHistory, {
          pattern: patternCopy,
          timestamp: Date.now()
        }];
      }
    });
    
    setHistoryIndex(prevIndex => prevIndex + 1);
  }, [historyIndex]);
  
  // Undo
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      return JSON.parse(JSON.stringify(history[historyIndex - 1].pattern));
    }
    return null;
  }, [history, historyIndex]);
  
  // Redo
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      return JSON.parse(JSON.stringify(history[historyIndex + 1].pattern));
    }
    return null;
  }, [history, historyIndex]);

  // Reset history
  const resetHistory = useCallback((newPattern: string[][]) => {
    setHistory([{ pattern: newPattern, timestamp: Date.now() }]);
    setHistoryIndex(0);
  }, []);

  return {
    history,
    historyIndex,
    addToHistory,
    handleUndo,
    handleRedo,
    resetHistory,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1
  };
};

export default useHistory;
