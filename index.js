const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const axios = require('axios');
const fs = require('fs');

(async () => {
  // Function to scrape programs list
  const scrapePrograms = async (url) => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    const content = await page.content();
    const $ = cheerio.load(content);

    const programs = [];
    // .filter_8
    $('li.item.filter_8').each((index, element) => {
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
          colleges_and_schools: keywords[3]?.keyword_4 || ''
        });
      }
    });

    await browser.close();
    return programs;
  };

  // Function to scrape tab content
  const scrapeTabContent = async (url) => {
    try {
      const response = await axios.get(url);
      const $ = cheerio.load(response.data);

      const nav = $('#tabs');
      if (!nav.length) {
        console.log('No tab navigation found on the page.');
        return [];
      }

      const tabsData = [];

      nav.find('li[role="presentation"]').each((index, tab) => {
        const tabElement = $(tab);
        const tabName = tabElement.find('a').text().trim();
        const href = tabElement.find('a').attr('href');
        const contentId = href ? href.replace('#', '') : null;

        if (contentId) {
          const contentDiv = $(`#${contentId}`);
          if (contentDiv.length) {
            const tabContent = [];

            contentDiv.find('p, h1, h2, h3, h4, h5, h6, table').each((_, element) => {
              const el = $(element);

              if (/^h[1-6]$/.test(el[0].tagName)) {
                tabContent.push({ heading: el.text().trim() });
              } else if (el[0].tagName === 'p') {
                tabContent.push({ paragraph: el.text().trim() });
              } else if (el[0].tagName === 'table') {
                const tableData = [];
                el.find('tr').each((_, row) => {
                  const columns = $(row).find('td');
                  if (columns.length >= 3) {
                    const courseId = columns.eq(0).hasClass('codecol') ? columns.eq(0).text().trim() : null;
                    const courseName = columns.eq(1).text().trim();
                    const credit = columns.eq(2).hasClass('hourscol') ? columns.eq(2).text().trim() : null;

                    if (courseId && courseName && credit) {
                      tableData.push({
                        course_id: courseId,
                        course_name: courseName,
                        credit: credit
                      });
                    }
                  }
                });
                if (tableData.length) {
                  tabContent.push({ table: tableData });
                }
              }
            });

            tabsData.push({
              tab_name: tabName,
              content: tabContent
            });
          }
        }
      });

      return tabsData;
    } catch (error) {
      console.error(`Failed to fetch the webpage: ${error.message}`);
      return [];
    }
  };

  // Main scraping logic
  // const programListUrl = 'https://catalog.odu.edu/programs/#filter=.filter_2';
  const programListUrlGraduation = "https://catalog.odu.edu/programs/#filter=.filter_8";
  // const programs = await scrapePrograms(programListUrl);
  const programs = await scrapePrograms(programListUrlGraduation);

  for (const program of programs) {
    console.log(`Fetching tab content for: ${program.program_title}`);
    const tabContent = await scrapeTabContent(program.program_url);
    program.tabs = tabContent; // Attach tab content to program object
  }

  // Save data to JSON file
  fs.writeFileSync('graduate__programs.json', JSON.stringify(programs, null, 2), 'utf-8');
  console.log('Programs with tab content saved to Undergraduate_programs.json');
})();


// Single scrape program function

// // URL to scrape
// const url = 'https://catalog.odu.edu/undergraduate/education/counseling-human-services/addiction-prevention-treatment-certificate/';

// // Fetch the webpage content
// axios.get(url)
//     .then(response => {
//         const $ = cheerio.load(response.data);

//         // Extract program title
//         const programTitle = $('h1.page-title').text().trim();

//         // Determine academic level
//         const academicLevel = url.includes('/undergraduate/') ? 'Undergraduate' : 'Graduate';

//         // Find the nav element containing the tabs
//         const nav = $('#tabs');
//         if (!nav.length) {
//             console.log('No tab navigation found on the page.');
//             return;
//         }

//         const tabsData = [];

//         // Extract tab names and corresponding content
//         nav.find('li[role="presentation"]').each((index, tab) => {
//             const tabElement = $(tab);
//             const tabName = tabElement.find('a').text().trim();
//             const href = tabElement.find('a').attr('href');
//             const contentId = href ? href.replace('#', '') : null;

//             if (contentId) {
//                 const contentDiv = $(`#${contentId}`);
//                 if (contentDiv.length) {
//                     const tabContent = [];

//                     // Extract content from paragraphs, headings, and tables
//                     contentDiv.find('p, h1, h2, h3, h4, h5, h6, table').each((_, element) => {
//                         const el = $(element);

//                         if (/^h[1-6]$/.test(el[0].tagName)) {
//                             tabContent.push({ heading: el.text().trim() });
//                         } else if (el[0].tagName === 'p') {
//                             tabContent.push({ paragraph: el.text().trim() });
//                         } else if (el[0].tagName === 'table') {
//                             const tableData = [];
//                             el.find('tr').each((_, row) => {
//                                 const columns = $(row).find('td');
//                                 if (columns.length >= 3) {
//                                     const courseId = columns.eq(0).hasClass('codecol') ? columns.eq(0).text().trim() : null;
//                                     const courseName = columns.eq(1).text().trim();
//                                     const credit = columns.eq(2).hasClass('hourscol') ? columns.eq(2).text().trim() : null;

//                                     if (courseId && courseName && credit) {
//                                         tableData.push({
//                                             course_id: courseId,
//                                             course_name: courseName,
//                                             credit: credit
//                                         });
//                                     }
//                                 }
//                             });
//                             if (tableData.length) {
//                                 tabContent.push({ table: tableData });
//                             }
//                         }
//                     });

//                     // Add tab details to the list
//                     tabsData.push({
//                         tab_name: tabName,
//                         content: tabContent
//                     });
//                 }
//             }
//         });

//         // Combine program title, academic level, and tab content
//         const programData = {
//             program_title: programTitle,
//             academic_level: academicLevel,
//             tabs: tabsData
//         };

//         // Convert data to JSON format
//         const jsonData = JSON.stringify(programData, null, 4);

//         // Output JSON data
//         console.log(jsonData);

//         // Optionally save to a file
//         fs.writeFileSync('Addiction-prevention-treatment-certificate_program_data.json', jsonData, 'utf8');
//         console.log('Data saved to program_data.json');
//     })
//     .catch(error => {
//         console.error(`Failed to fetch the webpage: ${error.message}`);
//     });
