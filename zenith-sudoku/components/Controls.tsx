import React from 'react';
import { Difficulty } from '../types';
import { 
  ArrowPathIcon, 
  BackspaceIcon,
  ArrowUturnLeftIcon
} from '@heroicons/react/24/outline';

interface ControlsProps {
  difficulty: Difficulty;
  setDifficulty: (d: Difficulty) => void;
  onNewGame: () => void;
  onNumberClick: (num: number) => void;
  onDelete: () => void;
  onUndo: () => void;
  mistakes: number;
  timeElapsed: number;
}

const Controls: React.FC<ControlsProps> = ({
  difficulty,
  setDifficulty,
  onNewGame,
  onNumberClick,
  onDelete,
  onUndo,
  mistakes,
  timeElapsed
}) => {
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-md mx-auto">
      
      {/* Top Bar: Stats & Difficulty */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Difficulty</span>
          <select 
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as Difficulty)}
            className="text-slate-700 font-bold bg-transparent border-none focus:ring-0 p-0 cursor-pointer hover:text-indigo-600 transition-colors"
          >
            {Object.values(Difficulty).map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col items-center">
             <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Mistakes</span>
             <span className={`font-mono font-bold ${mistakes > 2 ? 'text-red-500' : 'text-slate-700'}`}>
                {mistakes}/3
             </span>
        </div>

        <div className="flex flex-col items-end">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Time</span>
          <span className="font-mono font-bold text-slate-700">{formatTime(timeElapsed)}</span>
        </div>
      </div>

      {/* Number Pad */}
      <div className="grid grid-cols-5 gap-2 sm:gap-3">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            onClick={() => onNumberClick(num)}
            className="aspect-square flex items-center justify-center text-xl sm:text-2xl font-semibold bg-white text-indigo-600 rounded-lg shadow-sm border border-slate-200 hover:bg-indigo-50 hover:border-indigo-200 active:bg-indigo-100 active:scale-95 transition-all"
          >
            {num}
          </button>
        ))}
        <button
            onClick={onDelete}
            className="aspect-square flex items-center justify-center text-red-500 bg-white rounded-lg shadow-sm border border-slate-200 hover:bg-red-50 hover:border-red-200 active:scale-95 transition-all"
            aria-label="Delete"
        >
             <BackspaceIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onUndo}
          className="flex flex-row items-center justify-center gap-2 p-3 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800 transition-colors"
        >
          <ArrowUturnLeftIcon className="w-5 h-5" />
          <span className="font-semibold">Undo</span>
        </button>

         <button
          onClick={onNewGame}
          className="flex flex-row items-center justify-center gap-2 p-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all active:scale-95"
        >
          <ArrowPathIcon className="w-5 h-5" />
          <span className="font-semibold">New Game</span>
        </button>
      </div>
    </div>
  );
};

export default Controls;