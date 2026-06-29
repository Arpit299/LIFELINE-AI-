import React from 'react';
import { useTaskStore } from '../store/taskStore';
import BurndownChart from '../components/features/BurndownChart';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { 
  Trophy, 
  Flame, 
  Clock, 
  Activity, 
  LineChart, 
  PieChart, 
  Sparkles,
  FileDown
} from 'lucide-react';
import { exportTasksToPDF } from '../lib/exportPDF';

export const Analytics: React.FC = () => {
  const { tasks, stats } = useTaskStore();

  const activeTasks = tasks.filter(t => t.status !== 'done');
  const completedCount = tasks.filter(t => t.status === 'done').length;
  
  // Calculate category distribution data for chart
  const categoriesMap: Record<string, number> = {};
  tasks.forEach((t) => {
    categoriesMap[t.category] = (categoriesMap[t.category] || 0) + 1;
  });

  const categoryData = Object.keys(categoriesMap).map((cat) => ({
    name: cat,
    count: categoriesMap[cat],
  }));

  // Chart Colors List
  const colors = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];

  const completionRatio = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const handleExportPDFAction = () => {
    exportTasksToPDF(tasks, 'Hackathon Judge');
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-16 lg:pb-6">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div>
          <h2 className="text-base font-bold text-white/95">Velocity Analytics</h2>
          <p className="text-xs text-white/40 mt-0.5">Track your output velocity and monitor cognitive strain distributions.</p>
        </div>

        <Button variant="glass" size="sm" onClick={handleExportPDFAction}>
          <FileDown className="w-4 h-4 mr-1.5" />
          Export Backlog Audit
        </Button>
      </div>

      {/* Bento Grid Analytics Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 flex flex-col gap-1 text-center justify-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-purple-500" />
          <span className="text-3xs uppercase tracking-widest text-white/40 font-mono font-bold">Total Capture</span>
          <span className="text-2xl font-mono font-black text-white/90 mt-1">{tasks.length}</span>
          <span className="text-4xs text-white/40 font-mono mt-0.5">Tasks captured this cycle</span>
        </Card>

        <Card className="p-4 flex flex-col gap-1 text-center justify-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-cyan-500" />
          <span className="text-3xs uppercase tracking-widest text-white/40 font-mono font-bold">Completed</span>
          <span className="text-2xl font-mono font-black text-emerald-400 mt-1">{completedCount}</span>
          <span className="text-4xs text-white/40 font-mono mt-0.5">Success metrics archived</span>
        </Card>

        <Card className="p-4 flex flex-col gap-1 text-center justify-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-amber-500" />
          <span className="text-3xs uppercase tracking-widest text-white/40 font-mono font-bold">Completion Rate</span>
          <span className="text-2xl font-mono font-black text-cyan-400 mt-1">{completionRatio}%</span>
          <span className="text-4xs text-white/40 font-mono mt-0.5">Velocity efficiency index</span>
        </Card>

        <Card className="p-4 flex flex-col gap-1 text-center justify-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-orange-500" />
          <span className="text-3xs uppercase tracking-widest text-white/40 font-mono font-bold">Focus Streak</span>
          <span className="text-2xl font-mono font-black text-orange-400 mt-1 flex items-center justify-center gap-1">
            <Flame className="w-5 h-5 fill-orange-500/15" />
            {stats.streak}d
          </span>
          <span className="text-4xs text-white/40 font-mono mt-0.5">Consecutive completion days</span>
        </Card>
      </div>

      {/* Main Charts area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7">
          <BurndownChart />
        </div>

        {/* Load Distribution chart */}
        <div className="lg:col-span-5">
          <Card className="p-5 flex flex-col gap-4 h-full">
            <div className="flex items-center gap-2 pb-2 border-b border-white/5">
              <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20 text-cyan-400">
                <PieChart className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white/95">Category Distribution</h4>
                <p className="text-2xs text-white/40 mt-0.5">Volume comparison across system segments.</p>
              </div>
            </div>

            {categoryData.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-white/30 text-xs">
                Capture tasks across multiple segments to render distribution graphics.
              </div>
            ) : (
              <div className="flex-1 w-full text-2xs min-h-0 min-h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <XAxis 
                      dataKey="name" 
                      stroke="#ffffff30" 
                      tickLine={false}
                      axisLine={false}
                      style={{ fontSize: '10px' }}
                    />
                    <YAxis 
                      stroke="#ffffff30" 
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                      style={{ fontSize: '10px' }}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#090910', borderColor: '#ffffff15', borderRadius: '8px', color: '#fff' }} 
                      labelStyle={{ fontSize: '10px', color: '#ffffff50', fontFamily: 'monospace' }}
                      itemStyle={{ color: '#8B5CF6', fontSize: '12px', fontWeight: 'bold' }}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} fillOpacity={0.65} stroke={colors[index % colors.length]} strokeWidth={1} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
export default Analytics;
