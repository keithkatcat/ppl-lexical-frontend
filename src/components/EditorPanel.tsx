import { useEffect, useRef } from 'react';
import Editor, { type OnMount, type BeforeMount } from '@monaco-editor/react';
import type { LexicalError, Token } from '../services/lexerService';

type Monaco = Parameters<OnMount>[1];
type CodeEditor = Parameters<OnMount>[0];

interface Props {
  value: string;
  onChange: (v: string) => void;
  theme: 'dark' | 'light';
  errors: LexicalError[];
  highlight: Token | null;
}

const setup: BeforeMount = (monaco) => {
  if (!monaco.languages.getLanguages().some((l) => l.id === 'uno')) {
    monaco.languages.register({ id: 'uno', extensions: ['.uno'] });
    monaco.languages.setMonarchTokensProvider('uno', {
      declKeywords: ['target', 'budget', 'flash', 'ram', 'shared', 'pin', 'uart', 'dac', 'fn', 'main', 'struct', 'using', 'raw', 'cost'],
      controlKeywords: ['loop', 'for', 'while', 'if', 'else', 'break', 'continue', 'return', 'wait', 'within', 'every', 'on', 'rise', 'fall', 'change', 'set', 'read', 'send', 'alloc', 'release'],
      types: ['u8', 'u16', 'u32', 'i8', 'i16', 'i32', 'bool'],
      constants: ['true', 'false', 'high', 'low', 'toggle', 'out', 'in', 'in_pullup', 'nl'],
      tokenizer: {
        root: [
          [/\/\/.*$/, 'comment'],
          [/\/\*/, 'comment', '@comment'],
          [/[a-zA-Z_]\w*(?=\s*\()/, { cases: {
            '@declKeywords': 'keyword.decl', '@controlKeywords': 'keyword.control', '@default': 'function' } }],
          [/[a-zA-Z_]\w*/, { cases: {
            '@declKeywords': 'keyword.decl', '@controlKeywords': 'keyword.control',
            '@types': 'type', '@constants': 'constant', '@default': 'identifier' } }],
          [/0[xX][0-9a-fA-F]+/, 'number'],
          [/0[bB][01]+/, 'number'],
          [/\d+(?:cycles|us|ms|s|K|B)?/, 'number'],
          [/"(?:[^"\\\n]|\\.)*"/, 'string'],
          [/[=<>!+\-*/%&|^~]+/, 'operator'],
        ],
        comment: [
          [/[^/*]+/, 'comment'],
          [/\*\//, 'comment', '@pop'],
          [/[/*]/, 'comment'],
        ],
      },
    });
    monaco.languages.setLanguageConfiguration('uno', {
      brackets: [['{', '}'], ['(', ')'], ['[', ']']],
      autoClosingPairs: [{ open: '{', close: '}' }, { open: '(', close: ')' }, { open: '[', close: ']' }, { open: '"', close: '"' }],
      comments: { lineComment: '//', blockComment: ['/*', '*/'] },
    });
  }

  monaco.editor.defineTheme('uno-dark', {
    base: 'vs-dark', inherit: true,
    rules: [
      { token: 'keyword.decl', foreground: '66d9ef', fontStyle: 'italic' },
      { token: 'keyword.control', foreground: 'f92672' },
      { token: 'type', foreground: '66d9ef' },
      { token: 'constant', foreground: 'ae81ff' },
      { token: 'function', foreground: 'a6e22e' },
      { token: 'identifier', foreground: 'f8f8f2' },
      { token: 'number', foreground: 'ae81ff' },
      { token: 'string', foreground: 'e6db74' },
      { token: 'operator', foreground: 'f92672' },
      { token: 'comment', foreground: '75715e' },
    ],
    colors: {
      'editor.background': '#272822',
      'editorLineNumber.foreground': '#8f908a',
      'editorLineNumber.activeForeground': '#f8f8f2',
    },
  });
  monaco.editor.defineTheme('uno-light', {
    base: 'vs', inherit: true,
    rules: [
      { token: 'keyword.decl', foreground: '2b6a92', fontStyle: 'italic' },
      { token: 'keyword.control', foreground: 'a23b66' },
      { token: 'type', foreground: '2e7d7a' },
      { token: 'constant', foreground: '6d4bb0' },
      { token: 'function', foreground: '4d7a2c' },
      { token: 'identifier', foreground: '1f2d3a' },
      { token: 'number', foreground: '6d4bb0' },
      { token: 'string', foreground: '966a10' },
      { token: 'operator', foreground: 'a23b66' },
      { token: 'comment', foreground: '8497a5' },
    ],
    colors: {
      'editor.background': '#f4f7f9',
      'editor.foreground': '#1f2d3a',
      'editorLineNumber.foreground': '#8da0ae',
      'editorLineNumber.activeForeground': '#1f2d3a',
      'editorIndentGuide.background1': '#d5e0e8',
      'minimap.background': '#f4f7f9',
    },
  });
};

export default function EditorPanel({ value, onChange, theme, errors, highlight }: Props) {
  const editorRef = useRef<CodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);

  const applyMarkers = () => {
    const monaco = monacoRef.current, model = editorRef.current?.getModel();
    if (!monaco || !model) return;
    monaco.editor.setModelMarkers(
      model, 'uno-lexer',
      errors.map((e) => ({
        severity: monaco.MarkerSeverity.Error,
        message: e.message,
        startLineNumber: e.line, startColumn: e.column,
        endLineNumber: e.line, endColumn: e.column + 1,
      }))
    );
  };

  useEffect(applyMarkers, [errors]);

  const hoverRef = useRef<ReturnType<CodeEditor['createDecorationsCollection']> | null>(null);
  useEffect(() => {
    const editor = editorRef.current, monaco = monacoRef.current, model = editor?.getModel();
    if (!editor || !monaco || !model) return;
    hoverRef.current?.clear();
    if (!highlight) return;
    const range = new monaco.Range(highlight.line, highlight.column, highlight.line, highlight.column + highlight.lexeme.length);
    // Skip if the code was edited after the analysis, since the positions no longer line up.
    if (model.getValueInRange(range) !== highlight.lexeme) return;
    hoverRef.current = editor.createDecorationsCollection([{ range, options: { inlineClassName: 'token-hover' } }]);
    editor.revealLineInCenterIfOutsideViewport(highlight.line);
  }, [highlight]);

  return (
    <Editor
      height="100%"
      language="uno"
      path="editor.uno"
      theme={theme === 'dark' ? 'uno-dark' : 'uno-light'}
      value={value}
      beforeMount={setup}
      onMount={(editor, monaco) => {
        editorRef.current = editor;
        monacoRef.current = monaco;
        applyMarkers();
        // Monaco measures character width once. If the web font arrives after that,
        // the cursor drifts away from the text, so re-measure once the font is ready.
        document.fonts.load('13px "JetBrains Mono"').then(() => monaco.editor.remeasureFonts());
      }}
      onChange={(v) => onChange(v ?? '')}
      options={{
        fontFamily: '"JetBrains Mono", monospace', fontSize: 13, lineHeight: 22, lineNumbers: 'on',
        minimap: { enabled: true }, scrollBeyondLastLine: false, automaticLayout: true,
        padding: { top: 10 }, renderLineHighlight: 'none', guides: { indentation: true }, overviewRulerBorder: false,
      }}
    />
  );
}
