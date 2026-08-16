import { ModelOption } from '../types';

/**
 * Wait for Puter.js to load and be ready
 */
export async function waitForPuter(timeout = 10000): Promise<boolean> {
  const start = Date.now();
  
  while (Date.now() - start < timeout) {
    if (window.puter?.ai?.chat) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return false;
}

/**
 * Extract text from various response shapes
 */
export function extractText(response: any): string {
  if (typeof response === 'string') {
    return response;
  }
  
  if (!response) return '';
  
  // Handle resp.message.content patterns
  if (response.message?.content) {
    const content = response.message.content;
    
    // Array of {text} parts
    if (Array.isArray(content)) {
      return content.map((part: any) => part.text || '').join('');
    }
    
    // Object with .text
    if (typeof content === 'object' && content.text) {
      return content.text;
    }
    
    // Plain string
    if (typeof content === 'string') {
      return content;
    }
  }
  
  // Direct .text property
  if (response.text) {
    return response.text;
  }
  
  // Try JSON.stringify as fallback
  return JSON.stringify(response);
}

/**
 * Run AI chat with optional streaming
 */
export async function runAiChat(
  prompt: string,
  model: ModelOption,
  onChunk?: (fullText: string) => void
): Promise<string> {
  if (!window.puter?.ai?.chat) {
    throw new Error('Puter.js not loaded. Please refresh the page.');
  }

  try {
    // Try streaming first
    if (onChunk) {
      const stream = await window.puter.ai.chat(prompt, { model, stream: true });
      
      let fullText = '';
      
      // Handle async iterable
      if (stream && typeof stream[Symbol.asyncIterator] === 'function') {
        for await (const part of stream) {
          const text = typeof part === 'string' ? part : (part?.text || '');
          if (text) {
            fullText += text;
            onChunk(fullText);
          }
        }
        return fullText;
      } else if (stream?.message?.content) {
        // Some models may return non-streaming response even with stream: true
        return extractText(stream);
      }
    }
    
    // Non-streaming fallback
    const resp = await window.puter.ai.chat(prompt, { model });
    return extractText(resp);
  } catch (error: any) {
    // Check if it's a streaming rejection, try non-streaming
    if (error?.message?.includes('stream')) {
      const resp = await window.puter.ai.chat(prompt, { model });
      return extractText(resp);
    }
    throw error;
  }
}
