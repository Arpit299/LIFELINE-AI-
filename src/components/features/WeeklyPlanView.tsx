import React, { useState } from 'react';
import { useTaskStore } from '../../store/taskStore';
import { useUIStore } from '../../store/uiStore';
import { generateWeeklyPlan } from '../../lib/gemini/client';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Input } from '../ui/Input';
import { 
  CalendarRange, 
  Sparkles, 
  Clock, 
  Settings2,
  FileDown,
  AlertCircle
} from 'lucide-react';
import { jsPDF } from 'jspdf';

export const WeeklyPlanView: React.FC = () => {
  const { tasks, demoMode } = useTaskStore();
  const { weeklyPlan, isWeeklyPlanLoading, setWeeklyPlan, setWeeklyPlanLoading } = useUIStore();

  const [workingHours, setWorkingHours] = useState('9:00 AM - 5:00 PM');
  const [constraints, setConstraints] = useState('Minimize context switching, schedule heaviest tasks on Monday mornings.');

  const handleGeneratePlan = async () => {
    setWeeklyPlanLoading(true);
    try {
      const markdown = await generateWeeklyPlan(tasks, workingHours, constraints, demoMode);
      setWeeklyPlan({
        planMarkdown: markdown,
        generatedAt: new Date().toISOString()
      });
    } catch (e) {
      console.error(e);
    } finally {
      setWeeklyPlanLoading(false);
    }
  };

  const handleExportPDF = () => {
    if (!weeklyPlan) return;
    
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header
    doc.setFillColor(15, 15, 26);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('WEEKLY STRATEGIC PLAN', 14, 18);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(165, 180, 252);
    doc.text('LIFELINE AI Pro Strategic Planning System', 14, 25);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 32);

    // Body
    doc.setTextColor(15, 15, 26);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    const splitText = doc.splitTextToSize(weeklyPlan.planMarkdown, pageWidth - 28);
    let y = 50;
    
    splitText.forEach((line: string) => {
      if (y > 275) {
        doc.addPage();
        y = 20;
      }
      
      // Formatting headers slightly larger
      if (line.startsWith('#')) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text(line.replace(/#/g, '').trim(), 14, y);
        y += 8;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
      } else {
        doc.text(line, 14, y);
        y += 6;
      }
    });

    doc.save(`Lifeline_Weekly_Strategy_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Custom Markdown parser that maps text lines to stylish components
  const renderPlanMarkdown = (md: string) => {
    return md.split('\n').map((line, index) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={index} className="h-2" />;

      if (trimmed.startsWith('# ')) {
        return (
          <h2 key={index} className="text-xl font-bold text-white/95 mt-6 mb-3 border-b border-white/5 pb-2 font-sans tracking-tight">
            {trimmed.replace('# ', '')}
          </h2>
        );
      }
      if (trimmed.startsWith('## ')) {
        return (
          <h3 key={index} className="text-base font-bold text-purple-300 mt-5 mb-2 font-sans">
            {trimmed.replace('## ', '')}
          </h3>
        );
      }
      if (trimmed.startsWith('### ')) {
        return (
          <h4 key={index} className="text-sm font-semibold text-cyan-400 mt-4 mb-2 font-sans flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
            {trimmed.replace('### ', '')}
          </h4>
        );
      }
      if (trimmed.startsWith('* **') && trimmed.includes('** | **')) {
        // Hourly schedule lines
        const cleanLine = trimmed.replace('* **', '').replace('**', '');
        const [time, taskAndNote] = cleanLine.split(' | ');
        const [taskTitle, notes] = taskAndNote ? taskAndNote.split('**') : [taskAndNote, ''];
        return (
          <div key={index} className="flex gap-4 p-3 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/[0.04] transition-all mb-2">
            <span className="font-mono text-2xs font-bold text-cyan-400 min-w-20 border-r border-white/10 pr-4">
              {time}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white/90 truncate">{taskTitle}</p>
              {notes && <p className="text-3xs text-white/40 mt-1 leading-relaxed">{notes.replace(/^\s*\*\s*/, '')}</p>}
            </div>
          </div>
        );
      }
      if (trimmed.startsWith('*')) {
        return (
          <li key={index} className="text-xs text-white/70 leading-relaxed list-none pl-4 relative mb-2">
            <span className="absolute left-0 text-purple-400">•</span>
            {trimmed.replace(/^\*\s*/, '')}
          </li>
        );
      }
      return (
        <p key={index} className="text-xs text-white/60 leading-relaxed mb-3">
          {trimmed}
        </p>
      );
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Constraints Left Rail */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        <Card className="p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2 pb-3 border-b border-white/5">
            <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20 text-purple-400">
              <Settings2 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white/95">Planner Directives</h4>
              <p className="text-2xs text-white/40 mt-0.5">Customize constraints for the AI system.</p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <Input 
              label="Standard Work Hours" 
              value={workingHours} 
              onChange={e => setWorkingHours(e.target.value)} 
              placeholder="e.g., 9:00 AM - 5:00 PM"
            />

            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-xs font-medium text-white/60">Tactical Directives</label>
              <textarea
                value={constraints}
                onChange={e => setConstraints(e.target.value)}
                placeholder="List preferences, fatigue buffers, meeting loads..."
                rows={4}
                className="w-full bg-white/[0.03] hover:bg-white/[0.05] focus:bg-white/[0.07] text-white placeholder-white/30 text-sm rounded-xl px-4 py-3 border border-white/10 focus:border-purple-500 focus:outline-none transition-all duration-200 resize-none"
              />
            </div>

            <Button 
              variant="primary" 
              size="md" 
              loading={isWeeklyPlanLoading} 
              onClick={handleGeneratePlan}
              disabled={tasks.filter(t => t.status !== 'done').length === 0}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Synthesize Strategy
            </Button>
          </div>
        </Card>
      </div>

      {/* Schedule Center Stage */}
      <div className="lg:col-span-8">
        <Card className="p-6 min-h-96 flex flex-col justify-center">
          {!weeklyPlan && !isWeeklyPlanLoading ? (
            <div className="flex flex-col items-center text-center p-8 gap-4 max-w-md mx-auto">
              <div className="p-4 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-full animate-pulse">
                <CalendarRange className="w-8 h-8" />
              </div>
              <div className="flex flex-col gap-1">
                <h4 className="text-sm font-semibold text-white/95">No Strategic Plan Formulated</h4>
                <p className="text-xs text-white/40 leading-relaxed">
                  Provide schedule constraints on the sidebar and request a plan. Gemini 1.5 Pro will organize your backlogs, respect dependencies, and design a customized week.
                </p>
              </div>
            </div>
          ) : isWeeklyPlanLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="relative w-14 h-14 flex items-center justify-center">
                <div className="absolute inset-0 border-4 border-cyan-500/10 rounded-full" />
                <div className="absolute inset-0 border-4 border-t-cyan-400 rounded-full animate-spin" />
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-xs font-semibold text-cyan-300">Orchestrating Strategic Blocks...</span>
                <span className="text-3xs text-white/30 font-mono uppercase">Invoking reasoning engine</span>
              </div>
            </div>
          ) : weeklyPlan ? (
            <div className="flex flex-col gap-6">
              {/* Toolbar */}
              <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-white/40" />
                  <span className="text-2xs text-white/40 font-mono">
                    Updated: {new Date(weeklyPlan.generatedAt).toLocaleTimeString()}
                  </span>
                </div>

                <Button variant="glass" size="sm" onClick={handleExportPDF}>
                  <FileDown className="w-4 h-4 mr-2" />
                  Export Strategic PDF
                </Button>
              </div>

              {/* Rendered markdown area */}
              <div className="flex flex-col leading-relaxed max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                {renderPlanMarkdown(weeklyPlan.planMarkdown)}
              </div>
            </div>
          ) : null}
        </Card>
      </div>
    </div>
  );
};
export default WeeklyPlanView;
