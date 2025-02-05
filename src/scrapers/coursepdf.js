const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');
const axios = require('axios');
const path = require('path');


const coursePdf = async () => {
    
    const url = 'https://catalog.odu.edu/courses/';

    // Launch Puppeteer
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    // Get the HTML content
    const content = await page.content();
    const $ = cheerio.load(content);

    const pdfLinks = [];

    // Select all course links inside .sitemap class
    $('.sitemap li a').each((index, element) => {
        const href = $(element).attr('href');
        const courseTitle = $(element).text().trim();
        console.log(courseTitle)
        if (href) {
            const courseName = href.split('/').filter(Boolean).pop();
            const pdfLink = `https://catalog.odu.edu${href}${courseName}.pdf`;
            pdfLinks.push(pdfLink);
        }
    });

    console.log('PDF Links:', pdfLinks);
    console.log(pdfLinks.length)

     // Directory to save PDFs
      const outputDir = path.resolve(__dirname, 'course-catalog-pdfs');
      fs.mkdirSync(outputDir, { recursive: true });
    
 
      for (const pdfLink of pdfLinks) {
        try {
          const pdfResponse = await axios.get(pdfLink, { responseType: 'arraybuffer' });
          const pdfBuffer = pdfResponse.data;

          // Construct the file path
          const fileName = pdfLink.split('/').pop();
          const filePath = path.join(outputDir, fileName);
          fs.writeFileSync(filePath, pdfBuffer);
          console.log(`Downloaded PDF: ${filePath}`);
        } catch (error) {
          console.error(`Failed to download PDF from: ${pdfLink}`, error.message);
        }
      }

      await browser.close();

};

coursePdf();
