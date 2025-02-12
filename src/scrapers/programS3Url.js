const AWS = require('aws-sdk');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

// Configure AWS SDK
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_REGION
});

const bucketName = process.env.AWS_BUCKET_NAME;
const prefix = "knowledgebase/program_catalog_pdf/";

const listObjects = async () => {
  try {
    const data = await s3.listObjectsV2({ Bucket: bucketName, Prefix: prefix }).promise();
    
    if (!data.Contents || data.Contents.length === 0) {
      console.log("No files found in the specified prefix.");
      return;
    }

    const files = data.Contents.map(file => {
      const fileName = file.Key.replace(prefix, ""); 

      // Extract academic level and program file name
      const match = fileName.match(/([^\/]+)_program_catalog\/([^\/]+)\.pdf$/);
      let academicLevel = match ? match[1] : null;
      let programFile = match ? match[2] : null;

      return {
        academicLevel,
        programFile,
        programS3Uri: `s3://${bucketName}/${file.Key}` // Updated key name
      };
    });

    fs.writeFileSync('program_s3_url.json', JSON.stringify(files, null, 2));
    console.log('S3 file paths saved to program_s3_url.json');

  } catch (error) {
    console.error('Error fetching S3 files:', error);
  }
};

listObjects();




// ----adding programs3url in program catalog -----//


// const fs = require('fs');
// const path = require('path');


// const programS3Data = JSON.parse(fs.readFileSync('program_s3_url.json', 'utf-8'));
// const graduationPrograms = JSON.parse(fs.readFileSync('graduation_program.json', 'utf-8'));

// // Function to extract program file name from URL
// const extractProgramFile = (programUrl) => {
//   const match = programUrl.match(/([^\/]+)\/?$/);
//   return match ? match[1] : null;
// };

// // Create a lookup map for quick access to programS3Uri
// const programS3Map = programS3Data.reduce((acc, item) => {
//   if (item.programFile) {
//     acc[item.programFile] = item.programS3Uri;
//   }
//   return acc;
// }, {});

// // Add programS3Url to graduation programs
// graduationPrograms.forEach((program) => {
//   const programFile = extractProgramFile(program.programUrl);
//   if (programFile && programS3Map[programFile]) {
//     program.programS3Uri = programS3Map[programFile];
//   }
// });

// // Save the updated JSON
// fs.writeFileSync('graduation_program.json', JSON.stringify(graduationPrograms, null, 2), 'utf-8');
// console.log('Updated graduation_program.json with programS3Url');

















// to download the s3 uri 

// const AWS = require('aws-sdk');
// const fs = require('fs');
// const url = require('url');
// const dotenv = require('dotenv');

// dotenv.config();

// const s3 = new AWS.S3({
//   accessKeyId: process.env.AWS_ACCESS_KEY,    
//   secretAccessKey: process.env.AWS_SECRET_KEY,  
//   region: process.env.AWS_REGION   
// });

// // S3 URI to your file (replace with your actual S3 URI)
// const s3Uri = 's3://cloudaillc-meysam/knowledgebase/program_catalog_pdf/Undergraduate_program_catalog/accounting-minor.pdf';  // Replace with your S3 URI


// const parsedUri = url.parse(s3Uri);
// const bucketName = parsedUri.hostname;
// const fileKey = parsedUri.pathname.substring(1); 


// const params = {
//   Bucket: bucketName,
//   Key: fileKey
// };

// // Download the file
// const fileStream = fs.createWriteStream('accounting-minor.pdf');
// s3.getObject(params)
//   .createReadStream()
//   .pipe(fileStream)
//   .on('close', () => {
//     console.log('File downloaded successfully to "accounting-minor.pdf"');
//   })
//   .on('error', (err) => {
//     console.error('Error downloading file:', err);
//   });
