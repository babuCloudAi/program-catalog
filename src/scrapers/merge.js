const fs = require('fs');
const path = require('path');

// Change this to your folder path
const folderPath = './skills-mapping-courses';
const outputFile = 'allmerged.json';

const mergedData = [];

fs.readdir(folderPath, (err, files) => {
  if (err) {
    console.error('Error reading folder:', err);
    return;
  }

  files.forEach(file => {
    if (file.endsWith('.json')) {
      const filePath = path.join(folderPath, file);
      try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        mergedData.push(data);
        console.log(`Merged: ${file}`);
      } catch (error) {
        console.error(`Error reading ${file}: ${error.message}`);
      }
    }
  });

  // Write merged data to a new file
  fs.writeFileSync(outputFile, JSON.stringify(mergedData, null, 4));
  console.log(`✅ Merged ${mergedData.length} files into ${outputFile}`);
});
