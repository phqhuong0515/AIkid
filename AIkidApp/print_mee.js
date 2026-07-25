const fs = require('fs');
const readline = require('readline');
const fileStream = fs.createReadStream('/Users/imam/.gemini/antigravity/brain/24317102-cd47-483a-abd8-cfe60cfddcf8/.system_generated/logs/transcript_full.jsonl');
const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

async function run() {
  for await (const line of rl) {
    if (line.includes('app/(app)/mee/next.tsx') && line.includes('TargetFile')) {
       console.log("FOUND!");
       console.log(line.substring(0, 300));
       const data = JSON.parse(line);
       if (data.tool_calls) {
           data.tool_calls.forEach(c => {
               if(c.args && c.args.TargetFile && c.args.TargetFile.includes('next.tsx')) {
                   if (c.name === 'write_to_file' || c.name === 'write_to_file') {
                       console.log("TOOL:", c.name);
                   }
               }
           });
       }
    }
  }
}
run();
