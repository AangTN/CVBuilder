'use client';

import { useState, useCallback, useRef } from 'react';

export interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
}

export interface UseHistoryReturn<T> {
  state: T;
  setState: (newState: T, addToHistory?: boolean) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  reset: (newState: T) => void;
  clear: () => void;
}

/**
 * Hook for managing undo/redo history
 */
export function useHistory<T>(initialState: T, maxHistory = 50): UseHistoryReturn<T> {
  const [history, setHistory] = useState<HistoryState<T>>({
    past: [],
    present: initialState,
    future: [],
  });

  const isUndoingRef = useRef(false);

  const setState = useCallback(
    (newState: T, addToHistory = true) => {
      if (!addToHistory || isUndoingRef.current) {
        // Update without adding to history (for controlled updates)
        setHistory((current) => ({
          ...current,
          present: newState,
        }));
        return;
      }

      setHistory((current) => {
        // Don't add to history if state hasn't changed
        if (JSON.stringify(current.present) === JSON.stringify(newState)) {
          return current;
        }

        const newPast = [...current.past, current.present];
        
        // Limit history size
        if (newPast.length > maxHistory) {
          newPast.shift();
        }

        return {
          past: newPast,
          present: newState,
          future: [], // Clear future when making a new change
        };
      });
    },
    [maxHistory]
  );

  const undo = useCallback(() => {
    setHistory((current) => {
      if (current.past.length === 0) return current;

      const previous = current.past[current.past.length - 1];
      const newPast = current.past.slice(0, current.past.length - 1);

      isUndoingRef.current = true;

      return {
        past: newPast,
        present: previous,
        future: [current.present, ...current.future],
      };
    });

    // Reset the flag after a brief delay
    setTimeout(() => {
      isUndoingRef.current = false;
    }, 10);
  }, []);

  const redo = useCallback(() => {
    setHistory((current) => {
      if (current.future.length === 0) return current;

      const next = current.future[0];
      const newFuture = current.future.slice(1);

      isUndoingRef.current = true;

      return {
        past: [...current.past, current.present],
        present: next,
        future: newFuture,
      };
    });

    // Reset the flag after a brief delay
    setTimeout(() => {
      isUndoingRef.current = false;
    }, 10);
  }, []);

  const reset = useCallback((newState: T) => {
    setHistory({
      past: [],
      present: newState,
      future: [],
    });
  }, []);

  const clear = useCallback(() => {
    setHistory((current) => ({
      past: [],
      present: current.present,
      future: [],
    }));
  }, []);

  return {
    state: history.present,
    setState,
    undo,
    redo,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
    reset,
    clear,
  };
}
