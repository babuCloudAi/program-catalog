// const fs = require('fs');
// const path = require('path');

// const programData = JSON.parse(fs.readFileSync('program.json', 'utf-8'));
// const coursesData = JSON.parse(fs.readFileSync('allCourses.json', 'utf-8'));

// function programFilename(name) {
//     return name.replace(/[<>:"\/\\|?*\x00-\x1F]/g, '').replace(/\s+/g, '_'); // Remove invalid characters and replace spaces
// }

// function extractCourseCodes(programData) {
//     return programData.map(program => {
//         const { programTitle, programUrl, academicLevel, programType, academicInterests, collegesAndSchools } = program;
//         const department = program.department.replace(/\s+/g, ' ').trim();
//         const programLevel = academicLevel.replace(/\s+/g, '_'); 

//         const courseCodes = new Set();

//         if (program.tabs) {
//             Object.values(program.tabs).forEach(tab => {
//                 if (tab.courseExtractedFromText) {
//                     tab.courseExtractedFromText
//                         .map(course => course.toString().trim())
//                         .filter(course => course !== "")
//                         .forEach(course => courseCodes.add(course));
//                 }
//             });
//         }

//         return {
//             programTitle,
//             department,
//             programUrl,
//             academicLevel: programLevel,
//             programType,
//             academicInterests,
//             collegesAndSchools,
//             course_code: Array.from(courseCodes),
//         };
//     });
// }

// const extractedCourses = extractCourseCodes(programData);

// const programWiseData = extractedCourses.map(program => {
//     const uniqueCourseCodes = [...new Set(program.course_code)];
//     const courseCodes = uniqueCourseCodes.map(c => c.split(' ')[0]);

//     const courseList = coursesData.filter(course => courseCodes.includes(course.courseCode));
//     const courses = courseList.filter(c => uniqueCourseCodes.includes(c.courseIdentifier));

//     const courseMd = courses.map(course => ({
//         courseName: course.courseTitle,
//         creditHours: course.creditHours,
//         courseDescription: course.courseDescription,
//         corequisites: course.corequisites,
//         prerequisites: course.prerequisites,
//     }));

//     return {
//         ...program,
//         tabs: Object.fromEntries(
//             Object.entries(programData.find(p => p.programTitle === program.programTitle).tabs || {}).map(([tabName, tab]) => [
//                 tabName,
//                 { content: tab.content ? tab.content.trim() : "" },
//             ])
//         ),
//         courses: courseMd,
//     };
// });

// // Generate Markdown Files with File names

// const outputDir = path.join(__dirname, 'program_markdown');
// if (!fs.existsSync(outputDir)) {
//     fs.mkdirSync(outputDir, { recursive: true });
// }

// programWiseData.forEach(program => {
//     const fileTitle = `${programFilename(program.programTitle)}-${programFilename(program.department)}.md`;
//     const filePath = path.join(outputDir, fileTitle);

//     let markdownContent = `## Program Title: ${program.programTitle}\n`;
//     markdownContent += `Department: ${program.department}\n`;
//     markdownContent += `Academic Level: ${program.academicLevel}\n`;
//     markdownContent += `Program Type: ${program.programType}\n`;
//     markdownContent += `Academic Interests: ${program.academicInterests}\n`;
//     markdownContent += `Colleges and Schools: ${program.collegesAndSchools}\n`;

//     if (program.courses.length > 0) {
//         markdownContent += `## Course:\n`;
//         program.courses.forEach(course => {
//             markdownContent += `- ## ${course.courseName} (${course.creditHours} Credit Hours)\n`;
//             markdownContent += `  Description: ${course.courseDescription}\n`;
//             markdownContent += `  Prerequisites: ${course.prerequisites}\n`;
//             markdownContent += `  Corequisites: ${course.corequisites}\n`;
//             markdownContent += `\n`;
//         });
//     } else {
//         markdownContent += `No courses found for this program.\n\n`;
//     }

//     fs.writeFileSync(filePath, markdownContent);
//     console.log(`Markdown file generated: ${filePath}`);
// });



// const fs = require('fs');
// const path = require('path');

// const programData = JSON.parse(fs.readFileSync('program.json', 'utf-8'));
// const coursesData = JSON.parse(fs.readFileSync('allCourses.json', 'utf-8'));

