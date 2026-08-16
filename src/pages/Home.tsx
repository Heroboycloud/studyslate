import React, { useEffect, useRef } from 'react';
import { useRoute } from '../hooks';

const subjects = [
  'Biology', 'Chemistry', 'Physics', 'History', 'Literature', 
  'Mathematics', 'Computer Science', 'Psychology', 'Economics', 'Philosophy'
];

const toolCards = [
  { name: 'mnemonics', title: 'Mnemonic Maker', desc: 'Memory tricks that stick', icon: '🧠' },
  { name: 'keypoints', title: 'Key Point Distiller', desc: 'Extract the essentials', icon: '✨' },
  { name: 'questions', title: 'Exam Question Generator', desc: 'Practice makes perfect', icon: '📝' },
  { name: 'flashcards', title: 'Flashcard Forge', desc: 'Flip your way to mastery', icon: '🃏' },
  { name: 'simplify', title: 'Concept Simplifier', desc: 'Explain it like Im 5', icon: '💡' },
];

export function Home() {
  const { navigate } = useRoute();
  const [topic, setTopic] = React.useState('');
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    // Trigger SVG draw animation on mount
    if (svgRef.current) {
      const line = svgRef.current.querySelector('.draw-line');
      if (line) {
        line.classList.remove('animate-draw');
        setTimeout(() => line.classList.add('animate-draw'), 100);
      }
    }
  }, []);

  const handleQuickStart = (toolName: string) => {
    if (topic.trim()) {
      navigate(toolName, { topic });
    } else {
      navigate(toolName);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section - Study Desk on Chalkboard */}
      <section className="relative py-16 px-4 overflow-hidden">
        {/* Floating doodles */}
        <svg className="absolute top-20 left-10 w-24 h-24 opacity-20 animate-float" viewBox="0 0 100 100" fill="none" stroke="#F2CE68" strokeWidth="2">
          <circle cx="50" cy="50" r="30" />
          <circle cx="50" cy="50" r="20" />
          <circle cx="50" cy="50" r="10" />
          <path d="M50 20 L50 10 M50 80 L50 90 M20 50 L10 50 M80 50 L90 50" />
        </svg>
        
        <svg className="absolute bottom-40 right-20 w-16 h-16 opacity-20 animate-float" style={{ animationDelay: '1s' }} viewBox="0 0 100 100" fill="none" stroke="#8ECFE3" strokeWidth="2">
          <path d="M20 50 Q50 20 80 50 Q50 80 20 50 Z" />
          <path d="M35 50 L65 50 M50 35 L50 65" />
        </svg>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Chalk headline with hand-drawn underline */}
          <div className="relative inline-block mb-8">
            <h1 className="font-hand text-5xl md:text-7xl font-bold text-chalk-white">
              What are you studying tonight?
            </h1>
            <svg ref={svgRef} className="absolute -bottom-4 left-0 w-full h-8" viewBox="0 0 400 20" preserveAspectRatio="none">
              <path 
                className="draw-line" 
                d="M5 15 Q100 5 200 10 Q300 15 395 8" 
                fill="none" 
                stroke="#F2CE68" 
                strokeWidth="3" 
                strokeLinecap="round"
                strokeDasharray="1000"
                strokeDashoffset="1000"
              />
            </svg>
          </div>

          {/* Interactive input */}
          <div className="bg-chalkboard-dark/80 rounded-xl p-6 border-2 border-dashed border-chalk-fog/30 mb-12">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter a topic (e.g., Photosynthesis, World War II, Calculus...)"
              className="w-full bg-transparent border-b-2 border-chalk-fog/40 text-chalk-white placeholder-chalk-fog/50 text-xl py-3 px-4 focus:outline-none focus:border-chalk-yellow transition-colors font-display"
              onKeyDown={(e) => e.key === 'Enter' && handleQuickStart('mnemonics')}
            />
            
            {/* Quick start buttons */}
            <div className="flex flex-wrap justify-center gap-3 mt-6">
              {toolCards.map((tool) => (
                <button
                  key={tool.name}
                  onClick={() => handleQuickStart(tool.name)}
                  className="chip group"
                >
                  <span className="mr-2">{tool.icon}</span>
                  <span className="group-hover:text-chalk-yellow transition-colors">{tool.title.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Subject Ticker */}
      <section className="py-6 border-y border-chalk-fog/20 overflow-hidden">
        <div className="marquee-container">
          <div className="marquee-content flex gap-12 animate-[float_20s_linear_infinite]">
            {[...subjects, ...subjects].map((subject, i) => (
              <span key={i} className="text-chalk-fog/60 font-mono text-lg whitespace-nowrap">
                {subject}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Tool Cards - Tilted Index Cards */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-display font-bold text-chalk-white text-center mb-10">
            Your Study Toolkit
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {toolCards.map((card, i) => (
              <a
                href={`#/${card.name}`}
                key={card.name}
                className="reveal bg-paper-base text-paper-ink rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-300 group"
                style={{ 
                  transform: `rotate(${(i % 3) - 1}deg)`,
                  transition: 'transform 0.3s, box-shadow 0.3s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'rotate(0deg)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = `rotate(${(i % 3) - 1}deg)`}
              >
                <span className="text-4xl mb-4 block">{card.icon}</span>
                <h3 className="text-xl font-bold font-display mb-2 group-hover:text-chalk-yellow transition-colors">
                  {card.title}
                </h3>
                <p className="text-chalk-fog">{card.desc}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-chalkboard-dark/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-display font-bold text-chalk-white mb-10">
            How It Works
          </h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            <div className="reveal text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-chalk-yellow/20 flex items-center justify-center text-3xl">
                ⌨️
              </div>
              <p className="font-mono text-chalk-fog">Type</p>
            </div>
            
            {/* Hand-drawn arrow */}
            <svg className="w-24 h-12 text-chalk-fog/40 hidden md:block" viewBox="0 0 100 50" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M10 25 Q50 10 90 25" />
              <path d="M85 20 L90 25 L85 30" />
            </svg>
            
            <div className="reveal text-center" style={{ transitionDelay: '200ms' }}>
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-chalk-yellow/20 flex items-center justify-center text-3xl">
                🎨
              </div>
              <p className="font-mono text-chalk-fog">Chalk out</p>
            </div>
            
            <svg className="w-24 h-12 text-chalk-fog/40 hidden md:block" viewBox="0 0 100 50" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M10 25 Q50 10 90 25" />
              <path d="M85 20 L90 25 L85 30" />
            </svg>
            
            <div className="reveal text-center" style={{ transitionDelay: '400ms' }}>
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-chalk-yellow/20 flex items-center justify-center text-3xl">
                📚
              </div>
              <p className="font-mono text-chalk-fog">Study</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Free Section */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-display font-bold text-chalk-white mb-6">
            Why is this free?
          </h2>
          <div className="bg-chalkboard-lighter rounded-xl p-8 border border-chalk-fog/20">
            <p className="text-chalk-fog leading-relaxed mb-4">
              StudySlate runs entirely in your browser using <strong className="text-chalk-yellow">Puter.js</strong>. 
              There's no backend server costs because all AI processing happens through Puter's platform.
            </p>
            <p className="text-chalk-fog leading-relaxed">
              Each student uses their own free Puter account for AI requests — it's a <strong className="text-chalk-mint">user-pays model</strong> where Puter provides generous free tiers. 
              No API keys needed, no credit card required. Just sign up for free and start studying!
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4 bg-chalkboard-dark/30">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-display font-bold text-chalk-white text-center mb-10">
            FAQ
          </h2>
          <div className="space-y-4">
            <details className="group">
              <summary>Why do I see a sign-in popup on first use?</summary>
              <p className="mt-3 text-chalk-fog text-sm leading-relaxed">
                The first time you generate content, Puter will show a popup asking you to sign in or create a free account. 
                This is how Puter tracks usage for their free tier. Your data stays private and is only used for your AI requests.
              </p>
            </details>
            <details className="group">
              <summary>Is my study data saved anywhere?</summary>
              <p className="mt-3 text-chalk-fog text-sm leading-relaxed">
                No. StudySlate is stateless — nothing is saved to servers. If you refresh the page, your inputs and outputs will be lost. 
                Use the Copy button to save important results!
              </p>
            </details>
            <details className="group">
              <summary>Which model should I choose?</summary>
              <p className="mt-3 text-chalk-fog text-sm leading-relaxed">
                <strong className="text-chalk-yellow">openai/gpt-5.4-nano</strong> is fast and great for most tasks. 
                <strong className="text-chalk-yellow">anthropic/claude-sonnet-5</strong> offers deeper reasoning for complex topics but may be slower.
              </p>
            </details>
            <details className="group">
              <summary>Can I use this offline?</summary>
              <p className="mt-3 text-chalk-fog text-sm leading-relaxed">
                No, an internet connection is required because Puter.js needs to communicate with Puter's servers to process AI requests.
              </p>
            </details>
          </div>
        </div>
      </section>
    </div>
  );
}
