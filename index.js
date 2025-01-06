// const puppeteer = require('puppeteer');
// const cheerio = require('cheerio');
// const axios = require('axios');
// const fs = require('fs');

// (async () => {
//   // Function to scrape programs list
//   const scrapePrograms = async (url) => {
//     const browser = await puppeteer.launch({ headless: true });
//     const page = await browser.newPage();
//     await page.goto(url, { waitUntil: 'domcontentloaded' });

//     const content = await page.content();
//     const $ = cheerio.load(content);

//     const programs = [];
//     // .filter_8
//     $('li.item.filter_8').each((index, element) => {
//       const programTitle = $(element).find('span.title').text().trim();
//       const href = $(element).find('a').attr('href');

//       if (!href) return; // Skip if href is not found
//       const programUrl = href.startsWith('http') ? href : `https://catalog.odu.edu${href}`;

//       const keywords = [];
//       $(element)
//         .find('span.keyword')
//         .each((i, keywordElement) => {
//           const keyword = $(keywordElement).text().trim();
//           if (keyword) keywords.push({ [`keyword_${i + 1}`]: keyword });
//         });

//       if (programTitle) {
//         programs.push({
//           program_title: programTitle,
//           program_url: programUrl,
//           academic_level: keywords[0]?.keyword_1 || '',
//           program_type: keywords[1]?.keyword_2 || '',
//           academic_interests: keywords[2]?.keyword_3 || '',
//           colleges_and_schools: keywords[3]?.keyword_4 || ''
//         });
//       }
//     });

//     await browser.close();
//     return programs;
//   };

//   // Function to scrape tab content
//   const scrapeTabContent = async (url) => {
//     try {
//       const response = await axios.get(url);
//       const $ = cheerio.load(response.data);

//       const nav = $('#tabs');
//       if (!nav.length) {
//         console.log('No tab navigation found on the page.');
//         return [];
//       }

//       const tabsData = [];

//       nav.find('li[role="presentation"]').each((index, tab) => {
//         const tabElement = $(tab);
//         const tabName = tabElement.find('a').text().trim();
//         const href = tabElement.find('a').attr('href');
//         const contentId = href ? href.replace('#', '') : null;

//         if (contentId) {
//           const contentDiv = $(`#${contentId}`);
//           if (contentDiv.length) {
//             const tabContent = [];

//             contentDiv.find('p, h1, h2, h3, h4, h5, h6, table').each((_, element) => {
//               const el = $(element);

//               if (/^h[1-6]$/.test(el[0].tagName)) {
//                 tabContent.push({ heading: el.text().trim() });
//               } else if (el[0].tagName === 'p') {
//                 tabContent.push({ paragraph: el.text().trim() });
//               } else if (el[0].tagName === 'table') {
//                 const tableData = [];
//                 el.find('tr').each((_, row) => {
//                   const columns = $(row).find('td');
//                   if (columns.length >= 3) {
//                     const courseId = columns.eq(0).hasClass('codecol') ? columns.eq(0).text().trim() : null;
//                     const courseName = columns.eq(1).text().trim();
//                     const credit = columns.eq(2).hasClass('hourscol') ? columns.eq(2).text().trim() : null;

//                     if (courseId && courseName && credit) {
//                       tableData.push({
//                         course_id: courseId,
//                         course_name: courseName,
//                         credit: credit
//                       });
//                     }
//                   }
//                 });
//                 if (tableData.length) {
//                   tabContent.push({ table: tableData });
//                 }
//               }
//             });

//             tabsData.push({
//               tab_name: tabName,
//               content: tabContent
//             });
//           }
//         }
//       });

//       return tabsData;
//     } catch (error) {
//       console.error(`Failed to fetch the webpage: ${error.message}`);
//       return [];
//     }
//   };

//   // Main scraping logic
//   // const programListUrl = 'https://catalog.odu.edu/programs/#filter=.filter_2';
//   const programListUrlGraduation = "https://catalog.odu.edu/programs/#filter=.filter_8";
//   // const programs = await scrapePrograms(programListUrl);
//   const programs = await scrapePrograms(programListUrlGraduation);

//   for (const program of programs) {
//     console.log(`Fetching tab content for: ${program.program_title}`);
//     const tabContent = await scrapeTabContent(program.program_url);
//     program.tabs = tabContent; // Attach tab content to program object
//   }

//   // Save data to JSON file
//   fs.writeFileSync('graduate__programs.json', JSON.stringify(programs, null, 2), 'utf-8');
//   console.log('Programs with tab content saved to Undergraduate_programs.json');
// })();


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


//generating the pdfs

// const puppeteer = require('puppeteer');
// const cheerio = require('cheerio');
// const fs = require('fs');
// const axios = require('axios');
// const path = require('path');

// (async () => {
//   // const url = 'https://catalog.odu.edu/programs/#filter=.filter_2';  // undergraduate-program
//   const url = 'https://catalog.odu.edu/programs/#filter=.filter_8'; //graduate-program
 
  
//   // Launch Puppeteer
//   const browser = await puppeteer.launch({ headless: true });
//   const page = await browser.newPage();

//   // Go to the URL
//   await page.goto(url, { waitUntil: 'domcontentloaded' });

//   // Get the HTML content
//   const content = await page.content();

