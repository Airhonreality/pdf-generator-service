# PDF Generator - Vercel Serverless Function

Generador de PDFs serverless que convierte HTML a PDF usando Puppeteer y chrome-aws-lambda, desplegado en Vercel con soporte completo para CORS.

## ✨ Características

- **Generación de PDF desde HTML** usando Puppeteer con Chromium headless
- **Chromium preinstalado** mediante chrome-aws-lambda (optimizado para AWS Lambda y Vercel)
- **Serverless deployment** en Vercel con escalado automático
- **CORS habilitado** para permitir llamadas desde Google Apps Script y otras aplicaciones
- **Logging detallado** para debugging y monitoreo
- **Error handling robusto** con mensajes claros y descriptivos
- **Zero configuration** - listo para desplegar sin configuración adicional

## 📋 Requisitos

- **Node.js** >= 14.x
- **Cuenta en Vercel** (plan gratuito disponible)
- **Cuenta en GitHub** (para deployment automático)
- **Git** instalado localmente

## 🚀 Instalación Local

```bash
# Clonar el repositorio (o descargar los archivos)
cd pdf-generator-function

# Instalar dependencias
npm install
```

## 📁 Estructura del Proyecto

```
pdf-generator-function/
├── api/
│   └── pdf.js          # Función serverless principal
├── package.json        # Dependencias y configuración del proyecto
├── vercel.json         # Configuración de Vercel (routing, memory, timeout)
├── .gitignore          # Archivos a ignorar en Git
└── README.md           # Este archivo
```

### Descripción de archivos clave:

- **`api/pdf.js`**: Handler principal que recibe HTML, genera el PDF con Puppeteer y lo retorna como binario
- **`package.json`**: Define las dependencias exactas (chrome-aws-lambda 10.1.0 y puppeteer-core 10.4.0)
- **`vercel.json`**: Configura el runtime de Node.js, memoria (1024 MB) y timeout (10 segundos en plan gratuito)

## 🌐 API Endpoint

### **POST** `/api/pdf`

Genera un PDF a partir de HTML.

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "html": "<h1>Tu contenido HTML aquí</h1>"
}
```

**Response:**
- **Content-Type**: `application/pdf`
- **Content-Disposition**: `attachment; filename="generated.pdf"`
- **Body**: PDF binario

**Códigos de estado:**
- `200`: PDF generado exitosamente
- `400`: Bad Request (HTML inválido o vacío)
- `405`: Method Not Allowed (solo POST/OPTIONS permitidos)
- `500`: Internal Server Error (error en generación de PDF)

## 💡 Ejemplo de Uso con curl

```bash
# Generar un PDF simple
curl -X POST https://tu-proyecto.vercel.app/api/pdf \
  -H "Content-Type: application/json" \
  -d '{"html":"<html><body><h1>Test PDF</h1><p>Este es un documento de prueba.</p></body></html>"}' \
  --output test.pdf

# Generar PDF con estilos CSS
curl -X POST https://tu-proyecto.vercel.app/api/pdf \
  -H "Content-Type: application/json" \
  -d '{"html":"<html><head><style>body{font-family:Arial;padding:20px;}h1{color:#2563eb;}</style></head><body><h1>Título Estilizado</h1><p>Contenido con estilos.</p></body></html>"}' \
  --output styled.pdf
```

## 📱 Ejemplo de Uso desde Google Apps Script

```javascript
/**
 * Función de prueba para el generador de PDF en Vercel
 * 
 * INSTRUCCIONES:
 * 1. Reemplaza VERCEL_URL con tu URL de Vercel (ej: https://tu-proyecto.vercel.app)
 * 2. Ejecuta esta función desde el editor de Apps Script
 * 3. Autoriza los permisos cuando se te solicite
 * 4. Revisa tu Google Drive para encontrar el PDF generado
 */
