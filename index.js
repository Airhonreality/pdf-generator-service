const express = require('express');
const puppeteer = require('puppeteer');

// Crear la aplicación del servidor
const app = express();

// Middleware para que nuestro servidor entienda peticiones JSON
app.use(express.json({ limit: '10mb' })); // Aumentamos el límite para HTMLs grandes

// --- Lógica para CORS (Control de Acceso) ---
// Esto es crucial para que tu App Script pueda llamar a este servicio
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// --- La Ruta Principal para Generar PDFs ---
// Escuchará en la raíz de nuestra URL en peticiones POST
app.post('/', async (req, res) => {
  try {
    // 1. Validar la entrada
    const htmlContent = req.body.html;
    if (!htmlContent) {
      return res.status(400).send('Error: El cuerpo de la petición debe contener una propiedad "html".');
    }

    // 2. Lanzar el navegador invisible
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();

    // 3. Establecer el contenido y generar el PDF
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });

    // 4. Cerrar el navegador
    await browser.close();

    // 5. Enviar el PDF de vuelta
    res.setHeader('Content-Type', 'application/pdf');
    res.status(200).send(pdfBuffer);

  } catch (error) {
    console.error('Error al generar el PDF:', error);
    res.status(500).send(`Error interno del servidor: ${error.message}`);
  }
});

// --- Iniciar el Servidor ---
// Render nos dará un puerto a través de una variable de entorno.
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor de PDF escuchando en el puerto ${PORT}`);
});