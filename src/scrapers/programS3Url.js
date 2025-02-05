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
    
    const files = data.Contents.map(file => {
      const fileName = file.Key.replace(prefix, ""); // Remove prefix
      const match = fileName.match(/([^\/]+)\/([^\/]+)\.pdf$/);

      let academicLevel = match ? match[1] : null;
      let programFile = match ? match[2] : null;

      // Remove "_program_catalog" if present

      if (academicLevel) {
        academicLevel = academicLevel.replace("_program_catalog", "");
      }

      return {
        academicLevel,
        programFile,
        programS3Url: `https://${bucketName}.s3.amazonaws.com/${file.Key}`
      };
    });

    fs.writeFileSync('program_s3_url.json', JSON.stringify(files, null, 2));
    console.log('S3 file URLs saved to program_s3_url.json');
  } catch (error) {
    console.error('Error fetching S3 files:', error);
  }
};

listObjects();



// ----adding programs3url in program catalog -----//


const fs = require('fs');
const path = require('path');


const programS3Data = JSON.parse(fs.readFileSync('program_s3_url.json', 'utf-8'));
const graduationPrograms = JSON.parse(fs.readFileSync('undergraduation_program.json', 'utf-8'));

// Function to extract program file name from URL
const extractProgramFile = (programUrl) => {
  const match = programUrl.match(/([^\/]+)\/?$/);
  return match ? match[1] : null;
};

// Create a lookup map for quick access to programS3Url
const programS3Map = programS3Data.reduce((acc, item) => {
  if (item.programFile) {
    acc[item.programFile] = item.programS3Url;
  }
  return acc;
}, {});

// Add programS3Url to graduation programs
graduationPrograms.forEach((program) => {
  const programFile = extractProgramFile(program.programUrl);
  if (programFile && programS3Map[programFile]) {
    program.programS3Url = programS3Map[programFile];
  }
});

// Save the updated JSON
fs.writeFileSync('undergraduation_program.json', JSON.stringify(graduationPrograms, null, 2), 'utf-8');
console.log('Updated graduation_program.json with programS3Url');
