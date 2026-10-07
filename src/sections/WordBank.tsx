import { useMemo, useState } from 'react';
import { WORDS } from '@/data/words';
import { Check, RotateCcw, Search } from 'lucide-react';

interface Props {
  known: Set<string>;
  mark: (en: string, isKnown: boolean) => void;
}

export default function WordBank({ known, mark }: Props) {
  const [query, setQuery] = useState('');
  const [onlyUnknown, setOnlyUnknown] = useState(false);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return WORDS.filter(w => {
      if (onlyUnknown && known.has(w.en)) return false;
      if (q && !w.en.toLowerCase().includes(q) && !w.zh.includes(q)) return false;
      return true;
    });
  }, [query, onlyUnknown, known]);

  const knownInList = useMemo(() => list.filter(w => known.has(w.en)).length, [list, known]);

  return (
    <div className="rise-in">
      {/* toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone2" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="搜索英文单词或中文释义…"
            className="w-full bg-white border border-sand rounded-full pl-9 pr-4 py-2.5 text-sm outline-none focus:border-terra transition-colors placeholder:text-stone2"
          />
        </div>
        <button
          onClick={() => setOnlyUnknown(v => !v)}
          className={`px-4 py-2.5 rounded-full text-sm border transition-colors whitespace-nowrap ${
            onlyUnknown ? 'bg-terra border-terra text-paper' : 'border-sand text-ink/70 hover:bg-cream'
          }`}
        >
          只看未掌握
        </button>
      </div>

      {/* meta */}
      <div className="flex items-baseline gap-4 mb-4">
        <h2 className="font-display text-2xl text-terra">词库</h2>
        <span className="text-xs text-stone2 tracking-widest">
          {list.length} 词 · 已掌握 {knownInList}
        </span>
      </div>
      <div className="squiggle w-full mb-6" />

      {list.length === 0 && (
        <p className="text-stone2 text-sm py-16 text-center">没有匹配的单词</p>
      )}

      <ul className="divide-y divide-cream">
        {list.map(w => {
          const isKnown = known.has(w.en);
          return (
            <li key={w.en} className="group flex items-start gap-4 py-3">
              <button
                onClick={() => mark(w.en, !isKnown)}
                title={isKnown ? '标记为未掌握' : '标记为已掌握'}
                className={`mt-0.5 w-6 h-6 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                  isKnown
                    ? 'bg-terra border-terra text-paper'
                    : 'border-sand text-transparent hover:border-terra'
                }`}
              >
                {isKnown ? <Check className="w-3.5 h-3.5" /> : <RotateCcw className="w-3 h-3 opacity-0 group-hover:opacity-40 text-terra" />}
              </button>
              <span className={`font-display text-xl w-48 shrink-0 transition-opacity ${isKnown ? 'opacity-40' : ''}`}>
                {w.en}
              </span>
              <span className={`text-sm text-ink/75 leading-relaxed transition-opacity ${isKnown ? 'opacity-40' : ''}`}>
                {w.zh}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
