import React from 'react';
import { AiHint } from '../types';
import { SparklesIcon, XMarkIcon } from '@heroicons/react/24/solid';

interface AiAssistantProps {
  hint: AiHint | null;
  onClose: () => void;
}

const AiAssistant: React.FC<AiAssistantProps> = ({ hint, onClose }) => {
  if (!hint) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-[90%] max-w-md z-50 animate-fade-in-up">
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-2xl shadow-2xl border border-indigo-500/30 overflow-hidden">
        <div className="flex items-start justify-between p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-indigo-500 rounded-lg">
                <SparklesIcon className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 to-white">
              AI Assistant
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        
        <div className="px-4 pb-5">
            <p className="text-slate-200 text-sm leading-relaxed">
                {hint.text}
            </p>
            {hint.value && (
                <div className="mt-3 flex items-center gap-2 text-xs font-mono text-indigo-300 bg-indigo-950/50 p-2 rounded border border-indigo-500/20">
                    <span>Target: Row {hint.coords ? hint.coords.row + 1 : '?'}, Col {hint.coords ? hint.coords.col + 1 : '?'}</span>
                    <span className="text-slate-500">|</span>
                    <span>Suggest: <span className="text-white font-bold">{hint.value}</span></span>
                </div>
            )}
        </div>
        
        {/* Decorative progress bar line */}
        <div className="h-1 w-full bg-indigo-900/50">
            <div className="h-full bg-indigo-500 w-full animate-progress-shrink origin-left"></div>
        </div>
      </div>
    </div>
  );
};

export default AiAssistant;