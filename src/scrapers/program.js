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
      if (i === retries - 1) throw error; // Rethrow error after retries
    }
  }
};

// Function to scrape programs list
const scrapePrograms = async (url) => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();

  // Set user agent to mimic a browser
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  );

  await page.setDefaultNavigationTimeout(0); // Disable navigation timeout
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 0 });

  const content = await page.content();
  const $ = cheerio.load(content);

  const programs = {};

  $('li.item.filter_2').each((index, element) => {
    const programTitle = $(element).find('span.title').text().trim();
    const href = $(element).find('a').attr('href');

    if (!href) return; // Skip if href is not found
    const programUrl = href.startsWith('http') ? href : `https://catalog.odu.edu${href}`;

    const keywords = [];
    $(element)
      .find('span.keyword')
      .each((i, keywordElement) => {
        const keyword = $(keywordElement).text().trim();
        if (keyword) keywords.push({ [`keyword_${i + 1}`]: keyword });
      });

    if (programTitle) {
      programs[programTitle] = {
        programTitle:programTitle,
        programUrl: programUrl,
        academicLevel: keywords[0]?.keyword_1 || '',
        programType: keywords[1]?.keyword_2 || '',
        academicInterests: keywords[2]?.keyword_3 || '',
        collegesAndSchools: keywords[3]?.keyword_4 || '',
      };
    }
  });

  await browser.close();
  return programs;
};

// Function to scrape tab content
const scrapeTabContent = async (url) => {
  try {
    const html = await fetchWithRetry(url);
    const $ = cheerio.load(html);

    const breadcrumbNav = $('#breadcrumb');
    const department = breadcrumbNav.find('ul li:nth-child(4) a').text().trim();

    const nav = $('#tabs');
    const tabsData = {};
    const coursePattern = /\b([A-Z]{2,4}\s?\d{3}[A-Z]?)\b/g; // Regex pattern for course codes

    if (!nav.length) {
      // Handle case where #tabs is not present
      const requirementsContainer = $('#requirementstextcontainer');
      if (requirementsContainer.length) {
        const requirementsContent = [];
        const courseExtracted = new Set();

        requirementsContainer.children().each((_, element) => {
          const el = $(element);
          const htmlContent = $.html(el);
          requirementsContent.push(htmlContent);

          // Extract course codes using regex
          const matches = htmlContent.match(coursePattern);
          if (matches) matches.forEach((code) => courseExtracted.add(code));
        });

        tabsData["Requirements"] = {
          content: requirementsContent.join('\n'),
          courseExtractedFromText: Array.from(courseExtracted),
        };
      }

      return { department, ...tabsData };
    }

    // If #tabs is present, process the tabs
    nav.find('li[role="presentation"]').each((index, tab) => {
      const tabElement = $(tab);
      const tabName = tabElement.find('a').text().trim();
      const href = tabElement.find('a').attr('href');
      const contentId = href ? href.replace('#', '') : null;

      if (contentId) {
        const contentDiv = $(`#${contentId}`);
        if (contentDiv.length) {
          const tabContent = [];
          const courseExtracted = new Set();

          contentDiv.children().each((_, element) => {
            const el = $(element);
            const htmlContent = $.html(el);
            tabContent.push(htmlContent);

            // Extract course codes using regex
            const matches = htmlContent.match(coursePattern);
            if (matches) matches.forEach((code) => courseExtracted.add(code));
          });

          tabsData[tabName] = {
            content: tabContent.join('\n'),
            courseExtractedFromText: Array.from(courseExtracted),
          };
        }
      }
    });

    return { department, tabs: { ...tabsData } };
  } catch (error) {
    console.error(`Failed to fetch tab content for ${url}: ${error.message}`);
    return { department: '' };
  }
};

// Main scraping logic
(async () => {
  const programListUrl = 'https://catalog.odu.edu/programs/#filter=.filter_2';
  const programs = await scrapePrograms(programListUrl);

  for (const programTitle in programs) {
    const program = programs[programTitle];
    console.log(`Fetching tab content for: ${programTitle}`);
    const tabContent = await scrapeTabContent(program.programUrl);
    Object.assign(program, tabContent);
  }

  fs.writeFileSync('undergraduation_program.json', JSON.stringify(programs, null, 2), 'utf-8');
  console.log('Programs with tab content saved to graduate_program.json');
})();



//with textcontent in tab content

// const fetchWithRetry = async (url, retries = 3, timeout = 30000) => {
//   for (let i = 0; i < retries; i++) {
//     try {
//       const response = await axios.get(url, {
//         timeout,
//         headers: {
//           'User-Agent':
//             'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
//         },
//       });
//       return response.data;
//     } catch (error) {
//       console.error(`Attempt ${i + 1} failed: ${error.message}`);
//       if (i === retries - 1) throw error; // Rethrow error after retries
//     }
//   }
// };

