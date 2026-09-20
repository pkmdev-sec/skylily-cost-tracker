/**
 * Skylily Cost Tracker 🌸
 * 
 * Track and optimize LLM API costs across multiple providers.
 * 
 * @packageDocumentation
 */

// Main exports
export { CostTracker, tracker, PRICING } from './tracker.js';

// Error classes
export {
  CostTrackerError,
  InvalidModelError,
  InvalidTokenCountError,
  InvalidProviderError,
  InvalidDateRangeError,
  DataFileError,
  UnsupportedExportFormatError,
} from './errors.js';

// Types
export type {
  CostEntry,
  ModelPricing,
  CostTrackerConfig,
  CostStats,
  RecordOptions,
  StatsOptions,
  ExportOptions,
  ImportResult,
  BudgetAlert,
  CostTrackerEvent,
  CostEventCallback,
} from './types.js';

// Version
export const VERSION = '1.0.0';
