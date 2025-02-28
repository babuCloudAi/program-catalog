const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const url = 'https://catalog.odu.edu/undergraduate/general-education-requirements/';

async function scrapeData() {
    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        // Extract breadcrumb details
        const academicLevel = $('#breadcrumb ul li:nth-child(2) a').text().trim();
        const courseTitle = $('#breadcrumb ul li:nth-child(3)').text().trim();

        // Scrape raw HTML content inside #textcontainer
        const tabContent = $('#textcontainer').html().trim();
        
        // Structure the extracted data
        const scrapedData = {
            academicLevel,
            courseTitle,
            tab: {
                default: {
                    content : tabContent
                }
            }
        };

        // Save data to a JSON file
        fs.writeFileSync('general-education-requirement.json', JSON.stringify(scrapedData, null, 2), 'utf-8');
        console.log('Scraping completed. Data saved to scraped_data.json');
    } catch (error) {
        console.error('Error scraping data:', error);
    }
}

scrapeData();
