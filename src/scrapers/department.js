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
    const departmentsContainer = $("div#departmentstextcontainer");
    if (departmentsContainer.length) {
        departmentsContainer.find("div.sitemap li").each((_, li) => {
            const a = $(li).find("a");
            if (a.length) {
                departments.push({
                    name: a.text().trim(),
                    url: `https://catalog.odu.edu${a.attr("href")}`,
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

            // Check for category headers (h3 or h2)
            if (childTag.is("h3") || childTag.is("h2")) {
                currentCategory = childTag.text().trim();
                if (currentCategory) {
                    programs[currentCategory] = [];
                }
            }

            // Process program links inside "sitemap" divs
            else if (childTag.is("div") && childTag.hasClass("sitemap")) {
                if (currentCategory) {
                    childTag.find("li").each((_, li) => {
                        const aTag = $(li).find("a");
                        if (aTag.length) {
                            programs[currentCategory].push(aTag.text().trim());
                        }
                    });
                }
            }

            // Capture raw HTML content for other relevant tags
            else if (currentCategory && (childTag.is("p") || childTag.is("a") || childTag.is("ol") || childTag.is("li") || childTag.is("table"))) {
                const content = childTag.prop("outerHTML").trim();
                if (content) {
                    programs[currentCategory].push(content);
                }
            }
        });

        // Remove categories with empty arrays
        Object.keys(programs).forEach(category => {
            if (programs[category].length === 0) {
                delete programs[category];
            }
        });
    } else {
        console.error("Programs section not found.");
    }

    return programs;
}

function extractBreadcrumb($) {
    const breadcrumb = $("nav#breadcrumb");
    if (!breadcrumb.length) return null;

    const items = breadcrumb.find("li");
    if (items.length < 4) return null;

    return {
        academicLevel: items.eq(1).find("a").text().trim().toLowerCase().replace(/catalog/i, "").trim(),
        college: items.eq(2).find("a").text().trim(),
        department: items.eq(3).find("span.active").text().trim(),
    };
}

function extractCourses($) {
    const courses = {};
    const coursesSection = $("div#coursestextcontainer");

    if (coursesSection.length) {
        let currentCategory = null;

        coursesSection.children().each((_, child) => {
            const childTag = $(child);

            if (childTag.is("h3")) {
                currentCategory = childTag.text().trim();
                courses[currentCategory] = [];
            } else if (!childTag.is("h3")) {
                if (childTag.is("div") && currentCategory) {
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
        [department.name]: [{
            academicLevel: breadcrumb.academicLevel,
            college: breadcrumb.college,
            department: breadcrumb.department,
            programs: programs,
            courses: courses,
        }],
    };
}

async function main() {
    const baseUrls = [
        "https://catalog.odu.edu/graduate/health-sciences/",
        "https://catalog.odu.edu/undergraduate/health-sciences/"
    ];

    const results = {};

    function delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    for (const baseUrl of baseUrls) {
        console.log(`Fetching departments from base URL: ${baseUrl}`);
        const departments = await extractDepartments(baseUrl);
        if (!departments || !departments.length) {
            console.error(`No departments found for ${baseUrl}`);
            continue;
        }

        for (const department of departments) {
            await delay(2000);
            const departmentData = await scrapeDepartmentPage(department);
            if (departmentData) {
                Object.assign(results, departmentData); // Merge into the results object
            }
        }
    }

    const fileName = "health-sciences.json";
    fs.writeFileSync(fileName, JSON.stringify(results, null, 4), "utf-8");
    console.log(`Data saved to ${fileName}`);
}

main();



//------scraping the single page for program and course list (single page diffenrent department in undergraduation and graduation)


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
//             academicLevel: url.includes("undergraduate") ? "Undergraduate" : "Graduate",
//             department: null,
//         };
//     }

//     const items = breadcrumb.find("li");

//     const academicLevel = items.eq(1).find("a").text().trim().toLowerCase().replace(/catalog/i, "").trim();
//     const department = items.eq(2).find("span.active").text().trim() || null;

//     return {
//         academicLevel: academicLevel,
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

//     // Structure the result with department as the key and remaining info as array of objects
//     const result = {};

//     if (departmentName) {
//         result[departmentName] = [{
//             academicLevel: breadcrumb.academicLevel,
//             programs: programs || {},
//             courses: courses || {}
//         }];
//     }

//     return result;
// }

// async function main() {
//     const baseUrl = "https://catalog.odu.edu/graduate/graduate-school/"
//     console.log(`Fetching data from base URL: ${baseUrl}`);

//     const result = await scrapePage(baseUrl);

//     if (!result) {
//         console.error("No data found.");
//         return;
//     }

//     const fileName = "graduate-school.json"
//     fs.writeFileSync(fileName, JSON.stringify(result, null, 4), "utf-8");
//     console.log(`Data saved to ${fileName}`);
// }

// main();



//------scraping the single page for program and course list (same department in undergraduate and graduate)


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
//             academicLevel: url.includes("undergraduate") ? "Undergraduate" : "Graduate",
//             department: null,
//         };
//     }

//     const items = breadcrumb.find("li");

//     const academicLevel = items.eq(1).find("a").text().trim().toLowerCase().replace(/catalog/i, "").trim();
//     const department = items.eq(2).find("span.active").text().trim() || null;

//     return {
//         academicLevel: academicLevel,
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

//     // Build result
//     const result = {
//         academicLevel: breadcrumb.academicLevel,
//     };

//     if (programs) {
//         result.programs = programs;
//     }

//     if (courses) {
//         result.courses = courses;
//     }

//     return {
//         departmentName,
//         result,
//     };
// }

// async function main() {
//     const baseUrls = [
//         "https://catalog.odu.edu/graduate/cybersecurity/",
//         "https://catalog.odu.edu/undergraduate/cybersecurity/",
        
//     ];

//     const combinedResults = {};

//     for (const baseUrl of baseUrls) {
//         const data = await scrapePage(baseUrl);
//         if (data) {
//             const { departmentName, result } = data;

//             if (!combinedResults[departmentName]) {
//                 combinedResults[departmentName] = [];
//             }

//             combinedResults[departmentName].push(result);
//         }
//     }

//     const fileName = "cybersecurity.json";
//     fs.writeFileSync(fileName, JSON.stringify(combinedResults, null, 4), "utf-8");
//     console.log(`Data saved to ${fileName}`);
// }

// main();