import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Book, Play, Sparkles } from 'lucide-react';

export default function Onboarding() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'welcome' | 'choice'>('welcome');

  if (mode === 'welcome') {
    return (
      <div className="container py-20 flex flex-col items-center justify-center text-center min-h-[60vh]">
        <div className="w-20 h-20 rounded-2xl bg-accent flex items-center justify-center mb-6 text-text font-serif font-bold text-2xl">
          B
        </div>
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-text mb-4">Welcome to The Ultimate Book Tracker</h1>
        <p className="text-xl text-text-secondary mb-8 max-w-2xl">
          Your personal Netflix for books. A beautiful, private, offline digital library and reading journal.
        </p>
        <Button size="lg" onClick={() => setMode('choice')} className="px-10 py-3">
          <Sparkles className="w-4 h-4 mr-2" /> Get Started
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-20 flex flex-col items-center justify-center text-center min-h-[60vh]">
      <h1 className="text-3xl font-serif font-bold text-text mb-2">Choose how to begin</h1>
      <p className="text-text-secondary mb-10">Start with a curated demo library, or build your own from scratch.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
        <Card className="p-8 border-2 border-accent bg-accent/5 hover:border-accent/50 transition-colors cursor-pointer" onClick={() => {
          navigate('/library');
        }}>
          <div className="flex items-center gap-3 mb-4">
            <Play className="w-5 h-5 text-accent" />
            <span className="text-lg font-semibold text-text">Explore Demo Library</span>
          </div>
          <p className="text-text-secondary text-sm mb-4">Browse ~40 fictional books with covers, ratings, reviews, and stats to see the app in action.</p>
          <p className="text-xs text-text-muted">Demo data can be removed anytime.</p>
        </Card>
        <Card className="p-8 cursor-pointer" onClick={() => {
          navigate('/library');
        }}>
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-5 h-5 text-text-secondary" />
            <span className="text-lg font-semibold text-text">Start With My Own Library</span>
          </div>
          <p className="text-text-secondary text-sm mb-4">Begin with an empty library. Add your own books, covers, and reading records.</p>
          <p className="text-xs text-text-muted">Your data stays private on your device.</p>
        </Card>
      </div>
      <div className="mt-8">
        <Button variant="outline" size="sm" onClick={() => navigate('/settings')}>Settings</Button>
      </div>
    </div>
  );
}
