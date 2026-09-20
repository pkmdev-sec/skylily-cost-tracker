/**
 * Skylily Cost Tracker 🌸
 *
 * Track and optimize LLM API costs across multiple providers.
 *
 * @packageDocumentation
 */
export { CostTracker, tracker, PRICING } from './tracker.js';
export { CostTrackerError, InvalidModelError, InvalidTokenCountError, InvalidProviderError, InvalidDateRangeError, DataFileError, UnsupportedExportFormatError, } from './errors.js';
export type { CostEntry, ModelPricing, CostTrackerConfig, CostStats, RecordOptions, StatsOptions, ExportOptions, ImportResult, BudgetAlert, CostTrackerEvent, CostEventCallback, } from './types.js';
export declare const VERSION = "1.0.0";
//# sourceMappingURL=index.d.ts.map