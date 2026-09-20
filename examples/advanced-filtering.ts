/**
 * Advanced Filtering Example - Skylily Cost Tracker 🌸
 * 
 * This example demonstrates advanced filtering and analysis capabilities.
 */

import { CostTracker } from '../src/index.js';

console.log('💰 Skylily Cost Tracker - Advanced Filtering\n');

// Create tracker with sample data
const tracker = new CostTracker({
  dataFile: './examples/data/filtering-costs.json',
});

// Clear and add diverse sample data
tracker.clear();

console.log('Adding sample data across providers and use cases...\n');

// Simulate a week of usage
const sampleEntries = [
  // Day 1 - Heavy coding
  { provider: 'openai', model: 'gpt-4o', inputTokens: 5000, outputTokens: 2000, task: 'code:review PR #123' },
  { provider: 'anthropic', model: 'claude-sonnet-4', inputTokens: 3000, outputTokens: 1500, task: 'code:refactor auth module' },
  
  // Day 2 - Documentation
  { provider: 'openai', model: 'gpt-4.1-mini', inputTokens: 10000, outputTokens: 5000, task: 'docs:api reference' },
  { provider: 'google', model: 'gemini-2.5-flash', inputTokens: 8000, outputTokens: 4000, task: 'docs:readme update' },
  
  // Day 3 - Analysis
  { provider: 'openai', model: 'o3', inputTokens: 2000, outputTokens: 3000, task: 'analysis:architecture review' },
  { provider: 'anthropic', model: 'claude-opus-4', inputTokens: 1500, outputTokens: 2500, task: 'analysis:security audit' },
  
  // Day 4 - Quick tasks
  { provider: 'openai', model: 'gpt-4.1-nano', inputTokens: 20000, outputTokens: 10000, task: 'translation:batch' },
  { provider: 'google', model: 'gemini-2.5-flash-lite', inputTokens: 15000, outputTokens: 7000, task: 'summarization:daily reports' },
  
  // Day 5 - Mixed
  { provider: 'openai', model: 'gpt-4o', inputTokens: 4000, outputTokens: 1800, task: 'code:bug fix #456' },
  { provider: 'anthropic', model: 'claude-sonnet-4', inputTokens: 6000, outputTokens: 3000, task: 'docs:internal wiki' },
];

for (const entry of sampleEntries) {
  tracker.record(entry);
}
console.log(`  ✓ Added ${sampleEntries.length} entries\n`);

// Overall stats
console.log('📊 Overall Statistics:');
const overall = tracker.getStats();
console.log(`  Total Cost: $${overall.total.toFixed(4)}`);
console.log(`  Total Entries: ${overall.entryCount}`);
console.log(`  Avg Cost/Entry: $${overall.averageCost.toFixed(4)}\n`);

// Filter by provider
console.log('📊 By Provider:');
for (const provider of ['openai', 'anthropic', 'google']) {
  const stats = tracker.getStats({ provider });
  console.log(`  ${provider}: $${stats.total.toFixed(4)} (${stats.entryCount} calls)`);
}

// Filter by model
console.log('\n📊 By Model (OpenAI only):');
const openaiModels = ['gpt-4o', 'gpt-4.1-mini', 'gpt-4.1-nano', 'o3'];
for (const model of openaiModels) {
  const stats = tracker.getStats({ model });
  if (stats.entryCount > 0) {
    console.log(`  ${model}: $${stats.total.toFixed(4)}`);
  }
}

// Filter by task pattern
console.log('\n📊 By Task Category (regex filter):');
const categories = [
  { name: 'Code tasks', pattern: /^code:/ },
  { name: 'Documentation', pattern: /^docs:/ },
  { name: 'Analysis', pattern: /^analysis:/ },
  { name: 'Other', pattern: /^(translation|summarization):/ },
];

for (const { name, pattern } of categories) {
  const stats = tracker.getStats({ taskPattern: pattern });
  console.log(`  ${name}: $${stats.total.toFixed(4)} (${stats.entryCount} calls)`);
}

// Combined filters
console.log('\n📊 Combined Filter (OpenAI + code tasks):');
const combinedStats = tracker.getStats({
  provider: 'openai',
  taskPattern: /^code:/,
});
console.log(`  Cost: $${combinedStats.total.toFixed(4)}`);
console.log(`  Entries: ${combinedStats.entryCount}`);
console.log(`  Input Tokens: ${combinedStats.totalInputTokens}`);
console.log(`  Output Tokens: ${combinedStats.totalOutputTokens}`);

// Delete entries by condition
console.log('\n🗑️  Deleting all translation tasks...');
const deleted = tracker.deleteWhere(e => e.task?.startsWith('translation:') ?? false);
console.log(`  Deleted: ${deleted} entries`);

// Final stats
console.log('\n📊 After Deletion:');
const finalStats = tracker.getStats();
console.log(`  Total Cost: $${finalStats.total.toFixed(4)}`);
console.log(`  Total Entries: ${finalStats.entryCount}`);

console.log('\n✨ Done!');
