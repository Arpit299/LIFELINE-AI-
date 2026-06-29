import { GoogleGenAI } from '@google/genai';
import { 
  URGENCY_ANALYZER_PROMPT, 
  BULK_TASK_PARSER_PROMPT, 
  WEEKLY_PLAN_GENERATOR_PROMPT, 
  FOCUS_MODE_COACH_PROMPT 
} from './prompts';

let aiInstance: GoogleGenAI | null = null;

const getAIClient = (): GoogleGenAI => {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not defined.');
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
};

/**
 * Safely parse potential markdown JSON wrappers
 */
const cleanAndParseJson = (text: string): any => {
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return JSON.parse(cleaned);
};

export const runUrgencyAnalyzerChain = async (task: any, currentTime: string) => {
  const ai = getAIClient();
  const prompt = URGENCY_ANALYZER_PROMPT
    .replace('{title}', task.title)
    .replace('{description}', task.description || 'No description')
    .replace('{deadline}', task.deadline)
    .replace('{currentTime}', currentTime)
    .replace('{priority}', task.priority)
    .replace('{impact}', String(task.impact || 3))
    .replace('{dependencies}', task.dependencies?.length ? task.dependencies.join(', ') : 'None');

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      temperature: 0.3,
      responseMimeType: 'application/json'
    }
  });

  return cleanAndParseJson(response.text || '{}');
};

export const runBulkTaskParserChain = async (rawText: string, currentTime: string) => {
  const ai = getAIClient();
  const prompt = BULK_TASK_PARSER_PROMPT
    .replace('{rawText}', rawText)
    .replace('{currentTime}', currentTime);

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      temperature: 0.3,
      responseMimeType: 'application/json'
    }
  });

  return cleanAndParseJson(response.text || '[]');
};

export const runWeeklyPlanChain = async (tasks: any[], workingHours: string, constraints: string, currentTime: string) => {
  const ai = getAIClient();
  const prompt = WEEKLY_PLAN_GENERATOR_PROMPT
    .replace('{tasksJson}', JSON.stringify(tasks, null, 2))
    .replace('{workingHours}', workingHours)
    .replace('{constraints}', constraints || 'None')
    .replace('{currentTime}', currentTime);

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-pro', // use Pro for complex weekly planning!
    contents: prompt,
    config: {
      temperature: 0.7,
    }
  });

  return { planMarkdown: response.text || '' };
};

export const runFocusModeCoachChain = async (task: any, currentTime: string) => {
  const ai = getAIClient();
  const prompt = FOCUS_MODE_COACH_PROMPT
    .replace('{title}', task.title)
    .replace('{description}', task.description || 'No description')
    .replace('{impact}', String(task.impact || 3))
    .replace('{urgencyScore}', String(task.urgencyScore || 50))
    .replace('{currentTime}', currentTime);

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      temperature: 0.7,
      responseMimeType: 'application/json'
    }
  });

  return cleanAndParseJson(response.text || '{}');
};
