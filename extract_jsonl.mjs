import { readFileSync, writeFileSync } from 'fs';

const mdFile = 'darwinian_council_training_data.md';
const jsonlFile = 'darwinian_data.jsonl';

try {
  const content = readFileSync(mdFile, 'utf-8');
  const jsonBlocks = content.match(/```json\n([\s\S]*?)\n```/g);

  if (!jsonBlocks) {
    console.error("No JSON blocks found in the markdown file.");
    process.exit(1);
  }

  const lines = jsonBlocks.map(block => {
    // Remove the ```json and ``` markers
    const jsonStr = block.replace(/```json\n/, '').replace(/\n```/, '');
    // Parse and stringify to ensure it's on one line
    try {
      return JSON.stringify(JSON.parse(jsonStr));
    } catch (e) {
      console.warn("Skipping a block due to invalid JSON:", e.message);
      return null;
    }
  }).filter(line => line !== null);

  writeFileSync(jsonlFile, lines.join('\n'), 'utf-8');
  console.log(`✅ Successfully extracted ${lines.length} examples to ${jsonlFile}`);
} catch (err) {
  console.error("Error during extraction:", err);
}
