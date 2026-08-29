const fs = require("fs");
const readline = require("readline");

async function readRange() {
  const fileStream = fs.createReadStream("C:/Users/adhvi/.gemini/antigravity/brain/18277f60-fc2e-40ef-9abe-3277b47ad07c/.system_generated/logs/transcript.jsonl");
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let lineNum = 0;
  for await (const line of rl) {
    lineNum++;
    if (lineNum >= 870 && lineNum <= 895) {
      const obj = JSON.parse(line);
      console.log(`Line ${lineNum} [${obj.type}]: ${obj.content ? obj.content.slice(0, 150) : (obj.tool_calls ? JSON.stringify(obj.tool_calls).slice(0, 150) : "")}`);
    }
  }
}
readRange().catch(console.error);
