import React, { useEffect, useState } from 'react';
import { useAi, useRoute, useSavedResults } from '../hooks';
import { OutputBoard } from '../components';
import { ModelOption, ToolType } from '../types';

const techniques = ['Surprise me', 'Acronym', 'Acrostic', 'Story', 'Memory palace', 'Rhyme-song'];
const levels = ['High school', 'Undergraduate', 'Graduate', 'Professional'];
const defaultModel: ModelOption = 'openai/gpt-5.4-nano';

export function Mnemonics() {
  const { route } = useRoute();
  const { saveResult } = useSavedResults();
  const { status, output, error, run, reset, setOutput, setStatus } = useAi();
  
  const [topic, setTopic] = React.useState('');
  const [items, setItems] = React.useState('');
  const [technique, setTechnique] = React.useState('Surprise me');
  const [level, setLevel] = React.useState('Undergraduate');
  const [model, setModel] = React.useState<ModelOption>(defaultModel);
  const [lastPrompt, setLastPrompt] = React.useState('');
  const [saved, setSaved] = useState(false);

  // Prefill from URL params
  useEffect(() => {
    const topicParam = route.params.get('topic');
    if (topicParam) {
      setTopic(topicParam);
    }
  }, [route.params]);

  const buildPrompt = () => {
    return `You are a study assistant helping create mnemonics.

Topic: ${topic}
Items to remember (in order): ${items}
Mnemonic technique: ${technique}
Student level: ${level}

Please create:
1. TWO different mnemonics using the specified technique (or surprise me if selected)
2. For each mnemonic, show the cue-to-item mapping clearly
3. Include a 60-second recall drill to practice

Format your response with clear headings and bullet points.`;
  };

  const handleGenerate = () => {
    if (!topic.trim() || !items.trim()) return;
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
    setTopic('');
    setItems('');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
  };

  const handleSave = () => {
    if (output && topic) {
      saveResult('mnemonics' as ToolType, topic, output, model);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!output || !topic) return;
    const result = {
      tool: 'mnemonics',
      topic,
      content: output,
      model,
      createdAt: Date.now(),
    };
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `studyslate-mnemonics-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exampleItems = "Mitosis phases: Prophase, Metaphase, Anaphase, Telophase";

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-display font-bold text-chalk-white mb-8">
          🧠 Mnemonic Maker
        </h1>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Left: Form Panel */}
          <div className="space-y-6 sticky top-24 self-start">
            <div className="bg-chalkboard-dark/50 rounded-xl p-6 border border-chalk-fog/20">
              {/* Topic Input */}
              <div className="mb-4">
                <label className="block text-sm font-mono text-chalk-fog mb-2">
                  Topic *
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Biology, History, Chemistry..."
                  className="w-full bg-chalkboard-base border border-chalk-fog/30 rounded-lg px-4 py-3 text-chalk-white placeholder-chalk-fog/40 focus:outline-none focus:border-chalk-yellow transition-colors"
                />
                {!topic.trim() && status === 'error' && (
                  <p className="text-chalk-poppy text-xs mt-1">Please enter a topic</p>
                )}
              </div>

              {/* Items List */}
              <div className="mb-4">
                <label className="block text-sm font-mono text-chalk-fog mb-2">
                  Ordered Items to Remember *
                </label>
                <textarea
                  value={items}
                  onChange={(e) => setItems(e.target.value)}
                  placeholder="List items in order, one per line or comma-separated"
                  rows={4}
                  className="w-full bg-chalkboard-base border border-chalk-fog/30 rounded-lg px-4 py-3 text-chalk-white placeholder-chalk-fog/40 focus:outline-none focus:border-chalk-yellow transition-colors resize-none"
                />
                {!items.trim() && status === 'error' && (
                  <p className="text-chalk-poppy text-xs mt-1">Please enter items to remember</p>
                )}
              </div>

              {/* Example chips */}
              <button
                onClick={() => setItems(exampleItems)}
                className="text-xs text-chalk-glacier hover:text-chalk-white mb-4 underline"
              >
                Try an example
              </button>

              {/* Technique Chips */}
              <div className="mb-4">
                <label className="block text-sm font-mono text-chalk-fog mb-2">
                  Technique
                </label>
                <div className="flex flex-wrap gap-2">
                  {techniques.map((t) => (
                    <button
                      key={t}
                      onClick={() => setTechnique(t)}
                      className={`chip ${technique === t ? 'chip-selected' : ''}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Level Select */}
              <div className="mb-4">
                <label className="block text-sm font-mono text-chalk-fog mb-2">
                  Student Level
                </label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full bg-chalkboard-base border border-chalk-fog/30 rounded-lg px-4 py-3 text-chalk-white focus:outline-none focus:border-chalk-yellow transition-colors"
                >
                  {levels.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>

              {/* Model Select */}
              <div className="mb-6">
                <label className="block text-sm font-mono text-chalk-fog mb-2">
                  AI Model
                </label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value as ModelOption)}
                  className="w-full bg-chalkboard-base border border-chalk-fog/30 rounded-lg px-4 py-3 text-chalk-white focus:outline-none focus:border-chalk-yellow transition-colors"
                >
                  <option value="openai/gpt-5.4-nano">openai/gpt-5.4-nano (fast)</option>
                  <option value="anthropic/claude-sonnet-5">anthropic/claude-sonnet-5 (deep reasoning)</option>
                </select>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={status === 'loading' || status === 'streaming'}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === 'loading' || status === 'streaming' ? 'Generating...' : '✨ Generate Mnemonics'}
              </button>
            </div>
          </div>

          {/* Right: Output Board */}
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
