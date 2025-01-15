//generating the pdfs
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');
const axios = require('axios');
const path = require('path');

(async () => {
  const url = 'https://catalog.odu.edu/programs/#filter=.filter_8'; //graduate programs
  // const url = 'https://catalog.odu.edu/programs/#filter=.filter_2'; //undergraduate programs

  // Launch Puppeteer
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Navigate to the URL
  await page.goto(url, { waitUntil: 'domcontentloaded' });

  // Get the HTML content
  const content = await page.content();

  // Load Cheerio to parse the content
  const $ = cheerio.load(content);

  // Array to store PDF links
  const pdfLinks = [];

  // Scrape data and construct PDF links
  $('li.item.filter_8').each((index, element) => {
    const href = $(element).find('a').attr('href');
    if (href) {
      const programName = href.split('/').filter(part => part).pop();
      // Construct the PDF link
      const pdfLink = `https://catalog.odu.edu${href}${programName}.pdf`;
      pdfLinks.push(pdfLink);
    }
  });

  console.log('PDF Links:', pdfLinks);

  // Directory to save PDFs
  const outputDir = path.resolve(__dirname, 'graduate-programs-pdfs');

  // Ensure the output directory exists
  fs.mkdirSync(outputDir, { recursive: true });

  // Download PDF files
  for (const pdfLink of pdfLinks) {
    try {
      // Fetch PDF data
      const pdfResponse = await axios.get(pdfLink, { responseType: 'arraybuffer' });
      const pdfBuffer = pdfResponse.data;

      // Construct the file path
      const fileName = pdfLink.split('/').pop();
      const filePath = path.join(outputDir, fileName);

      // Save PDF to file
      fs.writeFileSync(filePath, pdfBuffer);
      console.log(`Downloaded PDF: ${filePath}`);
    } catch (error) {
      console.error(`Failed to download PDF from: ${pdfLink}`, error.message);
    }
  }

  // Close Puppeteer
  await browser.close();
})();




