import { useState } from 'react';
import { WORDS } from '@/data/words';
import { useKnown } from '@/hooks/useKnown';
import WordBank from '@/sections/WordBank';
import Flashcards from '@/sections/Flashcards';
import Quiz from '@/sections/Quiz';
import { BookOpen, Layers, PenLine, Trash2 } from 'lucide-react';

type Tab = 'bank' | 'cards' | 'quiz';

const TABS: { key: Tab; label: string; icon: typeof BookOpen }[] = [
  { key: 'bank', label: '词库', icon: BookOpen },
  { key: 'cards', label: '闪卡', icon: Layers },
  { key: 'quiz', label: '测验', icon: PenLine },
];

export default function Home() {
  const [tab, setTab] = useState<Tab>('cards');
  const { known, mark, stats, bumpReviewed, recordQuiz, resetProgress } = useKnown();
  const pct = Math.round((known.size / WORDS.length) * 100);

  return (
    <div className="min-h-screen paper-grain">
      {/* header */}
      <header className="sticky top-0 z-20 bg-paper/85 backdrop-blur border-b border-cream">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center gap-6">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-2xl tracking-wide">词海</span>
            <span className="font-display text-xs tracking-[0.3em] text-terra uppercase">Vocab</span>
          </div>
          <nav className="flex gap-1 ml-auto">
            {TABS.map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-4 py-2 rounded-full text-sm inline-flex items-center gap-1.5 transition-colors ${
                  tab === t.key ? 'bg-ink text-paper' : 'text-ink/60 hover:bg-cream'
                }`}
              >
                <t.icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            ))}
          </nav>
        </div>
        {/* progress hairline */}
        <div className="h-0.5 bg-cream">
          <div className="h-full bg-terra transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
      </header>

      {/* intro strip */}
      <div className="max-w-6xl mx-auto px-5 pt-10 pb-2">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <p className="font-display text-xs tracking-[0.35em] text-terra uppercase mb-2">
              {WORDS.length} Words
            </p>
            <h1 className="font-display text-3xl sm:text-4xl leading-snug">
              每天几张卡，词汇稳步涨
            </h1>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <div className="text-right">
              <p className="font-display text-2xl text-terra">{known.size}<span className="text-stone2 text-sm">/{WORDS.length}</span></p>
              <p className="text-xs text-stone2">已掌握</p>
            </div>
            <div className="text-right">
              <p className="font-display text-2xl">{stats.reviewed}</p>
              <p className="text-xs text-stone2">累计复习</p>
            </div>
            <div className="text-right">
              <p className="font-display text-2xl">{stats.quizTaken ? stats.bestScore : '—'}</p>
              <p className="text-xs text-stone2">测验最佳</p>
            </div>
            <button
              onClick={() => {
                if (window.confirm('确定清空所有学习进度吗？')) resetProgress();
              }}
              title="清空进度"
              className="text-stone2 hover:text-red-600 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="squiggle w-full" />
      </div>

      {/* main */}
      <main className="max-w-6xl mx-auto px-5 py-8 pb-24">
        {tab === 'bank' && <WordBank known={known} mark={mark} />}
        {tab === 'cards' && <Flashcards known={known} mark={mark} bumpReviewed={bumpReviewed} />}
        {tab === 'quiz' && <Quiz known={known} mark={mark} recordQuiz={recordQuiz} />}
      </main>

      <footer className="border-t border-cream py-6 text-center text-xs text-stone2">
        学习进度保存在本浏览器中 · 共 {WORDS.length} 个核心词汇
      </footer>
    </div>
  );
}
