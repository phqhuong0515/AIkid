const fs = require('fs');
const readline = require('readline');
const path = require('path');
const fileStream = fs.createReadStream('/Users/imam/.gemini/antigravity/brain/24317102-cd47-483a-abd8-cfe60cfddcf8/.system_generated/logs/transcript_full.jsonl');
const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

async function run() {
  for await (const line of rl) {
    try {
      const data = JSON.parse(line);
      if (data.tool_calls) {
        data.tool_calls.forEach(c => {
           if(c.args && c.args.CodeContent && c.args.CodeContent.includes('MeeNextScreen')) {
              console.log("Recovering MeeNextScreen!");
              const targetFile = 'app/(app)/mee/next.tsx';
              fs.mkdirSync(path.dirname(targetFile), { recursive: true });
              fs.writeFileSync(targetFile, c.args.CodeContent);
           }
        });
      }
    } catch(e){}
  }
}
run();
