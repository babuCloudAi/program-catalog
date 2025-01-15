const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");

async function getPageContent(url) {
    try {
        const response = await axios.get(url);
        return cheerio.load(response.data);
    } catch (error) {
        console.error(`Failed to fetch ${url}: ${error.message}`);
        return null;
    }
}

async function extractDepartments(url) {
    const $ = await getPageContent(url);
    if (!$) return null;

    const departments = [];
    // Target only the "Departments" container
    const departmentsContainer = $("div#departmentstextcontainer");
    if (departmentsContainer.length) {
        departmentsContainer.find("div.sitemap li").each((_, li) => {
            const a = $(li).find("a");
            if (a.length) {
                departments.push({
                    name: a.text().trim(),
                    url: `https://catalog.odu.edu${a.attr("href")}`, // Construct full URL
                });
            }
        });
    }

    return departments;
}

function extractPrograms($) {
    const programs = {};
    const programsSection = $("div#programstextcontainer");

    if (programsSection.length) {
        let currentCategory = null;

        programsSection.children().each((_, child) => {
            const childTag = $(child);

            // First, check for h3, and if not found, fall back to h2
            if (childTag.is("h3") || childTag.is("h2")) {
                currentCategory = childTag.text().trim();
                programs[currentCategory] = [];
            } else if (childTag.is("div") && childTag.hasClass("sitemap")) {
                // Process programs inside the sitemap div
                childTag.find("li").each((_, li) => {
                    const aTag = $(li).find("a");
                    if (aTag.length) {
                        programs[currentCategory].push(aTag.text().trim());
                    }
                });
            }
        });
    }

    return programs;
}


function extractBreadcrumb($) {
    const breadcrumb = $("nav#breadcrumb");
    if (!breadcrumb.length) return null;

    const items = breadcrumb.find("li");
    if (items.length < 4) return null;

    return {
        academic_level: items.eq(1).find("a").text().trim(),
        college: items.eq(2).find("a").text().trim(),
        department: items.eq(3).find("span.active").text().trim()
    };
}



function extractCourses($) {
    const courses = {};
    const coursesSection = $("div#coursestextcontainer");

    if (coursesSection.length) {
        let currentCategory = null;

        coursesSection.children().each((_, child) => {
            const childTag = $(child);

            // First, check for h3, and if not found, skip directly to scraping courses
            if (childTag.is("h3")) {
                currentCategory = childTag.text().trim();
                courses[currentCategory] = [];
            } else if(!childTag.is("h3")){
                 if(childTag.is("div") && currentCategory) {
                    // Scrape directly from the div when h3 is not found
                    childTag.find("span.text.detail-xrefcode.margin--tiny.text--semibold.text--big").each((_, span) => {
                        const strongTag = $(span).find("strong");
                        if (strongTag.length) {
                            courses[currentCategory].push(strongTag.text().trim());
                        }
                    });
                }

            }
        
        });
    }

    return courses;
}


async function scrapeDepartmentPage(department) {
    console.log(`Scraping department: ${department.name}`);
    const $ = await getPageContent(department.url);
    if (!$) return null;

    const breadcrumb = extractBreadcrumb($);
    const programs = extractPrograms($);
    const courses = extractCourses($);

    return {
        academic_level: breadcrumb.academic_level,
        college: breadcrumb.college,
        department: breadcrumb.department,
        department: department.name,
        programs: programs,
        courses: courses,
    };
}

async function main() {
    const baseUrl = "https://catalog.odu.edu/undergraduate/sciences/";
    console.log(`Fetching departments from base URL: ${baseUrl}`);

    // Step 1: Extract department links from the base URL
    const departments = await extractDepartments(baseUrl);
    console.log(departments)

    if (!departments || !departments.length) {
        console.error("No departments found.");
        return;
    }

    const results = [];

    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    for (const department of departments) {
        await delay(2000);  // Wait 2 seconds between requests
        const departmentData = await scrapeDepartmentPage(department);
        if (departmentData) {
            results.push(departmentData);
        }
    }
    
    // Step 3: Save results to a JSON file
    const fileName = "sciences.json";
    fs.writeFileSync(fileName, JSON.stringify(results, null, 4), "utf-8");
    console.log(`Data saved to ${fileName}`);
}

main();







