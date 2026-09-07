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

const PUBLIC_URL = (
  process.env.PUBLIC_URL ||
  `http://localhost:${PORT}`
).replace(/\/$/, '');

const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'certificados.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, '[]', 'utf8');
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

function leerCertificados() {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data || '[]');
  } catch {
    return [];
  }
}

function guardarCertificados(data) {
  fs.writeFileSync(
    DATA_FILE,
    JSON.stringify(data, null, 2),
    'utf8'
  );
}

function escapeHtml(text = '') {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />

      <title>Centro Constitución - Diplomas</title>

      <style>
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          font-family: Arial, Helvetica, sans-serif;
          background: #f2f2f2;
          color: #111;
        }

        .contenedor {
          max-width: 900px;
          margin: 30px auto;
          padding: 20px;
        }

        .panel {
          background: white;
          border-radius: 14px;
          padding: 24px;
          box-shadow: 0 4px 18px rgba(0,0,0,.12);
        }

        h1 {
          margin-top: 0;
          text-align: center;
        }

        .grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .campo {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        label {
          font-weight: bold;
        }

        input,
        select {
          padding: 12px;
          border-radius: 8px;
          border: 1px solid #bbb;
          font-size: 16px;
          background: white;
        }

        button {
          width: 100%;
          margin-top: 20px;
          padding: 14px;
          border: 0;
          border-radius: 9px;
          font-size: 17px;
          font-weight: bold;
          cursor: pointer;
          background: #111;
          color: white;
        }

        .ayuda {
          margin-top: 12px;
          font-size: 14px;
          color: #666;
          text-align: center;
        }

        @media (max-width: 700px) {
          .grid {
            grid-template-columns: 1fr;
          }
        }
      </style>
    </head>

    <body>

      <div class="contenedor">

        <div class="panel">

          <h1>Crear certificado</h1>

          <form method="POST" action="/crear">

            <div class="grid">

              <div class="campo">
                <label>Nombre del alumno</label>

                <input
                  name="alumno"
                  placeholder="Ej: Juan Pérez"
                  required
                />
              </div>

              <div class="campo">
                <label>Curso</label>

                <input
                  name="curso"
                  placeholder="Ej: Barbería Nivel Inicial"
                  required
                />
              </div>

              <div class="campo">
                <label>Fecha</label>

                <input
                  name="fecha"
                  placeholder="Ej: 7 de septiembre de 2026"
                  required
                />
              </div>

              <div class="campo">
                <label>Nombre del profesor/a</label>

                <input
                  name="docente"
                  value="María Acosta"
                  placeholder="Ej: María Acosta"
                  required
                />
              </div>

              <div class="campo">
                <label>Profesor o Profesora</label>

                <select name="cargoDocente" required>
                  <option value="Profesora">
                    Profesora
                  </option>

                  <option value="Profesor">
                    Profesor
                  </option>
                </select>
              </div>

              <div class="campo">
                <label>Director</label>

                <input
                  name="director"
                  value="Derlis Villalba"
                  placeholder="Ej: Derlis Villalba"
                  required
                />
              </div>

            </div>

            <button type="submit">
              Generar certificado
            </button>

          </form>

          <div class="ayuda">
            El certificado tendrá un QR único para verificar su autenticidad.
          </div>

        </div>

      </div>

    </body>
    </html>
  `);
});

app.post('/crear', async (req, res) => {
  try {
    const {
      alumno,
      curso,
      fecha,
      docente,
      cargoDocente,
      director
    } = req.body;

    const id = crypto.randomUUID();

    const certificado = {
      id,
      alumno,
      curso,
      fecha,
      docente,
      cargoDocente,
      director,
      creado: new Date().toISOString()
    };

    const certificados = leerCertificados();

    certificados.push(certificado);

    guardarCertificados(certificados);

    const urlVerificacion =
      `${PUBLIC_URL}/verificar/${id}`;

    const qr = await QRCode.toDataURL(
      urlVerificacion,
      {
        width: 300,
        margin: 1
      }
    );

res.send(`
  <!DOCTYPE html>
  <html lang="es">

  <head>

    <meta charset="UTF-8" />

    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0"
    />

    <title>Certificado</title>

    <style>

      * {
        box-sizing: border-box;
      }

      html,
      body {
        margin: 0;
        padding: 0;

        background: #ddd;

        font-family:
          Arial,
          Helvetica,
          sans-serif;
      }

      .acciones {
        max-width: 1120px;

        margin: 15px auto;

        display: flex;

        gap: 10px;

        padding: 0 10px;
      }

      .acciones button,
      .acciones a {
        flex: 1;

        padding: 12px;

        text-align: center;

        border: 0;

        border-radius: 8px;

        background: #111;

        color: white;

        text-decoration: none;

        font-family:
          Arial,
          sans-serif;

        font-weight: bold;

        cursor: pointer;
      }

      .vista {
        width: 100%;
        overflow-x: auto;
      }

      .certificado {
        position: relative;

        width: 297mm;
        height: 210mm;

        margin: 0 auto 30px;

        background-color: white;

        background-image:
          url("/fondo-certificado.png");

        background-size: 100% 100%;
        background-repeat: no-repeat;
        background-position: center;

        overflow: hidden;
      }

      /* =========================
         ALUMNO
      ========================== */

      .alumno {
        position: absolute;

        top: 39.5%;
        left: 7%;

        width: 86%;

        text-align: center;

        font-size: 10mm;
        font-weight: 900;

        text-transform: uppercase;

        line-height: 1.05;
      }

      /* =========================
         CURSO
      ========================== */

      .curso {
        position: absolute;

        top: 62%;
        left: 5%;

        width: 90%;

        text-align: center;

        font-size: 8.5mm;
        font-weight: 900;

        text-transform: uppercase;

        line-height: 1.05;
      }

      /* =========================
         FECHA
         SOLO LA FECHA
      ========================== */

      .fecha {
        position: absolute;

        top: 72.5%;
        left: 44%;

        width: 42%;

        text-align: center;

        font-size: 5.5mm;
        font-weight: 700;

        white-space: nowrap;

        background: white;
      }

      /* =========================
         DOCENTE
         SIN CREAR LINEA NUEVA
      ========================== */

      .firma-docente {
        position: absolute;

        bottom: 8.5%;
        left: 5%;

        width: 34%;

        text-align: center;
      }

      .texto-firma {
        display: inline-block;

        font-size: 5.5mm;
        font-weight: 700;

        white-space: nowrap;

        background: white;

        padding: 1mm 2mm;
      }

      /* =========================
         QR ARRIBA DERECHA
      ========================== */

      .qr {
        position: absolute;

        top: 5%;
        right: 4%;

        width: 27mm;
        height: 27mm;

        background: white;

        padding: 2mm;

        z-index: 20;
      }

      .qr img {
        display: block;

        width: 100%;
        height: 100%;

        object-fit: contain;
      }

      @page {
        size: A4 landscape;
        margin: 0;
      }

      @media print {

        html,
        body {
          width: 297mm;
          height: 210mm;

          margin: 0;
          padding: 0;

          background: white;
        }

        .acciones {
          display: none !important;
        }

        .vista {
          width: 297mm;
          height: 210mm;

          overflow: hidden;
        }

        .certificado {
          width: 297mm;
          height: 210mm;

          margin: 0;

          page-break-inside: avoid;
          page-break-after: avoid;

          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

      }

    </style>

  </head>

  <body>

    <div class="acciones">

      <a href="/">
        Crear otro
      </a>

      <button onclick="window.print()">
        Imprimir / Guardar PDF
      </button>

    </div>

    <div class="vista">

      <div class="certificado">

        <!-- QR ARRIBA DERECHA -->

        <div class="qr">

          <img
            src="${qr}"
            alt="QR de verificación"
          />

        </div>

        <!-- ALUMNO -->

        <div class="alumno">
          ${escapeHtml(alumno)}
        </div>

        <!-- CURSO -->

        <div class="curso">
          ${escapeHtml(curso)}
        </div>

        <!-- FECHA -->

        <div class="fecha">
          ${escapeHtml(fecha)}
        </div>

        <!-- DOCENTE -->

        <div class="firma-docente">

          <div class="texto-firma">

            ${escapeHtml(docente)}:
            ${escapeHtml(cargoDocente)}

          </div>

        </div>

      </div>

    </div>

  </body>

  </html>
`);

  } catch (error) {

    console.error(error);

    res.status(500).send(`
      <h2>Error al generar el certificado</h2>

      <p>
        ${escapeHtml(error.message)}
      </p>

      <a href="/">
        Volver
      </a>
    `);

  }
});

app.get('/verificar/:id', (req, res) => {

  const certificados =
    leerCertificados();

  const certificado =
    certificados.find(
      item =>
        item.id === req.params.id
    );

  if (!certificado) {

    return res.status(404).send(`
      <!DOCTYPE html>

      <html lang="es">

      <head>

        <meta charset="UTF-8">

        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        >

        <title>
          Certificado no encontrado
        </title>

      </head>

      <body
        style="
          font-family: Arial;
          text-align: center;
          padding: 40px;
        "
      >

        <h1>
          ❌ Certificado no válido
        </h1>

        <p>
          No encontramos este certificado
          en nuestros registros.
        </p>

      </body>

      </html>
    `);

  }

  res.send(`
    <!DOCTYPE html>

    <html lang="es">

    <head>

      <meta charset="UTF-8" />

      <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
      />

      <title>
        Verificación de certificado
      </title>

      <style>

        body {
          margin: 0;

          padding: 20px;

          font-family:
            Arial,
            Helvetica,
            sans-serif;

          background: #f2f2f2;
        }

        .tarjeta {
          max-width: 600px;

          margin: 40px auto;

          background: white;

          border-radius: 16px;

          padding: 30px;

          box-shadow:
            0 5px 20px
            rgba(0,0,0,.12);
        }

        h1 {
          color: #15803d;
        }

        .dato {
          margin: 15px 0;

          padding-bottom: 10px;

          border-bottom:
            1px solid #ddd;
        }

        .dato strong {
          display: block;

          margin-bottom: 4px;
        }

      </style>

    </head>

    <body>

      <div class="tarjeta">

        <h1>
          ✓ Certificado válido
        </h1>

        <p>
          Este certificado fue emitido por
          <strong>
            Centro Constitución
          </strong>.
        </p>

        <div class="dato">

          <strong>
            Alumno
          </strong>

          ${escapeHtml(certificado.alumno)}

        </div>

        <div class="dato">

          <strong>
            Curso
          </strong>

          ${escapeHtml(certificado.curso)}

        </div>

        <div class="dato">

          <strong>
            Fecha
          </strong>

          ${escapeHtml(certificado.fecha)}

        </div>

        <div class="dato">

          <strong>
            Docente
          </strong>

          ${escapeHtml(certificado.docente)}
          —
          ${escapeHtml(certificado.cargoDocente)}

        </div>

        <div class="dato">

          <strong>
            Director
          </strong>

          ${escapeHtml(certificado.director)}

        </div>

        <div class="dato">

          <strong>
            ID de certificado
          </strong>

          ${escapeHtml(certificado.id)}

        </div>

      </div>

    </body>

    </html>
  `);

});

app.listen(PORT, () => {

  console.log(
    `Servidor iniciado en puerto ${PORT}`
  );

});