//   // Load Cheerio
//   const $ = cheerio.load(content);

//   // Scrape data and construct PDF links
//   const pdfLinks = [];

//   $('li.item.filter_2').each((index, element) => {
//     const href = $(element).find('a').attr('href');
//     // console.log(href)
//     const programName = href.split('/').filter(part => part).pop();

// // console.log(programName);
    
//     if (href) {
//       // Construct the PDF link by appending '.pdf' to the href
//       const pdfLink = `https://catalog.odu.edu${href}${programName}.pdf`;

//       // Add the PDF link to the list
//       pdfLinks.push(pdfLink);
//     }
//   });
// console.log(pdfLinks)
//   // Download PDF files
//   for (const pdfLink of pdfLinks) {
//     try {
//       const pdfResponse = await axios.get(pdfLink, { responseType: 'arraybuffer' });
//       const pdfBuffer = pdfResponse.data;
//       const filePath = path.resolve(__dirname, 'graduate-programs-pdfs', `${pdfLink.split('/').pop()}`);
      
//       // Ensure 'pdfs' directory exists
//       fs.mkdirSync(path.dirname(filePath), { recursive: true });

//       // Save PDF to file
//       fs.writeFileSync(filePath, pdfBuffer);
//       console.log(`Downloaded PDF: ${filePath}`);
//     } catch (error) {
//       console.error(`Failed to download PDF from: ${pdfLink}`, error);
//     }
//   }

//   // Close Puppeteer
//   await browser.close();
// })();








const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const axios = require('axios');
const fs = require('fs');

(async () => {
  // Regex pattern for course codes
  const pattern = /\b([A-Z]{2,4}\s?\d{3}[A-Z]?)\b/g;

  // Function to scrape programs list
  const scrapePrograms = async (url) => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded' });

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
  
      // Scraping the breadcrumb to get the department
      const breadcrumbNav = $('#breadcrumb');
      const department = breadcrumbNav.find('ul li:nth-child(4) a').text().trim(); // Fourth li for department
  
      const nav = $('#tabs');
      if (!nav.length) {
        console.log('No tab navigation found on the page.');
        return [];
      }
  
      const tabsData = [];
      let lastParagraphText = '';  // To track consecutive <p> tags
      let courseCodes = [];  // To track course codes across consecutive <p> tags
  
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
                // Push previous paragraph if it exists before moving to a heading
                if (lastParagraphText) {
                  // Only push course_codes if there are any course codes
                  const paragraphEntry = { paragraph: lastParagraphText };
                  if (courseCodes.length > 0) {
                    paragraphEntry.course_codes = courseCodes;
                  }
                  tabContent.push(paragraphEntry);
                  lastParagraphText = '';  // Reset
                  courseCodes = [];  // Reset
                }
                tabContent.push({ heading: el.text().trim() });
              } else if (el[0].tagName === 'p') {
                const textContent = el.text().trim();
                const matchedCourses = textContent.match(pattern) || [];
  
                // Accumulate paragraph text and course codes
                if (lastParagraphText) {
                  lastParagraphText += ` ${textContent}`;
                } else {
                  lastParagraphText = textContent;
                }
  
                // Add any course codes found in the current paragraph to the list
                matchedCourses.forEach((courseCode) => {
                  if (!courseCodes.includes(courseCode)) {
                    courseCodes.push(courseCode);
                  }
                });
  
              } else if (el[0].tagName === 'table') {
                const tableData = [];
                el.find('tr').each((_, row) => {
                  const columns = $(row).find('td');
                  if (columns.length >= 3) {
                    const courseIdRaw = columns.eq(0).text().trim(); // Raw course ID from table
                    const courseId = courseIdRaw.match(pattern)?.[0] || null; // Validate course ID
                    const courseName = columns.eq(1).text().trim();
                    const credit = columns.eq(2).text().trim();
  
                    // Only include valid course IDs
                    if (courseId && courseName && credit) {
                      tableData.push({
                        course_code: courseId,
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
  
            // Push the final accumulated paragraph and course codes if any exist
            if (lastParagraphText) {
              const paragraphEntry = { paragraph: lastParagraphText };
              if (courseCodes.length > 0) {
                paragraphEntry.course_codes = courseCodes;
              }
              tabContent.push(paragraphEntry);
            }
  
            tabsData.push({
              tab_name: tabName,
              content: tabContent
            });
          }
        }
      });
  
      return { department, tabsData };
    } catch (error) {
      console.error(`Failed to fetch the webpage: ${error.message}`);
      return [];
    }
  };
  
  // Main scraping logic
  // const programListUrlGraduation = 'https://catalog.odu.edu/programs/#filter=.filter_8';
  const programListUrlUnderGraduation = 'https://catalog.odu.edu/programs/#filter=.filter_2';
  const programs = await scrapePrograms(programListUrlUnderGraduation);

  for (const program of programs) {
    console.log(`Fetching tab content for: ${program.program_title}`);
    const tabContent = await scrapeTabContent(program.program_url);
    program.department = tabContent.department;
    program.tabs = tabContent;
  }

  // Save data to JSON file
  fs.writeFileSync('UnderGraduation_program.json', JSON.stringify(programs, null, 2), 'utf-8');
  console.log('Programs with tab content saved to UnderGraduation_program.json');
})();

