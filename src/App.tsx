import { useEffect, useState } from 'react';
import { Navbar, Footer } from './components';
import { Home, Mnemonics, Keypoints, Questions, Flashcards, Simplify } from './pages';
import { useRoute } from './hooks';
import { waitForPuter } from './lib/puter';

function App() {
  const { route } = useRoute();
  const [puterReady, setPuterReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    waitForPuter().then(() => setPuterReady(true)).catch((e) => {
      console.error('Puter failed to load:', e);
      setError('Could not load Puter.js. Please check your connection.');
    });
  }, []);

  const renderPage = () => {
    switch (route.name) {
      case 'home': return <Home />;
      case 'mnemonics': return <Mnemonics />;
      case 'keypoints': return <Keypoints />;
      case 'questions': return <Questions />;
      case 'flashcards': return <Flashcards />;
      case 'simplify': return <Simplify />;
      default: return <Home />;
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-chalkboard-base flex items-center justify-center p-4">
        <div className="bg-chalk-poppy/20 border border-chalk-poppy rounded-lg p-8 max-w-md text-center">
          <h1 className="text-2xl font-hand text-chalk-poppy mb-4">Oops!</h1>
          <p className="text-chalk-fog mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="btn-primary">Reload Page</button>
        </div>
      </div>
    );
  }

  if (!puterReady) {
    return (
      <div className="min-h-screen bg-chalkboard-base flex items-center justify-center">
        <div className="text-center">
          <div className="chalk-dots mb-4"><span/><span/><span/></div>
          <p className="font-hand text-xl text-chalk-fog">Loading StudySlate...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-chalkboard-base flex flex-col">
      <Navbar />
      <main className="flex-1">
        {renderPage()}
      </main>
      <Footer />
    </div>
  );
}

export default App;
