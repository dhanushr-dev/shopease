const fs = require('fs');
const readline = require('readline');

async function run() {
  const filePath = 'C:\\Users\\dhanu\\.gemini\\antigravity\\brain\\abea401e-f716-46d5-ba45-003fe4a0744a\\.system_generated\\logs\\transcript.jsonl';
  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const startStep = 1520;
  const endStep = 1560;

  for await (const line of rl) {
    try {
      const obj = JSON.parse(line);
      if (obj.step_index >= startStep && obj.step_index <= endStep) {
        console.log(`\n=================== STEP ${obj.step_index} (${obj.type}) ===================`);
        console.log(`Source: ${obj.source}`);
        console.log(`Status: ${obj.status}`);
        console.log(`Content:\n${obj.content || ''}`);
        if (obj.tool_calls) {
          console.log(`Tool Calls: ${JSON.stringify(obj.tool_calls, null, 2)}`);
        }
      }
    } catch (e) {
      // Ignore
    }
  }
}

run();
