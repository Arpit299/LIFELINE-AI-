import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useUIStore } from '../../store/uiStore';
import { useTaskStore } from '../../store/taskStore';
import { Trophy, Flame, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export const CelebrationOverlay: React.FC = () => {
  const { showCelebration, setShowCelebration } = useUIStore();
  const { stats } = useTaskStore();

  useEffect(() => {
    if (showCelebration) {
      // 1. Fire an initial majestic burst
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B'],
      });

      // 2. Schedule auxiliary side bursts
      const duration = 3 * 1000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#8B5CF6', '#3B82F6', '#10B981'],
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#8B5CF6', '#3B82F6', '#10B981'],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };

      const timerId = setTimeout(() => {
        frame();
      }, 300);

      return () => clearTimeout(timerId);
    }
  }, [showCelebration]);

  if (!showCelebration) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop filter overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowCelebration(false)}
          className="absolute inset-0 bg-black/85 backdrop-blur-md cursor-pointer"
          id="celebration-backdrop"
        />

        {/* Celebratory Dialog Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 180 }}
          className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-zinc-900 via-zinc-950 to-black p-8 text-center shadow-2xl shadow-purple-500/10"
          id="celebration-modal"
        >
          {/* Ambient background light flare */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-purple-500/10 rounded-full filter blur-3xl pointer-events-none" />

          {/* Trophy & Sparkles Section */}
          <div className="relative mx-auto w-24 h-24 flex items-center justify-center mb-6">
            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 10, 0], scale: [1, 1.1, 1, 1.1, 1] }}
              transition={{ repeat: Infinity, repeatDelay: 3, duration: 1.5 }}
              className="p-5 rounded-2xl bg-gradient-to-tr from-purple-500/20 to-pink-500/20 text-yellow-400 border border-yellow-500/20 shadow-inner"
            >
              <Trophy className="w-12 h-12 filter drop-shadow-[0_0_10px_rgba(234,179,8,0.3)]" />
            </motion.div>
            <Sparkles className="absolute -top-1 -right-1 w-6 h-6 text-purple-400 animate-pulse" />
            <Sparkles className="absolute -bottom-1 -left-1 w-5 h-5 text-cyan-400 animate-ping" />
          </div>

          {/* Typography */}
          <h2 className="text-2xl font-black tracking-tight text-white mb-2 leading-tight">
            MASTER BACKLOG CLEARED!
          </h2>
          <p className="text-2xs uppercase tracking-widest font-bold font-mono text-purple-400 mb-4">
            Aesthetic Peak Performance Achieved
          </p>
          <p className="text-sm text-white/60 leading-relaxed mb-6">
            Exceptional job today. You have resolved every urgent priority task, leaving your active queue clean and optimized. Take a moment to rest and celebrate your focus.
          </p>

          {/* Performance stats summary */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            <div className="flex flex-col items-center justify-center p-3.5 rounded-2xl border border-white/5 bg-white/[0.01]">
              <Flame className="w-5 h-5 text-orange-400 mb-1 animate-bounce" />
              <span className="text-2xs text-white/40">Current Streak</span>
              <span className="text-lg font-black text-white font-mono mt-0.5">{stats.streak} days</span>
            </div>
            <div className="flex flex-col items-center justify-center p-3.5 rounded-2xl border border-white/5 bg-white/[0.01]">
              <CheckCircle className="w-5 h-5 text-emerald-400 mb-1" />
              <span className="text-2xs text-white/40">Total Operations</span>
              <span className="text-lg font-black text-white font-mono mt-0.5">{stats.totalCompleted} cleared</span>
            </div>
          </div>

          {/* Close/Continue Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowCelebration(false)}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold text-xs font-mono tracking-wider uppercase transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 cursor-pointer"
            id="dismiss-celebration-btn"
          >
            Acknowledge and Keep Vibing
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CelebrationOverlay;
