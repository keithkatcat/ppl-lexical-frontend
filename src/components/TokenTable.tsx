import type { Token, TokenType } from '../services/lexerService';

const BADGE: Record<TokenType, string> = {
  KEYWORD: 'border-violet-300 bg-violet-100 text-violet-800 dark:border-violet-500/40 dark:bg-violet-500/15 dark:text-violet-300',
  IDENTIFIER: 'border-sky-300 bg-sky-100 text-sky-800 dark:border-sky-500/40 dark:bg-sky-500/15 dark:text-sky-300',
  OPERATOR: 'border-amber-300 bg-amber-100 text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/15 dark:text-amber-300',
  NUMERAL: 'border-emerald-300 bg-emerald-100 text-emerald-800 dark:border-emerald-500/40 dark:bg-emerald-500/15 dark:text-emerald-300',
  STRING: 'border-teal-300 bg-teal-100 text-teal-800 dark:border-teal-500/40 dark:bg-teal-500/15 dark:text-teal-300',
  PUNCTUATOR: 'border-mist-300 bg-mist-100 text-mist-700 dark:border-zinc-500/40 dark:bg-zinc-500/10 dark:text-zinc-300',
  UNKNOWN: 'border-red-300 bg-red-100 text-red-800 dark:border-red-500/40 dark:bg-red-500/15 dark:text-red-300',
};

export default function TokenTable({ tokens, onHover }: { tokens: Token[]; onHover: (t: Token | null) => void }) {
  return (
    <div className="h-full overflow-auto" onMouseLeave={() => onHover(null)}>
      <table className="w-full table-fixed border-collapse text-[13px]">
        <thead className="sticky top-0 z-10 bg-mist-150 dark:bg-[#2a2a2a]">
          <tr className="text-left font-semibold">
            <th className="w-[32%] px-4 py-2.5">Token</th>
            <th className="w-[30%] px-4 py-2.5">Type</th>
            <th className="w-[19%] px-4 py-2.5">Line</th>
            <th className="px-4 py-2.5">Column</th>
          </tr>
        </thead>
        <tbody>
          {tokens.map((t) => (
            <tr key={t.id} onMouseEnter={() => onHover(t)} className="border-b border-mist-200 hover:bg-mist-100 dark:border-zinc-800 dark:hover:bg-zinc-800/60">
              <td className="truncate px-4 py-2 font-mono">{t.lexeme}</td>
              <td className="px-4 py-2">
                <span className={`inline-block rounded-[3px] border px-1.5 py-px font-mono text-[10px] font-medium ${BADGE[t.type]}`}>{t.type}</span>
              </td>
              <td className="px-4 py-2 font-mono tabular-nums">{t.line}</td>
              <td className="px-4 py-2 font-mono tabular-nums">{t.column}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
