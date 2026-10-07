import { useCallback, useEffect, useState } from 'react';
import { WORDS, type Word } from '@/data/words';
import { Shuffle, Check, X, RotateCcw } from 'lucide-react';

interface Props {
  known: Set<string>;
  mark: (en: string, isKnown: boolean) => void;
  bumpReviewed: (n?: number) => void;
}

type Scope = 'all' | 'unknown';

const SCOPES: { key: Scope; label: string }[] = [
  { key: 'all', label: '全部词库' },
  { key: 'unknown', label: '仅未掌握' },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function Flashcards({ known, mark, bumpReviewed }: Props) {
  const [scope, setScope] = useState<Scope>('all');
  const [deck, setDeck] = useState<Word[]>(() => shuffle(WORDS));
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState(false);

  const startDeck = useCallback((s: Scope, knownSet: Set<string>) => {
    const pool = s === 'unknown' ? WORDS.filter(w => !knownSet.has(w.en)) : WORDS;
    setDeck(shuffle(pool));
    setIdx(0);
    setFlipped(false);
    setDone(false);
  }, []);

  const card = deck[idx];

  const answer = useCallback((isKnown: boolean) => {
    if (!card) return;
    mark(card.en, isKnown);
    bumpReviewed(1);
    if (idx + 1 >= deck.length) {
      setDone(true);
    } else {
      setFlipped(false);
      // 等翻回正面再换下一张
      setTimeout(() => setIdx(i => i + 1), 180);
    }
  }, [card, idx, deck.length, mark, bumpReviewed]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); setFlipped(f => !f); }
      if (e.key === 'ArrowRight') answer(true);
      if (e.key === 'ArrowLeft') answer(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [answer]);

  if (deck.length === 0) {
    return (
      <div className="text-center py-24">
        <p className="font-display text-3xl mb-3">全部掌握了！</p>
        <p className="text-ink/60 text-sm mb-8">当前范围内没有未掌握的单词。</p>
        <button
          onClick={() => startDeck('all', known)}
          className="px-6 py-3 rounded-full bg-ink text-paper text-sm hover:bg-terra transition-colors"
        >
          重新开始全部词库
        </button>
      </div>
    );
  }

  if (done) {
    return (
      <div className="text-center py-24 rise-in">
        <p className="font-display text-5xl text-terra mb-4">Done.</p>
        <p className="text-ink/60 text-sm mb-8">本组 {deck.length} 张卡片已全部过一遍。</p>
        <div className="flex justify-center gap-3">
          <button
            onClick={() => startDeck(scope, known)}
            className="px-6 py-3 rounded-full bg-ink text-paper text-sm hover:bg-terra transition-colors inline-flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" /> 再来一组
          </button>
          <button
            onClick={() => { setScope('unknown'); startDeck('unknown', known); }}
            className="px-6 py-3 rounded-full border border-sand text-sm hover:bg-cream transition-colors"
          >
            攻克未掌握
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* scope picker */}
      <div className="flex flex-wrap gap-1.5 justify-center mb-8">
        {SCOPES.map(s => (
          <button
            key={s.key}
            onClick={() => { setScope(s.key); startDeck(s.key, known); }}
            className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
              scope === s.key ? 'bg-ink text-paper' : 'bg-cream/60 text-ink/60 hover:bg-cream'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* progress */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-xs text-stone2 tabular-nums">{idx + 1} / {deck.length}</span>
        <div className="flex-1 h-1 bg-cream rounded-full overflow-hidden">
          <div
            className="h-full bg-terra rounded-full transition-all duration-300"
            style={{ width: `${((idx) / deck.length) * 100}%` }}
          />
        </div>
        <button
          onClick={() => startDeck(scope, known)}
          title="重新洗牌"
          className="text-stone2 hover:text-terra transition-colors"
        >
          <Shuffle className="w-4 h-4" />
        </button>
      </div>

      {/* card */}
      <div
        className="flip-scene h-72 sm:h-80 cursor-pointer select-none"
        onClick={() => setFlipped(f => !f)}
      >
        <div className={`flip-inner ${flipped ? 'flipped' : ''}`}>
          <div className="flip-face bg-white rounded-3xl border border-sand shadow-[0_10px_40px_-16px_rgba(60,56,53,0.18)]">
            <span className="font-display text-5xl sm:text-6xl text-ink">{card.en}</span>
            <span className="mt-6 text-xs text-stone2">点击卡片查看释义</span>
          </div>
          <div className="flip-face flip-back bg-cream rounded-3xl border border-sand shadow-[0_10px_40px_-16px_rgba(60,56,53,0.18)] px-8">
            <span className="font-display text-2xl text-terra mb-4">{card.en}</span>
            <span className="text-lg sm:text-xl text-ink leading-relaxed text-center">{card.zh}</span>
          </div>
        </div>
      </div>

      {/* actions */}
      <div className="flex justify-center gap-4 mt-8">
        <button
          onClick={() => answer(false)}
          className="px-8 py-3.5 rounded-full border border-sand text-ink/80 hover:bg-cream transition-colors inline-flex items-center gap-2 text-sm"
        >
          <X className="w-4 h-4" /> 不认识
        </button>
        <button
          onClick={() => answer(true)}
          className="px-8 py-3.5 rounded-full bg-terra text-paper hover:bg-ink transition-colors inline-flex items-center gap-2 text-sm"
        >
          <Check className="w-4 h-4" /> 认识
        </button>
      </div>
      <p className="text-center text-xs text-stone2 mt-4">空格翻面 · ← 不认识 · → 认识</p>
    </div>
  );
}
