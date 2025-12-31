
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

              {/* Ears/Hat Visuals */}
              {char.features.includes('ears') && (
                <>
                  <div className="absolute -top-1.5 left-0.5 w-2.5 h-2.5 rounded-full" style={{ backgroundColor: char.color, filter: 'brightness(0.7)' }}></div>
                  <div className="absolute -top-1.5 right-0.5 w-2.5 h-2.5 rounded-full" style={{ backgroundColor: char.color, filter: 'brightness(0.7)' }}></div>
                </>
              )}
              {char.features.includes('ears_long') && (
                <>
                  <div className="absolute -top-4 left-1 w-2 h-5 rounded-t-full" style={{ backgroundColor: char.color, filter: 'brightness(0.7)' }}></div>
                  <div className="absolute -top-4 right-1 w-2 h-5 rounded-t-full" style={{ backgroundColor: char.color, filter: 'brightness(0.7)' }}></div>
                </>
              )}
              {char.features.includes('hat') && <div className="absolute -top-2 w-5 h-3 bg-black rounded-sm border-b border-zinc-800 shadow-md"></div>}

              {/* Face Details */}
              <div className="absolute top-2 w-full flex justify-around px-2">
                <div className="w-1.5 h-1.5 bg-white rounded-full flex items-center justify-center">
                  <div className="w-0.5 h-0.5 bg-black rounded-full"></div>
                </div>
                <div className="w-1.5 h-1.5 bg-white rounded-full flex items-center justify-center">
                  <div className="w-0.5 h-0.5 bg-black rounded-full"></div>
                </div>
              </div>
              <div className="absolute top-5 w-4 h-1.5 bg-black/40 rounded-full"></div>
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
    </div>
  );
};

export default GameMap;
