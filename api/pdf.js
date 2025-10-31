/**
 * PDF Generator - Vercel Serverless Function
 * 
 * Esta función serverless genera PDFs desde HTML usando Puppeteer y chrome-aws-lambda.
 * Está optimizada para ejecutarse en el entorno de Vercel con CORS habilitado.
 */

const chromium = require('@sparticuz/chromium');
const puppeteer = require('puppeteer-core');

/**
 * Handler principal de la función serverless
 * @param {Object} req - Request object de Vercel
 * @param {Object} res - Response object de Vercel
 */
module.exports = async (req, res) => {
  console.log('📥 PDF Generator - Nueva solicitud recibida');
  console.log('   Método:', req.method);
  console.log('   Headers:', JSON.stringify(req.headers, null, 2));
  console.log('🌎 NODE_ENV:', process.env.NODE_ENV);
  console.log('🖥️ Platform:', process.platform);
  console.log('🕒 Timestamp:', new Date().toISOString());
  console.log('🔧 Vercel Region:', process.env.VERCEL_REGION);
  console.log('🔧 Vercel Env:', process.env.VERCEL_ENV);
  console.log('🔧 Vercel URL:', process.env.VERCEL_URL);

  // Configurar headers CORS para todas las respuestas
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Manejar preflight OPTIONS request para CORS
  if (req.method === 'OPTIONS') {
    console.log('✅ Preflight CORS request - Respondiendo con 200');
    return res.status(200).end();
  }

  // Validar que sea un POST request
  if (req.method !== 'POST') {
    console.log('❌ Método no permitido:', req.method);
    return res.status(405).json({
      error: 'Method Not Allowed',
      message: 'Este endpoint solo acepta POST requests',
      allowedMethods: ['POST', 'OPTIONS']
    });
  }

  let browser = null;

  try {
    console.log('🔬 Dependencias instaladas:');
    try {
      const chromePkg = require('chrome-aws-lambda/package.json');
      const puppeteerPkg = require('puppeteer-core/package.json');
      console.log('   chrome-aws-lambda:', chromePkg.version);
      console.log('   puppeteer-core:', puppeteerPkg.version);
    } catch (depErr) {
      console.error('⚠️ Error leyendo versiones de dependencias:', depErr);
    }
    // Extraer HTML del body
    console.log('📄 Extrayendo HTML del body...');
    const { html } = req.body;

    // Validar que el HTML exista y sea una cadena no vacía
    if (!html || typeof html !== 'string' || html.trim().length === 0) {
      console.log('❌ HTML inválido o vacío');
      return res.status(400).json({
        error: 'Bad Request',
        message: 'El campo "html" es requerido y debe ser una cadena no vacía',
        receivedType: typeof html,
        receivedLength: html ? html.length : 0
      });
    }

    console.log('✅ HTML recibido correctamente');
    console.log('   Longitud:', html.length, 'caracteres');
    console.log('   Preview:', html.substring(0, 100) + '...');

    // Lanzar navegador con @sparticuz/chromium
    console.log('🚀 Lanzando navegador Chromium...');
    let executablePath;
    try {
      executablePath = await chromium.executablePath();
      console.log('🔍 Path de Chromium:', executablePath);
    } catch (exPathErr) {
      console.error('❌ Error obteniendo path de Chromium:', exPathErr);
    }
    browser = await puppeteer.launch({
      args: [
        ...chromium.args,
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
      executablePath,
      headless: chromium.headless,
      ignoreHTTPSErrors: true
    });
    console.log('✅ Navegador lanzado exitosamente');

  // Crear nueva página
  console.log('📃 Creando nueva página...');
  const page = await browser.newPage();
  console.log('✅ Página creada');
  console.log('🧩 User-Agent:', await page.evaluate(() => navigator.userAgent));

    // Establecer el contenido HTML
    console.log('🖊️  Estableciendo contenido HTML...');
    try {
      await page.setContent(html, {
        waitUntil: 'networkidle0',
        timeout: 30000
      });
      console.log('✅ Contenido HTML establecido');
    } catch (setContentErr) {
      console.error('❌ Error al establecer contenido HTML:', setContentErr);
      throw setContentErr;
    }

    // Generar PDF
    console.log('🎨 Generando PDF...');
    let pdfBuffer;
    try {
      pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        preferCSSPageSize: true,
        margin: {
          top: '10mm',
          right: '10mm',
          bottom: '10mm',
          left: '10mm'
        }
      });
      console.log('✅ PDF generado exitosamente');
      console.log('   Tamaño:', pdfBuffer.length, 'bytes');
    } catch (pdfErr) {
      console.error('❌ Error al generar PDF:', pdfErr);
      throw pdfErr;
    }

    // Cerrar navegador
    await browser.close();
    browser = null;
    console.log('✅ Navegador cerrado');

    // Enviar respuesta con el PDF
    console.log('📤 Enviando PDF al cliente...');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="generated.pdf"');
    res.setHeader('Content-Length', pdfBuffer.length);
    
    return res.status(200).send(pdfBuffer);

  } catch (error) {
    // Logging detallado del error
    console.error('❌ ERROR CRÍTICO en generación de PDF:');
    console.error('   Mensaje:', error.message);
    console.error('   Stack:', error.stack);
    console.error('   Nombre:', error.name);
    console.error('❌ Error completo:', error);
    console.log('🔬 Estado de dependencias en error:');
    try {
      const chromePkg = require('chrome-aws-lambda/package.json');
      const puppeteerPkg = require('puppeteer-core/package.json');
      console.log('   chrome-aws-lambda:', chromePkg.version);
      console.log('   puppeteer-core:', puppeteerPkg.version);
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

  } finally {
    // Asegurar que el navegador se cierre en todos los casos
    if (browser !== null) {
      console.log('🧹 Limpieza final: cerrando navegador...');
      try {
        await browser.close();
        console.log('✅ Navegador cerrado en bloque finally');
      } catch (closeError) {
        console.error('❌ Error en limpieza final:', closeError.message);
      }
    }
    console.log('🏁 Solicitud completada\n');
  }
};
