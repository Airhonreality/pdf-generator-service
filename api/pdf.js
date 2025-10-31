/**
 * PDF Generator - Vercel Serverless Function
 * Genera PDFs desde HTML usando Playwright.
 * Optimizada para Vercel con CORS y manejo robusto de errores.
 */
const { chromium } = require('playwright');

module.exports = async (req, res) => {
  // CORS y OPTIONS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method Not Allowed',
      message: 'Este endpoint solo acepta POST requests',
      allowedMethods: ['POST', 'OPTIONS']
    });
  }

  let browser = null;
  try {
    // Validación robusta del body
    const html = req.body && typeof req.body.html === 'string' && req.body.html.trim().length > 0
      ? req.body.html
      : '<h1>PDF de prueba Playwright</h1><p>HTML no recibido o vacío.</p>';
    console.log('📥 Solicitud recibida para PDF');
    console.log('   Método:', req.method);
    console.log('   Longitud HTML:', html.length);
    console.log('   Preview HTML:', html.substring(0, 100));

    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle' });
    console.log('✅ Contenido HTML establecido en la página');
    const pdfOptions = {
      format: 'A4',
      printBackground: true,
      margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' }
    };
    const pdfBuffer = await page.pdf(pdfOptions);
    console.log('✅ PDF generado. Tamaño:', pdfBuffer.length, 'bytes');
    await browser.close();
    browser = null;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="playwright.pdf"');
    res.setHeader('Content-Length', pdfBuffer.length);
    return res.status(200).send(pdfBuffer);
  } catch (error) {
    console.error('❌ Error al generar PDF:', error);
    if (browser !== null) {
      try { await browser.close(); } catch (closeErr) { console.error('❌ Error al cerrar navegador:', closeErr); }
    }
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Error al generar el PDF con Playwright',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
  }
  console.error('   Stack:', error.stack);
  console.error('   Nombre:', error.name);
  console.error('❌ Error completo:', error);
  console.error('❌ Error JSON:', JSON.stringify(error, null, 2));
  console.log('🟢 process.version:', process.version);
  console.log('🟢 process.versions.node:', process.versions.node);
  console.log('🟢 process.memoryUsage:', process.memoryUsage());
    console.log('🔬 Estado de dependencias en error:');
    try {
    } catch (depErr) {
      console.error('⚠️ Error leyendo versiones de dependencias:', depErr);
    }

    // Cerrar navegador si quedó abierto
    if (browser !== null) {
      console.log('🧹 Cerrando navegador en bloque de error...');
      try {
        await browser.close();
        console.log('✅ Navegador cerrado después de error');
      } catch (closeError) {
        console.error('❌ Error al cerrar navegador:', closeError.message);
      }
    }

    // Retornar error en formato JSON
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Error al generar el PDF',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });

};
