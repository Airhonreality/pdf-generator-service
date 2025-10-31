/**
 * Endpoint de diagnóstico avanzado para Vercel PDF Generator
 * Devuelve información ultra-detallada del entorno, binarios, dependencias y paths
 */

const chromium = require('@sparticuz/chromium');
const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
  const logs = [];
  function log(msg, type = 'info') {
    logs.push({ ts: new Date().toISOString(), type, msg });
  }

  log('🔬 Diagnóstico iniciado');
  log('🌎 NODE_ENV: ' + process.env.NODE_ENV);
  log('🖥️ Platform: ' + process.platform);
  log('🟢 process.version: ' + process.version);
  log('🟢 process.versions.node: ' + process.versions.node);
  log('🟢 process.memoryUsage: ' + JSON.stringify(process.memoryUsage()));
  log('🔧 Vercel Region: ' + process.env.VERCEL_REGION);
  log('🔧 Vercel Env: ' + process.env.VERCEL_ENV);
  log('🔧 Vercel URL: ' + process.env.VERCEL_URL);

  // Dependencias
  try {
    const chromiumPkg = require('@sparticuz/chromium/package.json');
    log('   @sparticuz/chromium: ' + chromiumPkg.version);
  } catch (depErr) {
    log('⚠️ Error leyendo versión de @sparticuz/chromium: ' + depErr, 'error');
  }
  try {
    const puppeteerPkg = require('puppeteer-core/package.json');
    log('   puppeteer-core: ' + puppeteerPkg.version);
  } catch (depErr) {
    log('⚠️ Error leyendo versión de puppeteer-core: ' + depErr, 'error');
  }

  // Path de Chromium
  let executablePath = null;
  try {
    executablePath = await chromium.executablePath();
    log('🔍 Path de Chromium: ' + executablePath);
    log('🔍 chromium.args: ' + JSON.stringify(chromium.args));
    log('🔍 chromium.headless: ' + chromium.headless);
    if (!executablePath) {
      log('❌ El path de Chromium está vacío o indefinido.', 'error');
    } else {
      // Validar si el archivo existe
      try {
        const exists = fs.existsSync(executablePath);
        log('🔎 ¿Existe el binario en ese path?: ' + exists);
        if (!exists) {
          const dir = path.dirname(executablePath);
          log('📁 Listando contenido del directorio: ' + dir);
          try {
            const files = fs.readdirSync(dir);
            log('📄 Archivos en el directorio: ' + JSON.stringify(files));
          } catch (dirErr) {
            log('❌ Error al leer el directorio: ' + dirErr, 'error');
          }
        }
      } catch (fsErr) {
        log('❌ Error al validar existencia del binario: ' + fsErr, 'error');
      }
    }
  } catch (exPathErr) {
    log('❌ Error obteniendo o validando path de Chromium: ' + exPathErr, 'error');
  }

  // Variables de entorno relevantes
  log('🔑 process.env.PATH: ' + process.env.PATH);
  log('🔑 process.env.HOME: ' + process.env.HOME);
  log('🔑 process.env.TMPDIR: ' + process.env.TMPDIR);

  // Intentar lanzar Puppeteer (solo diagnóstico, sin PDF)
  let puppeteerLaunchError = null;
  try {
    const puppeteer = require('puppeteer-core');
    await puppeteer.launch({
      args: chromium.args,
      executablePath,
      headless: chromium.headless,
      ignoreHTTPSErrors: true
    });
    log('✅ Puppeteer lanzó Chromium exitosamente.');
  } catch (err) {
    puppeteerLaunchError = err;
    log('❌ Error al lanzar Puppeteer: ' + err, 'error');
  }

  // Respuesta
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  return res.status(200).json({
    logs,
    puppeteerLaunchError: puppeteerLaunchError ? String(puppeteerLaunchError) : null,
    timestamp: new Date().toISOString()
  });
};
