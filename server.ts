import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { generateConceptStudyHelp } from './src/server/gemini';
import {
  appendStudyExchange,
  createConcept,
  createUserProfile,
  getBootstrap,
  getHealthSummary,
  getStudyContext,
  submitConceptQuiz,
  toggleConceptMastery,
  updateConcept,
} from './src/server/store';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    try {
      res.json(getHealthSummary());
    } catch (err) {
      res.status(500).json({ ok: false, error: (err as Error).message });
    }
  });

  app.get('/api/bootstrap', (req, res) => {
    try {
      const userId =
        typeof req.query.userId === 'string' ? req.query.userId : undefined;
      res.json(getBootstrap(userId));
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  app.post('/api/users', (req, res) => {
    try {
      const { name, grade, board, role } = req.body ?? {};
      const user = createUserProfile({
        name: String(name ?? ''),
        grade: Number(grade) as 5 | 6 | 7 | 8 | 9 | 10,
        board: board === 'SSC' ? 'SSC' : 'CBSE',
        role: role === 'teacher' ? 'teacher' : 'student',
      });
      res.status(201).json({ user });
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  });

  app.post('/api/progress/toggle', (req, res) => {
    try {
      const { userId, conceptId, mastered } = req.body ?? {};
      const masteredIds = toggleConceptMastery(
        String(userId ?? ''),
        String(conceptId ?? ''),
        typeof mastered === 'boolean' ? mastered : undefined,
      );
      res.json({ masteredIds });
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  });

  app.post('/api/quiz/submit', (req, res) => {
    try {
      const { userId, conceptId, answers } = req.body ?? {};
      if (!Array.isArray(answers)) {
        res.status(400).json({ error: 'Answers array is required.' });
        return;
      }
      const outcome = submitConceptQuiz({
        userId: String(userId ?? ''),
        conceptId: String(conceptId ?? ''),
        answers: answers.map((a) => Number(a)),
      });
      res.json(outcome);
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  });

  app.post('/api/concepts', (req, res) => {
    try {
      const {
        courseId,
        title,
        chapter,
        summary,
        formula,
        estimatedMinutes,
        prerequisites,
      } = req.body ?? {};
      const concept = createConcept({
        courseId: String(courseId ?? ''),
        title: String(title ?? ''),
        chapter: String(chapter ?? ''),
        summary: String(summary ?? ''),
        formula: typeof formula === 'string' ? formula : undefined,
        estimatedMinutes: Number(estimatedMinutes ?? 20),
        prerequisites: Array.isArray(prerequisites)
          ? prerequisites.map(String)
          : [],
      });
      res.status(201).json({ concept });
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  });

  app.put('/api/concepts/:id', (req, res) => {
    try {
      const concept = updateConcept(req.params.id, req.body ?? {});
      res.json({ concept });
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  });

  app.post('/api/ai/study', async (req, res) => {
    try {
      const { userId, conceptId, prompt } = req.body ?? {};
      const cleanPrompt = String(prompt ?? '').trim();
      if (!cleanPrompt) {
        res.status(400).json({ error: 'Please enter a study question or topic.' });
        return;
      }

      const ctx = getStudyContext(String(userId ?? ''), String(conceptId ?? ''));
      const reply = await generateConceptStudyHelp({
        course: ctx.course,
        concept: ctx.concept,
        prerequisiteTitles: ctx.prerequisiteTitles,
        prompt: cleanPrompt,
      });

      const messages = appendStudyExchange({
        userId: ctx.user.id,
        conceptId: ctx.concept.id,
        userPrompt: cleanPrompt,
        assistantReply: reply,
      });

      res.json({ messages });
    } catch (err) {
      const message = (err as Error).message || 'AI Study Tools failed.';
      const status = message.includes('GEMINI_API_KEY') ? 503 : 500;
      res.status(status).json({ error: message });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      const indexFile = path.join(distDir, 'index.html');
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(404).send('Build output not found.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LUMORA server listening on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start LUMORA server:', err);
  process.exit(1);
});
