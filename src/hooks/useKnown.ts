import { useCallback, useEffect, useState } from 'react';

const KNOWN_KEY = 'vocab-known-v1';
const STATS_KEY = 'vocab-stats-v1';

export interface Stats {
  reviewed: number;
  quizTaken: number;
  quizCorrect: number;
  bestScore: number;
}

const DEFAULT_STATS: Stats = { reviewed: 0, quizTaken: 0, quizCorrect: 0, bestScore: 0 };

function loadKnown(): Set<string> {
  try {
    const raw = localStorage.getItem(KNOWN_KEY);
    if (raw) return new Set(JSON.parse(raw) as string[]);
  } catch { /* ignore */ }
  return new Set();
}

function loadStats(): Stats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (raw) return { ...DEFAULT_STATS, ...(JSON.parse(raw) as Partial<Stats>) };
  } catch { /* ignore */ }
  return { ...DEFAULT_STATS };
}

export function useKnown() {
  const [known, setKnown] = useState<Set<string>>(loadKnown);
  const [stats, setStats] = useState<Stats>(loadStats);

  useEffect(() => {
    localStorage.setItem(KNOWN_KEY, JSON.stringify([...known]));
  }, [known]);

  useEffect(() => {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  }, [stats]);

  const mark = useCallback((en: string, isKnown: boolean) => {
    setKnown(prev => {
      const next = new Set(prev);
      if (isKnown) next.add(en); else next.delete(en);
      return next;
    });
  }, []);

  const bumpReviewed = useCallback((n = 1) => {
    setStats(s => ({ ...s, reviewed: s.reviewed + n }));
  }, []);

  const recordQuiz = useCallback((correct: number, total: number) => {
    setStats(s => ({
      ...s,
      quizTaken: s.quizTaken + 1,
      quizCorrect: s.quizCorrect + correct,
      bestScore: Math.max(s.bestScore, total > 0 ? Math.round((correct / total) * 100) : 0),
    }));
  }, []);

  const resetProgress = useCallback(() => {
    setKnown(new Set());
    setStats({ ...DEFAULT_STATS });
  }, []);

  return { known, mark, stats, bumpReviewed, recordQuiz, resetProgress };
}
