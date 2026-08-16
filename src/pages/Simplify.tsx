import React, { useEffect } from 'react';
import { useAi, useRoute } from '../hooks';
import { OutputBoard, Chalkdown } from '../components';
import { ModelOption } from '../types';

const audiences = [
  'a curious 8-year-old',
  'a high school student',
  'a college freshman',
  'my tired roommate at 1 a.m.',
  'someone with no background in the field'
];
const defaultModel: ModelOption = 'openai/gpt-5.4-nano';

export function Simplify() {
  const { route } = useRoute();
  const { status, output, error, run, reset, setOutput, setStatus } = useAi();
  
  const [concept, setConcept] = React.useState('');
  const [audience, setAudience] = React.useState('a curious 8-year-old');
  const [includeAnalogy, setIncludeAnalogy] = React.useState(true);
  const [includeHook, setIncludeHook] = React.useState(true);
  const [model, setModel] = React.useState<ModelOption>(defaultModel);
  const [lastPrompt, setLastPrompt] = React.useState('');

  useEffect(() => {
    const topicParam = route.params.get('topic');
    if (topicParam) setConcept(topicParam);
  }, [route.params]);

  const buildPrompt = () => {
    return `You are a concept simplifier. Explain this concept for ${audience}:

${concept}

${includeAnalogy ? 'Include ONE everyday analogy to help understanding.' : ''}
${includeHook ? 'Include a memory hook (mnemonic or catchy phrase).' : ''}

Structure your response with these sections:
## In Plain Words
${includeAnalogy ? '## The Analogy' : ''}
## Check Yourself
${includeHook ? '## Memory Hook' : ''}`;
  };

  const handleGenerate = () => {
    if (!concept.trim()) return;
    const prompt = buildPrompt();
    setLastPrompt(prompt);
    run(prompt, model, true);
  };

  const handleAgain = () => {
    if (lastPrompt) { setOutput(''); setStatus('idle'); run(lastPrompt, model, true); }
  };

  const handleClear = () => { reset(); setConcept(''); };
  const handleCopy = () => { navigator.clipboard.writeText(output); };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-display font-bold text-chalk-white mb-8">💡 Concept Simplifier</h1>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-6 sticky top-24 self-start">
            <div className="bg-chalkboard-dark/50 rounded-xl p-6 border border-chalk-fog/20">
              <div className="mb-4">
                <label className="block text-sm font-mono text-chalk-fog mb-2">Concept or Confusing Text *</label>
                <textarea value={concept} onChange={(e) => setConcept(e.target.value)} placeholder="Paste the confusing concept or text..." rows={5}
                  className="w-full bg-chalkboard-base border border-chalk-fog/30 rounded-lg px-4 py-3 text-chalk-white placeholder-chalk-fog/40 focus:outline-none focus:border-chalk-yellow resize-none" />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-mono text-chalk-fog mb-2">Explain it like I'm...</label>
                <select value={audience} onChange={(e) => setAudience(e.target.value)} className="w-full bg-chalkboard-base border border-chalk-fog/30 rounded-lg px-4 py-3 text-chalk-white">
                  {audiences.map((a) => (<option key={a} value={a}>{a}</option>))}
                </select>
              </div>

              <div className="mb-4 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={includeAnalogy} onChange={(e) => setIncludeAnalogy(e.target.checked)} className="w-4 h-4" />
                  <span className="text-sm text-chalk-fog">Include one everyday analogy</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={includeHook} onChange={(e) => setIncludeHook(e.target.checked)} className="w-4 h-4" />
                  <span className="text-sm text-chalk-fog">Include a memory hook</span>
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
                {status === 'loading' || status === 'streaming' ? 'Simplifying...' : '✨ Simplify Concept'}
              </button>
            </div>
          </div>

          <div>
            <OutputBoard status={status} output={output} error={error} onCopy={handleCopy} onAgain={handleAgain} onClear={handleClear} onRegenerate={handleAgain} />
          </div>
        </div>
      </div>
    </div>
  );
}
