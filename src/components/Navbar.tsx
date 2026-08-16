import { useRoute } from '../hooks';

const navLinks = [
  { name: 'home', label: 'Home', path: '/' },
  { name: 'mnemonics', label: 'Mnemonics', path: '/mnemonics' },
  { name: 'keypoints', label: 'Key Points', path: '/keypoints' },
  { name: 'questions', label: 'Questions', path: '/questions' },
  { name: 'flashcards', label: 'Flashcards', path: '/flashcards' },
  { name: 'simplify', label: 'Simplify', path: '/simplify' },
  { name: 'saved', label: 'Saved', path: '/saved' },
];

export function Navbar() {
  const { route, navigate } = useRoute();

  return (
    <nav className="sticky top-0 z-50 bg-chalkboard-base/95 backdrop-blur border-b border-chalk-fog/20">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <a href="#/" className="font-hand text-2xl font-bold text-chalk-yellow hover:text-chalk-white transition-colors">
            StudySlate
          </a>
          <div className="hidden md:flex items-center gap-1">
            {navLinks.slice(1).map((link) => (
              <button
                key={link.name}
                onClick={() => navigate(link.path)}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-all duration-200 ${
                  route.name === link.name
                    ? 'bg-chalk-yellow/20 text-chalk-white'
                    : 'text-chalk-fog hover:text-chalk-white hover:bg-chalkboard-lighter'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>
        <span className="text-xs font-mono text-chalk-mint bg-chalkboard-dark px-2 py-1 rounded border border-chalk-fog/20">
          Free · no key
        </span>
      </div>
    </nav>
  );
}
