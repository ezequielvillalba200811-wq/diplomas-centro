# Sistema de Diplomas - Centro Constitución

Sistema separado de la web principal.

## Qué hace
- Carga alumno, curso, profesor, director y fecha.
- Fecha automática desde el panel.
- Genera un código único.
- Genera QR automático.
- Guarda los certificados.
- Página pública de verificación.
- Muestra egresados del mismo curso.
- Diploma listo para imprimir o guardar en PDF A4 horizontal.
- Usa como plantilla el diploma enviado.

## Ejecutar
1. Instalá Node.js 20 o superior.
2. Abrí una terminal dentro de esta carpeta.
3. Ejecutá:

   npm install
   npm start

4. Abrí http://localhost:3000

## Para subirlo a Render
- Build command: npm install
- Start command: npm start
- Variable opcional:
  PUBLIC_URL=https://TU-DOMINIO.onrender.com

IMPORTANTE:
Esta primera versión guarda los datos en `data/certificados.json`.
Para uso definitivo en internet conviene conectar Supabase, porque Render puede reiniciar/eliminar almacenamiento local.

## Impresión
Abrí "Ver / imprimir" y tocá "Imprimir / Guardar PDF".
Elegí:
- Papel A4
- Horizontal
- Márgenes: ninguno
- Escala: 100 %
- Gráficos de fondo: activados