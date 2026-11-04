/** All lexer API access lives here. */
export type TokenType =
  | 'KEYWORD' | 'IDENTIFIER' | 'NUMERAL' | 'STRING'
  | 'OPERATOR' | 'PUNCTUATOR' | 'UNKNOWN';

export interface Token {
  id: number;
  lexeme: string;
  type: TokenType;
  line: number;
  column: number;
}

export interface LexicalError {
  message: string;
  line: number;
  column: number;
}

export interface LexerResponse {
  status: 'success' | 'error';
  tokens: Token[];
  errors: LexicalError[];
}

export const API_URL = 'http://localhost:8080/api/tokenize';

export async function tokenize(sourceCode: string): Promise<LexerResponse> {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sourceCode }),
  });
  if (!res.ok) throw new Error(`Lexer API responded with ${res.status}.`);
  return (await res.json()) as LexerResponse;
}
