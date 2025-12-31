import React from 'react';
import { CHARACTERS, RARITY_ORDER, RARITY_COLORS } from '../constants';
import { Rarity } from '../types';

interface TowerIndexProps {
    unlockedIds: string[];
    onClose: () => void;
}

const TowerIndex: React.FC<TowerIndexProps> = ({ unlockedIds, onClose }) => {
    const totalTowers = Object.keys(CHARACTERS).length;
    const unlockedCount = unlockedIds.length;
    const percentage = Math.floor((unlockedCount / totalTowers) * 100);

    // Group characters by rarity
    const groupedChars = RARITY_ORDER.reduce((acc, rarity) => {
        acc[rarity] = Object.values(CHARACTERS).filter(c => c.rarity === rarity);
        return acc;
    }, {} as Record<Rarity, typeof CHARACTERS[string][]>);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md" onClick={onClose}>
            <div
                className="w-full max-w-5xl h-[85vh] bg-zinc-950 border-2 border-zinc-800 rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
                    <div>
                        <h2 className="text-3xl font-creepy text-red-600 tracking-[0.2em] uppercase drop-shadow-[0_0_5px_rgba(220,38,38,0.5)]">Animatronic Index</h2>
                        <p className="text-zinc-500 text-xs font-mono-spaced uppercase mt-1">Fazbear Entertainment Archive</p>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                        <div className="text-xl font-bold font-mono-spaced text-zinc-300">
                            {unlockedCount} / {totalTowers} <span className="text-sm text-zinc-500">Collected</span>
                        </div>
                        <div className="w-48 h-2 bg-zinc-900 rounded-full border border-zinc-700 overflow-hidden">
                            <div className="h-full bg-green-600 transition-all duration-500" style={{ width: `${percentage}%` }}></div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    {RARITY_ORDER.map(rarity => {
                        const chars = groupedChars[rarity];
                        if (chars.length === 0) return null;

                        return (
                            <div key={rarity} className="mb-10">
                                <h3 className="text-sm font-bold uppercase tracking-widest mb-4 border-b border-zinc-800 pb-2 flex items-center gap-2" style={{ color: RARITY_COLORS[rarity] }}>
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: RARITY_COLORS[rarity] }}></div>
                                    {rarity} Class
                                </h3>

                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                    {chars.map(char => {
                                        const isUnlocked = unlockedIds.includes(char.id);

                                        return (
                                            <div
                                                key={char.id}
                                                className={`relative group border rounded-lg p-3 transition-all duration-300 flex flex-col gap-2
                          ${isUnlocked
                                                        ? 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-500 hover:bg-zinc-800/60'
                                                        : 'bg-black border-zinc-900 opacity-60 grayscale'
                                                    }`}
                                            >
                                                {/* Character Visual / Silhouette */}
                                                <div className="w-full aspect-square bg-zinc-950/50 rounded flex items-center justify-center relative overflow-hidden border border-zinc-900/50">
                                                    {isUnlocked ? (
                                                        <div className="w-12 h-12 relative">
                                                            {/* Simplified rendering for Index - just the color block + prominent features */}
                                                            {/* We can reuse the detailed renderer if we extract it, but for now a simplified version or just the color + icon is cleaner for a list */}
                                                            <div
                                                                className="w-full h-full rounded shadow-lg flex items-center justify-center border-2 border-black/20"
                                                                style={{ backgroundColor: char.color }}
                                                            >
                                                                {/* Minimal feature hints */}
                                                                {char.features.includes('hat') && <div className="absolute -top-1 w-6 h-4 bg-black rounded-sm border-b border-zinc-700"></div>}
                                                                {char.features.includes('ears') && (
                                                                    <>
                                                                        <div className="absolute -top-2 -left-1 w-3 h-3 rounded-full" style={{ backgroundColor: char.color, filter: 'brightness(0.8)' }}></div>
                                                                        <div className="absolute -top-2 -right-1 w-3 h-3 rounded-full" style={{ backgroundColor: char.color, filter: 'brightness(0.8)' }}></div>
                                                                    </>
                                                                )}
                                                                {char.features.includes('ears_long') && (
                                                                    <>
                                                                        <div className="absolute -top-4 left-1 w-2 h-6 rounded-t-full" style={{ backgroundColor: char.color, filter: 'brightness(0.8)' }}></div>
                                                                        <div className="absolute -top-4 right-1 w-2 h-6 rounded-t-full" style={{ backgroundColor: char.color, filter: 'brightness(0.8)' }}></div>
                                                                    </>
                                                                )}
                                                                <div className="flex gap-1.5">
                                                                    <div className="w-1.5 h-1.5 bg-white rounded-full flex items-center justify-center"><div className="w-0.5 h-0.5 bg-black rounded-full"></div></div>
                                                                    <div className="w-1.5 h-1.5 bg-white rounded-full flex items-center justify-center"><div className="w-0.5 h-0.5 bg-black rounded-full"></div></div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="text-4xl text-zinc-800 font-creepy">?</div>
                                                    )}
                                                </div>

                                                {/* Info */}
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex justify-between items-start">
                                                        <h4 className={`text-[10px] font-bold uppercase leading-tight ${isUnlocked ? 'text-zinc-200' : 'text-zinc-700'}`}>
                                                            {isUnlocked ? char.name : '???'}
                                                        </h4>
                                                    </div>

                                                    {isUnlocked && (
                                                        <div className="flex flex-col gap-0.5 mt-1 border-t border-zinc-800/50 pt-1">
                                                            <div className="flex justify-between text-[8px] text-zinc-500 uppercase font-bold">
                                                                <span>DMG</span> <span className="text-zinc-300">{char.damage}</span>
                                                            </div>
                                                            <div className="flex justify-between text-[8px] text-zinc-500 uppercase font-bold">
                                                                <span>RNG</span> <span className="text-zinc-300">{char.range}</span>
                                                            </div>
                                                            <div className="flex justify-between text-[8px] text-zinc-500 uppercase font-bold">
                                                                <span>SPD</span> <span className="text-zinc-300">{char.fireRate}</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {/* Origin Tag */}
                                                    {isUnlocked && (
                                                        <div className="mt-1">
                                                            <span className="text-[7px] px-1.5 py-0.5 bg-zinc-800 text-zinc-500 rounded border border-zinc-700 uppercase">{char.gameOrigin}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-zinc-800 flex justify-end bg-zinc-900/50">
                    <button
                        onClick={onClose}
                        className="px-8 py-3 bg-red-900 border border-red-500 hover:bg-red-800 text-white font-bold uppercase tracking-widest transition-all rounded"
                    >
                        Close Archive
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TowerIndex;
