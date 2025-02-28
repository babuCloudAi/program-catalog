// const fs = require('fs');
// const path = require('path');
// const markdownMagic = require('markdown-magic');

// const programData = JSON.parse(fs.readFileSync('program.json', 'utf-8'));
// const coursesData = JSON.parse(fs.readFileSync('allCourses.json', 'utf-8'));

// function extractCourseCodes(programData) {
//     return programData.map(program => {
//         const programTitle = program.programTitle;
//         const programUrl = program.programUrl
//         const academicLevel = program.academicLevel
//         const programType = program.programType
//         const academicInterests = program.academicInterests
//         const collegesAndSchools = program.collegesAndSchools

//         //removing extra spaces and non-breaking spaces
//         const department = program.department.replace(/\s+/g, ' ').trim();
//         const courseCodes = new Set(); // removing duplicates

//         if (program.tabs) {
//             Object.keys(program.tabs).forEach(tabKey => {
//                 const tab = program.tabs[tabKey];

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
//             academicLevel,
//             programType,
//             academicInterests,
//             collegesAndSchools,
//             course_code: Array.from(courseCodes) // Convert into Array
//         };
//     });
// }

// const extractedCourses = extractCourseCodes(programData);
// console.log("extracted Course Data:", JSON.stringify(extractedCourses, null, 2));

// const programWiseData = extractedCourses.map(program => {

//     const uniqueCourseCodes = [...new Set(program.course_code)];
//     console.log(uniqueCourseCodes.length)

//     // Extract only the course identifiers
//     const courseCodes = [...new Set(uniqueCourseCodes.map(c => c.split(' ')[0]))];
//     console.log("Final Course Codes:", courseCodes);

//     // Filter matching courses
//     const courseList = coursesData.filter(course => courseCodes.includes(course.courseCode));
//     console.log(courseList.length)

//     // // Filter relevant courses
//     const courses = courseList.filter(c => uniqueCourseCodes.includes(c.courseIdentifier));
//     console.log(`Matched Courses: ${courses.length}, Extracted: ${uniqueCourseCodes.length}`);

//     // Prepare structured course details
//     const courseMd = courseList.map(course => ({
//         courseName: course.courseTitle,
//         creditHours: course.creditHours,
//         courseDescription: course.courseDescription,
//         corequisites: course.corequisites,
//         prerequisites: course.prerequisites
//     }));

//     return {
//         programTitle: program.programTitle,
//         department: program.department.replace(/\s+/g, ' ').trim(),
//         programUrl : program.programUrl,
//         academicLevel : program.academicLevel,
//         programType : program.programType,
//         academicInterests : program.academicInterests,
//         collegesAndSchools : program.collegesAndSchools,
//         tabs: Object.fromEntries(
//             Object.entries(programData.find(p => p.programTitle === program.programTitle).tabs || {})
//                 .map(([tabName, tab]) => [
//                     tabName,
//                     { content: tab.content ? tab.content.trim() : "" }
//                 ])
//         ),
//         courses: courseMd
//     };
// });


// fs.writeFileSync('program_courses.json', JSON.stringify(programWiseData, null, 2));

// const markdownPath = path.join(__dirname, 'Program_Catalog.md');
// const markdownStream = fs.createWriteStream(markdownPath);

// programWiseData.forEach(program => {
//     markdownStream.write(`${program.programTitle}\n`);
//     markdownStream.write(`Department: ${program.department}\n`);
//     markdownStream.write(`Academic Level: ${program.academicLevel}\n`);
//     markdownStream.write(`Program Type: ${program.programType}\n`);
//     markdownStream.write(`Academic Interests: ${program.academicInterests}\n`);
//     markdownStream.write(`Colleges and Schools: ${program.collegesAndSchools}\n`);
//     markdownStream.write(`Program URL: ${program.programUrl}\n\n`); //remove this field

//     if (program.courses.length > 0) {
//         markdownStream.write(`Courses:\n`);
//         program.courses.forEach(course => {
//             markdownStream.write(`- ${course.courseName} (${course.creditHours} Credit Hours)\n`);
//             markdownStream.write(`  Description: ${course.courseDescription}\n`);
//             markdownStream.write(`  Prerequisites: ${course.prerequisites}\n`); // if exist will shown
//             markdownStream.write(`  Corequisites: ${course.corequisites}\n`);// if exist will shown
//             markdownStream.write(`\n`);
//         });
//     } else {
//         markdownStream.write(`No courses found for this program.\n\n`);
//     }
// });

// // Close the stream
// markdownStream.end(() => console.log("Markdown file successfully generated: Program_Catalog.md"));



// const fs = require('fs');
// const path = require('path');

// // Path to 'skills-mapping-courses' folder and output file
// const folderPath = path.resolve(__dirname, 'skills-mapping-courses');
// const outputFile = path.resolve(__dirname, 'allSkillCourses.json');

// // Verify folder exists before proceeding
// if (!fs.existsSync(folderPath)) {
//   console.error(`Error: Folder not found at ${folderPath}`);
//   process.exit(1);
// }

// // Collect and merge JSON file contents from folder
// const mergedData = fs.readdirSync(folderPath)
//   .filter(file => file.endsWith('.json'))
//   .flatMap(file => {
//     const filePath = path.join(folderPath, file);
//     try {
//       const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
//       return Array.isArray(content) ? content : [content];
//     } catch (error) {
//       console.error(`Error reading or parsing ${filePath}: ${error.message}`);
//       return [];
//     }
//   });

// // Write merged results into a single output JSON file
// try {
//   fs.writeFileSync(outputFile, JSON.stringify(mergedData, null, 2));
//   console.log(`Merged JSON created at: ${outputFile}`);
// } catch (error) {
//   console.error(`Failed to write merged JSON file: ${error.message}`);
// }