// function programFilename(name) {
//     return name.replace(/[<>:"/\\|?*\x00-\x1F]/g, '').replace(/\s+/g, '_');
// }

// function extractCourseCodes(programData) {
//     return programData.map(({ programTitle, programUrl, academicLevel, programType, academicInterests, collegesAndSchools, department, tabs }) => {
//         const programLevel = academicLevel.replace(/\s+/g, '_');
//         const courseCodes = new Set();

//         if (tabs) {
//             Object.values(tabs).forEach(tab => {
//                 if (tab.courseExtractedFromText) {
//                     tab.courseExtractedFromText.forEach(course => {
//                         const trimmedCourse = course.toString().trim();
//                         if (trimmedCourse) courseCodes.add(trimmedCourse);
//                     });
//                 }
//             });
//         }

//         return {
//             programTitle,
//             department: department.replace(/\s+/g, ' ').trim(),
//             programUrl,
//             academicLevel: programLevel,
//             programType,
//             academicInterests,
//             collegesAndSchools,
//             tabs,
//             course_code: Array.from(courseCodes),
//         };
//     });
// }

// const extractedCourses = extractCourseCodes(programData);

// const programWiseData = extractedCourses.map(program => {
//     const uniqueCourseCodes = [...new Set(program.course_code)];
//     const courseCodes = uniqueCourseCodes.map(c => c.split(' ')[0]);
//     const courseList = coursesData.filter(course => courseCodes.includes(course.courseCode));
//     const courses = courseList.filter(c => uniqueCourseCodes.includes(c.courseIdentifier));

//     const courseMd = courses.map(({ courseTitle, creditHours, courseDescription, prerequisites, corequisites }) => {
//         const showPrerequisites = prerequisites.trim() !== '';
//         const showCorequisites = corequisites.trim() !== '';
//         return {
//             courseName: courseTitle,
//             creditHours,
//             courseDescription,
//             prerequisites: showPrerequisites ? prerequisites : null,
//             corequisites: showCorequisites ? corequisites : null,
//         };
//     });

//     return {
//         ...program,
//         tabs: Object.fromEntries(Object.entries(programData.find(p => p.programTitle === program.programTitle).tabs || {}).map(([tabName, tab]) => [
//             tabName,
//             { content: tab.content ? tab.content.trim() : '' },
//         ])),
//         courses: courseMd,
//     };
// });

// const outputDir = path.join(__dirname, 'program_markdown_files');
// if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

// programWiseData.forEach(({ programTitle, department, academicLevel, programType, academicInterests, collegesAndSchools,tabs, courses }) => {
//     const fileTitle = `${programFilename(programTitle)}-${programFilename(department)}.md`;
//     const filePath = path.join(outputDir, fileTitle);

//     let markdownContent = `## Program Title: ${programTitle}\n`;
//     markdownContent += `Department: ${department}\n`;
//     markdownContent += `Academic Level: ${academicLevel}\n`;
//     markdownContent += `Program Type: ${programType}\n`;
//     markdownContent += `Academic Interests: ${academicInterests}\n`;
//     markdownContent += `Colleges and Schools: ${collegesAndSchools}\n\n`;
//     markdownContent += `tabs: ${tabs}\n\n`;

//     if (courses.length > 0) {
//         markdownContent += `## Course:\n`;
//         courses.forEach(({ courseName, creditHours, courseDescription, prerequisites, corequisites }) => {
//             markdownContent += `## ${courseName} (${creditHours} Credit Hours)\n`;
//             markdownContent += `  **Description**: ${courseDescription}\n`;
//             if (prerequisites) markdownContent += `  **Prerequisites**: ${prerequisites}\n`;
//             if (corequisites) markdownContent += `  **Corequisites**: ${corequisites}\n`;
//             markdownContent += `\n`;
//         });
//     } else {
//         markdownContent += `No courses found for this program.\n\n`;
//     }

//     fs.writeFileSync(filePath, markdownContent);
//     console.log(`Markdown file generated: ${filePath}`);
// });

const fs = require('fs');
const path = require('path');
const { gfm } = require('turndown-plugin-gfm');
const TurndownService = require('turndown');

const programData = JSON.parse(fs.readFileSync('program.json', 'utf-8'));
const coursesData = JSON.parse(fs.readFileSync('allCourses.json', 'utf-8'));


