
import React, { useState } from 'react';
import { Rarity, Character, PotionType, ActiveEffect } from '../types';
import { CHARACTERS, RARITY_WEIGHTS, GACHA_COST, RARITY_COLORS, DOUBLE_ROLL_COST, TRIPLE_ROLL_COST, RARITY_ORDER } from '../constants';

interface GachaProps {
  coins: number;
  activeEffects: ActiveEffect[];
  onPull: (characterIds: string[]) => void;
  onDeductCoins: (amount: number) => void;
}

const GachaSystem: React.FC<GachaProps> = ({ coins, activeEffects, onPull, onDeductCoins }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [lastResults, setLastResults] = useState<Character[]>([]);

  const luckMult = activeEffects.find(e => e.type === PotionType.LUCK)?.multiplier || 1;
  const speedMult = activeEffects.find(e => e.type === PotionType.SPEED)?.multiplier || 1;

  const totalBaseWeight = Object.values(RARITY_WEIGHTS).reduce((a, b) => a + b, 0);

  const performPull = (count: number) => {
    const cost = count === 1 ? GACHA_COST : count === 2 ? DOUBLE_ROLL_COST : TRIPLE_ROLL_COST;
    if (coins < cost || isSpinning) return;

    onDeductCoins(cost);
    setIsSpinning(true);
    setLastResults([]);

    const baseDelay = 2000;
    const finalDelay = Math.max(200, baseDelay * speedMult);

    setTimeout(() => {
      const allChars = Object.values(CHARACTERS);
      const results: Character[] = [];

      for (let i = 0; i < count; i++) {
        const totalWeight = allChars.reduce((acc, char) => {
          let weight = RARITY_WEIGHTS[char.rarity];
          if (char.rarity !== Rarity.COMMON) {
             weight *= luckMult;
          }
          return acc + weight;
        }, 0);

        let random = Math.random() * totalWeight;
        let chosen: Character = allChars[0];

        for (const char of allChars) {
          let weight = RARITY_WEIGHTS[char.rarity];
          if (char.rarity !== Rarity.COMMON) {
             weight *= luckMult;
          }

          if (random < weight) {
            chosen = char;
            break;
          }
          random -= weight;
        }
        results.push(chosen);
      }

      setLastResults(results);
      setIsSpinning(false);
      onPull(results.map(r => r.id));
    }, finalDelay);
  };

  return (
    <div className="bg-zinc-900/95 border-2 border-zinc-700 p-6 rounded-lg shadow-2xl backdrop-blur-md relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 text-right">
        <h4 className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Drop Rates</h4>
        {RARITY_ORDER.map(r => (
          <p key={r} className="text-[8px] font-mono-spaced" style={{ color: RARITY_COLORS[r] }}>
            {r}: {((RARITY_WEIGHTS[r] / totalBaseWeight) * 100).toFixed(1)}%
          </p>
        )).reverse()}
      </div>

      <h2 className="text-3xl font-bold mb-6 text-red-600 font-creepy tracking-[0.2em] text-center drop-shadow-[0_0_10px_rgba(220,38,38,0.5)]">PRIZE CORNER</h2>
      
      <div className="flex flex-col items-center gap-8">
        <div className={`w-full h-56 border-4 rounded-2xl flex items-center justify-center gap-6 transition-all duration-500 overflow-hidden relative ${isSpinning ? 'animate-pulse border-red-500 bg-red-950/20 shadow-[inset_0_0_50px_rgba(220,38,38,0.3)]' : 'border-zinc-800 bg-black/80'}`}>
          {isSpinning ? (
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-sm uppercase font-mono-spaced text-red-500 animate-bounce tracking-widest">Opening Boxes...</p>
            </div>
          ) : lastResults.length > 0 ? (
            <div className="flex gap-6">
              {lastResults.map((res, idx) => (
                <div key={idx} className="text-center p-3 animate-in zoom-in duration-300">
                  <div 
                    className="text-4xl mb-2 drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]"
                    style={{ color: res.color }}
                  >
                    ■
                  </div>
                  <p className="font-bold text-sm tracking-tight" style={{ color: RARITY_COLORS[res.rarity] }}>{res.name}</p>
                  <p className="text-[9px] uppercase tracking-[0.2em] text-zinc-500 font-bold">{res.rarity}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center">
              <p className="text-zinc-700 text-lg font-mono-spaced uppercase tracking-[0.3em]">Insert Faz-Coins</p>
              <p className="text-[10px] text-zinc-800 mt-2 uppercase">Gamble Responsibly</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-lg">
          <button
            onClick={() => performPull(1)}
            disabled={coins < GACHA_COST || isSpinning}
            className={`flex flex-col items-center justify-center py-4 rounded-xl font-bold transition-all border-2 ${
              coins >= GACHA_COST && !isSpinning 
                ? 'bg-zinc-800 border-zinc-600 hover:bg-zinc-700 hover:border-white text-white' 
                : 'bg-zinc-950 border-zinc-900 text-zinc-800 cursor-not-allowed'
            }`}
          >
            <span className="text-xs tracking-widest">SINGLE</span>
            <span className="text-lg text-yellow-600 font-mono-spaced mt-1">{GACHA_COST} FC</span>
          </button>
          
          <button
            onClick={() => performPull(2)}
            disabled={coins < DOUBLE_ROLL_COST || isSpinning}
            className={`flex flex-col items-center justify-center py-4 rounded-xl font-bold transition-all border-2 ${
              coins >= DOUBLE_ROLL_COST && !isSpinning 
                ? 'bg-gradient-to-br from-blue-900/40 to-blue-950/60 border-blue-500/50 hover:brightness-125 text-white shadow-lg' 
                : 'bg-zinc-950 border-zinc-900 text-zinc-800 cursor-not-allowed'
            }`}
          >
            <span className="text-xs tracking-widest">DOUBLE</span>
            <span className="text-lg text-yellow-600 font-mono-spaced mt-1">{DOUBLE_ROLL_COST} FC</span>
          </button>

          <button
            onClick={() => performPull(3)}
            disabled={coins < TRIPLE_ROLL_COST || isSpinning}
            className={`flex flex-col items-center justify-center py-4 rounded-xl font-bold transition-all border-2 ${
              coins >= TRIPLE_ROLL_COST && !isSpinning 
                ? 'bg-gradient-to-br from-red-900/40 to-red-950/60 border-red-500/50 hover:brightness-125 text-white shadow-[0_0_20px_rgba(220,38,38,0.2)]' 
                : 'bg-zinc-950 border-zinc-900 text-zinc-800 cursor-not-allowed'
            }`}
          >
            <span className="text-xs tracking-widest">TRIPLE</span>
            <span className="text-lg text-yellow-600 font-mono-spaced mt-1">{TRIPLE_ROLL_COST} FC</span>
          </button>
        </div>

        {luckMult > 1 && (
          <div className="flex items-center gap-2 bg-yellow-900/20 border border-yellow-500/30 px-4 py-1 rounded-full animate-pulse">
            <span className="text-yellow-500 text-[10px] font-bold uppercase tracking-widest">Luck Active: {luckMult}x</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default GachaSystem;
