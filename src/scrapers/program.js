const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const axios = require('axios');
const fs = require('fs');

const fetchWithRetry = async (url, retries = 3, timeout = 30000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await axios.get(url, {
        timeout,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Attempt ${i + 1} failed: ${error.message}`);
      if (i === retries - 1) throw error;
    }
  }
};

const scrapePrograms = async (url) => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  );
  await page.setDefaultNavigationTimeout(0);
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 0 });

  const content = await page.content();
  const $ = cheerio.load(content);
  const programs = [];

  $('li.item.filter_8').each((index, element) => {
    const programTitle = $(element).find('span.title').text().trim();
    const href = $(element).find('a').attr('href');
    if (!href) return;
    const programUrl = href.startsWith('http') ? href : `https://catalog.odu.edu${href}`;
    const keywords = $(element)
      .find('span.keyword')
      .map((i, el) => $(el).text().trim())
      .get();

    const academicLevel = (keywords[0] || '').toLowerCase();


    programs.push({
      programTitle,
      programUrl,
      academicLevel: academicLevel,
      programType: keywords[1] || '',
      academicInterests: keywords[2] || '',
      collegesAndSchools: keywords[3] || ''
    });
  });

  await browser.close();
  return programs;
};

const scrapeTabContent = async (url) => {
  try {
    const html = await fetchWithRetry(url);
    const $ = cheerio.load(html);
    const department = $('#breadcrumb ul li:nth-child(4) a').text().trim();
    const tabsData = {};
    const coursePattern = /\b([A-Z]{2,4}\s?\d{3}[A-Z]?)\b(?!-level|\/\d{3}-level)/g;

    if ($('#tabs').length) {
      $('#tabs li[role="presentation"]').each((index, tab) => {
        const tabName = $(tab).find('a').text().trim();
        const contentId = $(tab).find('a').attr('href')?.replace('#', '');
        if (contentId) {
          const contentDiv = $(`#${contentId}`);
          if (contentDiv.length) {
            let tabContent = contentDiv.html();

            // Remove unwanted matches directly from tabContent
            tabContent = tabContent.replace(/\b[A-Z]{2,4}\s?\d{3}[A-Z]?-level\b|\b[A-Z]{2,4}\s?\d{3}-level\b/g, '');

            // Extract and deduplicate course codes
            const courseExtracted = [...new Set((tabContent.match(coursePattern) || []).map(code => code.trim()))];

            tabsData[tabName] = { content: tabContent, courseExtractedFromText: courseExtracted };
          }
        }
      });
    } else if ($('#requirementstextcontainer').length) {
      let rawContent = $('#requirementstextcontainer').html();

      // Remove unwanted matches directly from rawContent
      rawContent = rawContent.replace(/\b[A-Z]{2,4}\s?\d{3}[A-Z]?-level\b|\b[A-Z]{2,4}\s?\d{3}-level\b/g, '');

      // Extract and deduplicate course codes
      const courseExtracted = [...new Set((rawContent.match(coursePattern) || []).map(code => code.trim()))];

      tabsData['Requirements'] = { content: rawContent, courseExtractedFromText: courseExtracted };
    } else if ($('#textcontainer').length) {
      // Fallback if no tabs or requirements container exist
      const rawContent = $('#textcontainer').html();
      tabsData['default'] = { content: rawContent}
    }

    return { department, tabs: tabsData };
  } catch (error) {
    console.error(`Failed to fetch tab content for ${url}: ${error.message}`);
    return { department: '', tabs: {} };
  }
};


(async () => {
  const programListUrl = 'https://catalog.odu.edu/programs/#filter=.filter_8';
  const programs = await scrapePrograms(programListUrl);

  for (let program of programs) {
    console.log(`Fetching tab content for: ${program.programTitle}`);
    const tabContent = await scrapeTabContent(program.programUrl);
    Object.assign(program, tabContent);
  }

  fs.writeFileSync('graduation_program.json', JSON.stringify(programs, null, 2), 'utf-8');
  console.log('Programs with tab content saved to graduation_program.json');
})();


