const fs = require('fs');

const programData = JSON.parse(fs.readFileSync('program.json', 'utf-8'));
const coursesData = JSON.parse(fs.readFileSync('allCourses.json', 'utf-8'));

function extractCourseCodes(programData) {
    return programData.map(program => {
        const programTitle = program.programTitle;

        //removing extra spaces and non-breaking spaces
        const department = program.department.replace(/\s+/g, ' ').trim();
        const courseCodes = new Set(); // removing duplicates

        if (program.tabs) {
            Object.keys(program.tabs).forEach(tabKey => {
                const tab = program.tabs[tabKey];

                if (tab.courseExtractedFromText) {
                    tab.courseExtractedFromText
                        .map(course => course.toString().trim())
                        .filter(course => course !== "")
                        .forEach(course => courseCodes.add(course));
                }
            });
        }

        return {
            programTitle,
            department,
            course_code: Array.from(courseCodes) // Convert into Array
        };
    });
}


const extractedCourses = extractCourseCodes(programData);
console.log("extracted Course Data:", JSON.stringify(extractedCourses, null, 2));


const programWiseData = extractedCourses.map(program => {

    const uniqueCourseCodes = [...new Set(program.course_code)];
    console.log(uniqueCourseCodes.length)

    // Extract only the course identifiers
    const courseCodes = [...new Set(uniqueCourseCodes.map(c => c.split(' ')[0]))];
    console.log("Final Course Codes:", courseCodes);

    // Filter matching courses
    const courseList = coursesData.filter(course => courseCodes.includes(course.courseCode));
    console.log(courseList.length)

    // // Filter relevant courses
    const courses = courseList.filter(c => uniqueCourseCodes.includes(c.courseIdentifier));
    console.log(`Matched Courses: ${courses.length}, Extracted: ${uniqueCourseCodes.length}`);

    // Prepare structured course details
    const courseMd = courseList.map(course => ({
        courseTitle: course.courseTitle,
        creditHours: course.creditHours,
        courseDescription: course.courseDescription,
        corequisites: course.corequisites || [],
        prerequisites: course.prerequisites || []
    }));

    return {
        programRequirement: {
            programTitle: program.programTitle,
            department: program.department.replace(/\s+/g, ' ').trim(),
            tabs: Object.fromEntries(
                Object.entries(programData.find(p => p.programTitle === program.programTitle).tabs || {})
                    .map(([tabName, tab]) => [
                        tabName,
                        { content: tab.content ? tab.content.trim() : "" }
                    ])
            )
        },
        courses: courseMd
    };
});


fs.writeFileSync('program_courses.json', JSON.stringify(programWiseData, null, 2));

