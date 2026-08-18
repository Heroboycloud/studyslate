import React, { useEffect, useState } from 'react';
import { useAi, useRoute, useSavedResults } from '../hooks';
import { ModelOption, ToolType, Flashcard } from '../types';

const cardStyles = ['Definitions', 'Q&A', 'Cloze', 'Mix'];
const defaultModel: ModelOption = 'openai/gpt-5.4-nano';

export function Flashcards() {
  const { route } = useRoute();
  const { saveResult } = useSavedResults();
  const { status, output, error, run, reset, setOutput, setStatus } = useAi();
  
  const [topic, setTopic] = React.useState('');
  const [count, setCount] = React.useState(5);
  const [cardStyle, setCardStyle] = React.useState('Mix');
  const [model, setModel] = React.useState<ModelOption>(defaultModel);
  const [lastPrompt, setLastPrompt] = React.useState('');
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [flipped, setFlipped] = useState<Set<number>>(new Set());
  const [saved, setSaved] = useState(false);

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

  const handleSave = () => {
    if (cards.length > 0 && topic) {
      const content = cards.map((c, i) => `**${i + 1}. ${c.q}**\n\n${c.a}`).join('\n\n---\n\n');
      saveResult('flashcards' as ToolType, topic, content, model);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleDownload = () => {
    if (cards.length === 0 || !topic) return;
    const mdContent = `# Flashcards: ${topic}\n\n*Generated on ${new Date().toLocaleString()} using ${model}*\n\n---\n\n${cards.map((c, i) => `## Card ${i + 1}\n\n**Q:** ${c.q}\n\n**A:** ${c.a}`).join('\n\n')}`;
    const blob = new Blob([mdContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flashcards-${topic.replace(/[^a-z0-9]/gi, '_').slice(0, 30)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

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
  };

  const revealedCount = flipped.size;

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-display font-bold text-white mb-8 glow-text">🃏 Flashcard Forge</h1>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-6 sticky top-24 self-start">
            <div className="card-dark rounded-xl p-6 border border-slate-700/50">
              <div className="mb-4">
                <label className="block text-sm font-mono text-slate-400 mb-2">Topic or Material *</label>
                <textarea value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Enter topic or paste material..." rows={4}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 resize-none transition-all" />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-mono text-slate-400 mb-2">Card Count: {count}</label>
                <input type="range" min="3" max="15" value={count} onChange={(e) => setCount(Number(e.target.value))} className="w-full accent-cyan-500" />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-mono text-slate-400 mb-2">Card Style</label>
                <div className="flex flex-wrap gap-2">
                  {cardStyles.map((s) => (
                    <button key={s} onClick={() => setCardStyle(s)} className={`chip ${cardStyle === s ? 'chip-selected' : ''}`}>{s}</button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-mono text-slate-400 mb-2">AI Model</label>
                <select value={model} onChange={(e) => setModel(e.target.value as ModelOption)} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50">
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
            <div className="card-dark rounded-xl p-6 min-h-[400px] border border-slate-700/50">
              {status === 'idle' && !cards.length && <div className="h-full flex items-center justify-center text-slate-500"><p className="font-hand text-xl">Your flashcards will appear here</p></div>}
              {status === 'loading' && !output && <div className="h-full flex flex-col items-center justify-center"><div className="loading-dots mb-4"><span/><span/><span/></div><p className="font-hand text-lg text-slate-400">Creating cards...</p></div>}
              {cards.length > 0 && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-mono text-slate-400">{revealedCount}/{cards.length} revealed</span>
                    <div className="flex gap-2">
                      <button onClick={shuffleCards} className="btn-secondary text-xs py-1 px-2">🔀 Shuffle</button>
                      <button onClick={flipAll} className="btn-secondary text-xs py-1 px-2">{flipped.size < cards.length ? '🔄 Flip All' : '🙈 Hide All'}</button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {cards.map((card, i) => (
                      <div key={i} className={`flip-card h-40 cursor-pointer ${flipped.has(i) ? 'flipped' : ''}`} onClick={() => toggleFlip(i)}>
                        <div className="flip-card-inner relative h-full">
                          <div className="flip-card-front absolute bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 flex items-center justify-center text-center border border-cyan-500/30 shadow-lg">
                            <p className="text-white font-medium">{card.q}</p>
                          </div>
                          <div className="flip-card-back absolute bg-gradient-to-br from-cyan-600 to-blue-700 rounded-xl p-4 flex items-center justify-center text-center border border-cyan-500/30 shadow-lg" style={{ transform: 'rotateY(180deg)' }}>
                            <p className="text-white font-medium">{card.a}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-slate-700/50">
                    <button onClick={handleCopy} className="btn-secondary text-sm py-2 px-3">📋 Copy JSON</button>
                    <button onClick={handleSave} className={`group flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${saved ? 'bg-green-900/40 border border-green-500/50 text-green-400' : 'btn-secondary'}`}>
                      <svg className="w-4 h-4" fill={saved ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                      {saved ? 'Saved' : 'Save'}
                    </button>
                    <button onClick={handleDownload} className="group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg transition-all duration-200 border border-cyan-500/30 shadow-lg">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                      Download MD
                    </button>
                    <button onClick={handleAgain} className="btn-secondary text-sm py-2 px-3">🔄 Again</button>
                    <button onClick={handleClear} className="btn-secondary text-sm py-2 px-3">🗑 Clear</button>
                  </div>
                </div>
              )}
              {status === 'done' && output && cards.length === 0 && (
                <div>
                  <p className="text-red-400 text-sm mb-2">Could not parse flashcards from output.</p>
                  <pre className="bg-slate-900/50 rounded p-4 text-xs overflow-auto max-h-60 text-slate-400 border border-slate-700">{output}</pre>
                  <button onClick={handleAgain} className="btn-primary text-sm mt-4">🔄 Retry</button>
                </div>
              )}
              {status === 'error' && <div className="h-full flex items-center justify-center"><div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6 text-center"><p className="text-red-400 font-semibold mb-2">Oops!</p><p className="text-slate-400 text-sm mb-4">{error}</p><button onClick={handleAgain} className="btn-primary text-sm">🔄 Regenerate</button></div></div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
