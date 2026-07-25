const fs = require('fs');
const path = require('path');
const readline = require('readline');

const brainDir = '/Users/imam/.gemini/antigravity/brain/';
const targetFilesToRecover = [
  'app/(app)/art/canvas.tsx',
  'app/(app)/mee/next.tsx',
  'src/features/art/SkiaCanvas.tsx',
  'src/features/art/DrawingToolbar.tsx',
  'src/features/art/AiResultPanel.tsx'
];

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
              if (call.name === 'write_to_file' && call.args && call.args.TargetFile) {
                const targetFile = call.args.TargetFile;
                if (targetFilesToRecover.some(t => targetFile.endsWith(t))) {
                  console.log(`Recovering ${targetFile} from ${dir}`);
                  fs.mkdirSync(path.dirname(targetFile), { recursive: true });
                  fs.writeFileSync(targetFile, call.args.CodeContent);
                }
              }
              if (call.name === 'multi_replace_file_content' && call.args && call.args.TargetFile) {
                const targetFile = call.args.TargetFile;
                 if (targetFilesToRecover.some(t => targetFile.endsWith(t))) {
                     console.log(`Note: ${targetFile} had edits in ${dir}. You might need to manually apply them if they are newer.`);
                 }
              }
            }
          }
        } catch(e) {}
      }
    }
  }
}
recover();
