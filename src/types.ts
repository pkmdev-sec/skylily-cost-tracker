/**
 * TypeScript Type Definitions - Skylily Cost Tracker 🌸
 */

/**
 * Represents a single cost entry in the tracker
 */
export interface CostEntry {
  /** ISO 8601 timestamp when the entry was recorded */
  timestamp: string;
  /** API provider (e.g., 'openai', 'anthropic', 'google') */
  provider: string;
  /** Model identifier (e.g., 'gpt-4o', 'claude-sonnet-4') */
  model: string;
  /** Number of input/prompt tokens */
  inputTokens: number;
  /** Number of output/completion tokens */
  outputTokens: number;
  /** Calculated cost in USD */
  cost: number;
  /** Optional task description for tracking purposes */
  task?: string;
  /** Optional metadata for additional context */
  metadata?: Record<string, unknown>;
}

/**
 * Pricing information for a model (per 1M tokens)
 */
export interface ModelPricing {
  /** Cost per 1 million input tokens in USD */
  inputPer1M: number;
  /** Cost per 1 million output tokens in USD */
  outputPer1M: number;
}

/**
 * Configuration options for CostTracker
 */
export interface CostTrackerConfig {
  /** Path to the data file (default: ~/.cost-tracker.json) */
  dataFile?: string;
  /** Whether to auto-save after each record (default: true) */
  autoSave?: boolean;
  /** Custom pricing overrides */
  customPricing?: Record<string, ModelPricing>;
  /** Whether to validate models against known pricing (default: false) */
  strictMode?: boolean;
  /** Default provider if not specified */
  defaultProvider?: string;
}

/**
 * Statistics returned by getStats()
 */
export interface CostStats {
  /** Total cost in USD for the period */
  total: number;
  /** Cost breakdown by model */
  byModel: Record<string, number>;
  /** Cost breakdown by provider */
  byProvider: Record<string, number>;
  /** Daily cost totals */
  daily: Record<string, number>;
  /** Number of entries in the period */
  entryCount: number;
  /** Total input tokens */
  totalInputTokens: number;
  /** Total output tokens */
  totalOutputTokens: number;
  /** Average cost per entry */
  averageCost: number;
  /** Date range of the stats */
  dateRange: {
    start: string;
    end: string;
  };
}

/**
 * Options for recording a cost entry
 */
export interface RecordOptions {
  /** API provider */
  provider: string;
  /** Model identifier */
  model: string;
  /** Number of input tokens */
  inputTokens: number;
  /** Number of output tokens */
  outputTokens: number;
  /** Optional task description */
  task?: string;
  /** Optional metadata */
  metadata?: Record<string, unknown>;
  /** Override automatic cost calculation */
  costOverride?: number;
}

/**
 * Options for getStats()
 */
export interface StatsOptions {
  /** Number of days to include (default: 30) */
  days?: number;
  /** Filter by provider */
  provider?: string;
  /** Filter by model */
  model?: string;
  /** Filter by task pattern (regex) */
  taskPattern?: RegExp;
  /** Start date (ISO string or Date) */
  startDate?: string | Date;
  /** End date (ISO string or Date) */
  endDate?: string | Date;
}

/**
 * Options for exporting data
 */
export interface ExportOptions {
  /** Export format */
  format: 'json' | 'csv';
  /** Number of days to include */
  days?: number;
  /** Include headers in CSV */
  includeHeaders?: boolean;
  /** Pretty print JSON */
  pretty?: boolean;
}

/**
 * Result of an import operation
 */
export interface ImportResult {
  /** Number of entries successfully imported */
  imported: number;
  /** Number of entries that failed */
  failed: number;
  /** Error messages for failed entries */
  errors: string[];
}

/**
 * Budget alert configuration
 */
export interface BudgetAlert {
  /** Budget limit in USD */
  limit: number;
  /** Alert threshold as percentage (0-1) */
  threshold: number;
  /** Period for the budget ('daily', 'weekly', 'monthly') */
  period: 'daily' | 'weekly' | 'monthly';
  /** Callback when threshold is exceeded */
  onExceeded?: (current: number, limit: number) => void;
}

/**
 * Callback type for cost tracking events
 */
export type CostEventCallback = (entry: CostEntry) => void;

/**
 * Event types emitted by CostTracker
 */
export type CostTrackerEvent = 'record' | 'load' | 'save' | 'clear' | 'budgetExceeded';
