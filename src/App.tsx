import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { GameSetup } from './components/GameSetup';
import { RankingPhase } from './components/RankingPhase';
import { WeightingPhase } from './components/WeightingPhase';
import { GuessPhase } from './components/GuessPhase';
import { ResultPhase } from './components/ResultPhase';

export type GamePhase = 'setup' | 'ranking' | 'weighting' | 'guessing' | 'result';
export type GameItem = { id: number; text: string };
export type RankingMap = { [key: number]: number }; // itemId -> rank
export type WeightMap = { [key: number]: number }; // itemId -> weight (0-100)

function App() {
  const [phase, setPhase] = useState<GamePhase>('setup');
  const [theme, setTheme] = useState('');
  const [items, setItems] = useState<GameItem[]>([]);
  const [rankings, setRankings] = useState<RankingMap>({});
  const [weights, setWeights] = useState<WeightMap>({});
  const [revealedCards, setRevealedCards] = useState<number[]>([]);
  const [savedTheme, setSavedTheme] = useState('');
  const [savedItems, setSavedItems] = useState<string[]>([]);

  const handleGameSetup = (newTheme: string, newItems: string[]) => {
    setTheme(newTheme);
    setSavedTheme(newTheme);
    setSavedItems(newItems);
    setItems(newItems.map((text, index) => ({ id: index + 1, text })));
    setPhase('weighting');
  };


  const handleWeightingComplete = (newWeights: WeightMap, newRankings: RankingMap) => {
    setWeights(newWeights);
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
    setWeights({});
    setRevealedCards([]);
  };

  const handleBack = () => {
    if (phase === 'weighting') {
      setPhase('setup');
    } else if (phase === 'guessing') {
      setPhase('weighting');
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
      {phase === 'weighting' && (
        <WeightingPhase
          theme={theme}
          items={items}
          rankings={rankings}
          onComplete={handleWeightingComplete}
          onBack={handleBack}
        />
      )}
      {phase === 'guessing' && (
        <GuessPhase
          theme={theme}
          items={items}
          rankings={rankings}
          weights={weights}
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
          weights={weights}
          onRestart={handleRestart}
        />
      )}
    </Layout>
  );
}

export default App;