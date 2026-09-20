# skylily-cost-tracker 🌸

[![npm version](https://img.shields.io/npm/v/skylily-cost-tracker.svg)](https://www.npmjs.com/package/skylily-cost-tracker)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Test Coverage](https://img.shields.io/badge/coverage-80%25+-brightgreen.svg)]()

> Track and optimize LLM API costs across multiple providers with ease.

A lightweight, type-safe cost tracking library for monitoring your LLM API spending across OpenAI, Anthropic, Google, and other providers. Features include built-in pricing, budget alerts, statistics, and export capabilities.

---

## ✨ Features

- **📊 Multi-Provider Support** - Built-in pricing for 25+ models across OpenAI, Anthropic, Google, and Perplexity
- **💰 Automatic Cost Calculation** - Calculates costs based on token usage and model pricing
- **🔔 Budget Alerts** - Set daily, weekly, or monthly budget limits with callbacks
- **📈 Rich Statistics** - Filter by provider, model, task, date range
- **📤 Export/Import** - JSON and CSV export formats for analysis
- **🔒 Type-Safe** - Full TypeScript support with comprehensive types
- **⚡ Zero Dependencies** - Only Node.js built-ins, no bloat
- **🛠️ CLI Included** - Command-line tool for quick access

---

## 📦 Installation

```bash
# npm
npm install skylily-cost-tracker

# yarn
yarn add skylily-cost-tracker

# pnpm
pnpm add skylily-cost-tracker
```

---

## 🚀 Quick Start

### Basic Usage

```typescript
import { CostTracker } from 'skylily-cost-tracker';

// Create a tracker (data stored in ~/.cost-tracker.json by default)
const tracker = new CostTracker();

// Record an API call
const entry = tracker.record({
  provider: 'openai',
  model: 'gpt-4o',
  inputTokens: 1500,
  outputTokens: 800,
  task: 'Code review',
});

console.log(`Cost: $${entry.cost.toFixed(4)}`);
// Output: Cost: $0.0118

// Get statistics for the last 30 days
const stats = tracker.getStats({ days: 30 });
console.log(`Total spent: $${stats.total.toFixed(2)}`);
```

### CLI Usage

```bash
# Record a cost entry
cost-tracker record --provider openai --model gpt-4o --input 1000 --output 500

# View statistics
cost-tracker stats --days 7

# View pricing
cost-tracker pricing

# View history
cost-tracker history 10
```

---

## 📖 API Reference

### CostTracker Class

The main class for tracking costs.

#### Constructor

```typescript
new CostTracker(config?: CostTrackerConfig)
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `dataFile` | `string` | `~/.cost-tracker.json` | Path to the data file |
| `autoSave` | `boolean` | `true` | Auto-save after each record |
| `customPricing` | `Record<string, ModelPricing>` | `{}` | Custom model pricing |
| `strictMode` | `boolean` | `false` | Throw on unknown models |
| `defaultProvider` | `string` | `'unknown'` | Default provider name |

#### Methods

##### `record(options: RecordOptions): CostEntry`

Records a cost entry and returns it.

```typescript
interface RecordOptions {
  provider: string;      // API provider (e.g., 'openai', 'anthropic')
  model: string;         // Model identifier (e.g., 'gpt-4o')
  inputTokens: number;   // Number of input tokens
  outputTokens: number;  // Number of output tokens
  task?: string;         // Optional task description
  metadata?: Record<string, unknown>;  // Optional metadata
  costOverride?: number; // Override automatic cost calculation
}
```

**Example:**
```typescript
const entry = tracker.record({
  provider: 'anthropic',
  model: 'claude-sonnet-4',
  inputTokens: 2000,
  outputTokens: 1000,
  task: 'Documentation generation',
  metadata: { userId: 'user_123', requestId: 'req_456' },
});
```

##### `getStats(options?: StatsOptions): CostStats`

Returns statistics for the specified period.

```typescript
interface StatsOptions {
  days?: number;         // Number of days (default: 30)
  provider?: string;     // Filter by provider
  model?: string;        // Filter by model
  taskPattern?: RegExp;  // Filter by task (regex)
  startDate?: string | Date;  // Custom start date
  endDate?: string | Date;    // Custom end date
}
```

**Returns:**
```typescript
interface CostStats {
  total: number;              // Total cost in USD
  byModel: Record<string, number>;    // Cost by model
  byProvider: Record<string, number>; // Cost by provider
  daily: Record<string, number>;      // Daily totals
  entryCount: number;         // Number of entries
  totalInputTokens: number;   // Total input tokens
  totalOutputTokens: number;  // Total output tokens
  averageCost: number;        // Average cost per entry
  dateRange: { start: string; end: string };
}
```

**Example:**
```typescript
// All stats for last 7 days
const stats = tracker.getStats({ days: 7 });

// Filter by provider
const openaiStats = tracker.getStats({ provider: 'openai' });

// Filter by task pattern
const codeStats = tracker.getStats({ taskPattern: /code|review/i });

// Custom date range
const stats = tracker.getStats({
  startDate: '2025-01-01',
  endDate: '2025-01-31',
});
```

##### `getEntries(limit?: number): CostEntry[]`

Returns the most recent entries.

```typescript
// Get last 50 entries
const entries = tracker.getEntries(50);
```

##### `getAllEntries(): CostEntry[]`

Returns all entries (copy of internal array).

##### `clear(): void`

Removes all entries.

##### `deleteWhere(filter: (entry: CostEntry) => boolean): number`

Deletes entries matching the filter. Returns count of deleted entries.

```typescript
// Delete all entries older than 90 days
const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
const deleted = tracker.deleteWhere(e => new Date(e.timestamp) < cutoff);
console.log(`Deleted ${deleted} old entries`);
```

##### `export(options: ExportOptions): string`

Exports entries to JSON or CSV format.

```typescript
interface ExportOptions {
  format: 'json' | 'csv';
  days?: number;           // Limit to recent days
  includeHeaders?: boolean; // CSV headers (default: true)
  pretty?: boolean;        // Pretty print JSON (default: true)
}
```

**Example:**
```typescript
// Export to pretty JSON
const json = tracker.export({ format: 'json', pretty: true });

// Export last 7 days to CSV
const csv = tracker.export({ format: 'csv', days: 7 });
```

##### `import(data: string | CostEntry[]): ImportResult`

Imports entries from JSON string or array.

```typescript
const result = tracker.import(jsonString);
console.log(`Imported: ${result.imported}, Failed: ${result.failed}`);
if (result.errors.length > 0) {
  console.log('Errors:', result.errors);
}
```

##### `addBudgetAlert(alert: BudgetAlert): void`

Adds a budget alert that triggers when spending exceeds a threshold.

```typescript
interface BudgetAlert {
  limit: number;           // Budget limit in USD
  threshold: number;       // Alert threshold (0-1, e.g., 0.8 = 80%)
  period: 'daily' | 'weekly' | 'monthly';
  onExceeded?: (current: number, limit: number) => void;
}
```

**Example:**
```typescript
// Alert when daily spending reaches 80% of $10
tracker.addBudgetAlert({
  limit: 10,
  threshold: 0.8,
  period: 'daily',
  onExceeded: (current, limit) => {
    console.warn(`Budget warning: $${current.toFixed(2)} of $${limit} spent`);
    // Send Slack notification, email, etc.
  },
});
```

##### `calculateCost(model: string, inputTokens: number, outputTokens: number): number`

Calculates cost for given token counts and model.

```typescript
const cost = tracker.calculateCost('gpt-4o', 10000, 5000);
console.log(`Estimated cost: $${cost.toFixed(4)}`);
```

##### `getAvailableModels(): Record<string, ModelPricing>`

Returns all available models with their pricing.

##### `setPricing(model: string, pricing: ModelPricing): void`

Adds or updates pricing for a model.

```typescript
tracker.setPricing('my-custom-model', {
  inputPer1M: 2.5,
  outputPer1M: 7.5,
});
```

##### `getDataFilePath(): string`

Returns the path to the data file.

##### `forceSave(): void`

Forces a save (useful when autoSave is disabled).

---

### Events

CostTracker extends EventEmitter and emits the following events:

| Event | Payload | Description |
|-------|---------|-------------|
| `record` | `CostEntry` | Fired after recording an entry |
| `load` | `CostEntry[]` | Fired after loading data file |
| `save` | `CostEntry[]` | Fired after saving data file |
| `clear` | `void` | Fired after clearing all entries |
| `budgetExceeded` | `{ current, limit, period }` | Fired when budget threshold is exceeded |

**Example:**
```typescript
tracker.on('record', (entry) => {
  console.log(`Recorded: ${entry.model} - $${entry.cost.toFixed(4)}`);
});

tracker.on('budgetExceeded', ({ current, limit, period }) => {
  sendAlert(`${period} budget exceeded: $${current.toFixed(2)}/$${limit}`);
});
```

---

### Error Classes

All errors extend `CostTrackerError` and include additional context.

| Error Class | Code | When Thrown |
|-------------|------|-------------|
| `CostTrackerError` | `COST_TRACKER_ERROR` | Base error class |
| `InvalidModelError` | `INVALID_MODEL` | Unknown model in strict mode |
| `InvalidTokenCountError` | `INVALID_TOKEN_COUNT` | Negative or NaN tokens |
| `InvalidProviderError` | `INVALID_PROVIDER` | Empty or invalid provider |
| `InvalidDateRangeError` | `INVALID_DATE_RANGE` | Negative days in stats |
| `DataFileError` | `DATA_FILE_ERROR` | File read/write/parse error |
| `UnsupportedExportFormatError` | `UNSUPPORTED_EXPORT_FORMAT` | Unknown export format |

**Example:**
```typescript
import { CostTracker, InvalidModelError } from 'skylily-cost-tracker';

const tracker = new CostTracker({ strictMode: true });

try {
  tracker.record({ provider: 'test', model: 'unknown', inputTokens: 100, outputTokens: 50 });
} catch (error) {
  if (error instanceof InvalidModelError) {
    console.log(`Unknown model: ${error.model}`);
    console.log(`Available: ${error.availableModels.join(', ')}`);
  }
}
```

---

## 💵 Built-in Pricing

Pricing data for 25+ models (per 1M tokens, USD):

### OpenAI
| Model | Input | Output |
|-------|-------|--------|
| gpt-4o | $2.50 | $10.00 |
| gpt-4o-mini | $0.15 | $0.60 |
| gpt-4.1 | $2.00 | $8.00 |
| gpt-4.1-mini | $0.15 | $0.60 |
| gpt-4.1-nano | $0.05 | $0.20 |
| gpt-5.2-codex | $3.00 | $12.00 |
| o3 | $20.00 | $60.00 |
| o3-mini | $1.10 | $4.40 |
| o4-mini | $1.10 | $4.40 |

### Anthropic
| Model | Input | Output |
|-------|-------|--------|
| claude-opus-4 | $15.00 | $75.00 |
| claude-sonnet-4 | $3.00 | $15.00 |
| claude-haiku | $0.25 | $1.25 |
| claude-3.5-sonnet | $3.00 | $15.00 |
| claude-3-opus | $15.00 | $75.00 |

### Google
| Model | Input | Output |
|-------|-------|--------|
| gemini-2.5-pro | $2.50 | $10.00 |
| gemini-2.5-flash | $0.50 | $1.50 |
| gemini-2.5-flash-lite | $0.25 | $0.75 |
| gemini-2.0-flash | $0.10 | $0.40 |

### Perplexity
| Model | Input | Output |
|-------|-------|--------|
| sonar-pro | $3.00 | $15.00 |
| sonar | $1.00 | $5.00 |
| sonar-deep-research | $5.00 | $25.00 |

---

## 🔧 Advanced Usage

### Custom Data File Location

```typescript
const tracker = new CostTracker({
  dataFile: '/var/log/llm-costs.json',
});
```

### Disable Auto-Save

```typescript
const tracker = new CostTracker({ autoSave: false });

// ... batch operations ...

tracker.forceSave(); // Save manually
```

### Strict Mode

```typescript
const tracker = new CostTracker({ strictMode: true });

// This will throw InvalidModelError
tracker.record({
  provider: 'openai',
  model: 'unknown-model',
  inputTokens: 100,
  outputTokens: 50,
});
```

### Integration with OpenAI SDK

```typescript
import OpenAI from 'openai';
import { CostTracker } from 'skylily-cost-tracker';

const openai = new OpenAI();
const tracker = new CostTracker();

async function chat(messages: OpenAI.ChatCompletionMessageParam[]) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages,
  });

  // Track the cost
  if (response.usage) {
    tracker.record({
      provider: 'openai',
      model: 'gpt-4o',
      inputTokens: response.usage.prompt_tokens,
      outputTokens: response.usage.completion_tokens,
      task: messages[0]?.content?.toString().slice(0, 50),
    });
  }

  return response;
}
```

### Integration with Anthropic SDK

```typescript
import Anthropic from '@anthropic-ai/sdk';
import { CostTracker } from 'skylily-cost-tracker';

