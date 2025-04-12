import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { GameSetup } from './components/GameSetup';
import { RankingPhase } from './components/RankingPhase';
import { GuessPhase } from './components/GuessPhase';
import { ResultPhase } from './components/ResultPhase';

export type GamePhase = 'setup' | 'ranking' | 'guessing' | 'result';
export type GameItem = { id: number; text: string };
export type RankingMap = { [key: number]: number }; // itemId -> rank

function App() {
  const [phase, setPhase] = useState<GamePhase>('setup');
  const [theme, setTheme] = useState('');
  const [items, setItems] = useState<GameItem[]>([]);
  const [rankings, setRankings] = useState<RankingMap>({});
  const [revealedCards, setRevealedCards] = useState<number[]>([]);
  const [savedTheme, setSavedTheme] = useState('');
  const [savedItems, setSavedItems] = useState<string[]>([]);

  const handleGameSetup = (newTheme: string, newItems: string[]) => {
    setTheme(newTheme);
    setSavedTheme(newTheme);
    setSavedItems(newItems);
    setItems(newItems.map((text, index) => ({ id: index + 1, text })));
    setPhase('ranking');
  };

  const handleRankingComplete = (newRankings: RankingMap) => {
    setRankings(newRankings);
    setRevealedCards([]); // Start with no cards revealed
    setPhase('guessing');
  };

  const handleCardReveal = (rank: number) => {
    setRevealedCards([...revealedCards, rank]);
    if (revealedCards.length + 1 === 7) { // All cards revealed
      setPhase('result');
    }
  };

  const handleRestart = () => {
    setPhase('setup');
    setTheme('');
    setSavedTheme('');
    setItems([]);
    setSavedItems([]);
    setRankings({});
    setRevealedCards([]);
  };

  const handleBack = () => {
    if (phase === 'ranking') {
      setPhase('setup');
    } else if (phase === 'guessing') {
      setPhase('ranking');
    }
  };

  return (
    <Layout>
      {phase === 'setup' && (
        <GameSetup 
          onComplete={handleGameSetup}
          initialTheme={savedTheme}
          initialItems={savedItems}
        />
      )}
      {phase === 'ranking' && (
        <RankingPhase
          theme={theme}
          items={items}
          onComplete={handleRankingComplete}
          onBack={handleBack}
        />
      )}
      {phase === 'guessing' && (
        <GuessPhase
          theme={theme}
          items={items}
          rankings={rankings}
          revealedCards={revealedCards}
          onCardReveal={handleCardReveal}
          onBack={handleBack}
        />
      )}
      {phase === 'result' && (
        <ResultPhase
          theme={theme}
          items={items}
          rankings={rankings}
          onRestart={handleRestart}
        />
      )}
    </Layout>
  );
}

export default App;