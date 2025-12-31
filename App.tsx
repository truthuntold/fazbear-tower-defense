
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, PlacedTower, Enemy, Projectile, Character, Rarity, Difficulty, PotionType, ActiveEffect } from './types';
import {
  CHARACTERS,
  STARTING_HEALTH,
  STARTING_COINS,
  FAZ_COIN_DROP,
  RARITY_COLORS,
  RARITY_UPGRADE_SCALING,
  RARITY_ORDER,
  DIFFICULTY_CONFIG,
  POTION_DATA,
  MAX_LEVEL,
  PATH,
  PREP_TIME_SECONDS,
  VICTORY_WAVE
} from './constants';
import GameMap from './components/GameMap';
import GachaSystem from './components/GachaSystem';
// Removed Gemini import <!-- Gemini Integration Removal -->

const SAVE_KEY = 'fazbear_td_v1_save';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(() => {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure transient state is reset even in saved data
        return {
          ...parsed,
          enemies: [],
          projectiles: [],
          isWaveActive: false,
          isPrepPhase: false,
          prepTimeRemaining: 0,
          placedTowers: (parsed.placedTowers || []).map((t: PlacedTower) => ({ ...t, lastFired: 0 }))
        };
      } catch (e) {
        console.error("Failed to parse save", e);
      }
    }

    return {
      health: STARTING_HEALTH,
      fazCoins: STARTING_COINS,
      wave: 0,
      isWaveActive: false,
      isPrepPhase: false,
      prepTimeRemaining: 0,
      inventory: ['freddy'],
      potions: {},
      activeEffects: [],
      placedTowers: [],
      enemies: [],
      projectiles: [],
      selectedTowerId: null,
      selectedPlacedTowerId: null,
      difficulty: null,
      isDifficultySelected: false,
      autoSellSettings: {
        [Rarity.COMMON]: false,
        [Rarity.UNCOMMON]: false,
        [Rarity.RARE]: false,
        [Rarity.EPIC]: false,
        [Rarity.LEGENDARY]: false,
        [Rarity.MYTHIC]: false,
        [Rarity.SECRET]: false,
      },
      gameSpeed: 1,
      purchasedSpeeds: [1],
      hasWon: false,
      isGameOver: false,
      autoSkipPrep: false,
    };
  });

  const [waveTitle, setWaveTitle] = useState("Shift Begins");
  const [showGacha, setShowGacha] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [flavorText, setFlavorText] = useState("");
  // Removed isAiLoading state <!-- Gemini Integration Removal -->
  const [cheatCode, setCheatCode] = useState("");
  const [showTerminal, setShowTerminal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const gameLoopRef = useRef<number>(null);
  const lastTickRef = useRef<number>(0);
  const tickCountRef = useRef<number>(0);

  // Persistence logic: Save whenever relevant state changes
  useEffect(() => {
    const { enemies, projectiles, isWaveActive, isPrepPhase, prepTimeRemaining, ...persistentData } = gameState;
    localStorage.setItem(SAVE_KEY, JSON.stringify(persistentData));

    setIsSaving(true);
    const timer = setTimeout(() => setIsSaving(false), 1000);
    return () => clearTimeout(timer);
  }, [
    gameState.fazCoins,
    gameState.wave,
    gameState.inventory,
    gameState.placedTowers,
    gameState.potions,
    gameState.activeEffects,
    gameState.difficulty,
    gameState.autoSellSettings,
    gameState.purchasedSpeeds,
    gameState.isGameOver,
    gameState.autoSkipPrep
  ]);

  // Update Active Effects
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      setGameState(prev => {
        const remaining = prev.activeEffects.filter(e => e.endTime > now);
        if (remaining.length !== prev.activeEffects.length) {
          return { ...prev, activeEffects: remaining };
        }
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Helper function to generate enemies based on current state
  const generateEnemies = (state: GameState): Enemy[] => {
    const nextWave = state.wave;
    const config = DIFFICULTY_CONFIG[state.difficulty || Difficulty.MEDIUM];
    const isBossRush = state.difficulty === Difficulty.BOSS_RUSH;

    const count = isBossRush ? (2 + Math.floor(nextWave / 2)) : (5 + nextWave * 3);
    return Array.from({ length: count }).map((_, i) => {
      const isBoss = isBossRush || (nextWave % 5 === 0 && i === count - 1);
      const baseHp = isBoss ? 300 + nextWave * 200 : 30 + nextWave * 30;
      const baseSpeed = isBoss ? 0.007 : (0.012 + (nextWave * 0.001));

      let type: Enemy['type'] = 'Human';
      if (isBoss) type = 'Boss';
      else if (nextWave > 8) type = 'Nightmare';
      else if (nextWave > 4) type = 'Zombie';

      return {
        id: `enemy-${i}-${Date.now()}`,
        type,
        maxHp: Math.floor(baseHp * config.hpMult),
        hp: Math.floor(baseHp * config.hpMult),
        speed: baseSpeed * config.speedMult,
        originalSpeed: baseSpeed * config.speedMult,
        positionIndex: 0,
        lerpFactor: -i * 1.5, // Fixed spacing to prevent Wave 5 stalling
        slowTimer: 0,
      };
    });
  };

  // Prep Phase Timer
  useEffect(() => {
    let timer: number | undefined;
    if (gameState.isPrepPhase) {
      if (gameState.autoSkipPrep || gameState.prepTimeRemaining <= 0) {
        setGameState(prev => {
          const newEnemies = generateEnemies(prev);
          return { ...prev, isPrepPhase: false, prepTimeRemaining: 0, isWaveActive: true, enemies: newEnemies };
        });
        return;
      }

      timer = window.setInterval(() => {
        setGameState(prev => {
          if (prev.prepTimeRemaining <= 1) {
            if (timer !== undefined) clearInterval(timer);
            const newEnemies = generateEnemies(prev);
            return { ...prev, isPrepPhase: false, prepTimeRemaining: 0, isWaveActive: true, enemies: newEnemies };
          }
          return { ...prev, prepTimeRemaining: prev.prepTimeRemaining - 1 };
        });
      }, 1000);
    }
    return () => {
      if (timer !== undefined) clearInterval(timer);
    };
  }, [gameState.isPrepPhase]);

  const handleCheatCode = (val: string) => {
    setCheatCode(val);
    const cmd = val.toLowerCase();

    if (cmd === 'freddy') {
      setGameState(prev => ({ ...prev, fazCoins: 999999999 }));
      setCheatCode("");
      setShowTerminal(false);
      setFlavorText("OVERRIDE ACCEPTED: Infinite Faz-Coins granted. Management is displeased.");
    } else if (cmd === 'reset') {
      handlePlayAgain();
    } else if (cmd === 'save') {
      const { enemies, projectiles, isWaveActive, isPrepPhase, prepTimeRemaining, ...persistentData } = gameState;
      localStorage.setItem(SAVE_KEY, JSON.stringify(persistentData));
      setCheatCode("");
      setShowTerminal(false);
      setFlavorText("MANUAL BACKUP CREATED.");
    }
  };

  const selectDifficulty = (diff: Difficulty) => {
    setGameState(prev => ({
      ...prev,
      difficulty: diff,
      isDifficultySelected: true
    }));
  };

  const buyPotion = (type: PotionType, tier: 1 | 2 | 3) => {
    const data = POTION_DATA[type];
    const cost = Math.floor(data.baseCost * Math.pow(2.5, tier - 1));
    if (gameState.fazCoins < cost) return;

    setGameState(prev => ({
      ...prev,
      fazCoins: prev.fazCoins - cost,
      potions: {
        ...prev.potions,
        [`${type}_${tier}`]: (prev.potions[`${type}_${tier}`] || 0) + 1
      }
    }));
  };

  const buySpeed = (multiplier: number, cost: number) => {
    if (gameState.fazCoins < cost || gameState.purchasedSpeeds.includes(multiplier)) return;
    setGameState(prev => ({
      ...prev,
      fazCoins: prev.fazCoins - cost,
      purchasedSpeeds: [...prev.purchasedSpeeds, multiplier],
      gameSpeed: multiplier
    }));
  };

  const usePotion = (type: PotionType, tier: number) => {
    const key = `${type}_${tier}`;
    if ((gameState.potions[key] || 0) <= 0) return;

    const data = POTION_DATA[type].tiers[tier as 1 | 2 | 3];
    const effect: ActiveEffect = {
      type,
      multiplier: data.multiplier,
      endTime: Date.now() + data.duration
    };

    setGameState(prev => {
      const otherEffects = prev.activeEffects.filter(e => e.type !== type);
      return {
        ...prev,
        potions: {
          ...prev.potions,
          [key]: prev.potions[key] - 1
        },
        activeEffects: [...otherEffects, effect]
      };
    });
    setFlavorText(`${type.toUpperCase()} AUGMENT INJECTED.`);
  };

  const FALLBACK_TITLES = [
    "Static in the Halls",
    "The First Watch",
    "Movement in the Kitchen",
    "The Music Box Winds",
    "Shadows in the Corner",
    "Vent Ventilation Failure",
    "Power Reserves Dwindling",
    "The Grand Re-Opening",
    "Foxy's Sprint",
    "Golden Hallucinations"
  ];

  const updateWaveTitleText = (wave: number) => {
    setWaveTitle(FALLBACK_TITLES[wave % FALLBACK_TITLES.length] || `Night ${wave}`);
  };

  const startWave = () => {
    if (gameState.isWaveActive || gameState.isPrepPhase || !gameState.difficulty || gameState.isGameOver) return;
    const nextWave = gameState.wave + 1;

    if (nextWave > VICTORY_WAVE) {
      setGameState(prev => ({ ...prev, hasWon: true }));
      return;
    }

    updateWaveTitleText(nextWave);
    setGameState(prev => ({
      ...prev,
      wave: nextWave,
      isPrepPhase: true,
      prepTimeRemaining: PREP_TIME_SECONDS
    }));
  };

  const sellCharacter = (charId: string) => {
    const char = CHARACTERS[charId];
    if (!char) return;
    setGameState(prev => {
      const idx = prev.inventory.indexOf(charId);
      if (idx === -1) return prev;
      const newInventory = [...prev.inventory];
      newInventory.splice(idx, 1);
      return {
        ...prev,
        fazCoins: prev.fazCoins + Math.floor(char.cost * 0.5),
        inventory: newInventory,
        selectedTowerId: prev.selectedTowerId === charId && !newInventory.includes(charId) ? null : prev.selectedTowerId
      };
    });
  };

  const toggleAutoSell = (rarity: Rarity) => {
    setGameState(prev => ({
      ...prev,
      autoSellSettings: { ...prev.autoSellSettings, [rarity]: !prev.autoSellSettings[rarity] }
    }));
  };

  const handlePlaceTower = (x: number, y: number) => {
    if (!gameState.selectedTowerId) return;
    const char = CHARACTERS[gameState.selectedTowerId];
    if (!char || gameState.fazCoins < char.cost) return;
    if (gameState.placedTowers.some(t => t.pos.x === x && t.pos.y === y)) return;

    const newTower: PlacedTower = {
      id: `tower-${Date.now()}`,
      characterId: char.id,
      pos: { x, y },
      lastFired: 0,
      level: 1,
    };

    setGameState(prev => {
      return {
        ...prev,
        fazCoins: prev.fazCoins - char.cost,
        placedTowers: [...prev.placedTowers, newTower],
        selectedTowerId: null,
      };
    });
  };

  const upgradeTower = (towerId: string) => {
    setGameState(prev => {
      const tower = prev.placedTowers.find(t => t.id === towerId);
      if (!tower || tower.level >= MAX_LEVEL) return prev;
      const char = CHARACTERS[tower.characterId];
      if (!char) return prev;
      const upgradeCost = Math.floor(char.cost * Math.pow(1.5, tower.level));
      if (prev.fazCoins < upgradeCost) return prev;
      return {
        ...prev,
        fazCoins: prev.fazCoins - upgradeCost,
        placedTowers: prev.placedTowers.map(t => t.id === towerId ? { ...t, level: t.level + 1 } : t)
      };
    });
  };

  const sellPlacedTower = (towerId: string) => {
    setGameState(prev => {
      const tower = prev.placedTowers.find(t => t.id === towerId);
      if (!tower) return prev;
      const char = CHARACTERS[tower.characterId];
      if (!char) return prev;

      // Total spent = base cost + sum of all upgrades
      let totalSpent = char.cost;
      for (let i = 1; i < tower.level; i++) {
        totalSpent += Math.floor(char.cost * Math.pow(1.5, i));
      }

      const refund = Math.floor(totalSpent * 0.6);

      return {
        ...prev,
        fazCoins: prev.fazCoins + refund,
        placedTowers: prev.placedTowers.filter(t => t.id !== towerId),
        selectedPlacedTowerId: prev.selectedPlacedTowerId === towerId ? null : prev.selectedPlacedTowerId
      };
    });
  };

  const handlePull = (charIds: string[]) => {
    setGameState(prev => {
      let finalCoins = prev.fazCoins;
      let finalInventory = [...prev.inventory];
      charIds.forEach(id => {
        const char = CHARACTERS[id];
        if (!char) return;

        if (prev.inventory.includes(id)) {
          // Already unlocked, refund 50%
          finalCoins += Math.floor(char.cost * 0.5);
        } else if (prev.autoSellSettings[char.rarity]) {
          // Auto-sell enabled for new unlock? 
          // Usually auto-sell only applies to duplicates in "unlock" systems, 
          // but I'll stick to refunding if already owned.
          finalInventory.push(id);
        } else {
          finalInventory.push(id);
        }
      });
      return { ...prev, fazCoins: finalCoins, inventory: finalInventory };
    });
    const lastCharIds = charIds[charIds.length - 1];
    const lastChar = CHARACTERS[lastCharIds];
    if (lastChar) {
      const FALLBACK_FLAVORS: Record<string, string> = {
        'freddy': "The leader of the band is watching you.",
        'bonnie': "He doesn't need a door to get in.",
        'chica': "Let's eat... but not pizza.",
        'foxy': "Stay away from Pirate Cove.",
        'golden_freddy': "IT'S ME.",
        'springtrap': "I always come back.",
        'puppet': "The music box stopped.",
        'balloon_boy': "Hi! Hello! HAHAHA!",
      };
      const id = lastChar.name.toLowerCase().replace(/\s+/g, '_');
      setFlavorText(FALLBACK_FLAVORS[id] || "A new presence arrives.");
    }
  };

  const gameLoop = useCallback((time: number) => {
    if (!lastTickRef.current) lastTickRef.current = time;
    const elapsed = time - lastTickRef.current;

    // Target 30 logic ticks per second at 1x speed
    const baseInterval = 33.3;
    const effectiveInterval = baseInterval / gameState.gameSpeed;
    const maxTicksPerFrame = 5;

    if (elapsed >= effectiveInterval) {
      let numTicks = Math.floor(elapsed / effectiveInterval);

      // If we fall too far behind (e.g. tab was inactive), discard overdue ticks
      if (numTicks > maxTicksPerFrame * 2) {
        lastTickRef.current = time;
        numTicks = maxTicksPerFrame;
      } else {
        lastTickRef.current += numTicks * effectiveInterval;
      }

      setGameState(prev => {
        if ((!prev.isWaveActive && prev.projectiles.length === 0) || prev.isGameOver) return prev;

        let workingState = { ...prev };

        // Process multiple ticks if needed (cap at 5 to prevent performance issues)
        const ticksToRun = Math.min(numTicks, maxTicksPerFrame);

        for (let t = 0; t < ticksToRun; t++) {
          tickCountRef.current++;

          const updatedEnemies = [...workingState.enemies];
          const updatedTowers = [...workingState.placedTowers];
          const updatedProjectiles = [...workingState.projectiles].filter(p => tickCountRef.current - p.startTime < p.duration);
          let newHealth = workingState.health;
          let newCoins = workingState.fazCoins;

          const diffConfig = DIFFICULTY_CONFIG[workingState.difficulty || Difficulty.MEDIUM];
          const moneyEffect = workingState.activeEffects.find(e => e.type === PotionType.MONEY);
          const moneyMult = moneyEffect ? moneyEffect.multiplier : 1;

          for (let i = updatedEnemies.length - 1; i >= 0; i--) {
            const enemy = updatedEnemies[i];
            if (enemy.slowTimer > 0) {
              enemy.slowTimer--;
              enemy.speed = enemy.originalSpeed * 0.5;
            } else {
              enemy.speed = enemy.originalSpeed;
            }

            enemy.lerpFactor += enemy.speed;
            if (enemy.lerpFactor >= 1) {
              enemy.lerpFactor = 0;
              enemy.positionIndex++;
              if (enemy.positionIndex >= PATH.length - 1) {
                newHealth -= (enemy.type === 'Boss' ? 5 : 1);
                updatedEnemies.splice(i, 1);
              }
            }
          }

          updatedTowers.forEach(tower => {
            const char = CHARACTERS[tower.characterId];
            if (char) {
              const scalingFactor = RARITY_UPGRADE_SCALING[char.rarity];
              const currentDamage = Math.floor(char.damage * Math.pow(scalingFactor, tower.level - 1));
              const currentFireRate = tower.level >= 5 ? Math.max(5, char.fireRate - 5) : char.fireRate;

              if (tickCountRef.current - tower.lastFired < currentFireRate) return;

              let target: Enemy | null = null;
              let minDist = char.range;

              updatedEnemies.forEach(e => {
                if (e.lerpFactor < 0) return;
                const pos = {
                  x: PATH[e.positionIndex].x + (PATH[e.positionIndex + 1]?.x - PATH[e.positionIndex].x || 0) * e.lerpFactor,
                  y: PATH[e.positionIndex].y + (PATH[e.positionIndex + 1]?.y - PATH[e.positionIndex].y || 0) * e.lerpFactor
                };
                const dist = Math.sqrt(Math.pow(pos.x - tower.pos.x, 2) + Math.pow(pos.y - tower.pos.y, 2));
                if (dist <= minDist) { target = e; minDist = dist; }
              });

              if (target) {
                target.hp -= currentDamage;
                tower.lastFired = tickCountRef.current;
                if (char.ability === 'slow') target.slowTimer = 60;
                updatedProjectiles.push({
                  id: `proj-${Date.now()}-${Math.random()}`,
                  start: { ...tower.pos },
                  end: {
                    x: PATH[target.positionIndex].x + (PATH[target.positionIndex + 1]?.x - PATH[target.positionIndex].x || 0) * target.lerpFactor,
                    y: PATH[target.positionIndex].y + (PATH[target.positionIndex + 1]?.y - PATH[target.positionIndex].y || 0) * target.lerpFactor
                  },
                  startTime: tickCountRef.current,
                  duration: 15,
                  color: char.color
                });
              }
            }
          });

          for (let i = updatedEnemies.length - 1; i >= 0; i--) {
            if (updatedEnemies[i].hp <= 0) {
              const killedEnemy = updatedEnemies[i];
              updatedEnemies.splice(i, 1);
              // Scale Faz-Coin rewards based on enemy health
              const reward = Math.floor(killedEnemy.maxHp * 0.15 + 5);
              newCoins += Math.floor(reward * diffConfig.coinMult * moneyMult);
            }
          }

          workingState = {
            ...workingState,
            health: Math.max(0, newHealth),
            fazCoins: newCoins,
            enemies: updatedEnemies,
            projectiles: updatedProjectiles,
            isWaveActive: updatedEnemies.length > 0,
            isGameOver: newHealth <= 0
          };

          if (workingState.isGameOver) break;
        }

        return workingState;
      });
    }
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [gameState.gameSpeed]);

  useEffect(() => {
    gameLoopRef.current = requestAnimationFrame(gameLoop);
    return () => { if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current); };
  }, [gameLoop]);

  const uniqueInventoryIds: string[] = Array.from(new Set(gameState.inventory)).sort((a: string, b: string) => {
    const charA = CHARACTERS[a as keyof typeof CHARACTERS]; const charB = CHARACTERS[b as keyof typeof CHARACTERS];
    return RARITY_ORDER.indexOf(charB.rarity) - RARITY_ORDER.indexOf(charA.rarity);
  });

  const handlePlayAgain = () => {
    localStorage.removeItem(SAVE_KEY);
    window.location.reload();
  };

  const handleRestartShift = () => {
    setGameState(prev => ({
      ...prev,
      health: STARTING_HEALTH,
      wave: 0,
      isWaveActive: false,
      isPrepPhase: false,
      prepTimeRemaining: 0,
      enemies: [],
      projectiles: [],
      placedTowers: prev.placedTowers.map(t => ({ ...t, lastFired: 0 })),
      isGameOver: false,
      hasWon: false
    }));
    tickCountRef.current = 0;
    lastTickRef.current = 0;
  };

  const handleGiveUp = () => {
    if (confirm("Management requires your full attention. Are you sure you want to give up on this shift?")) {
      setGameState(prev => ({ ...prev, isGameOver: true, health: 0 }));
    }
  };

  if (gameState.isGameOver) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-black crt text-center">
        <h2 className="font-creepy text-red-600 mb-4 animate-pulse tracking-[0.2em] text-[120px] leading-none">YOU'RE FIRED</h2>
        <h3 className="text-xl font-mono-spaced text-zinc-500 mb-12 uppercase tracking-widest border-y border-zinc-800 py-4 px-12">Termination Notice: Performance Sub-Optimal</h3>
        <div className="bg-zinc-900/50 p-8 border border-zinc-800 rounded-lg mb-12 max-w-md w-full">
          <p className="text-zinc-500 text-xs uppercase mb-4 font-bold tracking-widest text-left">Internal Memo:</p>
          <p className="text-zinc-400 text-sm italic leading-relaxed text-left">"Fazbear Entertainment is a place for joy and fun. Your failure to maintain the safety of our guests (and our expensive equipment) is a breach of contract. Don't let the door hit you on the way out."</p>
        </div>
        <div className="flex justify-center">
          <button onClick={handleRestartShift} className="px-10 py-5 bg-red-900 border-2 border-red-500 hover:bg-red-700 text-white font-black uppercase transition-all shadow-[0_0_30px_rgba(220,38,38,0.4)] hover:scale-105 tracking-widest rounded-sm">Restart Shift</button>
        </div>
      </div>
    );
  }

  if (gameState.hasWon) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-black crt text-center">
        <h2 className="text-6xl font-creepy text-yellow-500 mb-4 animate-bounce tracking-widest">6 AM</h2>
        <h3 className="text-2xl font-mono-spaced text-green-500 mb-12">SHIFT SURVIVED</h3>
        <p className="text-zinc-500 mb-12 max-w-md">You've successfully managed the animatronics for the entire night. Fazbear Entertainment congratulates you on your survival.</p>
        <div className="flex gap-6">
          <button onClick={() => setGameState(prev => ({ ...prev, hasWon: false }))} className="px-8 py-4 bg-zinc-900 border border-zinc-700 hover:border-white rounded font-bold uppercase transition-all">Continue Playing</button>
          <button onClick={handlePlayAgain} className="px-8 py-4 bg-red-900 border border-red-500 hover:bg-red-800 rounded font-bold uppercase transition-all">New Night</button>
        </div>
      </div>
    );
  }

  if (!gameState.isDifficultySelected) {
    return (
      <div className="h-screen w-screen flex flex-col bg-black crt overflow-hidden relative">
        <div className="absolute top-4 right-4 z-50">
          <button onClick={() => setShowSettings(!showSettings)} className={`px-4 py-2 rounded text-xs border-2 font-bold tracking-widest transition-all ${showSettings ? 'bg-zinc-700 border-zinc-400 shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'border-zinc-700 text-zinc-400 hover:border-zinc-300'}`}>SETTINGS</button>
        </div>

        {showSettings && (
          <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md" onClick={() => setShowSettings(false)}>
            <div className="w-full max-w-2xl bg-zinc-900 border-2 border-zinc-700 p-8 rounded-xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-3xl font-creepy text-zinc-100 text-center mb-8 tracking-widest">SYSTEM SETTINGS</h2>
              <div className="bg-black/40 p-6 rounded border border-zinc-800 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold">Factory Reset</h3>
                  <p className="text-xs text-zinc-500 uppercase">Wipe all progress and start over</p>
                </div>
                <button onClick={() => { if (confirm("Are you sure? This will wipe ALL progress!")) { localStorage.removeItem(SAVE_KEY); window.location.reload(); } }} className="px-6 py-3 bg-red-900 hover:bg-red-600 text-white font-bold rounded uppercase transition-all shadow-lg">Reset Data</button>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 flex flex-col items-center justify-center">
          <h2 className="text-4xl font-creepy text-red-600 mb-8 tracking-[0.3em] uppercase">Select Monitoring Level</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 max-w-6xl w-full px-12">
            {Object.values(Difficulty).map(diff => (
              <button key={diff} onClick={() => selectDifficulty(diff)} className="group p-8 bg-zinc-900 border-2 border-zinc-800 hover:border-red-600 transition-all rounded-lg flex flex-col items-center gap-4 hover:shadow-[0_0_30px_rgba(220,38,38,0.3)]">
                <span className="text-xl font-bold font-mono-spaced text-zinc-100">{diff}</span>
                <div className="text-[10px] text-zinc-500 font-mono-spaced uppercase space-y-1 text-center">
                  <p>Hostility: {DIFFICULTY_CONFIG[diff].hpMult}x</p>
                  <p>Faz-Reward: {DIFFICULTY_CONFIG[diff].coinMult}x</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const selectedChar: Character | undefined = gameState.selectedTowerId ? CHARACTERS[gameState.selectedTowerId as string] : undefined;
  const selectedPlacedTower: PlacedTower | null | undefined = gameState.selectedPlacedTowerId ? gameState.placedTowers.find(t => t.id === gameState.selectedPlacedTowerId) : null;
  const selectedPlacedChar: Character | null = selectedPlacedTower ? CHARACTERS[selectedPlacedTower.characterId] : null;

  return (
    <div className="h-screen w-screen flex flex-col bg-[#050505] crt text-zinc-100 overflow-hidden select-none">
      <header className="h-24 border-b border-zinc-800 bg-zinc-900/60 flex flex-col z-50 shadow-2xl relative">
        <div className="flex-1 flex items-center justify-between px-8">
          <div className="flex flex-col">
            <h1 className="text-2xl font-creepy tracking-[0.3em] text-red-600 drop-shadow-[0_0_10px_rgba(220,38,38,0.8)]">FAZBEAR TD</h1>
            <div className="flex items-center gap-4 mt-1">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Speed Control:</span>
              <div className="flex gap-2">
                {gameState.purchasedSpeeds.map(s => (
                  <button key={s} onClick={() => setGameState(prev => ({ ...prev, gameSpeed: s }))} className={`text-[10px] px-2 py-0.5 border rounded font-bold transition-all ${gameState.gameSpeed === s ? 'bg-red-900 border-red-500' : 'bg-black border-zinc-800 hover:border-zinc-500'}`}>{s}x</button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-12">
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-zinc-500 uppercase font-bold mb-1">AUTO-SELL</span>
              <div className="flex gap-1">
                {(RARITY_ORDER as Rarity[]).map((r: Rarity) => (
                  <button key={r} onClick={() => toggleAutoSell(r)} className={`text-[7px] px-2 py-1 border rounded uppercase font-bold transition-all ${gameState.autoSellSettings[r] ? 'bg-red-950 border-red-500 text-red-200' : 'bg-black border-zinc-800 text-zinc-600'}`}>{r}</button>
                ))}
              </div>
            </div>

            <div className="flex flex-col items-center">
              <span className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Faz-Coins</span>
              <span className="text-2xl font-bold text-yellow-500 font-mono-spaced tabular-nums">{gameState.fazCoins.toLocaleString()}</span>
            </div>

            <div className="flex flex-col items-center">
              <span className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Wave {gameState.wave}/{VICTORY_WAVE}</span>
              <span className={`text-sm font-bold text-red-600 uppercase tracking-widest`}>{waveTitle}</span>
            </div>
          </div>

          <div className="flex gap-4">
            <button onClick={handleGiveUp} className="px-4 py-2 rounded text-xs border-2 border-red-900/40 text-red-900/60 font-bold tracking-widest hover:bg-red-900/10 hover:text-red-600 hover:border-red-600/40 transition-all">GIVE UP</button>
            <button onClick={() => { setShowSettings(!showSettings); setShowShop(false); setShowGacha(false); }} className={`px-4 py-2 rounded text-xs border-2 font-bold tracking-widest transition-all ${showSettings ? 'bg-zinc-700 border-zinc-400 shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'border-zinc-700 text-zinc-400 hover:border-zinc-300'}`}>SETTINGS</button>
            <button onClick={() => { setShowShop(!showShop); setShowGacha(false); setShowSettings(false); }} className={`px-4 py-2 rounded text-xs border-2 font-bold tracking-widest transition-all ${showShop ? 'bg-blue-900 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'border-zinc-700 text-zinc-400 hover:border-zinc-300'}`}>FACILITY SHOP</button>
            <button onClick={() => { setShowGacha(!showGacha); setShowShop(false); setShowSettings(false); }} className={`px-4 py-2 rounded text-xs border-2 font-bold tracking-widest transition-all ${showGacha ? 'bg-red-900 border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.5)]' : 'border-zinc-700 text-zinc-400 hover:border-zinc-300'}`}>PRIZE CORNER</button>
          </div>
        </div>

        {/* Health Bar */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-zinc-900 overflow-hidden">
          <div className="h-full bg-red-600 transition-all duration-500 shadow-[0_0_10px_red]" style={{ width: `${(gameState.health / STARTING_HEALTH) * 100}%` }}></div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden relative">
        <aside className="w-80 border-r border-zinc-800 bg-zinc-900/20 flex flex-col p-4 gap-6 overflow-y-auto">
          <section className="flex flex-col gap-3">
            <h3 className="text-[11px] font-mono-spaced uppercase text-zinc-500 border-b border-zinc-800 pb-2 flex justify-between">Animatronics <span>{gameState.inventory.length}</span></h3>
            <div className="flex flex-col gap-2 max-h-[30vh] overflow-y-auto pr-1">
              {uniqueInventoryIds.map((charId: string) => {
                const char = CHARACTERS[charId];
                const canAfford = gameState.fazCoins >= char.cost;
                return (
                  <div
                    key={charId}
                    onClick={() => { setGameState(prev => ({ ...prev, selectedTowerId: charId, selectedPlacedTowerId: null })); setShowGacha(false); setShowShop(false); }}
                    className={`p-3 rounded-lg border group transition-all relative cursor-pointer ${gameState.selectedTowerId === charId ? 'bg-zinc-800 border-white shadow-xl scale-[1.02]' : canAfford ? 'bg-black/40 border-zinc-800 hover:border-zinc-600' : 'bg-red-950/20 border-red-900/40 opacity-80'}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold" style={{ color: canAfford ? RARITY_COLORS[char.rarity] : '#ef4444' }}>{char.name}</span>
                      <span className="text-[7px] text-zinc-600 font-bold uppercase tracking-tighter">Unlocked</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-sm shadow-inner" style={{ backgroundColor: char.color }}></div>
                        <div className="flex flex-col">
                          <span className="text-[9px] text-zinc-500 font-bold">DMG: {char.damage}</span>
                          <span className={`text-[9px] font-bold ${canAfford ? 'text-yellow-600' : 'text-red-500 animate-pulse'}`}>COST: {char.cost} FC</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <h3 className="text-[11px] font-mono-spaced uppercase text-zinc-500 border-b border-zinc-800 pb-2">Inventory Potions</h3>
            <div className="flex flex-col gap-2 max-h-[20vh] overflow-y-auto">
              {Object.entries(gameState.potions).map(([key, count]) => {
                if (count <= 0) return null;
                const [type, tier] = key.split('_');
                return (
                  <div key={key} className="flex items-center justify-between bg-black/40 p-2 rounded border border-zinc-800 text-[10px]">
                    <div className="flex flex-col">
                      <span className="font-bold uppercase text-zinc-300">{type} T{tier}</span>
                      <span className="text-zinc-600">STOCKED: {count}</span>
                    </div>
                    <button
                      onClick={() => usePotion(type as PotionType, parseInt(tier))}
                      className="bg-blue-900/40 hover:bg-blue-600 text-blue-200 px-3 py-1 rounded-sm border border-blue-500/30 uppercase font-bold"
                    >
                      Use
                    </button>
                  </div>
                );
              })}
              {Object.values(gameState.potions).every(v => (v as number) === 0) && <p className="text-[10px] text-zinc-700 italic text-center py-2 uppercase">No Serums Owned</p>}
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <h3 className="text-[11px] font-mono-spaced uppercase text-zinc-500 border-b border-zinc-800 pb-2">Active Potions</h3>
            <div className="space-y-2">
              {gameState.activeEffects.map(effect => (
                <div key={effect.type} className="flex justify-between items-center text-[10px] bg-blue-900/10 p-2 rounded border border-blue-500/30">
                  <span className="text-blue-400 font-bold uppercase">{effect.type} {effect.multiplier}x</span>
                  <span className="font-mono text-blue-300">{Math.max(0, Math.floor((effect.endTime - Date.now()) / 1000))}s</span>
                </div>
              ))}
              {gameState.activeEffects.length === 0 && <p className="text-[10px] text-zinc-700 italic text-center py-4 uppercase tracking-widest">No Active Augments</p>}
            </div>
          </section>
        </aside>

        <section className="flex-1 relative flex items-center justify-center bg-black overflow-hidden" onClick={() => setGameState(prev => ({ ...prev, selectedPlacedTowerId: null }))}>
          {showSettings ? (
            <div className="w-full max-w-2xl bg-zinc-900/90 border-2 border-zinc-700 p-8 rounded-xl shadow-2xl backdrop-blur-md" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-3xl font-creepy text-zinc-100 text-center mb-8 tracking-widest">SYSTEM SETTINGS</h2>
              <div className="flex flex-col gap-6">
                <div className="bg-black/40 p-6 rounded border border-zinc-800 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold">Factory Reset</h3>
                    <p className="text-xs text-zinc-500 uppercase">Wipe all progress and start over</p>
                  </div>
                  <button onClick={() => { if (confirm("Are you sure? This will wipe ALL progress!")) { localStorage.removeItem(SAVE_KEY); window.location.reload(); } }} className="px-6 py-3 bg-red-900 hover:bg-red-600 text-white font-bold rounded uppercase transition-all shadow-lg">Reset Data</button>
                </div>
                <div className="bg-black/40 p-6 rounded border border-zinc-800 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold">Stuck State Recovery</h3>
                    <p className="text-xs text-zinc-500 uppercase">Emergency reset of game phases</p>
                  </div>
                  <button onClick={() => { setGameState(prev => ({ ...prev, isWaveActive: false, isPrepPhase: false, prepTimeRemaining: 0, enemies: [], projectiles: [] })); setShowSettings(false); }} className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold rounded uppercase transition-all">Recover Phase</button>
                </div>
                <div className="bg-black/40 p-6 rounded border border-zinc-800 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold">Auto-Skip Prep Shift</h3>
                    <p className="text-xs text-zinc-500 uppercase">Skip the timer between waves automatically</p>
                  </div>
                  <button onClick={() => setGameState(prev => ({ ...prev, autoSkipPrep: !prev.autoSkipPrep }))} className={`px-6 py-3 border-2 font-bold rounded uppercase transition-all ${gameState.autoSkipPrep ? 'bg-green-900 border-green-500 text-green-200' : 'bg-black border-zinc-700 text-zinc-500 hover:border-zinc-500'}`}>{gameState.autoSkipPrep ? 'ENABLED' : 'DISABLED'}</button>
                </div>
              </div>
            </div>
          ) : showGacha ? (
            <div className="w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
              <GachaSystem coins={gameState.fazCoins} activeEffects={gameState.activeEffects} onPull={handlePull} onDeductCoins={(amt) => setGameState(prev => ({ ...prev, fazCoins: prev.fazCoins - amt }))} />
            </div>
          ) : showShop ? (
            <div className="w-full max-w-4xl bg-zinc-900/90 border-2 border-zinc-700 p-8 rounded-xl shadow-2xl backdrop-blur-md" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-3xl font-creepy text-blue-500 text-center mb-8 tracking-widest">FACILITY MAINTENANCE</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-sm font-bold text-zinc-400 uppercase mb-4 border-b border-zinc-800 pb-2">Augmentation Serums</h3>
                  <div className="space-y-4">
                    {(Object.values(PotionType) as PotionType[]).map(type => (
                      <div key={type} className="bg-black/40 p-3 rounded border border-zinc-800">
                        <p className="text-xs font-bold text-zinc-300 mb-3 uppercase tracking-widest">{type} EXTRACT</p>
                        <div className="flex gap-2">
                          {[1, 2, 3].map(tier => {
                            const cost = Math.floor(POTION_DATA[type].baseCost * Math.pow(2.5, tier - 1));
                            return (
                              <button key={tier} onClick={() => buyPotion(type, tier as 1 | 2 | 3)} disabled={gameState.fazCoins < cost} className={`flex-1 py-2 text-[10px] rounded border font-bold transition-all ${gameState.fazCoins >= cost ? 'border-blue-500/50 hover:bg-blue-900/20 text-blue-100' : 'border-zinc-900 text-zinc-800 opacity-50'}`}>T{tier}: {cost} FC</button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-400 uppercase mb-4 border-b border-zinc-800 pb-2">System Speed Upgrades</h3>
                  <div className="space-y-4">
                    {[2, 3].map(s => {
                      const cost = s === 2 ? 300 : 500;
                      const hasIt = gameState.purchasedSpeeds.includes(s);
                      return (
                        <div key={s} className="bg-black/40 p-4 rounded border border-zinc-800 flex justify-between items-center">
                          <div className="flex flex-col">
                            <span className="text-lg font-bold text-zinc-100">{s}x Clock Speed</span>
                            <span className="text-[10px] text-zinc-500 uppercase">Permanent Upgrade</span>
                          </div>
                          <button onClick={() => buySpeed(s, cost)} disabled={hasIt || gameState.fazCoins < cost} className={`px-6 py-2 rounded font-bold uppercase transition-all ${hasIt ? 'bg-green-900/40 border-green-500 text-green-500 cursor-default' : gameState.fazCoins >= cost ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg' : 'bg-zinc-900 text-zinc-700 opacity-50'}`}>{hasIt ? 'INSTALLED' : `${cost} FC`}</button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative group p-10">
              <GameMap towers={gameState.placedTowers} enemies={gameState.enemies} projectiles={gameState.projectiles} onPlaceTower={handlePlaceTower} onSelectPlacedTower={(tid) => setGameState(prev => ({ ...prev, selectedPlacedTowerId: tid, selectedTowerId: null }))} selectedTowerId={gameState.selectedTowerId} selectedPlacedTowerId={gameState.selectedPlacedTowerId} tickCount={tickCountRef.current} />
              {gameState.isPrepPhase && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center bg-black/60 backdrop-blur-md z-[100] p-4 rounded-xl border border-yellow-500/30">
                  <h2 className="text-[10px] font-mono-spaced text-yellow-500 mb-1 uppercase tracking-widest font-bold">Preparation Phase</h2>
                  <div className="text-3xl font-mono-spaced text-white font-bold">{gameState.prepTimeRemaining}s</div>
                  <div className="flex gap-4 mt-3">
                    <button onClick={() => setGameState(prev => ({ ...prev, prepTimeRemaining: 0 }))} className="px-3 py-1 bg-red-900/40 hover:bg-red-800 text-white font-bold rounded uppercase tracking-widest text-[8px] border border-red-500/50">Skip Prep</button>
                    <button onClick={() => setGameState(prev => ({ ...prev, autoSkipPrep: true }))} className="px-3 py-1 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 font-bold rounded uppercase tracking-widest text-[8px] border border-zinc-700">Remember</button>
                  </div>
                </div>
              )}
              {!gameState.isWaveActive && !gameState.isPrepPhase && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-[100]">
                  <button onClick={startWave} className="group flex flex-col items-center gap-4">
                    <div className="px-12 py-6 bg-red-700 hover:bg-red-600 text-white rounded-lg border-4 border-red-500 font-bold text-3xl transition-all shadow-[0_0_80px_rgba(220,38,38,0.5)] group-hover:scale-110 tracking-[0.2em] uppercase font-creepy">Clock In</div>
                    <span className="text-zinc-500 text-xs animate-pulse tracking-widest uppercase">Start Night Shift</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </section>

        <aside className="w-80 border-l border-zinc-800 bg-zinc-900/20 flex flex-col p-5 overflow-y-auto">
          {selectedChar ? (
            <div className="animate-in slide-in-from-right duration-200">
              <h3 className="text-[11px] font-mono-spaced uppercase text-zinc-500 border-b border-zinc-800 pb-2 mb-4">Unit Specs</h3>
              <div className="bg-black/60 p-5 rounded-xl border border-zinc-800 shadow-2xl">
                <div className="aspect-square w-24 mx-auto mb-6 bg-zinc-950 flex items-center justify-center rounded-lg border border-zinc-800"><div className="w-12 h-12 rounded" style={{ backgroundColor: selectedChar.color }}></div></div>
                <h4 className="text-lg font-bold text-center mb-1">{selectedChar.name}</h4>
                <p className="text-[10px] text-center uppercase tracking-[0.2em] mb-6 font-bold" style={{ color: RARITY_COLORS[selectedChar.rarity] }}>{selectedChar.rarity}</p>
                <div className="space-y-3 text-[11px] font-mono-spaced">
                  <div className="flex justify-between border-b border-zinc-800/50 pb-1"><span className="text-zinc-500">DMG:</span><span className="text-red-500">{selectedChar.damage}</span></div>
                  <div className="flex justify-between border-b border-zinc-800/50 pb-1"><span className="text-zinc-500">SPD:</span><span className="text-blue-400">{selectedChar.fireRate} tks</span></div>
                  <div className="flex justify-between pt-4"><span className="text-zinc-500 font-bold">DEPLOY:</span><span className="text-yellow-600 font-bold">{selectedChar.cost} FC</span></div>
                </div>
              </div>
            </div>
          ) : selectedPlacedTower && selectedPlacedChar ? (
            <div className="animate-in slide-in-from-right duration-200">
              <h3 className="text-[11px] font-mono-spaced uppercase text-zinc-500 border-b border-zinc-800 pb-2 mb-4">Unit Upgrades</h3>
              <div className="bg-black/60 p-5 rounded-xl border border-zinc-800 shadow-2xl">
                <div className="flex justify-between items-center mb-6"><h4 className="text-lg font-bold">{selectedPlacedChar.name}</h4><span className="text-xs px-2 py-0.5 bg-red-900 rounded font-bold">LVL {selectedPlacedTower.level}</span></div>
                <div className="space-y-4">
                  <div className="bg-zinc-950 p-3 rounded border border-zinc-800 text-[11px] font-mono-spaced">
                    <div className="flex justify-between mb-2"><span>Damage:</span><span className="text-red-500">{Math.floor(selectedPlacedChar.damage * Math.pow(RARITY_UPGRADE_SCALING[selectedPlacedChar.rarity], selectedPlacedTower.level - 1))}</span></div>
                    <div className="flex justify-between"><span>Fire Rate:</span><span className="text-green-500">{selectedPlacedTower.level >= 5 ? Math.max(5, selectedPlacedChar.fireRate - 5) : selectedPlacedChar.fireRate}</span></div>
                  </div>
                  <button onClick={() => upgradeTower(selectedPlacedTower.id)} disabled={selectedPlacedTower.level >= MAX_LEVEL || gameState.fazCoins < Math.floor(selectedPlacedChar.cost * Math.pow(1.5, selectedPlacedTower.level))} className="w-full py-4 bg-red-700 hover:bg-red-600 disabled:bg-zinc-800 disabled:text-zinc-700 text-white font-bold rounded-lg transition-all shadow-lg uppercase tracking-widest text-xs">{selectedPlacedTower.level >= MAX_LEVEL ? 'MAX LEVEL' : `UPGRADE: ${Math.floor(selectedPlacedChar.cost * Math.pow(1.5, selectedPlacedTower.level)).toLocaleString()} FC`}</button>

                  <button onClick={() => sellPlacedTower(selectedPlacedTower.id)} className="w-full py-2 bg-zinc-900 border border-zinc-800 hover:border-red-600 text-zinc-500 hover:text-red-500 font-bold rounded-lg transition-all uppercase tracking-widest text-[10px]">
                    SELL FOR {Math.floor((selectedPlacedChar.cost + Array.from({ length: selectedPlacedTower.level - 1 }).reduce((acc: number, _, i) => acc + Math.floor(selectedPlacedChar.cost * Math.pow(1.5, i + 1)), 0)) * 0.6).toLocaleString()} FC
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full gap-4">
              <h3 className="text-[11px] font-mono-spaced uppercase text-zinc-500 border-b border-zinc-800 pb-2 mb-2">Facility Logs</h3>
              <div className="p-4 bg-zinc-950/80 border border-zinc-800 rounded-lg shadow-inner"><p className="text-[9px] text-zinc-500 uppercase font-bold mb-1">Incoming Transmission</p><p className="text-[11px] italic text-zinc-400 leading-relaxed">"{flavorText || "The cameras are flickering again. Keep an eye on the vents..."}"</p></div>
              <div className="mt-auto space-y-2">
                <div className="flex justify-between items-center text-[10px] font-bold text-zinc-600 uppercase"><span>System Clock:</span><span className="text-green-600">Active</span></div>
                <div className="flex justify-between items-center text-[10px] font-bold text-zinc-600 uppercase"><span>Current Speed:</span><span className="text-red-600">{gameState.gameSpeed}x</span></div>
              </div>
            </div>
          )}
        </aside>

        {/* Code Terminal Button (Bottom Left) */}
        <div className="absolute bottom-4 left-4 z-[60] flex items-end gap-2">
          {showTerminal ? (
            <div className="bg-black/90 border border-red-500 p-2 rounded shadow-[0_0_20px_rgba(220,38,38,0.3)] animate-in slide-in-from-bottom duration-300 backdrop-blur-md">
              <p className="text-[8px] text-red-500 font-bold uppercase mb-1 font-mono-spaced">Authorized Personnel Only</p>
              <div className="flex gap-2">
                <input
                  autoFocus
                  type="text"
                  placeholder="CODE"
                  value={cheatCode}
                  onChange={(e) => handleCheatCode(e.target.value)}
                  onBlur={() => !cheatCode && setShowTerminal(false)}
                  className="bg-zinc-900 border border-zinc-800 text-[10px] px-2 py-1 w-32 outline-none focus:border-red-500 font-mono-spaced text-white uppercase"
                />
                <button
                  onClick={() => setShowTerminal(false)}
                  className="text-[10px] bg-zinc-800 px-2 text-zinc-400 hover:text-white"
                >
                  X
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowTerminal(true)}
              className="bg-black/60 border border-zinc-800 hover:border-red-500 text-[9px] font-bold px-3 py-1.5 text-zinc-500 hover:text-red-500 transition-all rounded uppercase tracking-widest backdrop-blur-sm"
            >
              TERMINAL
            </button>
          )}
        </div>
      </main>

      <footer className="h-8 bg-black border-t border-zinc-900 flex items-center justify-between px-6 text-[9px] text-zinc-600 font-mono-spaced">
        <div className="flex items-center gap-4">
          <span>SECURITY CLEARANCE: LEVEL 5</span>
          {isSaving && <span className="text-green-600 animate-pulse font-bold">[DATA SYNCING...]</span>}
        </div>
        <div className="flex gap-6 uppercase">
          <span className="text-zinc-800">Connection: SECURE</span>
          <span className="animate-pulse text-zinc-700">Fazbear Entertainment © 1987</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
