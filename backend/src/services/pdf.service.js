const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const generatePDF = async (htmlContent, outputPath) => {
  let browser;
  try {
    const launchOptions = {
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    };

    // Usar ejecutable del sistema si está definido en .env
    if (process.env.PUPPETEER_EXECUTABLE_PATH) {
      // Limpiar comillas si el usuario las puso en el .env
      launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH.replace(/['"]/g, '');
      console.log('Usando Chrome en:', launchOptions.executablePath);
    }

    browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();
    
    // Set content - simplified wait condition for speed
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    // Ensure directory exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    await page.pdf({
      path: outputPath,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '10mm',
        right: '10mm',
        bottom: '10mm',
        left: '10mm'
      }
    });

    return outputPath;
  } catch (error) {
    console.error('Error detallado en Puppeteer:', error);
    throw error;
  } finally {
    if (browser) await browser.close();
  }
};

module.exports = { generatePDF };

