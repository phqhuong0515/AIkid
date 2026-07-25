const fs = require('fs');
const path = require('path');
const readline = require('readline');

const brainDir = '/Users/imam/.gemini/antigravity/brain/';
const targetFile = 'app/(app)/mee/next.tsx';

async function recover() {
  const dirs = fs.readdirSync(brainDir);
  for (const dir of dirs) {
    const fullPath = path.join(brainDir, dir, '.system_generated/logs/transcript_full.jsonl');
    if (fs.existsSync(fullPath)) {
      const fileStream = fs.createReadStream(fullPath);
      const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });
      for await (const line of rl) {
        try {
          const data = JSON.parse(line);
          if (data.tool_calls) {
            for (const call of data.tool_calls) {
              if (call.name === 'write_to_file' && call.args && call.args.TargetFile && call.args.TargetFile.endsWith(targetFile)) {
                console.log(`Recovering ${targetFile} from ${dir}`);
                fs.mkdirSync(path.dirname(targetFile), { recursive: true });
                fs.writeFileSync(targetFile, call.args.CodeContent);
                return; // stop after first find to get the original file
              }
            }
          }
        } catch(e) {}
      }
    }
  }
}
recover();
