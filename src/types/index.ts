// Puter.js type declarations
declare global {
  interface Window {
    puter?: {
      ai: {
        chat: (prompt: string, options?: { model?: string; stream?: boolean }) => Promise<any>;
      };
    };
  }
}

export type AiStatus = 'idle' | 'loading' | 'streaming' | 'done' | 'error';

export type ModelOption = 'openai/gpt-5.4-nano' | 'anthropic/claude-sonnet-5';

export interface Flashcard {
  q: string;
  a: string;
}

export interface QuestionSet {
  questions: string[];
  answerKey: string[];
}

export interface MnemonicResult {
  mnemonics: string[];
  recallDrill: string;
}
