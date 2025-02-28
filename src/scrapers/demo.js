const fs = require('fs');

const dayCodes = {
  M: 'Monday', T: 'Tuesday', W: 'Wednesday',
  R: 'Thursday', F: 'Friday', S: 'Saturday', U: 'Sunday'
};

const programData = JSON.parse(fs.readFileSync('program.json', 'utf-8'));

function formatTime(time) {
  if (!time) return '';
  return `${time.slice(0, 2)}:${time.slice(2, 4)}`;
}

function formatCourseOfferings(programData) {
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
          days.split(',').map(dayCode => dayCodes[dayCode] || dayCode).join(' | ') : '';
        const formattedStartEndTime = ssrmeet_begin_time && ssrmeet_end_time ?
          `${formatTime(ssrmeet_begin_time)}-${formatTime(ssrmeet_end_time)}` : '';
        const buildingInfo = bldg_desc && site_type ?
          `${bldg_desc} (${site_type})` : site_type || '';

        formattedOutput += `    - Days: ${formattedDays} | Start/End Date: ${ssbsect_ptrm_start_date}-${ssbsect_ptrm_end_date} | ` +
                           `Start/End Time: ${formattedStartEndTime} | Mode: Traditional | Building: ${buildingInfo}\n`;
      });
    }
  });

  return formattedOutput;
}

console.log(formatCourseOfferings(programData));