const anthropic = new Anthropic();
const tracker = new CostTracker();

async function chat(prompt: string) {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  });

  tracker.record({
    provider: 'anthropic',
    model: 'claude-sonnet-4',
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
  });

  return response;
}
```

---

## 📁 Project Structure

```
skylily-cost-tracker/
├── src/
│   ├── index.ts          # Main exports
│   ├── tracker.ts        # CostTracker class
│   ├── errors.ts         # Custom error classes
│   ├── types.ts          # TypeScript types
│   └── cli.ts            # CLI implementation
├── tests/
│   ├── tracker.test.ts   # Core tests
│   ├── errors.test.ts    # Error tests
│   └── cli.test.ts       # CLI tests
├── examples/
│   ├── basic-usage.ts
│   ├── budget-alerts.ts
│   ├── export-import.ts
│   ├── custom-pricing.ts
│   └── advanced-filtering.ts
├── dist/                  # Compiled output
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── README.md
├── CHANGELOG.md
├── CONTRIBUTING.md
└── LICENSE
```

---

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

---

## 📜 License

MIT © [Skylily 🌸](https://github.com/skylily)

---

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## 📝 Changelog

See [CHANGELOG.md](CHANGELOG.md) for release history.

---

## 🙏 Acknowledgments

- Built with love by Skylily 🌸
- Pricing data from official provider documentation
- Inspired by the need to track LLM costs across multiple projects

---

<p align="center">Made with 💜 for the AI community</p>
