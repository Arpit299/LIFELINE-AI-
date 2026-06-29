import { Task, TaskAIAnalysis, FocusCoachResponse } from '../../types';
import { 
  getMockUrgencyAnalysis, 
  getMockBulkParsedTasks, 
  getMockWeeklyPlan, 
  getMockFocusCoaching 
} from './mockResponses';

export const isDemoModeActive = (): boolean => {
  if (typeof window === 'undefined') return false;
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('demo') === 'true' || localStorage.getItem('lifeline_demo_mode') === 'true';
};

/**
 * Exponential Backoff Utility for robust production calls
 */
const fetchWithRetry = async (url: string, options: RequestInit, retries = 3, delay = 500): Promise<Response> => {
  try {
    const res = await fetch(url, options);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return res;
  } catch (error) {
    if (retries <= 1) throw error;
    await new Promise(resolve => setTimeout(resolve, delay));
    return fetchWithRetry(url, options, retries - 1, delay * 2);
  }
};

/**
 * URGENY ANALYZER CHAIN
 */
export const analyzeTaskUrgency = async (task: Task, demoMode = false): Promise<TaskAIAnalysis> => {
  if (demoMode || isDemoModeActive()) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(getMockUrgencyAnalysis(task)), 1200);
    });
  }

  try {
    const response = await fetchWithRetry('/api/gemini/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task, currentTime: new Date().toISOString() }),
    }, 3, 1000);
    
    return await response.json();
  } catch (err) {
    console.error('API call failed, falling back to mock response:', err);
    return getMockUrgencyAnalysis(task);
  }
};

/**
 * BULK TASK PARSER CHAIN
 */
export const parseBulkTasks = async (rawText: string, demoMode = false): Promise<any[]> => {
  if (demoMode || isDemoModeActive()) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(getMockBulkParsedTasks(rawText)), 1000);
    });
  }

  try {
    const response = await fetchWithRetry('/api/gemini/parse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rawText, currentTime: new Date().toISOString() }),
    }, 3, 1000);

    return await response.json();
  } catch (err) {
    console.error('API call failed, falling back to mock response:', err);
    return getMockBulkParsedTasks(rawText);
  }
};

/**
 * WEEKLY PLAN GENERATOR CHAIN
 */
export const generateWeeklyPlan = async (tasks: Task[], workingHours: string, constraints: string, demoMode = false): Promise<string> => {
  if (demoMode || isDemoModeActive()) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(getMockWeeklyPlan(tasks)), 1500);
    });
  }

  try {
    const response = await fetchWithRetry('/api/gemini/plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        tasks, 
        workingHours, 
        constraints, 
        currentTime: new Date().toISOString() 
      }),
    }, 3, 1000);

    const data = await response.json();
    return data.planMarkdown;
  } catch (err) {
    console.error('API call failed, falling back to mock response:', err);
    return getMockWeeklyPlan(tasks);
  }
};

/**
 * FOCUS MODE COACH CHAIN
 */
export const generateFocusCoaching = async (task: Task, demoMode = false): Promise<FocusCoachResponse> => {
  if (demoMode || isDemoModeActive()) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(getMockFocusCoaching(task)), 1200);
    });
  }

  try {
    const response = await fetchWithRetry('/api/gemini/coach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task, currentTime: new Date().toISOString() }),
    }, 3, 1000);

    return await response.json();
  } catch (err) {
    console.error('API call failed, falling back to mock response:', err);
    return getMockFocusCoaching(task);
  }
};
