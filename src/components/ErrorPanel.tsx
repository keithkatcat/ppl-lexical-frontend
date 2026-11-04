import { useState } from 'react';
import type { LexicalError } from '../services/lexerService';

export default function ErrorPanel({ errors }: { errors: LexicalError[] }) {
  const [open, setOpen] = useState(true);
  if (!errors.length) return null;
  return (
    <div className="border-t border-red-500/40 bg-red-500/5">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-4 py-2 text-sm font-medium text-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-500 dark:text-red-400"
      >
        <span>Lexical errors ({errors.length})</span>
        <span className={`transition-transform ${open ? 'rotate-180' : ''}`}>▾</span>
      </button>
      {open && (
        <ul className="max-h-40 overflow-auto px-4 pb-3 font-mono text-xs">
          {errors.map((e, i) => (
            <li key={i} className="py-0.5">
              <span className="text-zinc-500">{e.line}:{e.column}</span> {e.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
