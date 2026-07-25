const fs = require('fs');
const path = require('path');
const readline = require('readline');

const brainDir = '/Users/imam/.gemini/antigravity/brain/';
const targetFile = 'app/(app)/mee/next.tsx';

async function recover() {
  const fullPath = path.join(brainDir, '24317102-cd47-483a-abd8-cfe60cfddcf8', '.system_generated/logs/transcript_full.jsonl');
  if (fs.existsSync(fullPath)) {
    const fileStream = fs.createReadStream(fullPath);
    const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });
    let latestContent = null;
    for await (const line of rl) {
      try {
        const data = JSON.parse(line);
        if (data.tool_calls) {
          for (const call of data.tool_calls) {
            if (call.name === 'write_to_file' && call.args && call.args.TargetFile && call.args.TargetFile.endsWith(targetFile)) {
              latestContent = call.args.CodeContent;
            }
          }
        }
      } catch(e) {}
    }
    if (latestContent) {
      console.log(`Recovering ${targetFile}`);
      fs.mkdirSync(path.dirname(targetFile), { recursive: true });
      fs.writeFileSync(targetFile, latestContent);
    } else {
      console.log('Not found in write_to_file, looking in multi_replace...');
    }
  }
}
recover();
