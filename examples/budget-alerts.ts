/**
 * Budget Alerts Example - Skylily Cost Tracker 🌸
 * 
 * This example shows how to set up budget alerts and event listeners.
 */

import { CostTracker } from '../src/index.js';

// Create tracker with budget monitoring
const tracker = new CostTracker({
  dataFile: './examples/data/budget-costs.json',
});

console.log('💰 Skylily Cost Tracker - Budget Alerts\n');

// Set up event listeners
tracker.on('record', (entry) => {
  console.log(`📝 Entry recorded: ${entry.model} - $${entry.cost.toFixed(4)}`);
});

tracker.on('budgetExceeded', ({ current, limit, period }) => {
  console.log(`\n⚠️  BUDGET ALERT!`);
  console.log(`   Period: ${period}`);
  console.log(`   Current: $${current.toFixed(4)}`);
  console.log(`   Limit: $${limit.toFixed(4)}`);
  console.log(`   Over by: $${(current - limit).toFixed(4)}\n`);
});

// Add daily budget alert ($1/day with 80% threshold)
tracker.addBudgetAlert({
  limit: 0.10, // $0.10 for demo purposes
  threshold: 0.8, // Warn at 80%
  period: 'daily',
  onExceeded: (current, limit) => {
    // You could send an email, Slack message, etc.
    console.log(`   💸 Custom callback: You've spent $${current.toFixed(4)} of your $${limit.toFixed(4)} daily budget`);
  },
});

// Add weekly budget alert
tracker.addBudgetAlert({
  limit: 0.50,
  threshold: 0.5, // Warn at 50%
  period: 'weekly',
});

console.log('Budget alerts configured:');
console.log('  - Daily: $0.10 (warn at 80%)');
console.log('  - Weekly: $0.50 (warn at 50%)\n');

// Simulate some API calls that exceed the budget
console.log('Simulating API calls...\n');

// This should trigger the daily alert
tracker.record({
  provider: 'openai',
  model: 'claude-opus-4',
  inputTokens: 10000,
  outputTokens: 5000,
  task: 'Complex analysis',
});

// Add more to exceed weekly
tracker.record({
  provider: 'openai',
  model: 'o3',
  inputTokens: 20000,
  outputTokens: 10000,
  task: 'Deep reasoning task',
});

// Get current spending
const dailyStats = tracker.getStats({ days: 1 });
const weeklyStats = tracker.getStats({ days: 7 });

console.log('\n📊 Current Spending:');
console.log(`   Daily: $${dailyStats.total.toFixed(4)}`);
console.log(`   Weekly: $${weeklyStats.total.toFixed(4)}`);

console.log('\n✨ Done!');
