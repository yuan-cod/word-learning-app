import { useMemo, useState } from 'react';
import { WORDS, type Word } from '@/data/words';
import { RotateCcw } from 'lucide-react';

interface Props {
  known: Set<string>;
  mark: (en: string, isKnown: boolean) => void;
  recordQuiz: (correct: number, total: number) => void;
}

const QUIZ_LEN = 10;

type Phase = 'setup' | 'playing' | 'result';

interface Question {
  word: Word;
  options: string[];
  direction: 'en2zh' | 'zh2en';
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildQuiz(pool: Word[]): Question[] {
  const picked = shuffle(pool).slice(0, Math.min(QUIZ_LEN, pool.length));
  return picked.map(word => {
    const direction: Question['direction'] = Math.random() < 0.7 ? 'en2zh' : 'zh2en';
    const distract = shuffle(WORDS.filter(w => w.en !== word.en)).slice(0, 3);
    const options = direction === 'en2zh'
      ? shuffle([word.zh, ...distract.map(d => d.zh)])
      : shuffle([word.en, ...distract.map(d => d.en)]);
    return { word, options, direction };
  });
}

export default function Quiz({ known, mark, recordQuiz }: Props) {
  const [scope, setScope] = useState<'all' | 'unknown'>('all');
  const [phase, setPhase] = useState<Phase>('setup');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [idx, setIdx] = useState(0);
  const [chosen, setChosen] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);

  const pool = useMemo(
    () => (scope === 'unknown' ? WORDS.filter(w => !known.has(w.en)) : WORDS),
    [scope, known],
  );

  const start = () => {
    setQuestions(buildQuiz(pool));
    setIdx(0);
    setChosen(null);
    setCorrectCount(0);
    setPhase('playing');
  };

  const q = questions[idx];

  const choose = (opt: string) => {
    if (chosen) return;
    setChosen(opt);
    const answer = q.direction === 'en2zh' ? q.word.zh : q.word.en;
    const right = opt === answer;
    if (right) setCorrectCount(c => c + 1);
    // 答错自动把它标记为未掌握
    if (!right) mark(q.word.en, false);
  };

  const next = () => {
    if (idx + 1 >= questions.length) {
      recordQuiz(correctCount, questions.length);
      setPhase('result');
    } else {
      setIdx(i => i + 1);
      setChosen(null);
    }
  };

  if (phase === 'setup') {
    return (
      <div className="max-w-xl mx-auto text-center py-14 rise-in">
        <span className="font-display text-xs tracking-[0.35em] text-terra uppercase">Quiz</span>
        <h2 className="font-display text-4xl sm:text-5xl mt-4 mb-4">拼一场小测验</h2>
        <p className="text-ink/60 text-sm leading-relaxed mb-10">
          随机抽取 {QUIZ_LEN} 题，四选一。英译汉为主，偶尔汉译英。答错的单词会自动回到「未掌握」。
        </p>
        <div className="flex justify-center gap-3 mb-8">
          {(['all', 'unknown'] as const).map(s => (
            <button
              key={s}
              onClick={() => setScope(s)}
              className={`px-5 py-2.5 rounded-full text-sm transition-colors ${
                scope === s ? 'bg-ink text-paper' : 'bg-cream/60 text-ink/60 hover:bg-cream'
              }`}
            >
              {s === 'all' ? `全部词库 (${WORDS.length})` : `仅未掌握 (${pool.length})`}
            </button>
          ))}
        </div>
        <button
          onClick={start}
          disabled={pool.length < 4}
          className="px-10 py-4 rounded-full bg-terra text-paper text-sm tracking-widest hover:bg-ink transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          开始测验
        </button>
        {pool.length < 4 && (
          <p className="text-xs text-stone2 mt-3">未掌握的单词不足 4 个，试试全部词库</p>
        )}
      </div>
    );
  }

  if (phase === 'result') {
    const pct = Math.round((correctCount / questions.length) * 100);
    const verdict = pct >= 90 ? '太出色了' : pct >= 70 ? '相当不错' : pct >= 50 ? '继续加油' : '再巩固一下';
    return (
      <div className="max-w-xl mx-auto text-center py-14 rise-in">
        <div className="font-display text-7xl text-terra mb-2">{pct}</div>
        <p className="text-xs tracking-[0.35em] text-stone2 uppercase mb-4">Score</p>
        <p className="font-display text-3xl mb-2">{verdict}</p>
        <p className="text-ink/60 text-sm mb-10">{questions.length} 题答对 {correctCount} 题</p>
        <div className="flex justify-center gap-3">
          <button
            onClick={start}
            className="px-6 py-3 rounded-full bg-ink text-paper text-sm hover:bg-terra transition-colors inline-flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" /> 再来一轮
          </button>
          <button
            onClick={() => setPhase('setup')}
            className="px-6 py-3 rounded-full border border-sand text-sm hover:bg-cream transition-colors"
          >
            更换范围
          </button>
        </div>
      </div>
    );
  }

  const answer = q.direction === 'en2zh' ? q.word.zh : q.word.en;

  return (
    <div className="max-w-2xl mx-auto rise-in">
      <div className="flex items-center gap-3 mb-8">
        <span className="text-xs text-stone2 tabular-nums">{idx + 1} / {questions.length}</span>
        <div className="flex-1 h-1 bg-cream rounded-full overflow-hidden">
          <div className="h-full bg-terra rounded-full transition-all duration-300" style={{ width: `${(idx / questions.length) * 100}%` }} />
        </div>
        <span className="text-xs text-terra tabular-nums">对 {correctCount}</span>
      </div>

      <div className="bg-white rounded-3xl border border-sand p-8 sm:p-10 mb-6 text-center shadow-[0_10px_40px_-16px_rgba(60,56,53,0.18)]">
        <p className="text-xs tracking-[0.3em] text-stone2 uppercase mb-4">
          {q.direction === 'en2zh' ? '选择正确的中文释义' : '选择对应的英文单词'}
        </p>
        {q.direction === 'en2zh' ? (
          <p className="font-display text-4xl sm:text-5xl">{q.word.en}</p>
        ) : (
          <p className="text-xl sm:text-2xl leading-relaxed">{q.word.zh}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {q.options.map(opt => {
          const isAnswer = opt === answer;
          const isChosen = opt === chosen;
          let cls = 'bg-white border-sand hover:border-terra hover:bg-cream/50';
          if (chosen) {
            if (isAnswer) cls = 'bg-terra border-terra text-paper';
            else if (isChosen) cls = 'bg-red-100 border-red-300 text-red-800';
            else cls = 'bg-white border-sand opacity-50';
          }
          return (
            <button
              key={opt}
              onClick={() => choose(opt)}
              disabled={!!chosen}
              className={`border rounded-2xl px-5 py-4 text-left text-sm leading-relaxed transition-all ${cls} ${
                q.direction === 'zh2en' ? 'font-display text-lg' : ''
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {chosen && (
        <div className="text-center mt-8 rise-in">
          <p className="text-sm mb-4">
            {chosen === answer
              ? <span className="text-terra">回答正确</span>
              : <span className="text-red-700">正确答案：<span className="font-medium">{answer}</span></span>}
          </p>
          <button
            onClick={next}
            className="px-8 py-3 rounded-full bg-ink text-paper text-sm hover:bg-terra transition-colors"
          >
            {idx + 1 >= questions.length ? '查看成绩' : '下一题'}
          </button>
        </div>
      )}
    </div>
  );
}
