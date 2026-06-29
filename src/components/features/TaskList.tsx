import React from 'react';
import { useTaskStore } from '../../store/taskStore';
import { useUIStore } from '../../store/uiStore';
import TaskCard from './TaskCard';
import { SkeletonLoader } from '../ui/SkeletonLoader';
import { Filter, ArchiveRestore, Sparkles } from 'lucide-react';

export const TaskList: React.FC = () => {
  const { tasks, loading } = useTaskStore();
  const { searchQuery, categoryFilter, priorityFilter, statusFilter, setFilters } = useUIStore();

  const handleClearFilters = () => {
    setFilters({
      searchQuery: '',
      categoryFilter: 'All',
      priorityFilter: 'All',
      statusFilter: 'All'
    });
  };

  if (loading) {
    return <SkeletonLoader count={4} />;
  }

  // Apply filters
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          task.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === 'All' || task.category === categoryFilter;
    const matchesPriority = priorityFilter === 'All' || task.priority === priorityFilter;
    
    let matchesStatus = true;
    if (statusFilter === 'Active') {
      matchesStatus = task.status !== 'done';
    } else if (statusFilter === 'Completed') {
      matchesStatus = task.status === 'done';
    }

    return matchesSearch && matchesCategory && matchesPriority && matchesStatus;
  });

  // Sort tasks: Active tasks sorted by urgencyScore descending; completed tasks at the bottom
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (a.status === 'done' && b.status !== 'done') return 1;
    if (a.status !== 'done' && b.status === 'done') return -1;
    return b.urgencyScore - a.urgencyScore;
  });

  return (
    <div className="flex flex-col gap-4">
      {/* List Header & Metrics */}
      <div className="flex items-center justify-between text-xs text-white/40 pb-2 border-b border-white/5">
        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5" />
          <span>Showing {sortedTasks.length} of {tasks.length} tasks</span>
        </div>

        {(categoryFilter !== 'All' || priorityFilter !== 'All' || statusFilter !== 'All' || searchQuery !== '') && (
          <button
            onClick={handleClearFilters}
            className="text-purple-400 hover:text-purple-300 transition-colors cursor-pointer"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Task List Rendering */}
      {sortedTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
          <ArchiveRestore className="w-10 h-10 text-white/20 mb-3" />
          <p className="text-sm text-white/60 font-medium">No tasks match your criteria</p>
          <p className="text-xs text-white/30 text-center mt-1 max-w-xs">
            Try adjusting your search terms or filters, or capture a new action item to begin.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sortedTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
};
export default TaskList;