function testVercelPdfGenerator() {
  // URL de tu función desplegada en Vercel
  const VERCEL_URL = 'https://tu-proyecto.vercel.app/api/pdf';
  
  // HTML de ejemplo con estilos inline
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: 'Arial', sans-serif;
            padding: 40px;
            color: #333;
          }
          h1 {
            color: #2563eb;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 10px;
          }
          .info-box {
            background-color: #f0f9ff;
            border-left: 4px solid #2563eb;
            padding: 15px;
            margin: 20px 0;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ccc;
            font-size: 12px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <h1>PDF Generado desde Google Apps Script</h1>
        
        <div class="info-box">
          <p><strong>Fecha de generación:</strong> ${new Date().toLocaleString('es-ES')}</p>
          <p><strong>Sistema:</strong> Google Apps Script + Vercel Serverless</p>
        </div>
        
        <h2>Características del Sistema</h2>
        <ul>
          <li>Generación serverless con Puppeteer</li>
          <li>Chromium preinstalado (chrome-aws-lambda)</li>
          <li>Escalado automático en Vercel</li>
          <li>CORS habilitado para Apps Script</li>
        </ul>
        
        <h2>Ventajas</h2>
        <ol>
          <li><strong>Zero maintenance:</strong> No hay servidores que mantener</li>
          <li><strong>Alta disponibilidad:</strong> 99.99% uptime garantizado</li>
          <li><strong>Escalabilidad:</strong> Maneja múltiples requests simultáneos</li>
          <li><strong>Bajo costo:</strong> Plan gratuito incluye 100 GB/mes</li>
        </ol>
        
        <div class="footer">
          <p>PDF Generator v1.0.0 | Generado con Vercel Serverless Functions</p>
        </div>
      </body>
    </html>
  `;

  try {
    Logger.log('🚀 Iniciando generación de PDF...');
    Logger.log('📍 URL: ' + VERCEL_URL);
    
    // Realizar la solicitud POST al endpoint de Vercel
    const response = UrlFetchApp.fetch(VERCEL_URL, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify({ html: htmlContent }),
      muteHttpExceptions: true  // Para capturar errores HTTP
    });
    
    // Verificar el código de respuesta
    const responseCode = response.getResponseCode();
    Logger.log('📊 Código de respuesta: ' + responseCode);
    
    if (responseCode !== 200) {
      // Si no es 200, mostrar el error
      const errorText = response.getContentText();
      Logger.log('❌ Error del servidor:');
      Logger.log(errorText);
      throw new Error('Error HTTP ' + responseCode + ': ' + errorText);
    }
    
    // Obtener el PDF como blob
    const pdfBlob = response.getBlob();
    Logger.log('✅ PDF recibido correctamente');
    Logger.log('📦 Tamaño: ' + pdfBlob.getBytes().length + ' bytes');
    
    // Configurar nombre del archivo
    const fileName = 'PDF_Generado_' + new Date().getTime() + '.pdf';
    pdfBlob.setName(fileName);
    
    // Guardar en Google Drive
    const file = DriveApp.createFile(pdfBlob);
    Logger.log('💾 PDF guardado en Google Drive');
    Logger.log('📄 Nombre: ' + fileName);
    Logger.log('🔗 URL: ' + file.getUrl());
    
    // Retornar información del archivo
    return {
      success: true,
      fileId: file.getId(),
      fileName: fileName,
      fileUrl: file.getUrl(),
      fileSize: pdfBlob.getBytes().length,
      message: 'PDF generado y guardado exitosamente'
    };
    
  } catch (error) {
    Logger.log('❌ ERROR: ' + error.message);
    Logger.log('📋 Stack: ' + error.stack);
    
    return {
      success: false,
      error: error.message,
      message: 'Error al generar el PDF'
    };
  }
}

/**
 * Función para generar PDF desde una plantilla personalizada
 * 
 * @param {string} htmlTemplate - HTML personalizado para convertir a PDF
 * @param {string} fileName - Nombre del archivo PDF (opcional)
 * @returns {Object} Información del archivo generado
 */
function generateCustomPDF(htmlTemplate, fileName) {
  const VERCEL_URL = 'https://tu-proyecto.vercel.app/api/pdf';
  
  fileName = fileName || 'Custom_PDF_' + new Date().getTime() + '.pdf';
  
  try {
    const response = UrlFetchApp.fetch(VERCEL_URL, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify({ html: htmlTemplate }),
      muteHttpExceptions: true
    });
    
    if (response.getResponseCode() !== 200) {
      throw new Error('Error HTTP ' + response.getResponseCode());
    }
    
    const pdfBlob = response.getBlob();
    pdfBlob.setName(fileName);
    
    const file = DriveApp.createFile(pdfBlob);
    
    return {
      success: true,
      fileId: file.getId(),
      fileName: fileName,
      fileUrl: file.getUrl()
    };
    
  } catch (error) {
    Logger.log('Error: ' + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}
```

## 🚢 Deployment en Vercel

### Opción 1: Deployment desde GitHub (Recomendado)

```bash
# 1. Inicializar repositorio Git
git init
git add .
git commit -m "Initial commit: PDF Generator serverless function"

# 2. Crear repositorio en GitHub
# Ve a https://github.com/new y crea un nuevo repositorio

# 3. Conectar con GitHub
git remote add origin https://github.com/tu-usuario/pdf-generator-vercel.git
git branch -M main
git push -u origin main

# 4. Deployment en Vercel
# - Ve a https://vercel.com/new
# - Haz clic en "Import Git Repository"
# - Selecciona tu repositorio de GitHub
# - Haz clic en "Deploy"
# - ¡Listo! Vercel detectará automáticamente la configuración
```

### Opción 2: Deployment con Vercel CLI

```bash
# 1. Instalar Vercel CLI
npm install -g vercel

# 2. Login en Vercel
vercel login

# 3. Deploy
vercel --prod
```

Después del deployment, Vercel te dará una URL como:
```
https://pdf-generator-vercel.vercel.app
```

Tu endpoint será:
```
https://pdf-generator-vercel.vercel.app/api/pdf
```

## ⚙️ Configuración en Orbital Core (Google Apps Script)

Una vez desplegado en Vercel, configura la URL en tu proyecto de Google Apps Script:

```javascript
// En tu archivo de configuración o al inicio de tu script
const PDF_GENERATOR_FUNCTION_URL = 'https://tu-proyecto.vercel.app/api/pdf';

// Usar en tu función
function generarPDF(htmlContent) {
  const response = UrlFetchApp.fetch(PDF_GENERATOR_FUNCTION_URL, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({ html: htmlContent })
  });
  
  return response.getBlob();
}
```

**Importante:** Asegúrate de usar la URL completa con `/api/pdf` al final.

## 🔧 Troubleshooting

### Problema: "Timeout after 10 seconds"
**Causa:** El HTML es muy complejo o carga recursos externos lentos.

**Soluciones:**
- Optimiza el HTML (reduce imágenes, simplifica CSS)
- Convierte imágenes a base64 e incorpóralas inline
- Considera upgrade a Vercel Pro (timeout de 60 segundos)
- Usa `waitUntil: 'domcontentloaded'` en lugar de `'networkidle0'`

### Problema: "PDF en blanco o incompleto"
**Causa:** CSS externo o fuentes no cargadas correctamente.

**Soluciones:**
- Usa CSS inline en lugar de hojas de estilo externas
- Convierte fuentes web a base64 con `@font-face`
- Usa fuentes del sistema (Arial, Times New Roman, etc.)
- Agrega `printBackground: true` en las opciones de PDF

### Problema: "Module not found: chrome-aws-lambda"
**Causa:** Dependencias no instaladas o no sincronizadas con Vercel.

**Soluciones:**
```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install

# Commit y push
git add .
git commit -m "Fix dependencies"
git push
```

### Problema: "502 Bad Gateway"
**Causa:** Error en la función o memoria insuficiente.

**Soluciones:**
- Revisa los logs en Vercel Dashboard
- Aumenta la memoria en `vercel.json` (máx 1024 MB en plan gratuito)
- Simplifica el HTML para reducir uso de memoria

### Problema: "CORS Error" desde Apps Script
**Causa:** Headers CORS no configurados correctamente.

**Solución:**
- Verifica que el endpoint incluya los headers CORS (ya incluidos en `api/pdf.js`)
- Asegúrate de usar HTTPS en la URL
- Verifica que no haya proxy o firewall bloqueando la solicitud

## 📊 Limitaciones

### Vercel Free Tier:
- **Bandwidth:** 100 GB/mes
- **Timeout:** 10 segundos por request
- **Memoria:** 1 GB máximo
- **Deployments:** Ilimitados
- **Concurrent executions:** 1000 máximo

### Vercel Pro Tier ($20/mes):
- **Bandwidth:** 1 TB/mes
- **Timeout:** 60 segundos por request
- **Memoria:** 3 GB máximo
- **Priority support**

### Recomendaciones:
- Para documentos simples, el plan gratuito es suficiente
- Si generas PDFs complejos con muchas imágenes, considera el plan Pro
- Monitorea el uso en el Vercel Dashboard para evitar sorpresas

## 🧪 Testing Local

Para probar la función localmente con Vercel CLI:

```bash
# Instalar Vercel CLI
npm install -g vercel

# Iniciar servidor de desarrollo
vercel dev

# La función estará disponible en:
# http://localhost:3000/api/pdf
```

Probar con curl:
```bash
curl -X POST http://localhost:3000/api/pdf \
  -H "Content-Type: application/json" \
  -d '{"html":"<h1>Test Local</h1>"}' \
  --output test-local.pdf
```

## 📝 Logging y Monitoreo

Los logs están disponibles en el Vercel Dashboard:
1. Ve a tu proyecto en https://vercel.com
2. Haz clic en la pestaña "Deployments"
3. Selecciona un deployment
4. Haz clic en "Functions" para ver los logs en tiempo real

Los logs incluyen:
- ✅ Solicitudes recibidas (método, headers)
- 📄 HTML recibido (preview)
- 🚀 Estado del navegador Chromium
- 🎨 Generación de PDF (tamaño)
- ❌ Errores detallados con stack trace

## 🔐 Seguridad

### Recomendaciones:
- **No expongas datos sensibles** en los logs (elimina datos personales del HTML)
- **Valida el HTML** antes de enviarlo (sanitiza entrada del usuario)
- **Usa HTTPS** siempre (Vercel lo proporciona automáticamente)
- **Rate limiting:** Considera implementar límites si es de uso público
- **Authentication:** Agrega API keys si necesitas restringir acceso

## 📄 Licencia

MIT License - Libre para uso personal y comercial.

---

## 🆘 Soporte

Si encuentras problemas:
1. Revisa la sección de **Troubleshooting**
2. Consulta los logs en Vercel Dashboard
3. Verifica que las versiones de las dependencias coincidan
4. Busca en la documentación oficial de [Vercel](https://vercel.com/docs) y [Puppeteer](https://pptr.dev/)

---

**¡Listo para generar PDFs serverless! 🚀📄**
