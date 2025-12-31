
import React from 'react';
import { Position, PlacedTower, Enemy, Projectile } from '../types';
import { PATH, GRID_SIZE, CHARACTERS } from '../constants';

interface GameMapProps {
  towers: PlacedTower[];
  enemies: Enemy[];
  projectiles: Projectile[];
  onPlaceTower: (x: number, y: number) => void;
  onSelectPlacedTower: (towerId: string | null) => void;
  selectedTowerId: string | null;
  selectedPlacedTowerId: string | null;
  tickCount: number;
}

const GameMap: React.FC<GameMapProps> = ({
  towers,
  enemies,
  projectiles,
  onPlaceTower,
  onSelectPlacedTower,
  selectedTowerId,
  selectedPlacedTowerId,
  tickCount
}) => {
  const cellSize = 50;

  const isPath = (x: number, y: number) => {
    for (let i = 0; i < PATH.length - 1; i++) {
      const p1 = PATH[i];
      const p2 = PATH[i + 1];
      if (
        (p1.x === p2.x && x === p1.x && y >= Math.min(p1.y, p2.y) && y <= Math.max(p1.y, p2.y)) ||
        (p1.y === p2.y && y === p1.y && x >= Math.min(p1.x, p2.x) && x <= Math.max(p1.x, p2.x))
      ) {
        return true;
      }
    }
    return false;
  };

  const getEnemyPosition = (enemy: Enemy): { x: number, y: number } => {
    const p1 = PATH[enemy.positionIndex];
    const p2 = PATH[enemy.positionIndex + 1] || p1;
    return {
      x: p1.x + (p2.x - p1.x) * enemy.lerpFactor,
      y: p1.y + (p2.y - p1.y) * enemy.lerpFactor
    };
  };

  return (
    <div
      className="relative bg-zinc-950 border-8 border-zinc-900 rounded-lg shadow-[0_0_100px_rgba(0,0,0,1)] cursor-crosshair overflow-hidden"
      style={{ width: GRID_SIZE * cellSize, height: GRID_SIZE * cellSize }}
    >
      {/* Background patterns - Checkerboard floor for FNAF feel */}
      <div className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(45deg, #222 25%, transparent 25%), linear-gradient(-45deg, #222 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #222 75%), linear-gradient(-45deg, transparent 75%, #222 75%)`,
          backgroundSize: `${cellSize}px ${cellSize}px`,
          backgroundPosition: `0 0, 0 ${cellSize / 2}px, ${cellSize / 2}px -${cellSize / 2}px, -${cellSize / 2}px 0px`
        }}
      ></div>

      {/* Tiles */}
      {Array.from({ length: GRID_SIZE }).map((_, y) =>
        Array.from({ length: GRID_SIZE }).map((_, x) => (
          <div
            key={`${x}-${y}`}
            onClick={(e) => {
              e.stopPropagation();
              if (!isPath(x, y)) {
                onPlaceTower(x, y);
                onSelectPlacedTower(null);
              }
            }}
            className={`absolute border border-black/20 transition-all ${!isPath(x, y) ? (selectedTowerId ? 'hover:bg-red-900/20 hover:border-red-500/50 cursor-pointer' : 'hover:bg-white/5') : 'bg-zinc-900/60'}`}
            style={{ left: x * cellSize, top: y * cellSize, width: cellSize, height: cellSize }}
          ></div>
        ))
      )}

      {/* Path - Tiled checkered line */}
      {PATH.map((p, i) => (
        i < PATH.length - 1 && (
          <div
            key={`line-${i}`}
            className="absolute bg-zinc-800/40 border-y border-zinc-700/50"
            style={{
              left: Math.min(p.x, PATH[i + 1].x) * cellSize,
              top: Math.min(p.y, PATH[i + 1].y) * cellSize,
              width: Math.abs(p.x - PATH[i + 1].x) * cellSize + cellSize,
              height: Math.abs(p.y - PATH[i + 1].y) * cellSize + cellSize,
              zIndex: 1
            }}
          ></div>
        )
      ))}

      {/* Projectiles */}
      <svg className="absolute inset-0 pointer-events-none z-50" width={GRID_SIZE * cellSize} height={GRID_SIZE * cellSize}>
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {projectiles.map(p => {
          const progress = (tickCount - p.startTime) / p.duration;
          if (progress > 1) return null;
          const startX = p.start.x * cellSize + cellSize / 2;
          const startY = p.start.y * cellSize + cellSize / 2;
          const curX = startX + (p.end.x - p.start.x) * cellSize * progress;
          const curY = startY + (p.end.y - p.start.y) * cellSize * progress;

          // Muzzle flash at tower
          const flashOpacity = Math.max(0, 1 - progress * 4);
          const flashSize = 10 + progress * 20;

          return (
            <g key={p.id}>
              {/* Muzzle Flash */}
              {flashOpacity > 0 && (
                <circle
                  cx={startX}
                  cy={startY}
                  r={flashSize}
                  fill="none"
                  stroke={p.color}
                  strokeWidth="2"
                  strokeOpacity={flashOpacity}
                  filter="url(#glow)"
                />
              )}

              {/* Trait/Tail */}
              <line
                x1={startX + (p.end.x - p.start.x) * cellSize * Math.max(0, progress - 0.1)}
                y1={startY + (p.end.y - p.start.y) * cellSize * Math.max(0, progress - 0.1)}
                x2={curX}
                y2={curY}
                stroke={p.color}
                strokeWidth="2"
                strokeOpacity="0.4"
              />

              {/* Projectile Core */}
              <circle cx={curX} cy={curY} r="4" fill={p.color} filter="url(#glow)" />
            </g>
          );
        })}
      </svg>

      {/* Towers */}
      {towers.map(tower => {
        const char = CHARACTERS[tower.characterId];
        const isSelected = selectedPlacedTowerId === tower.id;
        return (
          <div
            key={tower.id}
            onClick={(e) => {
              e.stopPropagation();
              onSelectPlacedTower(tower.id);
            }}
            className={`absolute z-40 flex items-center justify-center group cursor-pointer`}
            style={{ left: tower.pos.x * cellSize, top: tower.pos.y * cellSize, width: cellSize, height: cellSize }}
          >
            <div
              className={`w-10 h-10 rounded shadow-2xl border-2 transition-transform group-hover:scale-110 relative flex items-center justify-center ${char.features.includes('ghostly') ? 'animate-pulse opacity-60' : ''} ${isSelected ? 'border-red-500 ring-4 ring-red-500/20' : 'border-zinc-800 bg-zinc-900'}`}
              style={{ backgroundColor: char.color }}
            >
              <div className="absolute -bottom-2 -right-2 bg-red-900 border border-red-500 text-[8px] px-1 font-bold text-white z-50 rounded shadow-lg">
                L{tower.level}
              </div>

              {/* === BASE VISUALS === */}

              {/* Withered/Glitchy Effects (Background) */}
              {char.features.includes('withered') && (
                <div className="absolute inset-0 bg-black/30 w-full h-full" style={{ clipPath: 'polygon(10% 0, 30% 20%, 50% 0, 70% 30%, 90% 0, 100% 40%, 80% 60%, 100% 80%, 70% 100%, 50% 80%, 30% 100%, 10% 70%, 0 100%, 0 0)' }}></div>
              )}
              {char.features.includes('glitchy') && (
                <div className="absolute inset-0 bg-purple-500/20 animate-pulse" style={{ mixBlendMode: 'difference' }}></div>
              )}
              {char.features.includes('fire') && (
                <div className="absolute -inset-2 bg-orange-500/30 blur-sm rounded-full animate-pulse"></div>
              )}

              {/* === HEAD FEATURES === */}

              {/* Ears: Round (Bears/Bunnies - Default) */}
              {char.features.includes('ears') && (
                <>
                  <div className="absolute -top-1.5 left-0.5 w-2.5 h-2.5 rounded-full" style={{ backgroundColor: char.color, filter: 'brightness(0.9)' }}></div>
                  <div className="absolute -top-1.5 right-0.5 w-2.5 h-2.5 rounded-full" style={{ backgroundColor: char.color, filter: 'brightness(0.9)' }}></div>
                </>
              )}
              {/* Ears: Long (Bunnies) */}
              {char.features.includes('ears_long') && (
                <>
                  <div className="absolute -top-4 left-1 w-2 h-5 rounded-t-full" style={{ backgroundColor: char.color, filter: 'brightness(0.9)' }}></div>
                  <div className="absolute -top-4 right-1 w-2 h-5 rounded-t-full" style={{ backgroundColor: char.color, filter: 'brightness(0.9)' }}></div>
                </>
              )}
              {/* Ears: Pointed (Foxes/Dogs) */}
              {char.features.includes('ears_pointed') && (
                <>
                  <div className="absolute -top-2 left-0 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[8px]" style={{ borderBottomColor: char.color, transform: 'rotate(-20deg)' }}></div>
                  <div className="absolute -top-2 right-0 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[8px]" style={{ borderBottomColor: char.color, transform: 'rotate(20deg)' }}></div>
                </>
              )}
              {/* Hair/Pigtails */}
              {char.features.includes('pigtails') && (
                <>
                  <div className="absolute -top-1 -left-2 w-3 h-4 bg-orange-600 rounded-full"></div>
                  <div className="absolute -top-1 -right-2 w-3 h-4 bg-orange-600 rounded-full"></div>
                </>
              )}
              {char.features.includes('hair') && (
                <div className="absolute -top-1 inset-x-0 h-2 bg-gray-300 rounded-t-lg mx-auto w-8"></div>
              )}


              {/* Hat */}
              {char.features.includes('hat') && <div className="absolute -top-2 w-5 h-4 bg-black rounded-sm border-b-2 border-zinc-700 shadow-md transform -translate-y-1"></div>}
              {char.features.includes('propeller') && (
                <div className="absolute -top-3 w-6 h-1 bg-red-500 animate-spin origin-center rounded-full z-20">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full"></div>
                </div>
              )}

              {/* === FACE === */}
              {char.features.includes('mask') ? (
                <div className="absolute inset-1 bg-white rounded-full border border-gray-300 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-black rounded-full mr-2"></div>
                  <div className="w-1.5 h-1.5 bg-black rounded-full ml-2"></div>
                  {char.name.includes('Puppet') || char.name.includes('Marionne') ? (
                    <>
                      <div className="absolute top-4 w-2 h-3 bg-purple-500/50 rounded-full blur-[1px]"></div>
                      <div className="absolute bottom-1 w-3 h-1 bg-black rounded-full"></div>
                    </>
                  ) : null}
                </div>
              ) : (
                <div className="absolute top-2 w-full flex justify-around px-2 z-10">
                  <div className="w-1.5 h-1.5 bg-white rounded-full flex items-center justify-center shadow-inner">
                    <div className={`w-0.5 h-0.5 bg-black rounded-full ${char.features.includes('eyepatch') ? 'hidden' : ''}`}></div>
                    {char.features.includes('eyepatch') && <div className="absolute inset-0 bg-black rounded-full opacity-90 border border-zinc-800"></div>}
                  </div>
                  <div className="w-1.5 h-1.5 bg-white rounded-full flex items-center justify-center shadow-inner">
                    {char.features.includes('glowing_eye') ? (
                      <div className="w-0.5 h-0.5 bg-red-500 shadow-[0_0_4px_red] rounded-full"></div>
                    ) : (
                      <div className="w-0.5 h-0.5 bg-black rounded-full"></div>
                    )}
                  </div>
                </div>
              )}

              {/* Cheeks */}
              {char.features.includes('cheeks') && (
                <>
                  <div className="absolute top-4 left-0.5 w-1.5 h-1.5 bg-red-500/60 rounded-full blur-[0.5px]"></div>
                  <div className="absolute top-4 right-0.5 w-1.5 h-1.5 bg-red-500/60 rounded-full blur-[0.5px]"></div>
                </>
              )}

              {/* Snout/Beak */}
              {char.features.includes('beak') ? (
                <div className="absolute top-4 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-t-orange-500 z-10"></div>
              ) : (
                !char.features.includes('mask') && <div className="absolute top-4 w-4 h-2 bg-black/20 rounded-full z-10"></div>
              )}

              {/* Teeth */}
              {char.features.includes('teeth') && (
                <div className="absolute top-5 flex justify-center space-x-[1px] w-full px-3">
                  <div className="w-0.5 h-1 bg-white rounded-b-sm"></div>
                  <div className="w-0.5 h-1 bg-white rounded-b-sm"></div>
                  <div className="w-0.5 h-1 bg-white rounded-b-sm"></div>
                  <div className="w-0.5 h-1 bg-white rounded-b-sm"></div>
                </div>
              )}

              {/* === BODY & EXTRAS === */}

              {/* Bowtie */}
              {char.features.includes('bowtie') && (
                <div className="absolute top-7 w-3 h-1.5 flex justify-center items-center z-20">
                  <div className="w-0 h-0 border-l-[3px] border-l-transparent border-t-[3px] border-t-black border-b-[3px] border-b-black transform rotate-90"></div>
                  <div className="w-0.5 h-0.5 bg-black rounded-full"></div>
                  <div className="w-0 h-0 border-l-[3px] border-l-transparent border-t-[3px] border-t-black border-b-[3px] border-b-black transform -rotate-90"></div>
                </div>
              )}
              {/* Bib */}
              {char.features.includes('bib') && (
                <div className="absolute top-6 w-5 h-3 bg-white rounded-b-full text-[4px] text-center leading-[4px] flex items-center justify-center border border-gray-200">
                  LET'S<br />EAT
                </div>
              )}
              {/* Vest/Suit details */}
              {char.features.includes('vest') && (
                <div className="absolute top-6 w-4 h-4 bg-purple-700 rounded-sm"></div>
              )}

              {/* Held Items (Hook, Sign, Mic) */}
              {char.features.includes('hook') && (
                <div className="absolute top-4 -right-1 w-2 h-3 border-2 border-gray-400 rounded-b-lg border-t-0 transform scale-75"></div>
              )}
              {char.features.includes('sign') && (
                <div className="absolute bottom-0 -left-1 w-3 h-2 bg-white border border-gray-800 transform -rotate-12 z-30">
                  <div className="w-full h-full text-[3px] flex items-center justify-center">HI</div>
                </div>
              )}

              {/* Special Boss/Mythic Features */}
              {char.features.includes('many_heads') && (
                <>
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full border border-black"></div>
                  <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-white rounded-full border border-black"></div>
                  <div className="absolute top-1/2 -right-2 w-2 h-2 bg-white rounded-full border border-black"></div>
                </>
              )}
              {char.features.includes('wires') && (
                <>
                  <div className="absolute -left-1 top-2 w-2 h-[1px] bg-gray-600 rotate-12"></div>
                  <div className="absolute -right-1 bottom-3 w-2 h-[1px] bg-gray-600 -rotate-12"></div>
                  <div className="absolute left-2 -bottom-1 w-[1px] h-2 bg-gray-600"></div>
                </>
              )}
            </div>

            {/* Range Circle */}
            <div
              className={`absolute rounded-full border-2 border-dashed border-red-500/30 bg-red-500/5 pointer-events-none transition-all duration-300 z-0 ${isSelected ? 'scale-100 opacity-100' : 'scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100'}`}
              style={{
                width: char.range * 2 * cellSize,
                height: char.range * 2 * cellSize,
                left: '50%',
                top: '50%',
                marginLeft: -char.range * cellSize,
                marginTop: -char.range * cellSize
              }}
            ></div>
          </div>
        );
      })}

      {/* Enemies */}
      {enemies.map(enemy => {
        const pos = getEnemyPosition(enemy);
        const isSlowed = enemy.slowTimer > 0;
        const isBoss = enemy.type === 'Boss';

        return (
          <div
            key={enemy.id}
            className={`absolute z-50 flex flex-col items-center justify-center transition-all ${isSlowed ? 'brightness-50' : ''}`}
            style={{
              left: pos.x * cellSize,
              top: pos.y * cellSize,
              width: cellSize,
              height: cellSize,
              transform: isBoss ? 'scale(1.8)' : 'none'
            }}
          >
            <div className="w-8 h-1 bg-zinc-900 rounded-full mb-1 border border-white/20 overflow-hidden">
              <div className="h-full bg-red-600" style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }}></div>
            </div>

            <div className="relative w-6 h-8 flex items-center justify-center">
              <div className={`w-5 h-6 rounded-sm border border-black/40 shadow-md ${enemy.type === 'Nightmare' ? 'bg-zinc-900' : enemy.type === 'Zombie' ? 'bg-green-800' : 'bg-[#d2b48c]'}`}>
                {/* Glowing Eyes */}
                <div className="absolute top-1 left-1.5 w-1 h-1 bg-red-500 rounded-full shadow-[0_0_5px_red] animate-pulse"></div>
                <div className="absolute top-1 right-1.5 w-1 h-1 bg-red-500 rounded-full shadow-[0_0_5px_red] animate-pulse"></div>
              </div>

              {isSlowed && (
                <div className="absolute inset-0 bg-blue-500/30 rounded-full animate-ping pointer-events-none"></div>
              )}
            </div>
          </div>
        );
      })}

      {/* Start/End labels */}
      <div className="absolute top-0 left-0 p-1 bg-green-900/40 text-green-500 text-[8px] font-bold uppercase z-10">Entry Point</div>
      <div className="absolute bottom-0 right-0 p-1 bg-red-900/40 text-red-500 text-[8px] font-bold uppercase z-10">Office Vent</div>
    </div >
  );
};

export default GameMap;
