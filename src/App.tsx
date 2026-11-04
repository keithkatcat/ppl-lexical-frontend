import { useEffect, useState, useCallback } from 'react';
import EditorPanel from './components/EditorPanel';
import TokenTable from './components/TokenTable';
import ErrorPanel from './components/ErrorPanel';
import { tokenize, type LexicalError, type Token } from './services/lexerService';

type Theme = 'dark' | 'light';
const ic = { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

const Sun = () => <svg {...ic} width={18} height={18}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>;
const Moon = () => <svg {...ic} width={18} height={18}><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>;
const AnalyzeIcon = () => <svg {...ic}><path d="M3 3v18h18" /><path d="M8 17v-5M13 17V8M18 17v-8" /></svg>;
const ResetIcon = () => <svg {...ic}><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></svg>;
const CheckIcon = () => <svg {...ic} width={16} height={16} className="text-emerald-500"><circle cx="12" cy="12" r="10" fill="currentColor" stroke="none" /><path d="M8 12.5l2.7 2.7L16 9.5" stroke="#fff" /></svg>;
const AlertIcon = () => <svg {...ic} width={16} height={16} className="text-red-500"><circle cx="12" cy="12" r="10" /><path d="M12 7v6M12 17h.01" /></svg>;

const btn = 'flex items-center gap-1.5 rounded px-2.5 py-1 text-[13px] text-mist-700 hover:bg-mist-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-mist-500 disabled:opacity-50 dark:text-zinc-300 dark:hover:bg-zinc-700';

export default function App() {
  const [theme, setTheme] = useState<Theme>('light');
  const [sourceCode, setSourceCode] = useState('');
  const [tokens, setTokens] = useState<Token[]>([]);
  const [errors, setErrors] = useState<LexicalError[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [hovered, setHovered] = useState<Token | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => { document.documentElement.classList.toggle('dark', theme === 'dark'); }, [theme]);

  const analyze = useCallback(async () => {
    setIsLoading(true); setApiError(null);
    try {
      const res = await tokenize(sourceCode);
      setTokens(res.tokens); setErrors(res.errors); setHasRun(true);
    } catch (e) {
      setApiError(e instanceof Error ? e.message : 'Could not reach the lexer API.');
    } finally { setIsLoading(false); }
  }, [sourceCode]);

  const reset = () => { setSourceCode(''); setTokens([]); setErrors([]); setHasRun(false); setApiError(null); setHovered(null); };

  const panel = 'flex min-h-0 flex-1 flex-col overflow-hidden rounded-[5px] border border-mist-300 bg-mist-50 dark:border-zinc-800 dark:bg-[#1e1e1e]';
  const panelHead = 'flex h-12 items-center justify-between gap-3 border-b border-mist-200 px-4 dark:border-zinc-800';

  const failed = !!apiError;
  const status = failed ? 'Failed' : isLoading ? 'Analyzing…' : hasRun ? 'Complete' : 'Idle';
  const statusColor = failed ? 'text-red-500' : hasRun ? 'text-emerald-600 dark:text-emerald-400' : 'text-mist-600 dark:text-zinc-500';

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between border-b border-mist-300 px-5 py-3 dark:border-zinc-800 dark:bg-[#1a1a1a]">
        <div className="flex items-center gap-4">
          <span className="grid h-11 w-14 place-items-center rounded-[5px] bg-mist-300 text-[22px] font-semibold tracking-tight text-mist-900 dark:bg-mist-200">μno</span>
          <span aria-hidden className="h-9 w-px rotate-[14deg] bg-mist-400 dark:bg-zinc-600" />
          <h1 className="font-display text-[30px] leading-none tracking-wide text-mist-900 dark:text-zinc-100">Lexical Analyzer</h1>
        </div>
        <button role="switch" aria-checked={theme === 'dark'} aria-label="Toggle dark mode"
          onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
          className="flex items-center gap-2.5 text-mist-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-mist-500 dark:text-zinc-400">
          <Sun />
          <span className="relative h-6 w-11 rounded-full bg-mist-300 dark:bg-zinc-700">
            <span className={`absolute top-1 h-4 w-4 rounded-full bg-mist-50 transition-all dark:bg-[#1a1a1a] ${theme === 'dark' ? 'left-6' : 'left-1'}`} />
          </span>
          <Moon />
        </button>
      </header>

      <main className="grid min-h-0 flex-1 grid-cols-1 gap-3 p-3 md:grid-cols-2">
        <section className={panel} aria-label="Source code">
          <div className={panelHead}>
            <h2 className="text-[15px]">Source Code (μno)</h2>
            <div className="flex items-center gap-1">
              <button className={btn} onClick={analyze} disabled={isLoading}><AnalyzeIcon />Analyze</button>
              <button className={btn} onClick={reset}><ResetIcon />Reset</button>
            </div>
          </div>
          <div className="border-b border-mist-200 bg-mist-100 dark:border-zinc-800 dark:bg-[#232323]">
            <span className="inline-block border-b-2 border-mist-500 bg-mist-50 px-4 py-1.5 text-[13px] dark:border-zinc-400 dark:bg-[#1e1e1e]">editor.uno</span>
          </div>
          <div className="min-h-0 flex-1">
            <EditorPanel value={sourceCode} onChange={setSourceCode} theme={theme} errors={errors} highlight={hovered} />
          </div>
        </section>

        <section className={panel} aria-label="Tokenization results">
          <div className={panelHead}>
            <h2 className="text-[15px]">Tokenization Results</h2>
            <div className="flex items-center gap-4 text-[13px]" aria-live="polite">
              <span className="flex items-center gap-1.5">
                {failed || (hasRun && errors.length) ? <AlertIcon /> : hasRun ? <CheckIcon /> : null}
                Analysis Status: <span className={statusColor}>{status}</span>
              </span>
              <span>Tokens: <span className="text-amber-600 dark:text-amber-400">{tokens.length}</span></span>
              <span>Errors: <span className="text-red-500">{errors.length}</span></span>
            </div>
          </div>

          {apiError && (
            <p className="border-b border-red-300 bg-red-50 px-4 py-2 text-[13px] text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-400">
              {apiError} backend API.
            </p>
          )}

          <div className="min-h-0 flex-1 p-2">
            {hasRun ? (
              <TokenTable tokens={tokens} onHover={setHovered} />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-1 text-center text-mist-600 dark:text-zinc-500">
                <p className="font-medium text-mist-800 dark:text-zinc-300">No tokens yet</p>
                <p className="text-[13px]">Write code in the editor, then select Analyze.</p>
              </div>
            )}
          </div>
          <ErrorPanel errors={errors} />
        </section>
      </main>
    </div>
  );
}
