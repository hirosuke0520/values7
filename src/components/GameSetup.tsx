import React, { useState } from 'react';

interface GameSetupProps {
  onComplete: (theme: string, items: string[]) => void;
}

export function GameSetup({ onComplete }: GameSetupProps) {
  const [theme, setTheme] = useState('');
  const [items, setItems] = useState<string[]>(Array(7).fill(''));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (theme && items.every(item => item.trim())) {
      onComplete(theme, items);
    }
  };

  const handleItemChange = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index] = value;
    setItems(newItems);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-white">Game Setup</h2>
        <p className="text-white/80">Enter a theme and 7 items to rank</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="theme" className="block text-sm font-medium text-white">
            Theme
          </label>
          <input
            type="text"
            id="theme"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            placeholder="e.g., Qualities in a partner"
            className="mt-1 block w-full rounded-md bg-white/5 border border-white/10 text-white placeholder-white/50 focus:ring-2 focus:ring-white/20 focus:border-transparent"
            required
          />
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-white">
            Items to Rank
          </label>
          {items.map((item, index) => (
            <input
              key={index}
              type="text"
              value={item}
              onChange={(e) => handleItemChange(index, e.target.value)}
              placeholder={`Item ${index + 1}`}
              className="block w-full rounded-md bg-white/5 border border-white/10 text-white placeholder-white/50 focus:ring-2 focus:ring-white/20 focus:border-transparent"
              required
            />
          ))}
        </div>

        <button
          type="submit"
          className="w-full py-3 px-4 rounded-md bg-white/20 hover:bg-white/30 text-white font-medium transition-colors"
        >
          Start Game
        </button>
      </form>
    </div>
  );
}