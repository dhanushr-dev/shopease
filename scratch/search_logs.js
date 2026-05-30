const fs = require('fs');
const readline = require('readline');

async function run() {
  const filePath = 'C:\\Users\\dhanu\\.gemini\\antigravity\\brain\\abea401e-f716-46d5-ba45-003fe4a0744a\\.system_generated\\logs\\transcript.jsonl';
  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  console.log('Searching for User Inputs and System Errors in transcript...');
  let count = 0;
  for await (const line of rl) {
    try {
      const obj = JSON.parse(line);
      // Let's print User inputs or steps with status ERROR or error responses
      if (obj.type === 'USER_INPUT') {
        console.log(`[USER INPUT] Step ${obj.step_index}: ${obj.content || ''}`);
      } else if (obj.status === 'ERROR' || (obj.content && obj.content.toLowerCase().includes('error') && obj.content.toLowerCase().includes('exception'))) {
        console.log(`[ERROR STEP] Step ${obj.step_index} (${obj.type}): ${obj.content?.substring(0, 300) || ''}`);
      }
    } catch (e) {
      // Ignore invalid JSON lines
    }
  }
}

run();
