const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');

(async () => {

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
      
      if (!href) return;  // if href is not found
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

  // scrape tab content for a given program_url
  const scrapeTabContent = async (page, url) => {
    if (!url || !url.startsWith('http')) {
      console.error(`Invalid URL: ${url}`);
      return {};
    }

    await page.goto(url, { waitUntil: 'domcontentloaded' });

    const tabs = [
      { name: 'Overview', selector: 'a[href="#textcontainer"]' },
      { name: 'Requirements', selector: 'a[href="#requirementstextcontainer"]' },
      { name: 'Degree Program Guide', selector: 'a[href="#degreeprogramguidetextcontainer"]' },
      { name: "Master's Degree Options", selector: 'a[href="#mastersdegreeoptionstextcontainer"]' },
    ];

    const tabContent = {};

    for (const tab of tabs) {
      try {
        console.log(`Clicking tab: ${tab.name}`);
        await page.click(tab.selector);
        await page.waitForSelector(tab.selector.replace('a[href="#', '#').replace('"]', ''), { timeout: 5000 }); // Wait for content to load

        // Extract the content
        const content = await page.evaluate((selector) => {
          const contentElement = document.querySelector(selector);
          return contentElement ? contentElement.innerText.trim() : 'No content found';
        }, tab.selector.replace('a[href="#', '#').replace('"]', '')); // Convert href to ID selector

        console.log(`Tab content for ${tab.name}:`, content);
  
        tabContent[tab.name] = content;

      } catch (error) {
        console.error(`Failed to fetch content for ${tab.name} on ${url}:`, error);
      }
    }

    return tabContent;
  };

  // combine program details with tab content (for Undergraduate_programs and graduate_programs)

  const programListUrl = 'https://catalog.odu.edu/programs/#filter=.filter_2'; // Undergraduate_programs url
  // const programListUrl = 'https://catalog.odu.edu/programs/#filter=.filter_8';  // graduate_programs url
  const programs = await scrapePrograms(programListUrl);

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  for (const program of programs) {
    console.log(`Fetching tab content for: ${program.program_title}`);
    const tabContent = await scrapeTabContent(page, program.program_url); // Use the full URL here
    program.tabs = tabContent; // Add tab content to the program object
  }

  await browser.close();

  // Save combined data to a JSON file
  fs.writeFileSync('Undergraduate_programs.json', JSON.stringify(programs, null, 2), 'utf-8');
  console.log('Programs with tab content saved to Undergraduate_programs.json');
})();
