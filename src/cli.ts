#!/usr/bin/env node
/**
 * cost-tracker CLI - Skylily 🌸
 */

import { CostTracker, PRICING } from './tracker.js';

const c = { reset: '\x1b[0m', bright: '\x1b[1m', dim: '\x1b[2m', red: '\x1b[31m', green: '\x1b[32m', yellow: '\x1b[33m', magenta: '\x1b[35m', cyan: '\x1b[36m' };

function printUsage(): void {
  console.log(`
${c.bright}${c.magenta}💰 cost-tracker${c.reset}
${c.dim}Track and optimize LLM API costs${c.reset}

${c.cyan}Commands:${c.reset}
  cost-tracker stats              Show cost statistics
  cost-tracker record <args>      Record a cost entry
  cost-tracker pricing              Show model pricing
  cost-tracker budget               Budget report (--limit N)            Show model pricing
  cost-tracker history [n]        Show last n entries

${c.cyan}Record Usage:${c.reset}
  cost-tracker record --provider openai --model gpt-4o --input 1000 --output 500

${c.cyan}Examples:${c.reset}
  cost-tracker stats --days 7
  cost-tracker pricing              Show model pricing
  cost-tracker budget               Budget report (--limit N)
`);
}

function formatCost(cost: number): string {
  return '$' + cost.toFixed(4);
}

function main(): void {
  const args = process.argv.slice(2);
  const cmd = args[0];
  const tracker = new CostTracker();
  
  if (!cmd || cmd === '--help') {
    printUsage();
    return;
  }
  
  if (cmd === 'stats') {
    const daysIdx = args.indexOf('--days');
    const daysArg = daysIdx >= 0 ? args[daysIdx + 1] : undefined;
    const days = daysArg ? parseInt(daysArg, 10) : 30;
    const jsonMode = args.includes('--json');
    
    const stats = tracker.getStats(days);
    
    if (jsonMode) {
      console.log(JSON.stringify(stats, null, 2));
      return;
    }
    
    console.log(`${c.bright}${c.magenta}💰 Cost Statistics (${days} days)${c.reset}\n`);
    console.log(`${c.cyan}Total:${c.reset} ${c.green}${formatCost(stats.total)}${c.reset}\n`);
    
    console.log(`${c.cyan}By Provider:${c.reset}`);
    for (const [provider, cost] of Object.entries(stats.byProvider).sort((a, b) => b[1] - a[1])) {
      console.log(`  ${provider}: ${formatCost(cost)}`);
    }
    
    console.log(`\n${c.cyan}By Model:${c.reset}`);
    for (const [model, cost] of Object.entries(stats.byModel).sort((a, b) => b[1] - a[1])) {
      console.log(`  ${model}: ${formatCost(cost)}`);
    }
    
    console.log(`\n${c.cyan}Daily:${c.reset}`);
    for (const [day, cost] of Object.entries(stats.daily).slice(-7)) {
      console.log(`  ${day}: ${formatCost(cost)}`);
    }
  } else if (cmd === 'pricing') {
    console.log(`${c.bright}${c.magenta}💰 Model Pricing (per 1M tokens)${c.reset}\n`);
    for (const [model, pricing] of Object.entries(PRICING)) {
      console.log(`${c.cyan}${model}${c.reset}: $${pricing.inputPer1M} input / $${pricing.outputPer1M} output`);
    }
  } else if (cmd === 'record') {
    const getValue = (key: string) => {
      const idx = args.indexOf('--' + key);
      return idx >= 0 ? args[idx + 1] : '';
    };
    
    const entry = tracker.record(
      getValue('provider') || 'unknown',
      getValue('model') || 'unknown',
      parseInt(getValue('input') || '0', 10),
      parseInt(getValue('output') || '0', 10),
      getValue('task')
    );
    
    console.log(`${c.green}✓${c.reset} Recorded: ${formatCost(entry.cost)} (${entry.model})`);
  } else if (cmd === 'budget') {
    const limitIdx = args.indexOf('--limit');
    const limitValue = limitIdx >= 0 ? args[limitIdx + 1] : undefined;
    const limit = limitValue ? parseFloat(limitValue) : 10;
    const days = 7;
    
    const stats = tracker.getStats(days);
    const dailyAvg = stats.total / days;
    const projected = dailyAvg * 30;
    
    console.log(`${c.bright}${c.magenta}💰 Budget Report${c.reset}\n`);
    console.log(`${c.cyan}Last 7 days:${c.reset} ${formatCost(stats.total)}`);
    console.log(`${c.cyan}Daily avg:${c.reset} ${formatCost(dailyAvg)}`);
    console.log(`${c.cyan}Projected/month:${c.reset} ${formatCost(projected)}`);
    console.log(`${c.cyan}Budget limit:${c.reset} ${formatCost(limit)}\n`);
    
    if (projected > limit) {
      console.log(`${c.red}⚠️ WARNING: Projected ${formatCost(projected)} exceeds budget ${formatCost(limit)}${c.reset}`);
      process.exit(1);
    } else {
      const remaining = limit - projected;
      console.log(`${c.green}✓ Within budget. ${formatCost(remaining)} remaining.${c.reset}`);
    }
  } else if (cmd === 'history') {
    const limit = parseInt(args[1] || '10', 10);
    const entries = tracker.getEntries(limit);
    
    console.log(`${c.bright}${c.magenta}💰 Recent Entries${c.reset}\n`);
    for (const e of entries) {
      console.log(`${c.dim}${e.timestamp.split('T')[0]}${c.reset} ${e.model}: ${formatCost(e.cost)}${e.task ? ' - ' + e.task : ''}`);
    }
  }
}

main();
