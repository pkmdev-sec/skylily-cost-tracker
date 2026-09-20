/**
 * Basic Usage Example - Skylily Cost Tracker 🌸
 * 
 * This example demonstrates the fundamental features of the cost tracker.
 */

import { CostTracker, PRICING } from '../src/index.js';

// Create a tracker with default settings
const tracker = new CostTracker({
  dataFile: './examples/data/basic-costs.json',
});

console.log('💰 Skylily Cost Tracker - Basic Usage\n');

// Record some API calls
console.log('Recording API calls...\n');

// Record an OpenAI call
const openaiEntry = tracker.record({
  provider: 'openai',
  model: 'gpt-4o',
  inputTokens: 1500,
  outputTokens: 800,
  task: 'Code review',
});
console.log(`✓ OpenAI GPT-4o: $${openaiEntry.cost.toFixed(4)}`);

// Record an Anthropic call
const claudeEntry = tracker.record({
  provider: 'anthropic',
  model: 'claude-sonnet-4',
  inputTokens: 2000,
  outputTokens: 1200,
  task: 'Documentation generation',
});
console.log(`✓ Claude Sonnet 4: $${claudeEntry.cost.toFixed(4)}`);

// Record a Google call
const geminiEntry = tracker.record({
  provider: 'google',
  model: 'gemini-2.5-flash',
  inputTokens: 5000,
  outputTokens: 2000,
  task: 'Quick summarization',
});
console.log(`✓ Gemini 2.5 Flash: $${geminiEntry.cost.toFixed(4)}`);

// Get statistics
console.log('\n📊 Statistics for the last 30 days:\n');
const stats = tracker.getStats({ days: 30 });

console.log(`Total Cost: $${stats.total.toFixed(4)}`);
console.log(`Total Entries: ${stats.entryCount}`);
console.log(`Average Cost/Entry: $${stats.averageCost.toFixed(4)}`);
console.log(`Total Tokens: ${stats.totalInputTokens + stats.totalOutputTokens}`);

console.log('\nBy Provider:');
for (const [provider, cost] of Object.entries(stats.byProvider)) {
  console.log(`  ${provider}: $${cost.toFixed(4)}`);
}

console.log('\nBy Model:');
for (const [model, cost] of Object.entries(stats.byModel)) {
  console.log(`  ${model}: $${cost.toFixed(4)}`);
}

// Show available pricing
console.log('\n💵 Available Model Pricing (per 1M tokens):');
const models = ['gpt-4o', 'claude-sonnet-4', 'gemini-2.5-flash'];
for (const model of models) {
  const pricing = PRICING[model];
  if (pricing) {
    console.log(`  ${model}: $${pricing.inputPer1M} in / $${pricing.outputPer1M} out`);
  }
}

console.log('\n✨ Done!');