function programFilename(name) {
    return name.replace(/[<>:"/\\|?*\x00-\x1F]/g, '').replace(/\s+/g, '_');
}
const dayCodes = {
    M: 'Monday',
    T: 'Tuesday',
    W: 'Wednesday',
    R: 'Thursday',
    F: 'Friday',
    S: 'Saturday',
    U: 'Sunday'
};



// function extractPlainText(html) {
//     const turndownService = new TurndownService({
//         headingStyle: 'atx', // Use # for headings
//         hr: '---', // Use --- for horizontal rules
//         bulletListMarker: '-', // Use - for unordered lists
//         codeBlockStyle: 'fenced', // Use ``` for code blocks
//         linkStyle: 'inlined', // Inline links [text](url)
//     });


//     turndownService.use(gfm);

//     turndownService.addRule('tables', {
//         filter: ['table'], // Apply this rule to <table> elements
//         replacement: function (content, node) {
//             const rows = Array.from(node.querySelectorAll('tr')).map((row) => {
//                 const cells = Array.from(row.querySelectorAll('th, td'))
//                     .map(cell => cell.textContent.replace(/\u00A0/g, ' ').trim()); // Replace non-breaking space and trim
//                 return `|${cells.join('|')}|`; // Join cells with pipes
//             });
    
//             // Add a separator row after the header
//             if (rows.length > 0) {
//                 const separator = `|${rows[0].split('|').slice(1, -1).map(() => '---').join('|')}|`;
//                 rows.splice(1, 0, separator); // Insert separator after the header
//             }
    
//             return rows; // Join all rows with newlines
//         }
//     });
    
//     // Convert HTML to Markdown
//     return turndownService.turndown(html).replace(/\n+/g, '\n\n').trim();
// }
// const TurndownService = require('turndown');

// const TurndownService = require("turndown");
const cheerio = require("cheerio");
// const { gfm } = require("turndown-plugin-gfm"); // Enables table support

class HTMLConverter {
    static removeTagAndContent(html, tagName = "colgroup") {
        /**
         * Removes the specified HTML tag and its content from the given HTML string.
         * @param {string} html - The HTML content as a string.
         * @param {string} tagName - The tag name to remove (default: "colgroup").
         * @return {string} - Modified HTML string without the specified tag and its content.
         */
        const $ = cheerio.load(html);
        $(tagName).remove(); // Removes the tag and its content
        return $.html();
    }

    static htmlStringToMarkdown(content) {
        /**
         * Converts an HTML string to Markdown format, removing unwanted tags.
         * @param {string} content - The HTML content as a string.
         * @return {string} - Markdown-converted string.
         */
        const turndownService = new TurndownService({ headingStyle: "atx" });

        // Enable GitHub Flavored Markdown (GFM) for tables
        turndownService.use(gfm);

        // Remove unwanted tags (like <colgroup>)
        content = HTMLConverter.removeTagAndContent(content);

        // Replace <br> with new lines
        content = content.replace(/<br\s*\/?>/gi, "\n");

        // Convert HTML to Markdown
        return turndownService.turndown(content);
    }
}

function extractCourseCodes(programData) {
    return programData.map(({ 
        programTitle, 
        programUrl, 
        academicLevel, 
        programType, 
        academicInterests, 
        collegesAndSchools, 
        department, 
        tabs 
    }) => {
        const programLevel = academicLevel.replace(/\s+/g, '_'); // Normalize academic level
        const courseCodes = new Set();

        if (tabs) {
            Object.values(tabs).forEach(tab => {
                // Extract course codes from `courseExtractedFromText`
                if (tab.courseExtractedFromText) {
                    tab.courseExtractedFromText.forEach(course => {
                        const trimmedCourse = course.toString().trim();
                        if (trimmedCourse) courseCodes.add(trimmedCourse);
                    });
                }
                // Convert HTML content in each tab to Markdown
                if (tab.content) {
                    tab.content =  HTMLConverter.htmlStringToMarkdown(tab.content);
                }
            });
        }

        return {
            programTitle,
            department: department.replace(/\s+/g, ' ').trim(), // Normalize department name
            programUrl,
            academicLevel: programLevel,
            programType,
            academicInterests,
            collegesAndSchools,
            tabs,
            course_code: Array.from(courseCodes) // Convert Set to Array
        };
    });
}

// Example Usage
const extractedCourses = extractCourseCodes(programData);


function formatTime(time) {
    if (!time) return '';
    return `${time.slice(0, 2)}:${time.slice(2, 4)}`;
  }
  
const programWiseData = extractedCourses.map(program => {
    const uniqueCourseCodes = [...new Set(program.course_code)];
    const courseCodes = uniqueCourseCodes.map(c => c.split(' ')[0]);
    const courseList = coursesData.filter(course => courseCodes.includes(course.courseCode));
    const courses = courseList.filter(c => uniqueCourseCodes.includes(c.courseIdentifier));

    const courseMd = courses.map(({ courseTitle, creditHours, courseDescription, prerequisites, corequisites }) => {
        const showPrerequisites = prerequisites.trim() !== '';
        const showCorequisites = corequisites.trim() !== '';
        return {
            courseName: courseTitle,
            creditHours,
            courseDescription,
            prerequisites: showPrerequisites ? prerequisites : null,
            corequisites: showCorequisites ? corequisites : null,
        };
    });

    let formattedOutput = '';

    programData.forEach(course => {
      const courseOffering = course.courseOffering;
      
      for (const term in courseOffering) {
        formattedOutput += `  - ${term}\n`;
        
        courseOffering[term].forEach(({
          ssbsect_ptrm_start_date, ssbsect_ptrm_end_date,
          ssrmeet_begin_time, ssrmeet_end_time, site_type,
          bldg_desc, days
        }) => {
          const formattedDays = days ?
            days.split(',').map(dayCode => dayCodes[dayCode] || dayCode).join(' | ') : 'N/A';
          const formattedStartEndTime = ssrmeet_begin_time && ssrmeet_end_time ?
            `${formatTime(ssrmeet_begin_time)}-${formatTime(ssrmeet_end_time)}` : 'N/A';
          const buildingInfo = bldg_desc && site_type ?
            `${bldg_desc} (${site_type})` : site_type || 'N/A';
  
          formattedOutput += `    \ Days: ${formattedDays} | Start/End Date: ${ssbsect_ptrm_start_date}-${ssbsect_ptrm_end_date} | ` +
                             `Start/End Time: ${formattedStartEndTime} | Mode: Traditional | Building: ${buildingInfo}\n`;
        });
      }
    });
  
    // return formattedOutput;

    return {
        ...program,
        tabs: program.tabs,
        courses: courseMd,
        offered : formattedOutput
    };
});

const outputDir = path.join(__dirname, 'program_markdown_files');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

programWiseData.forEach(({ programTitle, department, academicLevel, programType, academicInterests, collegesAndSchools, tabs, courses , offered}) => {
    const fileTitle = `${programFilename(programTitle)}-${programFilename(department)}.md`;
    const filePath = path.join(outputDir, fileTitle);

    let markdownContent = `## Program Title: ${programTitle}\n`;
    markdownContent += `Department: ${department}\n`;
    markdownContent += `Academic Level: ${academicLevel}\n`;
    markdownContent += `Program Type: ${programType}\n`;
    markdownContent += `Academic Interests: ${academicInterests}\n`;
    markdownContent += `Colleges and Schools: ${collegesAndSchools}\n\n`;

    // Add tabs content
    if (tabs) {
        Object.entries(tabs).forEach(([tabName, tab]) => {
            markdownContent += `### ${tabName}\n`;
            markdownContent += `${tab.content}\n\n`; // Use the plain text content directly
        });
    }

    if (courses.length > 0) {
        markdownContent += `## Courses:\n`;
        courses.forEach(({ courseName, creditHours, courseDescription, prerequisites, corequisites }) => {
            markdownContent += `### ${courseName} (${creditHours} Credit Hours)\n`;
            markdownContent += `**Description**: ${courseDescription}\n`;
            if (prerequisites) markdownContent += `**Prerequisites**: ${prerequisites}\n`;
            if (corequisites) markdownContent += `**Corequisites**: ${corequisites}\n`;
            markdownContent += `\n`;
        });

        markdownContent += `## Course offered:\n ${offered}\n\n`;

        
    } else {
        markdownContent += `No courses found for this program.\n\n`;
    }

    fs.writeFileSync(filePath, markdownContent);
    console.log(`Markdown file generated: ${filePath}`);
});
