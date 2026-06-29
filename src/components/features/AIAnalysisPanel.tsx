import React, { useEffect, useState } from 'react';
import { useTaskStore } from '../../store/taskStore';
import { useUIStore } from '../../store/uiStore';
import { analyzeTaskUrgency } from '../../lib/gemini/client';
import { AIAnalysisSkeleton } from '../ui/SkeletonLoader';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import { getScoreColor } from '../../lib/urgencyScore';
import { 
  BrainCircuit, 
  Sparkles, 
  AlertTriangle, 
  Footprints, 
  Hourglass,
  Check
} from 'lucide-react';

export const AIAnalysisPanel: React.FC = () => {
  const { selectedTaskIdForAnalysis, setSelectedTaskIdForAnalysis } = useUIStore();
  const { tasks, updateTaskAIAnalysis, demoMode } = useTaskStore();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<any | null>(null);

  const task = tasks.find(t => t.id === selectedTaskIdForAnalysis);

  useEffect(() => {
    if (!task) {
      setAnalysis(null);
      return;
    }

    // If task already has a saved analysis, load it immediately
    if (task.aiAnalysis) {
      setAnalysis(task.aiAnalysis);
      return;
    }

    // Otherwise, trigger the live AI Analysis
    const triggerAnalysis = async () => {
      setLoading(true);
      setError(null);
      setAnalysis(null);
      try {
        const result = await analyzeTaskUrgency(task, demoMode);
        setAnalysis(result);
        // Persist to store so user doesn't lose it on modal close
        await updateTaskAIAnalysis(task.id, result);
      } catch (err: any) {
        setError(err.message || 'Failed to complete task urgency analysis');
      } finally {
        setLoading(false);
      }
    };

    triggerAnalysis();
  }, [selectedTaskIdForAnalysis, task?.id]);

  if (!task) return null;

  const scoreColor = analysis ? getScoreColor(analysis.urgency_score) : getScoreColor(task.urgencyScore);

  return (
    <Modal
      isOpen={selectedTaskIdForAnalysis !== null}
      onClose={() => setSelectedTaskIdForAnalysis(null)}
      title="Gemini Urgency Intelligence Analysis"
    >
      <div className="flex flex-col gap-5">
        {/* Task Header info */}
        <div className="p-4 rounded-xl bg-white/5 border border-white/5">
          <span className="text-2xs uppercase tracking-wider font-bold text-white/40 font-mono">Analyzed Object</span>
          <h4 className="text-sm font-semibold text-white/90 mt-1">{task.title}</h4>
          <p className="text-xs text-white/50 mt-1 line-clamp-2">{task.description}</p>
        </div>

        {loading ? (
          <AIAnalysisSkeleton />
        ) : error ? (
          <div className="p-5 border border-red-500/20 bg-red-500/5 rounded-xl text-center">
            <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-red-300">Analysis Failed</p>
            <p className="text-xs text-red-400/80 mt-1">{error}</p>
          </div>
        ) : analysis ? (
          <div className="flex flex-col gap-5">
            {/* Urgency Score Highlight */}
            <div className="flex items-center justify-between p-5 rounded-xl bg-gradient-to-r from-purple-950/20 to-cyan-950/20 border border-white/5">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-white/50 font-medium">Calculated Urgency Level</span>
                <span className={`text-2xl font-mono font-black ${scoreColor.text}`}>
                  {analysis.urgency_score} <span className="text-xs text-white/30">/ 100</span>
                </span>
              </div>
              <div className={`p-3 rounded-full ${scoreColor.bg} border ${scoreColor.border} shadow-lg ${scoreColor.glow}`}>
                <BrainCircuit className="w-6 h-6 text-white" />
              </div>
            </div>

            {/* Strategic reasoning */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-white/50 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                Strategic AI Reasoning
              </span>
              <p className="text-xs text-white/80 leading-relaxed bg-white/[0.02] border border-white/5 rounded-xl p-4">
                {analysis.reasoning}
              </p>
            </div>

            {/* Roadblocks & blockages */}
            {analysis.blockers && analysis.blockers.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold text-white/50 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  Roadblocks & Dependency Warnings
                </span>
                <div className="flex flex-col gap-1.5">
                  {analysis.blockers.map((blocker: string, index: number) => (
                    <div key={index} className="flex gap-2 items-start text-xs text-white/70 bg-amber-500/5 p-2.5 rounded-lg border border-amber-500/10">
                      <Hourglass className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                      <span>{blocker}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Next physical step */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-white/50 flex items-center gap-1.5">
                <Footprints className="w-3.5 h-3.5 text-cyan-400" />
                Low-Friction Next Action Step
              </span>
              <div className="p-4 bg-cyan-500/5 border border-cyan-500/10 rounded-xl flex items-start gap-3">
                <Check className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5 bg-cyan-500/10 rounded-full p-1" />
                <p className="text-xs font-semibold text-cyan-200 leading-relaxed">
                  {analysis.next_action}
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-white/5">
              <Button variant="primary" size="sm" onClick={() => setSelectedTaskIdForAnalysis(null)}>
                Apply Action Plan
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </Modal>
  );
};
export default AIAnalysisPanel;
