import React, { useState } from 'react';
import { useTaskStore } from '../../store/taskStore';
import { Input, TextArea, Select } from '../ui/Input';
import Button from '../ui/Button';

interface TaskInputFormProps {
  onSubmit: (data: {
    title: string;
    description: string;
    category: string;
    priority: 'low' | 'medium' | 'high';
    impact: number;
    deadline: string;
    dependencies: string[];
  }) => void | Promise<void>;
  onCancel?: () => void;
  submitButtonText?: string;
  isSubmitting?: boolean;
}

export const TaskInputForm: React.FC<TaskInputFormProps> = ({
  onSubmit,
  onCancel,
  submitButtonText = 'Capture Task',
  isSubmitting = false,
}) => {
  const { tasks } = useTaskStore();

  // Form States
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Work');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [impact, setImpact] = useState(3);
  
  // Default deadline is 24 hours from now
  const [deadline, setDeadline] = useState(() => {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    return tomorrow.toISOString().slice(0, 16);
  });
  const [selectedDependencies, setSelectedDependencies] = useState<string[]>([]);

  // Validation States
  const [errors, setErrors] = useState<{ title?: string; deadline?: string }>({});

  const validate = (): boolean => {
    const newErrors: { title?: string; deadline?: string } = {};

    if (!title.trim()) {
      newErrors.title = 'Task title is required.';
    } else if (title.trim().length > 200) {
      newErrors.title = 'Title cannot exceed 200 characters.';
    }

    if (!deadline) {
      newErrors.deadline = 'Deadline target is required.';
    } else {
      const selectedTime = new Date(deadline).getTime();
      if (isNaN(selectedTime)) {
        newErrors.deadline = 'Please specify a valid deadline date.';
      } else if (selectedTime <= Date.now()) {
        newErrors.deadline = 'Deadline must be a future timestamp.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
        impact,
        deadline: new Date(deadline).toISOString(),
        dependencies: selectedDependencies,
      });

      // Clear Form on success
      setTitle('');
      setDescription('');
      setCategory('Work');
      setPriority('medium');
      setImpact(3);
      setSelectedDependencies([]);
      setErrors({});
    } catch (error) {
      console.error('Submission failed in TaskInputForm:', error);
    }
  };

  const categories = [
    { value: 'Work', label: 'Work' },
    { value: 'Engineering', label: 'Engineering' },
    { value: 'Security', label: 'Security' },
    { value: 'Infrastructure', label: 'Infrastructure' },
    { value: 'Testing', label: 'Testing' },
    { value: 'Life', label: 'Life' },
    { value: 'General', label: 'General' },
  ];

  const priorities = [
    { value: 'low', label: 'Low Urgency' },
    { value: 'medium', label: 'Medium Urgency' },
    { value: 'high', label: 'High Urgency' },
  ];

  const toggleDependency = (id: string) => {
    setSelectedDependencies((prev) =>
      prev.includes(id) ? prev.filter((depId) => depId !== id) : [...prev, id]
    );
  };

  const activeBacklogTasks = tasks.filter((t) => t.status !== 'done');

  return (
    <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
      <Input
        label="Task Title"
        placeholder="e.g., Audit production security rules"
        value={title}
        onChange={(e) => {
          setTitle(e.target.value);
          if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
        }}
        error={errors.title}
        required
      />

      <TextArea
        label="Description (Optional)"
        placeholder="e.g., Double check database constraints, secure update paths, test on edge-case scenarios."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Category"
          options={categories}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
        <Select
          label="Priority Base"
          options={priorities}
          value={priority}
          onChange={(e) => setPriority(e.target.value as any)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-white/60">Impact Weight (1-5)</label>
          <div className="flex items-center gap-2 mt-1">
            {Array.from({ length: 5 }).map((_, idx) => {
              const rating = idx + 1;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setImpact(rating)}
                  className={`w-8 h-8 rounded-lg font-mono text-xs font-bold border transition-all cursor-pointer ${
                    impact >= rating
                      ? 'bg-violet/35 border-violet text-violet shadow-inner'
                      : 'bg-white/5 border-white/10 text-white/40 hover:text-white/70'
                  }`}
                >
                  {rating}
                </button>
              );
            })}
          </div>
        </div>

        <Input
          type="datetime-local"
          label="Deadline Target"
          value={deadline}
          onChange={(e) => {
            setDeadline(e.target.value);
            if (errors.deadline) setErrors((prev) => ({ ...prev, deadline: undefined }));
          }}
          error={errors.deadline}
          required
        />
      </div>

      {/* Dependencies selection */}
      {activeBacklogTasks.length > 0 && (
        <div className="flex flex-col gap-2 border-t border-white/5 pt-4 mt-1">
          <label className="text-xs font-medium text-white/60">
            Requires Completion of (Dependencies)
          </label>
          <div className="max-h-28 overflow-y-auto custom-scrollbar flex flex-wrap gap-2 mt-1">
            {activeBacklogTasks.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => toggleDependency(t.id)}
                className={`px-3 py-1.5 rounded-lg text-2xs font-medium border transition-all cursor-pointer ${
                  selectedDependencies.includes(t.id)
                    ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                    : 'bg-white/5 border-white/5 text-white/50 hover:bg-white/10'
                }`}
              >
                {t.title}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3 justify-end border-t border-white/5 pt-5 mt-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 bg-transparent text-white/70 hover:text-white text-xs font-medium rounded-xl hover:bg-white/5 border border-white/10 transition-all cursor-pointer"
          >
            Cancel
          </button>
        )}
        <Button variant="primary" size="sm" type="submit" loading={isSubmitting}>
          {submitButtonText}
        </Button>
      </div>
    </form>
  );
};

export default TaskInputForm;
