import express from 'express';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const PUBLIC_URL = (process.env.PUBLIC_URL || `http://localhost:${PORT}`).replace(/\/$/, '');

const DATA_FILE = path.join(__dirname, 'data', 'certificados.json');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

function readCertificados() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function writeCertificados(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

function slugify(text = '') {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function codigoCertificado() {
  const y = new Date().getFullYear();
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `CC-${y}-${random}`;
}

app.get('/', (_, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/api/certificados', (req, res) => {
  const all = readCertificados();
  const q = String(req.query.q || '').trim().toLowerCase();

  if (!q) return res.json(all);

  res.json(
    all.filter(x =>
      [x.alumno, x.curso, x.profesor, x.director, x.codigo]
        .some(v => String(v || '').toLowerCase().includes(q))
    )
  );
});

app.post('/api/certificados', async (req, res) => {
  const alumno = String(req.body.alumno || '').trim();
  const curso = String(req.body.curso || '').trim();
  const profesor = String(req.body.profesor || '').trim();
  const director = String(req.body.director || '').trim();
  const fecha = String(req.body.fecha || '').trim();

  if (!alumno || !curso || !profesor || !director || !fecha) {
    return res.status(400).json({ error: 'Faltan datos obligatorios.' });
  }

  const all = readCertificados();
  const id = crypto.randomUUID();
  const codigo = codigoCertificado();
  const verifyUrl = `${PUBLIC_URL}/verificar/${id}`;
  const qr = await QRCode.toDataURL(verifyUrl, {
    width: 700,
    margin: 1,
    errorCorrectionLevel: 'H'
  });

  const item = {
    id,
    codigo,
    alumno,
    curso,
    curso_slug: slugify(curso),
    profesor,
    director,
    fecha,
    qr,
    created_at: new Date().toISOString()
  };

  all.unshift(item);
  writeCertificados(all);

  res.json(item);
});

app.delete('/api/certificados/:id', (req, res) => {
  const all = readCertificados();
  const next = all.filter(x => x.id !== req.params.id);

  if (next.length === all.length) {
    return res.status(404).json({ error: 'Certificado no encontrado.' });
  }

  writeCertificados(next);
  res.json({ ok: true });
});

app.get('/api/certificados/:id', (req, res) => {
  const item = readCertificados().find(x => x.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Certificado no encontrado.' });
  res.json(item);
});

app.get('/api/curso/:slug', (req, res) => {
  const all = readCertificados().filter(x => x.curso_slug === req.params.slug);
  res.json(all);
});

app.get('/diploma/:id', (_, res) => {
  res.sendFile(path.join(__dirname, 'public', 'diploma.html'));
});

app.get('/verificar/:id', (_, res) => {
  res.sendFile(path.join(__dirname, 'public', 'verificar.html'));
});

app.listen(PORT, () => {
  console.log(`Sistema de diplomas: http://localhost:${PORT}`);
});