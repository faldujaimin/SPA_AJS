import React, { useState, useEffect, useCallback } from 'react';
import Wheel from './components/Wheel';
import { Plus, Trash2, RotateCcw, Sparkles, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { sounds } from './utils/sounds';

const PRESET_IDEAS = {
  food: ["Pizza", "Burger", "Sushi", "Pasta", "Tacos", "Salad", "Steak", "Ramen"],
  activity: ["Watch a Movie", "Go for a Walk", "Read a Book", "Play Video Games", "Call a Friend", "Exercise", "Clean Room", "Mediate"],
  coding: ["Refactor Code", "Write Tests", "New Feature", "Fix Bugs", "Documentation", "Learn New Tech", "Break Time", "UI Polish"]
};

function App() {
  const [options, setOptions] = useState(() => {
    const saved = localStorage.getItem('decision-wheel-options');
    return saved ? JSON.parse(saved) : ["Pizza", "Burger", "Pasta"];
  });
  const [inputValue, setInputValue] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);
  const [winnerIndex, setWinnerIndex] = useState(null);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    localStorage.setItem('decision-wheel-options', JSON.stringify(options));
  }, [options]);

  const addOption = useCallback(() => {
    if (inputValue.trim()) {
      setOptions([...options, inputValue.trim()]);
      setInputValue('');
    }
  }, [inputValue, options]);

  const removeOption = (index) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleSpin = () => {
    if (options.length < 2 || isSpinning) return;
    
    const newWinnerIndex = Math.floor(Math.random() * options.length);
    setWinnerIndex(newWinnerIndex);
    setIsSpinning(true);
    setShowResult(false);
    
    // Play sound if possible (omitting for now or using beep)
  };

  const onSpinFinished = () => {
    setIsSpinning(false);
    setShowResult(true);
    sounds.playWin();
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#6366f1', '#ec4899', '#10b981']
    });
  };

  const suggestOptions = (type) => {
    setOptions(PRESET_IDEAS[type] || PRESET_IDEAS.food);
  };

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center max-w-6xl mx-auto">
      <motion.header 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-8"
      >
        <h1 className="text-5xl md:text-6xl font-black mb-2 bg-gradient-to-r from-indigo-400 via-pink-400 to-emerald-400 bg-clip-text text-transparent">
          Decision Wheel 🎡
        </h1>
        <p className="text-slate-400 text-lg">Can't decide? Let the universe choose!</p>
      </motion.header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 w-full items-start">
        
        {/* Left Side: Wheel */}
        <div className="flex flex-col items-center gap-8">
          <div className="relative w-full aspect-square max-w-[500px]">
            <Wheel 
              options={options} 
              spinning={isSpinning} 
              winningIndex={winnerIndex}
              onFinished={onSpinFinished}
            />
            
            <AnimatePresence>
              {showResult && (
                <motion.div 
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center p-4"
                >
                  <div className="glass p-8 rounded-3xl text-center border-2 border-primary shadow-[0_0_50px_rgba(99,102,241,0.3)]">
                    <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                    <h2 className="text-secondary text-xl font-bold uppercase tracking-widest mb-2">The Winner is:</h2>
                    <div className="text-4xl font-black text-white mb-6 uppercase">{options[winnerIndex]}</div>
                    <div className="flex flex-col gap-2">
                      <button 
                        onClick={() => setShowResult(false)}
                        className="bg-primary hover:bg-primary-hover px-6 py-3 rounded-xl text-white font-bold"
                      >
                        Keep & Close
                      </button>
                      <button 
                        onClick={() => {
                          removeOption(winnerIndex);
                          setShowResult(false);
                        }}
                        className="bg-slate-700 hover:bg-slate-600 px-6 py-3 rounded-xl text-slate-200 font-bold border border-slate-600"
                      >
                        Remove & Close
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={handleSpin}
            disabled={isSpinning || options.length < 2}
            className={`
              w-full max-w-sm py-5 rounded-2xl text-2xl font-black uppercase tracking-tighter
              flex items-center justify-center gap-3 transition-all
              ${isSpinning || options.length < 2 
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_30px_rgba(79,70,229,0.5)] hover:scale-105'}
            `}
          >
            {isSpinning ? <RotateCcw className="animate-spin" /> : 'SPIN THE WHEEL'}
          </button>
        </div>

        {/* Right Side: Logic & Options */}
        <div className="glass p-6 md:p-8 rounded-3xl flex flex-col gap-6 h-full max-h-[700px]">
          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Sparkles className="text-indigo-400" /> AI Suggestions
            </h3>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => suggestOptions('food')} className="px-4 py-2 glass text-sm hover:border-indigo-400">🍕 Food</button>
              <button onClick={() => suggestOptions('activity')} className="px-4 py-2 glass text-sm hover:border-pink-400">🎮 Activities</button>
              <button onClick={() => suggestOptions('coding')} className="px-4 py-2 glass text-sm hover:border-emerald-400">💻 Coding</button>
            </div>
          </div>

          <div className="flex gap-2">
            <input 
              type="text" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addOption()}
              placeholder="Enter an option..."
              className="flex-1"
            />
            <button 
              onClick={addOption}
              className="p-4 bg-indigo-600 hover:bg-indigo-500 text-white"
            >
              <Plus />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <h3 className="text-lg font-semibold text-slate-400 mb-4 sticky top-0 bg-[#0f172a]/80 backdrop-blur-sm py-2">
              Current Options ({options.length})
            </h3>
            <div className="flex flex-col gap-2">
              <AnimatePresence>
                {options.map((option, idx) => (
                  <motion.div 
                    key={`${option}-${idx}`}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 20, opacity: 0 }}
                    className="flex items-center justify-between p-4 glass rounded-xl group border-l-4"
                    style={{ borderLeftColor: ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#f97316'][idx % 8] }}
                  >
                    <span className="font-medium text-slate-200">{option}</span>
                    <button 
                      onClick={() => removeOption(idx)}
                      className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={18} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
              {options.length === 0 && (
                <div className="text-center py-12 text-slate-500 italic">
                  No options yet. Add some or use suggestions!
                </div>
              )}
            </div>
          </div>
          
          <button 
            onClick={() => setOptions([])}
            className="text-slate-500 hover:text-slate-300 text-sm flex items-center justify-center gap-2 mt-4"
          >
            Clear All
          </button>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}

export default App;
