const toolLinks = [
  { label: 'Mnemonics', path: '/mnemonics' },
  { label: 'Key Points', path: '/keypoints' },
  { label: 'Questions', path: '/questions' },
  { label: 'Flashcards', path: '/flashcards' },
  { label: 'Simplify', path: '/simplify' },
];

export function Footer() {
  return (
    <footer className="border-t border-chalk-fog/20 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-chalk-fog text-sm">
            <span className="font-hand text-lg text-chalk-yellow">StudySlate</span>
            {' '}— AI-powered study tools on a chalkboard near you.
          </div>
          <div className="flex items-center gap-4">
            {toolLinks.map((link) => (
              <a
                key={link.path}
                href={`#${link.path}`}
                className="text-chalk-fog hover:text-chalk-white text-sm transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="text-chalk-fog/60 text-xs">
            Powered by <a href="https://puter.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-chalk-mint">Puter.js</a> — user-pays model
          </div>
        </div>
      </div>
    </footer>
  );
}
