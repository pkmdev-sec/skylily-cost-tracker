/**
 * Custom Pricing Example - Skylily Cost Tracker 🌸
 * 
 * This example shows how to add custom model pricing and use strict mode.
 */

import { CostTracker, PRICING, InvalidModelError } from '../src/index.js';

console.log('💰 Skylily Cost Tracker - Custom Pricing\n');

// Show built-in pricing
console.log('📋 Built-in Model Pricing (per 1M tokens):');
console.log('---');
const popularModels = ['gpt-4o', 'gpt-4.1-mini', 'claude-opus-4', 'claude-sonnet-4', 'gemini-2.5-flash'];
for (const model of popularModels) {
  const p = PRICING[model];
  if (p) {
    console.log(`  ${model.padEnd(20)} $${p.inputPer1M.toFixed(2)} in  / $${p.outputPer1M.toFixed(2)} out`);
  }
}
console.log('---\n');

// Create tracker with custom pricing for internal/self-hosted models
const tracker = new CostTracker({
  dataFile: './examples/data/custom-pricing-costs.json',
  customPricing: {
    // Your self-hosted Llama model (estimate compute cost)
    'llama-3.1-70b': { inputPer1M: 0.5, outputPer1M: 1.0 },
    // Internal fine-tuned model
    'gpt-4o-finetuned-internal': { inputPer1M: 5.0, outputPer1M: 15.0 },
    // Custom pricing for a reseller/proxy
    'claude-sonnet-4-proxy': { inputPer1M: 4.5, outputPer1M: 18.0 },
  },
});

console.log('✅ Custom models added:');
console.log('  - llama-3.1-70b (self-hosted)');
console.log('  - gpt-4o-finetuned-internal');
console.log('  - claude-sonnet-4-proxy\n');

// Track costs for custom models
console.log('Recording usage for custom models...\n');

const llamaEntry = tracker.record({
  provider: 'local',
  model: 'llama-3.1-70b',
  inputTokens: 50000,
  outputTokens: 10000,
  task: 'Batch processing',
});
console.log(`  llama-3.1-70b: $${llamaEntry.cost.toFixed(4)}`);

const ftEntry = tracker.record({
  provider: 'openai',
  model: 'gpt-4o-finetuned-internal',
  inputTokens: 2000,
  outputTokens: 800,
  task: 'Specialized task',
});
console.log(`  gpt-4o-finetuned-internal: $${ftEntry.cost.toFixed(4)}`);

// Dynamically add pricing
console.log('\n📝 Dynamically adding pricing for new model...');
tracker.setPricing('mistral-large-2', { inputPer1M: 3.0, outputPer1M: 9.0 });

const mistralEntry = tracker.record({
  provider: 'mistral',
  model: 'mistral-large-2',
  inputTokens: 3000,
  outputTokens: 1500,
  task: 'Alternative provider test',
});
console.log(`  mistral-large-2: $${mistralEntry.cost.toFixed(4)}`);

// Demonstrate strict mode
console.log('\n🔒 Demonstrating strict mode...');

const strictTracker = new CostTracker({
  dataFile: './examples/data/strict-costs.json',
  strictMode: true,
});

try {
  // This will throw because the model is unknown
  strictTracker.record({
    provider: 'unknown',
    model: 'totally-made-up-model',
    inputTokens: 1000,
    outputTokens: 500,
  });
} catch (error) {
  if (error instanceof InvalidModelError) {
    console.log(`  ✓ Caught InvalidModelError as expected!`);
    console.log(`    Model: ${error.model}`);
    console.log(`    Available: ${error.availableModels.slice(0, 5).join(', ')}...`);
  }
}

// Show all available models
console.log('\n📋 All available models in custom tracker:');
const allModels = tracker.getAvailableModels();
console.log(`  Total: ${Object.keys(allModels).length} models`);

console.log('\n✨ Done!');
