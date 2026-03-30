import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import routes from './routes';

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure data directory exists
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// ── MIDDLEWARE ──
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// ── API ROUTES ──
app.use('/api', routes);

// ── SERVE FRONTEND ──
app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// ── START ──
app.listen(PORT, () => {
    console.log(`
  ╔══════════════════════════════════════════╗
  ║   🔥 Impronta Manager v1.0              ║
  ║   Servidor corriendo en puerto ${PORT}       ║
  ║   → http://localhost:${PORT}                 ║
  ╚══════════════════════════════════════════╝
    `);
});

export default app;
