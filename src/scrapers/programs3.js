const fs = require('fs');

// Load the JSON files
const programS3Uri = JSON.parse(fs.readFileSync('program_s3_uri.json', 'utf8'));
const graduationProgram = JSON.parse(fs.readFileSync('undergraduation_program.json', 'utf8'));

// Convert program_s3_uri.json into a map for quick lookup
const programUriMap = {};
programS3Uri.forEach(item => {
    programUriMap[item.programFile] = item.programS3Uri;
});

// Update graduation_program.json with matching S3 URI
graduationProgram.forEach(program => {
    if (program.programUrl) {
        // Extract last segment of programUrl
        const urlParts = program.programUrl.split('/');
        const lastSegment = urlParts.filter(part => part).pop(); // Remove empty elements and get last part

        // Check if lastSegment matches a key in programUriMap
        if (programUriMap[lastSegment]) {
            program.programS3Uri = programUriMap[lastSegment];
        }
    }
});

// Save the updated graduation_program.json
fs.writeFileSync('undergraduation_program_updated.json', JSON.stringify(graduationProgram, null, 2), 'utf8');

console.log('Updated graduation_program.json with programS3Uri.');
