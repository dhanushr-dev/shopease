const fs = require('fs');

const logPath = 'C:\\Users\\dhanu\\.gemini\\antigravity\\brain\\abea401e-f716-46d5-ba45-003fe4a0744a\\.system_generated\\tasks\\task-1462.log';
if (fs.existsSync(logPath)) {
  const content = fs.readFileSync(logPath, 'utf8');
  const lines = content.split('\n');
  const start = 439;
  const end = Math.min(lines.length - 1, 600);
  console.log(`Printing lines from ${start} to ${end}:`);
  for (let i = start; i <= end; i++) {
    console.log(`${i + 1}: ${lines[i]}`);
  }
} else {
  console.log('Log file does not exist.');
}
