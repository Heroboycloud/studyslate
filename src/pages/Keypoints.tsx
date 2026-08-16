import React, { useEffect, useState } from 'react';
import { useAi, useRoute, useSavedResults } from '../hooks';
import { OutputBoard } from '../components';
import { ModelOption, ToolType } from '../types';

const goals = ['Quick skim', 'Deep dive'];
const formats = ['Bullets', 'Cornell outline', 'Mind-map tree', 'Timeline'];
const defaultModel: ModelOption = 'openai/gpt-5.4-nano';

export function Keypoints() {
  const { route } = useRoute();
  const { saveResult } = useSavedResults();
  const { status, output, error, run, reset, setOutput, setStatus } = useAi();
  
  const [material, setMaterial] = React.useState('');
  const [goal, setGoal] = React.useState('Quick skim');
  const [format, setFormat] = React.useState('Bullets');
  const [flagTraps, setFlagTraps] = React.useState(false);
  const [model, setModel] = React.useState<ModelOption>(defaultModel);
  const [lastPrompt, setLastPrompt] = React.useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const topicParam = route.params.get('topic');
    if (topicParam) {
      setMaterial(topicParam);
    }
  }, [route.params]);

  const buildPrompt = () => {
    return `You are a study assistant distilling key points.

Material/Topic: ${material}
Goal: ${goal}
Format: ${format}
${flagTraps ? 'IMPORTANT: Flag common exam traps and misconceptions.' : ''}

Please extract the essential information in the requested format. ${flagTraps ? 'Include a section on common pitfalls.' : ''}`;
  };

  const handleGenerate = () => {
    if (!material.trim()) return;
    const prompt = buildPrompt();
    setLastPrompt(prompt);
    run(prompt, model, true);
  };

  const handleAgain = () => {
    if (lastPrompt) {
      setOutput('');
      setStatus('idle');
      run(lastPrompt, model, true);
    }
  };

  const handleClear = () => {
    reset();
    setMaterial('');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
  };

  const handleSave = () => {
    if (output && material) {
      saveResult('keypoints' as ToolType, material.slice(0, 100), output, model);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!output || !material) return;
    const result = {
      tool: 'keypoints',
      topic: material.slice(0, 100),
      content: output,
      model,
      createdAt: Date.now(),
    };
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `studyslate-keypoints-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-display font-bold text-chalk-white mb-8">
          ✨ Key Point Distiller
        </h1>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-6 sticky top-24 self-start">
            <div className="bg-chalkboard-dark/50 rounded-xl p-6 border border-chalk-fog/20">
              <div className="mb-4">
                <label className="block text-sm font-mono text-chalk-fog mb-2">
                  Material or Topic *
                </label>
                <textarea
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  placeholder="Paste your reading material or enter a topic..."
                  rows={6}
                  className="w-full bg-chalkboard-base border border-chalk-fog/30 rounded-lg px-4 py-3 text-chalk-white placeholder-chalk-fog/40 focus:outline-none focus:border-chalk-yellow transition-colors resize-none"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-mono text-chalk-fog mb-2">Goal</label>
                <div className="flex flex-wrap gap-2">
                  {goals.map((g) => (
                    <button key={g} onClick={() => setGoal(g)} className={`chip ${goal === g ? 'chip-selected' : ''}`}>{g}</button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-mono text-chalk-fog mb-2">Format</label>
                <div className="flex flex-wrap gap-2">
                  {formats.map((f) => (
                    <button key={f} onClick={() => setFormat(f)} className={`chip ${format === f ? 'chip-selected' : ''}`}>{f}</button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={flagTraps} onChange={(e) => setFlagTraps(e.target.checked)} className="w-4 h-4" />
                  <span className="text-sm text-chalk-fog">Flag common exam traps</span>
                </label>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-mono text-chalk-fog mb-2">AI Model</label>
                <select value={model} onChange={(e) => setModel(e.target.value as ModelOption)} className="w-full bg-chalkboard-base border border-chalk-fog/30 rounded-lg px-4 py-3 text-chalk-white focus:outline-none focus:border-chalk-yellow">
                  <option value="openai/gpt-5.4-nano">openai/gpt-5.4-nano (fast)</option>
                  <option value="anthropic/claude-sonnet-5">anthropic/claude-sonnet-5 (deep reasoning)</option>
                </select>
              </div>

              <button onClick={handleGenerate} disabled={status === 'loading' || status === 'streaming'} className="btn-primary w-full disabled:opacity-50">
                {status === 'loading' || status === 'streaming' ? 'Generating...' : '✨ Distill Key Points'}
              </button>
            </div>
          </div>

          <div>
            <OutputBoard
              status={status}
              output={output}
              error={error}
              onCopy={handleCopy}
              onAgain={handleAgain}
              onClear={handleClear}
              onRegenerate={handleAgain}
              onSave={handleSave}
              onDownload={handleDownload}
              saved={saved}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
