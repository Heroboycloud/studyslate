import React, { useEffect } from 'react';
import { useAi, useRoute, useSavedResults } from '../hooks';
import { Chalkdown } from '../components';
import { ModelOption, ToolType } from '../types';

const difficulties = ['Warm-up', 'Exam level', 'Brutal'];
const questionTypes = ['Multiple choice', 'True/false', 'Short answer', 'Fill-in-the-blank'];
const defaultModel: ModelOption = 'openai/gpt-5.4-nano';

export function Questions() {
  const { route } = useRoute();
  const { saveResult } = useSavedResults();
  const { status, output, error, run, reset, setOutput, setStatus } = useAi();
  
  const [topic, setTopic] = React.useState('');
  const [difficulty, setDifficulty] = React.useState('Exam level');
  const [count, setCount] = React.useState(5);
  const [selectedTypes, setSelectedTypes] = React.useState<string[]>(['Multiple choice']);
  const [hideAnswers, setHideAnswers] = React.useState(true);
  const [model, setModel] = React.useState<ModelOption>(defaultModel);
  const [lastPrompt, setLastPrompt] = React.useState('');

  useEffect(() => {
    const topicParam = route.params.get('topic');
    if (topicParam) setTopic(topicParam);
  }, [route.params]);

  const toggleType = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const buildPrompt = () => {
    return `You are an exam question generator.

Topic: ${topic}
Difficulty: ${difficulty}
Number of questions: ${count}
Question types: ${selectedTypes.join(', ')}

IMPORTANT FORMAT REQUIREMENTS:
1. Start with "## Questions" heading
2. List all questions clearly numbered
3. Then add "## Answer Key" heading
4. Put all answers under the Answer Key section

Generate ${count} ${difficulty.toLowerCase()} ${selectedTypes.join('/').toLowerCase()} questions about ${topic}.`;
  };

  const handleGenerate = () => {
    if (!topic.trim()) return;
    const prompt = buildPrompt();
    setLastPrompt(prompt);
    run(prompt, model, true);
  };

  const handleAgain = () => {
    if (lastPrompt) { setOutput(''); setStatus('idle'); run(lastPrompt, model, true); }
  };

  const handleClear = () => { reset(); setTopic(''); };
  const handleCopy = () => { navigator.clipboard.writeText(output); };

  const handleSave = () => {
    if (output && topic) {
      saveResult('questions' as ToolType, topic, output, model);
    }
  };

  const handleDownload = () => {
    if (!output || !topic) return;
    const result = {
      tool: 'questions',
      topic,
      content: output,
      model,
      createdAt: Date.now(),
    };
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `studyslate-questions-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Split output at Answer Key for flap rendering
  const parts = output.split(/##\s*Answer Key/i);
  const questionsPart = parts[0]?.trim() || '';
  const answerKeyPart = parts[1]?.trim() || '';

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-display font-bold text-chalk-white mb-8">📝 Exam Question Generator</h1>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-6 sticky top-24 self-start">
            <div className="bg-chalkboard-dark/50 rounded-xl p-6 border border-chalk-fog/20">
              <div className="mb-4">
                <label className="block text-sm font-mono text-chalk-fog mb-2">Topic or Material *</label>
                <textarea value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Enter topic or paste material..." rows={4}
                  className="w-full bg-chalkboard-base border border-chalk-fog/30 rounded-lg px-4 py-3 text-chalk-white placeholder-chalk-fog/40 focus:outline-none focus:border-chalk-yellow resize-none" />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-mono text-chalk-fog mb-2">Difficulty</label>
                <div className="flex flex-wrap gap-2">
                  {difficulties.map((d) => (
                    <button key={d} onClick={() => setDifficulty(d)} className={`chip ${difficulty === d ? 'chip-selected' : ''}`}>{d}</button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-mono text-chalk-fog mb-2">Question Count: {count}</label>
                <input type="range" min="5" max="15" value={count} onChange={(e) => setCount(Number(e.target.value))} className="w-full" />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-mono text-chalk-fog mb-2">Question Types</label>
                <div className="flex flex-wrap gap-2">
                  {questionTypes.map((t) => (
                    <button key={t} onClick={() => toggleType(t)} className={`chip ${selectedTypes.includes(t) ? 'chip-selected' : ''}`}>{t}</button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={hideAnswers} onChange={(e) => setHideAnswers(e.target.checked)} className="w-4 h-4" />
                  <span className="text-sm text-chalk-fog">Hide answer key behind a flap</span>
                </label>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-mono text-chalk-fog mb-2">AI Model</label>
                <select value={model} onChange={(e) => setModel(e.target.value as ModelOption)} className="w-full bg-chalkboard-base border border-chalk-fog/30 rounded-lg px-4 py-3 text-chalk-white">
                  <option value="openai/gpt-5.4-nano">openai/gpt-5.4-nano (fast)</option>
                  <option value="anthropic/claude-sonnet-5">anthropic/claude-sonnet-5 (deep reasoning)</option>
                </select>
              </div>

              <button onClick={handleGenerate} disabled={status === 'loading' || status === 'streaming'} className="btn-primary w-full disabled:opacity-50">
                {status === 'loading' || status === 'streaming' ? 'Generating...' : '✨ Generate Questions'}
              </button>
            </div>
          </div>

          <div>
            <div className="bg-paper-base rounded-xl p-6 min-h-[400px] text-paper-ink">
              {status === 'idle' && <div className="h-full flex items-center justify-center text-chalk-fog/60"><p className="font-hand text-xl">Your questions will appear here</p></div>}
              {(status === 'loading' || status === 'streaming') && !output && <div className="h-full flex flex-col items-center justify-center"><div className="chalk-dots mb-4"><span/><span/><span/></div><p className="font-hand text-lg text-chalk-fog">Writing questions...</p></div>}
              {(status === 'streaming' || status === 'done') && output && (
                <div>
                  <div className="prose prose-invert max-w-none"><Chalkdown content={questionsPart || output} /></div>
                  {answerKeyPart && hideAnswers ? (
                    <details className="mt-6 border-t border-chalk-fog/20 pt-4">
                      <summary className="cursor-pointer font-semibold text-chalk-poppy">Show Answer Key</summary>
                      <div className="mt-4"><Chalkdown content={answerKeyPart} /></div>
                    </details>
                  ) : answerKeyPart && (
                    <div className="mt-6 border-t border-chalk-fog/20 pt-4"><Chalkdown content={answerKeyPart} /></div>
                  )}
                  {status === 'done' && <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-chalk-fog/20">
                    <button onClick={handleCopy} className="btn-secondary text-sm py-1 px-3">📋 Copy</button>
                    <button onClick={handleSave} className="btn-secondary text-sm py-1 px-3">💾 Save</button>
                    <button onClick={handleDownload} className="btn-secondary text-sm py-1 px-3">⬇️ Download</button>
                    <button onClick={handleAgain} className="btn-secondary text-sm py-1 px-3">🔄 Again</button>
                    <button onClick={handleClear} className="btn-secondary text-sm py-1 px-3">🗑 Clear</button>
                  </div>}
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
