# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Nothing yet

---

## [1.0.0] - 2025-01-28

### Added

#### Core Features
- **CostTracker class** - Main class for tracking LLM API costs
  - `record()` - Record cost entries with automatic cost calculation
  - `getStats()` - Get statistics with filtering by provider, model, task, date range
  - `getEntries()` / `getAllEntries()` - Retrieve recorded entries
  - `clear()` - Clear all entries
  - `deleteWhere()` - Delete entries matching a filter
  - `export()` - Export to JSON or CSV format
  - `import()` - Import from JSON string or array
  - `calculateCost()` - Calculate cost for given tokens
  - `getAvailableModels()` / `setPricing()` - Manage pricing data
  - `addBudgetAlert()` - Set up budget alerts with callbacks
  - `forceSave()` - Manual save when autoSave is disabled

#### Built-in Pricing
- **OpenAI models**: gpt-4o, gpt-4o-mini, gpt-4.1, gpt-4.1-mini, gpt-4.1-nano, gpt-5.2-codex, o3, o3-mini, o4-mini
- **Anthropic models**: claude-opus-4, claude-sonnet-4, claude-haiku, claude-3.5-sonnet, claude-3-opus
- **Google models**: gemini-2.5-pro, gemini-2.5-flash, gemini-2.5-flash-lite, gemini-2.0-flash
- **Perplexity models**: sonar-pro, sonar, sonar-deep-research

#### Configuration Options
- `dataFile` - Custom data file path
- `autoSave` - Enable/disable automatic saving
- `customPricing` - Add custom model pricing
- `strictMode` - Throw errors for unknown models
- `defaultProvider` - Default provider name

#### Events
- `record` - Fired after recording an entry
- `load` - Fired after loading data file
- `save` - Fired after saving data file
- `clear` - Fired after clearing entries
- `budgetExceeded` - Fired when budget threshold is exceeded

#### Error Classes
- `CostTrackerError` - Base error class
- `InvalidModelError` - Unknown model in strict mode
- `InvalidTokenCountError` - Invalid token count
- `InvalidProviderError` - Invalid provider
- `InvalidDateRangeError` - Invalid date range
- `DataFileError` - File operation error
- `UnsupportedExportFormatError` - Unknown export format

#### CLI
- `cost-tracker stats` - Display cost statistics
- `cost-tracker record` - Record a cost entry
- `cost-tracker pricing` - Show model pricing
- `cost-tracker history` - Show recent entries

#### TypeScript Support
- Full type definitions
- Exported interfaces: `CostEntry`, `ModelPricing`, `CostTrackerConfig`, `CostStats`, `RecordOptions`, `StatsOptions`, `ExportOptions`, `ImportResult`, `BudgetAlert`

#### Documentation
- Comprehensive README with API reference
- Multiple usage examples
- CONTRIBUTING.md guidelines

### Changed
- Nothing (initial release)

### Deprecated
- Nothing (initial release)

### Removed
- Nothing (initial release)

### Fixed
- Nothing (initial release)

### Security
- Nothing (initial release)

---

## [0.1.0] - 2025-01-28

### Added
- Initial prototype with basic tracking functionality
- Simple CLI

---

[Unreleased]: https://github.com/skylily/skylily-cost-tracker/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/skylily/skylily-cost-tracker/compare/v0.1.0...v1.0.0
[0.1.0]: https://github.com/skylily/skylily-cost-tracker/releases/tag/v0.1.0
