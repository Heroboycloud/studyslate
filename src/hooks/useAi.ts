import { useState, useCallback, useRef, useEffect } from 'react';
import { AiStatus, ModelOption } from '../types';
import { runAiChat } from '../lib/puter';

export interface UseAiOptions {
  initialStatus?: AiStatus;
}

export function useAi(options: UseAiOptions = {}) {
  const [status, setStatus] = useState<AiStatus>(options.initialStatus || 'idle');
  const [output, setOutput] = useState<string>('');
  const [error, setError] = useState<string>('');
  const abortRef = useRef<boolean>(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortRef.current = true;
    };
  }, []);

  const reset = useCallback(() => {
    abortRef.current = true;
    setStatus('idle');
    setOutput('');
    setError('');
    setTimeout(() => { abortRef.current = false; }, 0);
  }, []);

  const run = useCallback(async (
    prompt: string,
    model: ModelOption,
    enableStreaming: boolean = true
  ) => {
    if (!prompt.trim()) {
      setError('Please enter some content first.');
      setStatus('error');
      return;
    }

    abortRef.current = false;
    setStatus(enableStreaming ? 'streaming' : 'loading');
    setOutput('');
    setError('');

    try {
      const result = await runAiChat(
        prompt,
        model,
        enableStreaming ? (text) => {
          if (!abortRef.current) {
            setOutput(text);
          }
        } : undefined
      );

      if (!abortRef.current) {
        setOutput(result);
        setStatus('done');
      }
    } catch (err: any) {
      if (!abortRef.current) {
        let friendlyError = 'Something went wrong. ';
        
        if (err?.message?.includes('Puter')) {
          friendlyError += 'Puter.js may not be loaded yet. Try refreshing.';
        } else if (err?.message?.includes('sign') || err?.message?.includes('auth')) {
          friendlyError += 'You may need to sign in to Puter (it\'s free!). Click Regenerate to try again.';
        } else {
          friendlyError += 'Please check your connection and try again.';
        }
        
        setError(friendlyError);
        setStatus('error');
      }
    }
  }, []);

  const retry = useCallback(() => {
    // This would need the last prompt stored - for now just reset
    reset();
  }, [reset]);

  return {
    status,
    output,
    error,
    run,
    retry,
    reset,
    setOutput,
    setStatus,
  };
}
