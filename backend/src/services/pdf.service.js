const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const generatePDF = async (htmlContent, outputPath) => {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
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

