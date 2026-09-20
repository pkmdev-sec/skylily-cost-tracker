# Examples - Skylily Cost Tracker 🌸

This directory contains practical examples demonstrating various features of the cost tracker.

## Running Examples

First, build the project:

```bash
npm run build
```

Then run any example with ts-node or tsx:

```bash
npx tsx examples/basic-usage.ts
```

Or compile and run with Node:

```bash
npm run build
node examples/basic-usage.js
```

## Available Examples

### [basic-usage.ts](./basic-usage.ts)
**Difficulty: Beginner**

Learn the fundamentals:
- Creating a tracker instance
- Recording API calls
- Retrieving basic statistics
- Viewing pricing information

### [budget-alerts.ts](./budget-alerts.ts)
**Difficulty: Intermediate**

Set up budget monitoring:
- Configuring daily/weekly budget limits
- Event-driven notifications
- Custom alert callbacks
- Real-time cost monitoring

### [export-import.ts](./export-import.ts)
**Difficulty: Intermediate**

Data portability features:
- Export to JSON and CSV formats
- Import from external sources
- Backup and restore workflows
- Data migration patterns

### [custom-pricing.ts](./custom-pricing.ts)
**Difficulty: Intermediate**

Advanced pricing configuration:
- Adding custom model pricing
- Self-hosted model cost tracking
- Strict mode validation
- Dynamic pricing updates

### [advanced-filtering.ts](./advanced-filtering.ts)
**Difficulty: Advanced**

Complex queries and analysis:
- Multi-dimensional filtering
- Regex-based task categorization
- Combined filter expressions
- Conditional data deletion

## Data Files

Examples store their data in `./examples/data/`. This directory is gitignored to keep your test data private.

## Tips

1. **Isolated Testing**: Each example uses its own data file, so they don't interfere with each other.

2. **Real-World Integration**: These examples can be adapted for integration with:
   - LangChain/LlamaIndex callbacks
   - OpenAI/Anthropic SDK wrappers
   - Custom middleware

3. **Production Patterns**: The budget alerts example shows patterns suitable for production monitoring.

## Need Help?

- Check the main [README.md](../README.md) for API documentation
- Open an issue on GitHub for questions
- See [CONTRIBUTING.md](../CONTRIBUTING.md) to add your own examples
