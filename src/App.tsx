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

  const handleGameSetup = (newTheme: string, newItems: string[]) => {
    setTheme(newTheme);
    setItems(newItems.map((text, index) => ({ id: index + 1, text })));
    setPhase('ranking');
  };

  const handleRankingComplete = (newRankings: RankingMap) => {
    setRankings(newRankings);
    // Automatically reveal the middle card (4th position)
    setRevealedCards([4]);
    setPhase('guessing');
  };

  const handleCardReveal = (rank: number) => {
    setRevealedCards([...revealedCards, rank]);
    if (revealedCards.length + 1 === 6) { // All cards revealed (7 total - 1 initial)
      setPhase('result');
    }
  };

  const handleRestart = () => {
    setPhase('setup');
    setTheme('');
    setItems([]);
    setRankings({});
    setRevealedCards([]);
  };

  return (
    <Layout>
      {phase === 'setup' && (
        <GameSetup onComplete={handleGameSetup} />
      )}
      {phase === 'ranking' && (
        <RankingPhase
          theme={theme}
          items={items}
          onComplete={handleRankingComplete}
        />
      )}
      {phase === 'guessing' && (
        <GuessPhase
          theme={theme}
          items={items}
          rankings={rankings}
          revealedCards={revealedCards}
          onCardReveal={handleCardReveal}
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