const fs = require('fs');
const axios = require('axios');
const dotenv = require('dotenv');
const cheerio = require('cheerio');

dotenv.config();


// Your OpenAI API key
const apiKey = process.env.OPENAI_API_KEY || "your-api-key-here";


// Function to process skills using OpenAI API
async function processSkills(courseTitle, courseDescription) {
  const prompt = `
  Based on the course information provided below, generate the required skills for a "${courseTitle}" course in JSON format with these categories:
      - Technical and Digital Skills
      - Interpersonal and Communication Skills
      - Problem-Solving and Analytical Skills
      - Organizational and Leadership Skills
  
      Focus on concrete, practical skills rather than abstract concepts. For technical courses, emphasize hard skills first. For soft-skill-focused courses (e.g., leadership training), prioritize the most relevant categories.
  
      Guidelines:
      1. Prioritize skills explicitly mentioned in the course description (e.g., "information security" → Technical).
      2. Infer implicit skills based on the description (e.g., "critical evaluation of information" → Problem Solving).
      3. If a category has limited relevance to the course, omit it or write "N/A".
      4. Avoid generic terms; focus on actionable, specific skills (e.g., "collaborative coding" instead of "teamwork").
  
      Course Description: "${courseDescription}"
  
      Output the response in valid JSON format with clearly structured skills under each category.
  
      Example output:
      {
         "courseTitle: "Introduction to Data Science"
        "Technical and Digital Skills": ["Python programming", "SQL queries", "Pandas data manipulation" ,etc] || "N/A",
        "Interpersonal and Communication Skills": ["Presenting data insights", "collaborative coding via GitHub",etc] || "N/A",
        "Problem-Solving and Analytical Skills": ["Statistical analysis", "outlier detection", "A/B testing design",etc] || "N/A",
        "Organizational and Leadership Skills": ["Agile project workflows", "dataset version control",etc]|| "N/A"
      }
  `;

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',  
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
      }
    );

    const skillText = response.data.choices[0]?.message?.content?.trim();
    if (!skillText) {
      console.error("No content found in the response.");
      return null;
    }

    // Parse the skills response into JSON directly in the desired format
    const skillsJSON = JSON.parse(skillText);
    return skillsJSON;
  } catch (error) {
    console.error("Error processing skills:", error);
    return null;
  }
}

// The URL to scrape data from
const url = "https://catalog.odu.edu/courses/psyc/";

// Fetch the page content and scrape the data
axios.get(url)
  .then(async (response) => {
    const $ = cheerio.load(response.data);

    // Extract the page title to use as the filename
    const pageTitle = $("h1.page-title").text().trim() || "default_title";

    // Define a dictionary to store the scraped content
    const scrapedData = [];

    // Scrape undergraduate course details
    const undergraduateTab = $('#undergraduatecoursestexttab');
    if (undergraduateTab.length) {
      const undergraduateLevel = "undergraduate";
      const undergraduateContainer = $('#undergraduatecoursestextcontainer');
      if (undergraduateContainer.length) {
        const courses = undergraduateContainer.find('.courseblock');
        for (let course of courses.toArray()) {
          const courseCode = $(course).find('.detail-xrefcode').text().trim();
          const courseTitle = $(course).find('.detail-title').text().trim();
          const courseDescription = $(course).find('.courseblockextra').text().trim();

          // Process the skills for the course
          const skills = await processSkills(courseTitle, courseDescription);

          // Add course data with skills to the scrapedData array
          if (skills) {
            scrapedData.push({
              courseTitle,
              courseCode,
              academicLevel: undergraduateLevel,
              courseDescription,
              ...skills, // Directly spread the skill categories into the object
            });
          }
        }
      }
    }

    // Scrape graduate course details
    const graduateTab = $('#graduatecoursestexttab');
    if (graduateTab.length) {
      const graduateLevel = "graduate";
      const graduateContainer = $('#graduatecoursestextcontainer');
      if (graduateContainer.length) {
        const courses = graduateContainer.find('.courseblock');
        for (let course of courses.toArray()) {
          const courseCode = $(course).find('.detail-xrefcode').text().trim();
          const courseTitle = $(course).find('.detail-title').text().trim();
          const courseDescription = $(course).find('.courseblockextra').text().trim();

          // Process the skills for the course
          const skills = await processSkills(courseTitle, courseDescription);

          // Add course data with skills to the scrapedData array
          if (skills) {
            scrapedData.push({
              courseCode,
              courseTitle,
              academicLevel: graduateLevel,
              courseDescription,
              ...skills, // Directly spread the skill categories into the object
            });
          }
        }
      }
    }

    // Save the scraped data with skills to a JSON file
    const filename = `${pageTitle.replace(/\s*-\s*/g, '-').replace(/\s+/g, '_')}.json`;
    fs.writeFileSync(filename, JSON.stringify(scrapedData, null, 4));

    console.log(`Scraped data with skills saved to ${filename}`);
  })
  .catch((error) => {
    console.error('Error fetching the page:', error);
  });

  