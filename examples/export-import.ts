/**
 * Export/Import Example - Skylily Cost Tracker 🌸
 * 
 * This example demonstrates data export and import capabilities.
 */

import * as fs from 'node:fs';
import { CostTracker } from '../src/index.js';

console.log('💰 Skylily Cost Tracker - Export/Import\n');

// Create tracker with some test data
const tracker = new CostTracker({
  dataFile: './examples/data/export-import-costs.json',
});

// Clear any existing data
tracker.clear();

// Add sample data
console.log('Adding sample data...\n');

const sampleData = [
  { provider: 'openai', model: 'gpt-4o', inputTokens: 1000, outputTokens: 500, task: 'Code review' },
  { provider: 'openai', model: 'gpt-4.1-mini', inputTokens: 5000, outputTokens: 2000, task: 'Documentation' },
  { provider: 'anthropic', model: 'claude-sonnet-4', inputTokens: 3000, outputTokens: 1500, task: 'Analysis' },
  { provider: 'google', model: 'gemini-2.5-flash', inputTokens: 10000, outputTokens: 5000, task: 'Summarization' },
];

for (const data of sampleData) {
  tracker.record(data);
  console.log(`  ✓ ${data.model}: ${data.task}`);
}

// Export to JSON
console.log('\n📤 Exporting to JSON...');
const jsonExport = tracker.export({ format: 'json', pretty: true });
fs.writeFileSync('./examples/data/export.json', jsonExport);
console.log('  Saved to ./examples/data/export.json');

// Export to CSV
console.log('\n📤 Exporting to CSV...');
const csvExport = tracker.export({ format: 'csv', includeHeaders: true });
fs.writeFileSync('./examples/data/export.csv', csvExport);
console.log('  Saved to ./examples/data/export.csv');

// Show CSV preview
console.log('\nCSV Preview:');
console.log('---');
const csvLines = csvExport.split('\n').slice(0, 3);
for (const line of csvLines) {
  console.log(line);
}
console.log('...\n---');

// Export last 7 days only
console.log('\n📤 Exporting last 7 days to compact JSON...');
const recentExport = tracker.export({ format: 'json', days: 7, pretty: false });
fs.writeFileSync('./examples/data/export-recent.json', recentExport);
console.log('  Saved to ./examples/data/export-recent.json');

// Demonstrate import
console.log('\n📥 Demonstrating import...');

// Create a new tracker
const newTracker = new CostTracker({
  dataFile: './examples/data/imported-costs.json',
});
newTracker.clear();

// Import from JSON file
const importData = fs.readFileSync('./examples/data/export.json', 'utf-8');
const result = newTracker.import(importData);

console.log(`  Imported: ${result.imported} entries`);
console.log(`  Failed: ${result.failed} entries`);
if (result.errors.length > 0) {
  console.log(`  Errors: ${result.errors.join(', ')}`);
}

// Verify import
const stats = newTracker.getStats();
console.log(`\n  Total cost in imported data: $${stats.total.toFixed(4)}`);
console.log(`  Entry count: ${stats.entryCount}`);

// Clean up
console.log('\n🧹 Cleaning up example files...');
// Keep the files for inspection

console.log('\n✨ Done!');
console.log('\nGenerated files:');
console.log('  - ./examples/data/export.json');
console.log('  - ./examples/data/export.csv');
console.log('  - ./examples/data/export-recent.json');
console.log('  - ./examples/data/imported-costs.json');
