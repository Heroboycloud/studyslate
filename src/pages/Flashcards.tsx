import React, { useEffect, useState } from 'react';
import { useAi, useRoute } from '../hooks';
import { Chalkdown } from '../lib';
import { ModelOption, Flashcard } from '../types';

const cardStyles = ['Definitions', 'Q&A', 'Cloze', 'Mix'];
const defaultModel: ModelOption = 'openai/gpt-5.4-nano';

export function Flashcards() {
  const { route } = useRoute();
  const { status, output, error, run, reset, setOutput, setStatus } = useAi();
  
  const [topic, setTopic] = React.useState('');
  const [count, setCount] = React.useState(5);
  const [cardStyle, setCardStyle] = React.useState('Mix');
  const [model, setModel] = React.useState<ModelOption>(defaultModel);
  const [lastPrompt, setLastPrompt] = React.useState('');
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [flipped, setFlipped] = useState<Set<number>>(new Set());
  const [shuffleSeed, setShuffleSeed] = useState(0);

  useEffect(() => {
    const topicParam = route.params.get('topic');
    if (topicParam) setTopic(topicParam);
  }, [route.params]);

  const buildPrompt = () => {
    return `You are a flashcard generator. Create ${count} ${cardStyle.toLowerCase()} flashcards about: ${topic}

CRITICAL: Output ONLY raw JSON array, nothing else. No markdown, no code fences, no explanations.
Format exactly like this: [{"q":"question text","a":"answer text"}]

Each card must have "q" and "a" keys with string values.`;
  };

  const parseCards = (text: string): Flashcard[] => {
    try {
      // Strip code fences
      let cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      // Find first [ to last ]
      const start = cleaned.indexOf('[');
      const end = cleaned.lastIndexOf(']');
      if (start === -1 || end === -1) throw new Error('No JSON array found');
      const jsonStr = cleaned.slice(start, end + 1);
      const parsed = JSON.parse(jsonStr);
      return parsed.map((c: any) => ({
        q: c.q || c.question || '',
        a: c.a || c.answer || ''
      })).filter((c: Flashcard) => c.q && c.a);
    } catch {
      return [];
    }
  };

  const handleGenerate = () => {
    if (!topic.trim()) return;
    const prompt = buildPrompt();
    setLastPrompt(prompt);
    setCards([]);
    setFlipped(new Set());
    run(prompt, model, false); // Non-streaming for JSON
  };

  useEffect(() => {
    if (status === 'done' && output) {
      const parsed = parseCards(output);
      if (parsed.length > 0) {
        setCards(parsed);
      }
    }
  }, [status, output]);

  const handleAgain = () => {
    if (lastPrompt) { setOutput(''); setStatus('idle'); setCards([]); setFlipped(new Set()); run(lastPrompt, model, false); }
  };

  const handleClear = () => { reset(); setTopic(''); setCards([]); setFlipped(new Set()); };
  const handleCopy = () => { navigator.clipboard.writeText(JSON.stringify(cards, null, 2)); };

  const toggleFlip = (i: number) => {
    setFlipped(prev => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  const flipAll = () => {
    if (flipped.size < cards.length) {
      setFlipped(new Set(cards.map((_, i) => i)));
    } else {
      setFlipped(new Set());
    }
  };

  const shuffleCards = () => {
    setCards(prev => [...prev].sort(() => Math.random() - 0.5));
    setFlipped(new Set());
    setShuffleSeed(prev => prev + 1);
  };

  const revealedCount = flipped.size;

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-display font-bold text-chalk-white mb-8">🃏 Flashcard Forge</h1>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-6 sticky top-24 self-start">
            <div className="bg-chalkboard-dark/50 rounded-xl p-6 border border-chalk-fog/20">
              <div className="mb-4">
                <label className="block text-sm font-mono text-chalk-fog mb-2">Topic or Material *</label>
                <textarea value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Enter topic or paste material..." rows={4}
                  className="w-full bg-chalkboard-base border border-chalk-fog/30 rounded-lg px-4 py-3 text-chalk-white placeholder-chalk-fog/40 focus:outline-none focus:border-chalk-yellow resize-none" />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-mono text-chalk-fog mb-2">Card Count: {count}</label>
                <input type="range" min="3" max="15" value={count} onChange={(e) => setCount(Number(e.target.value))} className="w-full" />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-mono text-chalk-fog mb-2">Card Style</label>
                <div className="flex flex-wrap gap-2">
                  {cardStyles.map((s) => (
                    <button key={s} onClick={() => setCardStyle(s)} className={`chip ${cardStyle === s ? 'chip-selected' : ''}`}>{s}</button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-mono text-chalk-fog mb-2">AI Model</label>
                <select value={model} onChange={(e) => setModel(e.target.value as ModelOption)} className="w-full bg-chalkboard-base border border-chalk-fog/30 rounded-lg px-4 py-3 text-chalk-white">
                  <option value="openai/gpt-5.4-nano">openai/gpt-5.4-nano (fast)</option>
                  <option value="anthropic/claude-sonnet-5">anthropic/claude-sonnet-5 (deep reasoning)</option>
                </select>
              </div>

              <button onClick={handleGenerate} disabled={status === 'loading'} className="btn-primary w-full disabled:opacity-50">
                {status === 'loading' ? 'Generating...' : '✨ Generate Flashcards'}
              </button>
            </div>
          </div>

          <div>
            <div className="bg-paper-base rounded-xl p-6 min-h-[400px] text-paper-ink">
              {status === 'idle' && !cards.length && <div className="h-full flex items-center justify-center text-chalk-fog/60"><p className="font-hand text-xl">Your flashcards will appear here</p></div>}
              {status === 'loading' && !output && <div className="h-full flex flex-col items-center justify-center"><div className="chalk-dots mb-4"><span/><span/><span/></div><p className="font-hand text-lg text-chalk-fog">Creating cards...</p></div>}
              {cards.length > 0 && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-mono text-chalk-fog">{revealedCount}/{cards.length} revealed</span>
                    <div className="flex gap-2">
                      <button onClick={shuffleCards} className="btn-secondary text-xs py-1 px-2">🔀 Shuffle</button>
                      <button onClick={flipAll} className="btn-secondary text-xs py-1 px-2">{flipped.size < cards.length ? '🔄 Flip All' : '🙈 Hide All'}</button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {cards.map((card, i) => (
                      <div key={i} className={`flip-card h-40 cursor-pointer ${flipped.has(i) ? 'flipped' : ''}`} onClick={() => toggleFlip(i)}>
                        <div className="flip-card-inner relative h-full">
                          <div className="flip-card-front absolute bg-chalkboard-base rounded-xl p-4 flex items-center justify-center text-center border-2 border-chalk-fog/20">
                            <p className="text-paper-ink font-medium">{card.q}</p>
                          </div>
                          <div className="flip-card-back absolute bg-chalk-yellow rounded-xl p-4 flex items-center justify-center text-center border-2 border-chalk-fog/20" style={{ transform: 'rotateY(180deg)' }}>
                            <p className="text-chalkboard-base font-medium">{card.a}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-6 pt-4 border-t border-chalk-fog/20">
                    <button onClick={handleCopy} className="btn-secondary text-sm py-1 px-3">📋 Copy JSON</button>
                    <button onClick={handleAgain} className="btn-secondary text-sm py-1 px-3">🔄 Again</button>
                    <button onClick={handleClear} className="btn-secondary text-sm py-1 px-3">🗑 Clear</button>
                  </div>
                </div>
              )}
              {status === 'done' && output && cards.length === 0 && (
                <div>
                  <p className="text-chalk-poppy text-sm mb-2">Could not parse flashcards from output.</p>
                  <pre className="bg-chalkboard-dark rounded p-4 text-xs overflow-auto max-h-60 text-chalk-fog">{output}</pre>
                  <button onClick={handleAgain} className="btn-primary text-sm mt-4">🔄 Retry</button>
                </div>
              )}
              {status === 'error' && <div className="h-full flex items-center justify-center"><div className="bg-chalk-poppy/20 border border-chalk-poppy rounded-lg p-6 text-center"><p className="text-chalk-poppy font-semibold mb-2">Oops!</p><p className="text-chalk-fog text-sm mb-4">{error}</p><button onClick={handleAgain} className="btn-primary text-sm">🔄 Regenerate</button></div></div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