//scraping the single page for program and course list


// async function getPageContent(url) {
//     try {
//         const response = await axios.get(url);
//         return cheerio.load(response.data);
//     } catch (error) {
//         console.error(`Failed to fetch ${url}: ${error.message}`);
//         return null;
//     }
// }

// function extractDepartmentName($) {
//     const departmentHeader = $("h1");
//     return departmentHeader.length ? departmentHeader.text().trim() : null;
// }

// function extractPrograms($) {
//     const programs = {};
//     const programsSection = $("div#programstextcontainer");

//     if (programsSection.length) {
//         let currentCategory = null;

//         programsSection.children().each((_, child) => {
//             const childTag = $(child);

//             if (childTag.is("h3") || childTag.is("h2")) {
//                 currentCategory = childTag.text().trim();
//                 programs[currentCategory] = [];
//             } else if (childTag.is("div") && childTag.hasClass("sitemap")) {
//                 childTag.find("li").each((_, li) => {
//                     const aTag = $(li).find("a");
//                     if (aTag.length) {
//                         programs[currentCategory].push(aTag.text().trim());
//                     }
//                 });
//             }
//         });
//     }

//     // Remove categories with empty arrays
//     Object.keys(programs).forEach((category) => {
//         if (programs[category].length === 0) {
//             delete programs[category];
//         }
//     });

//     return Object.keys(programs).length > 0 ? programs : null;
// }

// function extractCourses($) {
//     const courses = {};
//     const coursesSection = $("div#coursestextcontainer");

//     if (coursesSection.length) {
//         let currentCategory = null;

//         coursesSection.children().each((_, child) => {
//             const childTag = $(child);

//             if (childTag.is("h3")) {
//                 currentCategory = childTag.text().trim();
//                 courses[currentCategory] = [];
//             } else if (childTag.is("div") && currentCategory) {
//                 childTag.find("span.text.detail-xrefcode.margin--tiny.text--semibold.text--big").each((_, span) => {
//                     const strongTag = $(span).find("strong");
//                     if (strongTag.length) {
//                         courses[currentCategory].push(strongTag.text().trim());
//                     }
//                 });
//             }
//         });
//     }

//     // Remove categories with empty arrays
//     Object.keys(courses).forEach((category) => {
//         if (courses[category].length === 0) {
//             delete courses[category];
//         }
//     });

//     return Object.keys(courses).length > 0 ? courses : null;
// }

// function extractBreadcrumb($, url) {
//     const breadcrumb = $("nav#breadcrumb");
//     if (!breadcrumb.length) {
//         console.warn("Breadcrumb navigation not found.");
//         return {
//             academic_level: url.includes("undergraduate") ? "Undergraduate" : "Graduate",
//             department: null,
//         };
//     }

//     const items = breadcrumb.find("li");

//     const academicLevel = items.eq(1).find("a").text().trim() || 
//         (url.includes("undergraduate") ? "Undergraduate" : "Graduate");
//     const department = items.eq(2).find("span.active").text().trim() || null;

//     return {
//         academic_level: academicLevel,
//         department: department,
//     };
// }

// async function scrapePage(url) {
//     console.log(`Scraping URL: ${url}`);
//     const $ = await getPageContent(url);
//     if (!$) return null;

//     const departmentName = extractDepartmentName($);
//     const breadcrumb = extractBreadcrumb($, url);
//     const programs = extractPrograms($);
//     const courses = extractCourses($);

//     // Only include non-empty fields in the final result
//     const result = {
//         department: departmentName,
//         academic_level: breadcrumb.academic_level,
//     };

//     if (programs) {
//         result.programs = programs;
//     }

//     if (courses) {
//         result.courses = courses;
//     }

//     return result;
// }

// async function main() {
//     const baseUrl = "https://catalog.odu.edu/graduate/continuing-education/"
//     console.log(`Fetching data from base URL: ${baseUrl}`);

//     const result = await scrapePage(baseUrl);

//     if (!result) {
//         console.error("No data found.");
//         return;
//     }

//     const fileName = "continuing-education.json"
//     fs.writeFileSync(fileName, JSON.stringify(result, null, 4), "utf-8");
//     console.log(`Data saved to ${fileName}`);
// }

// main();



//verifing the h2 h3 and supply logistic departments missing course data
