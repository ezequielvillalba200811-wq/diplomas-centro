<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">

<title>Diploma - Centro Constitución</title>

<style>
* {
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
}

body {
  background: #ddd;
  font-family: Arial, sans-serif;
}

.toolbar {
  background: #111;
  padding: 12px;
  text-align: center;
}

.toolbar button {
  border: 0;
  border-radius: 8px;
  padding: 11px 20px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
}

.wrapper {
  width: 100%;
  overflow-x: auto;
  padding: 15px 0;
}

.sheet {
  position: relative;

  width: 1123px;
  height: 794px;

  margin: 0 auto;

  background-image: url('/template-diploma.jpeg');
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;

  overflow: hidden;
}

/* NOMBRE DEL ALUMNO */

.student {
  position: absolute;

  top: 345px;
  left: 190px;

  width: 743px;

  text-align: center;

  font-size: 37px;
  line-height: 1;

  font-weight: 800;
  text-transform: uppercase;
}

/* CURSO */

.course {
  position: absolute;

  top: 555px;
  left: 175px;

  width: 773px;

  text-align: center;

  font-size: 32px;
  line-height: 1.05;

  font-weight: 900;
  text-transform: uppercase;
}

/* FECHA */

.citydate {
  position: absolute;

  top: 635px;
  left: 245px;

  width: 635px;

  text-align: center;

  font-size: 22px;

  font-weight: 700;
  font-style: italic;
}

/* PROFESORA */

.professor {
  position: absolute;

  left: 100px;
  top: 694px;

  width: 270px;

  text-align: center;

  font-size: 23px;
  font-weight: 700;
}

/* DIRECTOR */

.director {
  position: absolute;

  right: 100px;
  top: 694px;

  width: 270px;

  text-align: center;

  font-size: 23px;
  font-weight: 700;
}

/* QR */

.qr {
  position: absolute;

  right: 53px;
  top: 43px;

  width: 145px;
  height: 145px;

  background: white;
}

.qr img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* CÓDIGO */

.code {
  position: absolute;

  bottom: 17px;
  left: 411px;

  width: 300px;

  text-align: center;

  font-size: 13px;
  color: #444;
}


/* IMPRESIÓN */

@page {
  size: A4 landscape;
  margin: 0;
}

@media print {

  body {
    background: white;
  }

  .toolbar {
    display: none;
  }

  .wrapper {
    padding: 0;
    overflow: visible;
  }

  .sheet {
    width: 297mm;
    height: 210mm;
    margin: 0;
  }
}

</style>
</head>

<body>

<div class="toolbar">

  <button onclick="window.print()">
    Imprimir / Guardar PDF
  </button>

</div>

<div class="wrapper">

  <div class="sheet">

    <div
      class="student"
      id="student">
    </div>

    <div
      class="course"
      id="course">
    </div>

    <div
      class="citydate"
      id="citydate">
    </div>

    <div
      class="professor"
      id="professor">
    </div>

    <div
      class="director"
      id="director">
    </div>

    <div class="qr">

      <img
        id="qr"
        alt="Código QR">

    </div>

    <div
      class="code"
      id="code">
    </div>

  </div>

</div>


<script>

(async () => {

  const id =
    location.pathname
      .split('/')
      .pop();

  const response =
    await fetch(
      '/api/certificados/' + id
    );

  const certificado =
    await response.json();

  if (!response.ok) {

    document.body.innerHTML =
      '<h1 style="text-align:center">Diploma no encontrado</h1>';

    return;
  }


  /* ALUMNO */

  document
    .getElementById('student')
    .textContent =
      certificado.alumno;


  /* CURSO */

  document
    .getElementById('course')
    .textContent =
      certificado.curso;


  /* FECHA */

  const partes =
    certificado.fecha
      .split('-')
      .map(Number);

  const fecha =
    new Date(
      partes[0],
      partes[1] - 1,
      partes[2]
    );

  const dia =
    String(
      fecha.getDate()
    ).padStart(2, '0');

  const mes =
    fecha.toLocaleDateString(
      'es-AR',
      {
        month: 'long'
      }
    );

  const anio =
    fecha.getFullYear();

  document
    .getElementById('citydate')
    .textContent =
      `${dia} de ${mes} de ${anio}`;


  /* PROFESORA */

  document
    .getElementById('professor')
    .textContent =
      certificado.profesor;


  /* DIRECTOR */

  document
    .getElementById('director')
    .textContent =
      certificado.director;


  /* QR */

  document
    .getElementById('qr')
    .src =
      certificado.qr;


  /* CÓDIGO */

  document
    .getElementById('code')
    .textContent =
      certificado.codigo;

})();

</script>

</body>
</html>
