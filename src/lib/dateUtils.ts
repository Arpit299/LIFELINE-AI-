/**
 * Lifeline AI Date and Time Utility Functions
 */

export const isOverdue = (deadlineStr: string): boolean => {
  return new Date(deadlineStr).getTime() < Date.now();
};

export const formatDeadlineRemaining = (deadlineStr: string): string => {
  const diffMs = new Date(deadlineStr).getTime() - Date.now();
  const diffMsAbs = Math.abs(diffMs);
  
  const minutes = Math.floor(diffMsAbs / (1000 * 60));
  const hours = Math.floor(diffMsAbs / (1000 * 60 * 60));
  const days = Math.floor(diffMsAbs / (1000 * 60 * 60 * 24));

  const isPast = diffMs < 0;

  if (isPast) {
    if (minutes < 60) return `Overdue by ${minutes}m`;
    if (hours < 24) return `Overdue by ${hours}h`;
    return `Overdue by ${days}d`;
  } else {
    if (minutes < 60) return `Due in ${minutes}m`;
    if (hours < 24) return `Due in ${hours}h`;
    if (days === 1) return `Due in 1 day`;
    return `Due in ${days} days`;
  }
};

export const formatTimeLeftForTimer = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export const formatDateTimeLocal = (isoString: string): string => {
  try {
    const d = new Date(isoString);
    const tzoffset = d.getTimezoneOffset() * 60000; // offset in milliseconds
    const localISOTime = (new Date(d.getTime() - tzoffset)).toISOString().slice(0, 16);
    return localISOTime;
  } catch (e) {
    return '';
  }
};
