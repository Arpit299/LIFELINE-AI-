import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { 
  runUrgencyAnalyzerChain, 
  runBulkTaskParserChain, 
  runWeeklyPlanChain, 
  runFocusModeCoachChain 
} from './src/lib/gemini/chains';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json());

  // API Proxy Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', serverTime: new Date().toISOString() });
  });

  // Urgency Analyzer Proxy
  app.post('/api/gemini/analyze', async (req: any, res: any) => {
    try {
      const { task, currentTime } = req.body;
      if (!task) {
        return res.status(400).json({ error: 'Task data is required' });
      }
      const analysis = await runUrgencyAnalyzerChain(task, currentTime || new Date().toISOString());
      res.json(analysis);
    } catch (error: any) {
      console.error('Error in /api/gemini/analyze:', error);
      res.status(500).json({ error: error.message || 'AI service failure' });
    }
  });

  // Bulk Task Parser Proxy
  app.post('/api/gemini/parse', async (req: any, res: any) => {
    try {
      const { rawText, currentTime } = req.body;
      if (!rawText) {
        return res.status(400).json({ error: 'rawText is required' });
      }
      const parsedTasks = await runBulkTaskParserChain(rawText, currentTime || new Date().toISOString());
      res.json(parsedTasks);
    } catch (error: any) {
      console.error('Error in /api/gemini/parse:', error);
      res.status(500).json({ error: error.message || 'AI service failure' });
    }
  });

  // Weekly Plan Proxy
  app.post('/api/gemini/plan', async (req: any, res: any) => {
    try {
      const { tasks, workingHours, constraints, currentTime } = req.body;
      if (!tasks || !Array.isArray(tasks)) {
        return res.status(400).json({ error: 'Tasks array is required' });
      }
      const plan = await runWeeklyPlanChain(
        tasks, 
        workingHours || '9:00 AM - 5:00 PM', 
        constraints || 'None', 
        currentTime || new Date().toISOString()
      );
      res.json(plan);
    } catch (error: any) {
      console.error('Error in /api/gemini/plan:', error);
      res.status(500).json({ error: error.message || 'AI service failure' });
    }
  });

  // Focus Mode Coach Proxy
  app.post('/api/gemini/coach', async (req: any, res: any) => {
    try {
      const { task, currentTime } = req.body;
      if (!task) {
        return res.status(400).json({ error: 'Task is required' });
      }
      const coaching = await runFocusModeCoachChain(task, currentTime || new Date().toISOString());
      res.json(coaching);
    } catch (error: any) {
      console.error('Error in /api/gemini/coach:', error);
      res.status(500).json({ error: error.message || 'AI service failure' });
    }
  });

  // Vite Integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[LIFELINE AI SERVER] Running on http://0.0.0.0:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
});
