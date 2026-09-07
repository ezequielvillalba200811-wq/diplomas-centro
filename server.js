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

const DATA_FILE = path.join(__dirname, 'certificados.json');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

function readCertificados() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function writeCertificados(data) {
  fs.writeFileSync(
    DATA_FILE,
    JSON.stringify(data, null, 2),
    'utf8'
  );
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
  const year = new Date().getFullYear();
  const random = crypto
    .randomBytes(3)
    .toString('hex')
    .toUpperCase();

  return `CC-${year}-${random}`;
}

function publicUrl(req) {
  const configured = String(
    process.env.PUBLIC_URL || ''
  )
    .trim()
    .replace(/\/$/, '');

  if (configured) {
    return configured;
  }

  const proto =
    req.headers['x-forwarded-proto'] ||
    req.protocol;

  return `${proto}://${req.get('host')}`;
}

/* =========================
   PANEL PRINCIPAL
========================= */

app.get('/', (req, res) => {
  res.sendFile(
    path.join(__dirname, 'admin.html')
  );
});

/* =========================
   LISTAR CERTIFICADOS
========================= */

app.get('/api/certificados', (req, res) => {
  const certificados = readCertificados();

  const q = String(
    req.query.q || ''
  )
    .trim()
    .toLowerCase();

  if (!q) {
    return res.json(certificados);
  }

  const resultados =
    certificados.filter(certificado => {

      const campos = [
        certificado.alumno,
        certificado.curso,
        certificado.profesor,
        certificado.director,
        certificado.codigo
      ];

      return campos.some(campo =>
        String(campo || '')
          .toLowerCase()
          .includes(q)
      );
    });

  res.json(resultados);
});

/* =========================
   CREAR CERTIFICADO
========================= */

app.post(
  '/api/certificados',
  async (req, res) => {

    try {

      const alumno =
        String(req.body.alumno || '').trim();

      const curso =
        String(req.body.curso || '').trim();

      const profesor =
        String(req.body.profesor || '').trim();

      const director =
        String(req.body.director || '').trim();

      const fecha =
        String(req.body.fecha || '').trim();

      if (
        !alumno ||
        !curso ||
        !profesor ||
        !director ||
        !fecha
      ) {

        return res.status(400).json({
          error:
            'Faltan datos obligatorios.'
        });

      }

      const certificados =
        readCertificados();

      const id =
        crypto.randomUUID();

      const codigo =
        codigoCertificado();

      const verifyUrl =
        `${publicUrl(req)}/verificar/${id}`;

      const qr =
        await QRCode.toDataURL(
          verifyUrl,
          {
            width: 700,
            margin: 1,
            errorCorrectionLevel: 'H'
          }
        );

      const certificado = {

        id,
        codigo,

        alumno,
        curso,

        curso_slug:
          slugify(curso),

        profesor,
        director,
        fecha,

        qr,

        created_at:
          new Date().toISOString()
      };

      certificados.unshift(
        certificado
      );

      writeCertificados(
        certificados
      );

      res.json(certificado);

    } catch (error) {

      console.error(error);

      res.status(500).json({
        error:
          'No se pudo generar el certificado.'
      });

    }
  }
);

/* =========================
   VER UN CERTIFICADO
========================= */

app.get(
  '/api/certificados/:id',
  (req, res) => {

    const certificado =
      readCertificados().find(
        item =>
          item.id === req.params.id
      );

    if (!certificado) {

      return res
        .status(404)
        .json({
          error:
            'Certificado no encontrado.'
        });

    }

    res.json(certificado);
  }
);

/* =========================
   ELIMINAR CERTIFICADO
========================= */

app.delete(
  '/api/certificados/:id',
  (req, res) => {

    const certificados =
      readCertificados();

    const nuevos =
      certificados.filter(
        item =>
          item.id !== req.params.id
      );

    if (
      nuevos.length ===
      certificados.length
    ) {

      return res
        .status(404)
        .json({
          error:
            'Certificado no encontrado.'
        });

    }

    writeCertificados(nuevos);

    res.json({
      ok: true
    });
  }
);

/* =========================
   EGRESADOS POR CURSO
========================= */

app.get(
  '/api/curso/:slug',
  (req, res) => {

    const certificados =
      readCertificados()
        .filter(
          item =>
            item.curso_slug ===
            req.params.slug
        );

    res.json(certificados);
  }
);

/* =========================
   DIPLOMA
========================= */

app.get(
  '/diploma/:id',
  (req, res) => {

    res.sendFile(
      path.join(
        __dirname,
        'diploma.html'
      )
    );

  }
);

/* =========================
   VERIFICACIÓN QR
========================= */

app.get(
  '/verificar/:id',
  (req, res) => {

    res.sendFile(
      path.join(
        __dirname,
        'verificar.html'
      )
    );

  }
);

/* =========================
   INICIAR SERVIDOR
========================= */

app.listen(
  PORT,
  '0.0.0.0',
  () => {

    console.log(
      `Sistema de diplomas iniciado en puerto ${PORT}`
    );

  }
);
