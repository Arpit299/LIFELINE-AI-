import React, { useState } from 'react';
import { useTaskStore } from '../../store/taskStore';
import { useUIStore } from '../../store/uiStore';
import { parseBulkTasks } from '../../lib/gemini/client';
import { TextArea } from '../ui/Input';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import Badge from '../ui/Badge';
import { Sparkles, FormInput, ListPlus } from 'lucide-react';
import { TaskInputForm } from './TaskInputForm';

export const AddTaskModal: React.FC = () => {
  const { isAddTaskModalOpen, setAddTaskModalOpen } = useUIStore();
  const { addTask, demoMode } = useTaskStore();

  const [activeTab, setActiveTab] = useState<'manual' | 'bulk'>('manual');

  // Bulk Parsing States
  const [bulkText, setBulkText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parsedPreview, setParsedPreview] = useState<any[]>([]);

  const handleManualSubmit = async (data: {
    title: string;
    description: string;
    category: string;
    priority: 'low' | 'medium' | 'high';
    impact: number;
    deadline: string;
    dependencies: string[];
  }) => {
    await addTask({
      ...data,
      userId: 'demo-user', // default
    });
    setAddTaskModalOpen(false);
  };

  const handleBulkParse = async () => {
    if (!bulkText.trim()) return;
    setIsParsing(true);
    setParsedPreview([]);

    try {
      const extracted = await parseBulkTasks(bulkText, demoMode);
      setParsedPreview(extracted);
    } catch (e) {
      console.error(e);
    } finally {
      setIsParsing(false);
    }
  };

  const handleImportParsedTask = async (item: any, index: number) => {
    await addTask({
      title: item.title,
      description: item.description,
      category: item.category || 'Work',
      priority: item.priority || 'medium',
      impact: item.impact || 3,
      deadline: item.deadline || new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      dependencies: [],
      userId: 'demo-user'
    });

    // Filter imported task out of previews
    setParsedPreview(prev => prev.filter((_, idx) => idx !== index));
    
    // Close modal if all items are imported
    if (parsedPreview.length <= 1) {
      setBulkText('');
      setAddTaskModalOpen(false);
    }
  };

  const handleImportAllParsedTasks = async () => {
    for (const item of parsedPreview) {
      await addTask({
        title: item.title,
        description: item.description,
        category: item.category || 'Work',
        priority: item.priority || 'medium',
        impact: item.impact || 3,
        deadline: item.deadline || new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        dependencies: [],
        userId: 'demo-user'
      });
    }
    setParsedPreview([]);
    setBulkText('');
    setAddTaskModalOpen(false);
  };

  return (
    <Modal isOpen={isAddTaskModalOpen} onClose={() => setAddTaskModalOpen(false)} title="Capture Action Items">
      {/* Tab Switcher */}
      <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/5 mb-6">
        <button
          onClick={() => setActiveTab('manual')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer ${
            activeTab === 'manual' 
              ? 'bg-purple-600/25 text-purple-200 border border-purple-500/30' 
              : 'text-white/40 hover:text-white/80'
          }`}
        >
          <FormInput className="w-3.5 h-3.5" />
          Standard Capture
        </button>
        <button
          onClick={() => setActiveTab('bulk')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer ${
            activeTab === 'bulk' 
              ? 'bg-cyan-600/25 text-cyan-200 border border-cyan-500/30' 
              : 'text-white/40 hover:text-white/80'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          AI Bulk Brain-Dump
        </button>
      </div>

      {activeTab === 'manual' ? (
        <TaskInputForm 
          onSubmit={handleManualSubmit} 
          onCancel={() => setAddTaskModalOpen(false)} 
        />
      ) : (
        <div className="flex flex-col gap-4">
          <p className="text-xs text-white/50 leading-relaxed">
            Pour your unformatted stream of thoughts, emails, or chat logs below. Our parser will instantly distill distinct tasks, deadlines, and priorities for you.
          </p>

          <TextArea 
            placeholder="e.g., call client by Friday, audit database security specs today, check back on report tomorrow by noon" 
            value={bulkText} 
            onChange={e => setBulkText(e.target.value)}
            disabled={isParsing}
            className="h-32"
          />

          <Button 
            variant="secondary" 
            size="md" 
            loading={isParsing} 
            onClick={handleBulkParse}
            disabled={!bulkText.trim()}
            className="w-full"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Deconstruct Brain-Dump
          </Button>

          {/* Extracted tasks container */}
          {parsedPreview.length > 0 && (
            <div className="flex flex-col gap-3 mt-4 border-t border-white/5 pt-4">
              <div className="flex items-center justify-between text-xs font-semibold text-white/60">
                <span>Extracted Actions ({parsedPreview.length})</span>
                <button 
                  onClick={handleImportAllParsedTasks}
                  className="text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <ListPlus className="w-3.5 h-3.5" />
                  Import All
                </button>
              </div>

              <div className="flex flex-col gap-3 max-h-52 overflow-y-auto custom-scrollbar pr-1">
                {parsedPreview.map((item, index) => (
                  <div key={index} className="p-3 bg-white/[0.02] border border-white/5 rounded-xl flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1 flex flex-col gap-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-white/90 truncate">{item.title}</span>
                        <Badge variant="gray" size="sm">{item.category}</Badge>
                      </div>
                      <p className="text-2xs text-white/50 line-clamp-1">{item.description}</p>
                      <span className="text-2xs text-purple-300 font-mono">
                        Target Due: {new Date(item.deadline).toLocaleDateString()}
                      </span>
                    </div>

                    <button
                      onClick={() => handleImportParsedTask(item, index)}
                      className="text-2xs font-bold text-cyan-400 hover:text-cyan-300 bg-cyan-400/10 border border-cyan-500/20 px-2 py-1 rounded-md transition-all cursor-pointer"
                    >
                      Import
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};
export default AddTaskModal;
