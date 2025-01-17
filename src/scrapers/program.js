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

  const programs = [];

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
      programs.push({
        program_title: programTitle,
        program_url: programUrl,
        academic_level: keywords[0]?.keyword_1 || '',
        program_type: keywords[1]?.keyword_2 || '',
        academic_interests: keywords[2]?.keyword_3 || '',
        colleges_and_schools: keywords[3]?.keyword_4 || '',
      });
    }
  });

  await browser.close();
  return programs;
};


// // Function to scrape tab content with the updated structure
// const scrapeTabContent = async (url) => {
//   try {
//     const html = await fetchWithRetry(url);
//     const $ = cheerio.load(html);

//     const breadcrumbNav = $('#breadcrumb');
//     const department = breadcrumbNav.find('ul li:nth-child(4) a').text().trim();

//     const nav = $('#tabs');
//     if (!nav.length) {
//       console.log(`No tab navigation found on the page: ${url}`);
//       return { department, tabsData: {} };
//     }

//     const tabsData = {};

//     nav.find('li[role="presentation"]').each((index, tab) => {
//       const tabElement = $(tab);
//       const tabName = tabElement.find('a').text().trim();
//       const href = tabElement.find('a').attr('href');
//       const contentId = href ? href.replace('#', '') : null;

//       if (contentId) {
//         const contentDiv = $(`#${contentId}`);
//         if (contentDiv.length) {
//           const content = [];
//           let currentHeading = null;
//           const contentObject = {};

//           contentDiv.find('p, h2, h3, h4, h5, h6, table').each((_, element) => {
//             const el = $(element);

//             if (/^h[2-6]$/.test(el[0].tagName)) {
//               // Start a new heading
//               currentHeading = el.text().trim();
//               if (currentHeading && !contentObject[currentHeading]) {
//                 contentObject[currentHeading] = [];
//               }
//             } else if (el[0].tagName === 'p' && currentHeading) {
//               // Add paragraph under the current heading
//               const textContent = el.text().trim();
//               if (textContent) {
//                 contentObject[currentHeading].push(textContent);
//               }
//             } else if (el[0].tagName === 'table') {
//               const tableRows = [];

//               el.find('tr').each((_, row) => {
//                 const columns = $(row).find('td');
//                 if (columns.length >= 3) {
//                   const courseIdRaw = columns.eq(0).text().trim();
//                   const courseId = courseIdRaw.match(/\b([A-Z]{2,4}\s?\d{3}[A-Z]?)\b/)?.[0] || null;
//                   const courseName = columns.eq(1).text().trim();
//                   const credit = columns.eq(2).text().trim();

//                   if (courseId && courseName && credit) {
//                     tableRows.push(`${courseId}: ${courseName} (${credit} credits)`);
//                   }
//                 }
//               });

//               if (tableRows.length) {
//                 if (currentHeading) {
//                   contentObject[currentHeading].push(tableRows.join('\n'));
//                 } else {
//                   content.push(tableRows.join('\n'));
//                 }
//               }
//             }
//           });

//           // Flatten the contentObject into a single array for the tab
//           Object.keys(contentObject).forEach((key) => {
//             content.push({ [key]: contentObject[key] });
//           });

//           tabsData[tabName] = content;
//         }
//       }
//     });

//     return { department, tabsData };
//   } catch (error) {
//     console.error(`Failed to fetch tab content for ${url}: ${error.message}`);
//     return { department: '', tabsData: {} };
//   }
// };

// // Main scraping logic
// (async () => {
//   const programListUrl = 'https://catalog.odu.edu/programs/#filter=.filter_2';
//   const programs = await scrapePrograms(programListUrl);

//   for (const program of programs) {
//     console.log(`Fetching tab content for: ${program.program_title}`);
//     const tabContent = await scrapeTabContent(program.program_url);
//     program.department = tabContent.department;
//     program.tabs = tabContent.tabsData;
//   }

//   fs.writeFileSync('babu.json', JSON.stringify(programs, null, 2), 'utf-8');
//   console.log('Programs with tab content saved to graduate.json');
// })();


// Function to scrape tab content with the updated structure
const scrapeTabContent = async (url) => {
  try {
    const html = await fetchWithRetry(url);
    const $ = cheerio.load(html);

    const breadcrumbNav = $('#breadcrumb');
    const department = breadcrumbNav.find('ul li:nth-child(4) a').text().trim();

    const nav = $('#tabs');
    if (!nav.length) {
      console.log(`No tab navigation found on the page: ${url}`);
      return { department, tabsData: {} };
    }

    const tabsData = {};

    nav.find('li[role="presentation"]').each((index, tab) => {
      const tabElement = $(tab);
      const tabName = tabElement.find('a').text().trim();
      const href = tabElement.find('a').attr('href');
      const contentId = href ? href.replace('#', '') : null;

      if (contentId) {
        const contentDiv = $(`#${contentId}`);
        if (contentDiv.length) {
          const content = {};
          let currentHeading = null;

          contentDiv.find('p, h2, h3, h4, h5, h6, table').each((_, element) => {
            const el = $(element);

            if (/^h[2-6]$/.test(el[0].tagName)) {
              // Start a new heading (h2-h6)
              currentHeading = el.text().trim();
              if (currentHeading) {
                content[currentHeading] = '';
              }
            } else if (el[0].tagName === 'p' && currentHeading) {
              // Concatenate paragraphs under the current heading into a single string
              const textContent = el.text().trim();
              if (textContent) {
                content[currentHeading] += textContent + ' ';  // Adding a space to separate each paragraph
              }
            } else if (el[0].tagName === 'table') {
              const tableRows = [];

              el.find('tr').each((_, row) => {
                const columns = $(row).find('td');
                if (columns.length >= 3) {
                  const courseIdRaw = columns.eq(0).text().trim();
                  const courseId = courseIdRaw.match(/\b([A-Z]{2,4}\s?\d{3}[A-Z]?)\b/)?.[0] || null;
                  const courseName = columns.eq(1).text().trim();
                  const credit = columns.eq(2).text().trim();

                  if (courseId && courseName && credit) {
                    tableRows.push(`${courseId}: ${courseName} (${credit} credits)`);
                  }
                }
              });

              if (tableRows.length) {
                if (currentHeading) {
                  content[currentHeading] += tableRows.join('\n') + ' ';
                } else {
                  content.push(tableRows.join('\n') + ' ');
                }
              }
            }
          });

          // Flattening the content object
          Object.keys(content).forEach((key) => {
            tabsData[tabName] = { ...tabsData[tabName], [key]: content[key].trim() };
          });
        }
      }
    });

    return { department, tabsData };
  } catch (error) {
    console.error(`Failed to fetch tab content for ${url}: ${error.message}`);
    return { department: '', tabsData: {} };
  }
};

// Main scraping logic
(async () => {
  const programListUrl = 'https://catalog.odu.edu/programs/#filter=.filter_2';
  const programs = await scrapePrograms(programListUrl);

  for (const program of programs) {
    console.log(`Fetching tab content for: ${program.program_title}`);
    const tabContent = await scrapeTabContent(program.program_url);
    program.department = tabContent.department;
    program.tabs = tabContent.tabsData;
  }

  fs.writeFileSync('example.json', JSON.stringify(programs, null, 2), 'utf-8');
  console.log('Programs with tab content saved to graduate.json');
})();