// // Function to scrape programs list
// const scrapePrograms = async (url) => {
//   const browser = await puppeteer.launch({
//     headless: true,
//     args: ['--no-sandbox', '--disable-setuid-sandbox'],
//   });
//   const page = await browser.newPage();

//   // Set user agent to mimic a browser
//   await page.setUserAgent(
//     'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
//   );

//   await page.setDefaultNavigationTimeout(0); // Disable navigation timeout
//   await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 0 });

//   const content = await page.content();
//   const $ = cheerio.load(content);

//   const programs = {};

//   $('li.item.filter_2').each((index, element) => {
//     const programTitle = $(element).find('span.title').text().trim();
//     const href = $(element).find('a').attr('href');

//     if (!href) return; // Skip if href is not found
//     const programUrl = href.startsWith('http') ? href : `https://catalog.odu.edu${href}`;

//     const keywords = [];
//     $(element)
//       .find('span.keyword')
//       .each((i, keywordElement) => {
//         const keyword = $(keywordElement).text().trim();
//         if (keyword) keywords.push({ [`keyword_${i + 1}`]: keyword });
//       });

//     if (programTitle) {
//       programs[programTitle] = {
//         programUrl: programUrl,
//         academicLevel: keywords[0]?.keyword_1 || '',
//         programType: keywords[1]?.keyword_2 || '',
//         academicInterests: keywords[2]?.keyword_3 || '',
//         collegesAndSchools: keywords[3]?.keyword_4 || '',
//       };
//     }
//   });

//   await browser.close();
//   return programs;
// };

// // Function to scrape tab content
// const scrapeTabContent = async (url) => {
//   try {
//     const html = await fetchWithRetry(url);
//     const $ = cheerio.load(html);

//     const breadcrumbNav = $('#breadcrumb');
//     const department = breadcrumbNav.find('ul li:nth-child(4) a').text().trim();

//     const nav = $('#tabs');
//     const tabsData = {};
//     const coursePattern = /\b([A-Z]{2,4}\s?\d{3}[A-Z]?)\b/g; // Regex pattern for course codes

//     if (!nav.length) {
//       // Handle case where #tabs is not present
//       const requirementsContainer = $('#requirementstextcontainer');
//       if (requirementsContainer.length) {
//         let requirementsContent = '';
//         const courseExtracted = new Set();

//         requirementsContainer.children().each((_, element) => {
//           const el = $(element);
//           const textContent = $(el).text().trim();
//           requirementsContent += `${textContent}\n`;

//           // Extract course codes using regex
//           const matches = textContent.match(coursePattern);
//           if (matches) matches.forEach((code) => courseExtracted.add(code));
//         });

//         tabsData["Requirements"] = {
//           content: requirementsContent.trim(),
//           courseExtractedFromText: Array.from(courseExtracted),
//         };
//       }

//       return { department, ...tabsData };
//     }

//     // If #tabs is present, process the tabs
//     nav.find('li[role="presentation"]').each((index, tab) => {
//       const tabElement = $(tab);
//       const tabName = tabElement.find('a').text().trim();
//       const href = tabElement.find('a').attr('href');
//       const contentId = href ? href.replace('#', '') : null;

//       if (contentId) {
//         const contentDiv = $(`#${contentId}`);
//         if (contentDiv.length) {
//           let tabContent = '';
//           const courseExtracted = new Set();

//           contentDiv.children().each((_, element) => {
//             const el = $(element);
//             const textContent = $(el).text().trim();
//             tabContent += `${textContent}\n`;

//             // Extract course codes using regex
//             const matches = textContent.match(coursePattern);
//             if (matches) matches.forEach((code) => courseExtracted.add(code));
//           });

//           tabsData[tabName] = {
//             content: tabContent.trim(),
//             courseExtractedFromText: Array.from(courseExtracted),
//           };
//         }
//       }
//     });

//     return { department, tabs: { ...tabsData } };
//   } catch (error) {
//     console.error(`Failed to fetch tab content for ${url}: ${error.message}`);
//     return { department: '' };
//   }
// };

// // Main scraping logic
// (async () => {
//   const programListUrl = 'https://catalog.odu.edu/programs/#filter=.filter_2';
//   const programs = await scrapePrograms(programListUrl);

//   for (const programTitle in programs) {
//     const program = programs[programTitle];
//     console.log(`Fetching tab content for: ${programTitle}`);
//     const tabContent = await scrapeTabContent(program.programUrl);
//     Object.assign(program, tabContent);
//   }

//   fs.writeFileSync('undergraduate_program_text.json', JSON.stringify(programs, null, 2), 'utf-8');
//   console.log('Programs with tab content saved to graduate_program.json');
// })();

