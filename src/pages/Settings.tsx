import React from 'react';
import { useTaskStore } from '../store/taskStore';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { 
  Sparkles, 
  Trash2, 
  Info, 
  HelpCircle,
  Database,
  Lock,
  Flame,
  CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';

export const Settings: React.FC = () => {
  const { demoMode, setDemoMode, resetStore, loadLocalTasks } = useTaskStore();

  const handleToggleDemoMode = () => {
    const nextMode = !demoMode;
    setDemoMode(nextMode);
    localStorage.setItem('lifeline_demo_mode', String(nextMode));
    toast.success(`Demo Mode successfully toggled to ${nextMode ? 'ON' : 'OFF'}`);
  };

  const handleResetData = () => {
    if (window.confirm('Are you absolutely sure you want to flush all custom tasks and stats? This action is irreversible.')) {
      localStorage.removeItem('lifeline_tasks');
      localStorage.removeItem('lifeline_stats');
      resetStore();
      loadLocalTasks();
      toast.success('Local database flushed and re-seeded to default demo status.');
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-16 lg:pb-6">
      <div className="border-b border-white/5 pb-4">
        <h2 className="text-base font-bold text-white/95">Operational Settings</h2>
        <p className="text-xs text-white/40 mt-0.5">Configure operational thresholds, reset datastores, and inspect algorithms.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Core Settings Panel */}
        <div className="md:col-span-6 flex flex-col gap-6">
          <Card className="p-5 flex flex-col gap-5">
            <div className="flex items-center gap-2 pb-2 border-b border-white/5">
              <Database className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-semibold text-white/95 font-sans">System Diagnostics & Presets</h3>
            </div>

            {/* Toggle demo mode */}
            <div className="flex items-center justify-between py-2">
              <div className="flex flex-col gap-0.5 max-w-xs">
                <span className="text-xs font-semibold text-white/90">Mock Demo Preset Mode</span>
                <span className="text-2xs text-white/40 leading-relaxed">Runs Gemini chains locally using premium high-fidelity outputs. Bypasses actual Google AI key charges.</span>
              </div>

              <button
                onClick={handleToggleDemoMode}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  demoMode ? 'bg-purple-600' : 'bg-white/10'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    demoMode ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Flush database */}
            <div className="flex items-center justify-between py-2 border-t border-white/5 pt-4">
              <div className="flex flex-col gap-0.5 max-w-xs">
                <span className="text-xs font-semibold text-white/90">Wipe Local Datastore</span>
                <span className="text-2xs text-white/40 leading-relaxed">Deletes all current tasks, resets active streaks, and restores initial guest mode variables.</span>
              </div>

              <Button variant="danger" size="sm" onClick={handleResetData} className="px-3.5 py-2 text-2xs font-semibold gap-1.5">
                <Trash2 className="w-3.5 h-3.5" />
                Flush Storage
              </Button>
            </div>
          </Card>

          {/* Credentials Info card */}
          <Card className="p-5 flex flex-col gap-4 border-l-2 border-cyan-500">
            <div className="flex items-center gap-2 text-cyan-400">
              <Lock className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider font-mono">Secret API Management</span>
            </div>
            <p className="text-2xs text-white/60 leading-relaxed">
              LIFELINE AI is built on standard, server-side secure routes. All API calls are proxied through Node.js endpoints, preventing the exposure of your private **Google AI Studio Credentials** to any browser clients. To run with real live Gemini endpoints, simply supply `GEMINI_API_KEY` in the AI Studio platform Secrets configuration block.
            </p>
          </Card>
        </div>

        {/* Algorithm explainer */}
        <div className="md:col-span-6">
          <Card className="p-5 flex flex-col gap-4">
            <div className="flex items-center gap-2 pb-2 border-b border-white/5">
              <HelpCircle className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-semibold text-white/95 font-sans">Algorithmic Overview</h3>
            </div>

            <div className="flex flex-col gap-4">
              <div className="bg-white/[0.01] p-4 rounded-xl border border-white/5 flex flex-col gap-2">
                <span className="text-3xs uppercase tracking-widest font-bold text-cyan-400 font-mono">The Lifeline Score™ Equation</span>
                <p className="text-sm font-mono font-bold text-white/90 mt-1">
                  score = (W_u × T_p) + (I_w × B_f)
                </p>
                <div className="flex flex-col gap-1.5 text-2xs text-white/50 leading-relaxed mt-1">
                  <p>• **W_u (Urgency Weight)**: Represents the priority influence of remaining clock time (set to **60**).</p>
                  <p>• **T_p (Time Pressure)**: Calculated dynamically as `1 - (hours_remaining / 168)` (caps at 1.0, overdue is 1.0).</p>
                  <p>• **I_w (Impact Weight)**: Impact score from 1-5 multiplied by a scalar factor.</p>
                  <p>• **B_f (Blocking Factor)**: Scaling modifier that compounds if *other* unfinished tasks depend on this card (`1 + 0.25 × count`).</p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold text-white/70">Circular Ring Diagnostic Diagnostics</span>
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10 text-center">
                    <span className="text-2xs font-bold text-emerald-400 font-mono">0 - 40</span>
                    <span className="text-4xs text-white/40 block mt-0.5">Stable/Green</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/10 text-center">
                    <span className="text-2xs font-bold text-amber-400 font-mono">41 - 70</span>
                    <span className="text-4xs text-white/40 block mt-0.5">Tension/Amber</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-red-500/5 border border-red-500/10 text-center">
                    <span className="text-2xs font-bold text-red-400 font-mono">71 - 100</span>
                    <span className="text-4xs text-white/40 block mt-0.5">Pulsing Danger</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
export default Settings;
