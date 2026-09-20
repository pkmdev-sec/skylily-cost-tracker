/**
 * Cost Tracker - Skylily 🌸
 *
 * Track and optimize LLM API costs across multiple providers.
 */
import { EventEmitter } from 'node:events';
import type { CostEntry, ModelPricing, CostTrackerConfig, CostStats, RecordOptions, StatsOptions, ExportOptions, ImportResult, BudgetAlert } from './types.js';
/**
 * Default pricing for popular LLM models (per 1M tokens in USD)
 * Last updated: January 2025
 */
export declare const PRICING: Record<string, ModelPricing>;
/**
 * CostTracker - Track and analyze LLM API costs
 *
 * @example
 * ```typescript
 * import { CostTracker } from 'skylily-cost-tracker';
 *
 * const tracker = new CostTracker();
 *
 * // Record usage
 * tracker.record({
 *   provider: 'openai',
 *   model: 'gpt-4o',
 *   inputTokens: 1000,
 *   outputTokens: 500,
 *   task: 'Code review'
 * });
 *
 * // Get statistics
 * const stats = tracker.getStats({ days: 7 });
 * console.log(`Total cost: $${stats.total.toFixed(4)}`);
 * ```
 */
export declare class CostTracker extends EventEmitter {
    private dataFile;
    private entries;
    private config;
    private pricing;
    private budgetAlerts;
    /**
     * Create a new CostTracker instance
     *
     * @param config - Configuration options
     */
    constructor(config?: CostTrackerConfig);
    /**
     * Expand ~ to home directory
     */
    private expandPath;
    /**
     * Load entries from the data file
     */
    private load;
    /**
     * Save entries to the data file
     */
    private save;
    /**
     * Validate token count
     */
    private validateTokens;
    /**
     * Calculate cost for given tokens and model
     */
    calculateCost(model: string, inputTokens: number, outputTokens: number): number;
    /**
     * Record a cost entry
     *
     * @param options - Recording options or positional args for backward compatibility
     * @returns The recorded cost entry
     *
     * @example
     * ```typescript
     * // Using options object (recommended)
     * tracker.record({
     *   provider: 'anthropic',
     *   model: 'claude-sonnet-4',
     *   inputTokens: 2000,
     *   outputTokens: 1000,
     *   task: 'Documentation generation'
     * });
     *
     * // Using positional arguments (legacy)
     * tracker.record('openai', 'gpt-4o', 1000, 500, 'Code review');
     * ```
     */
    record(optionsOrProvider: RecordOptions | string, model?: string, inputTokens?: number, outputTokens?: number, task?: string): CostEntry;
    /**
     * Get cost statistics for a time period
     *
     * @param options - Statistics options
     * @returns Cost statistics
     */
    getStats(options?: StatsOptions | number): CostStats;
    /**
     * Get entries with optional limit
     *
     * @param limit - Maximum number of entries to return
     * @returns Array of cost entries
     */
    getEntries(limit?: number): CostEntry[];
    /**
     * Get all entries
     */
    getAllEntries(): CostEntry[];
    /**
     * Clear all entries
     */
    clear(): void;
    /**
     * Delete entries matching a filter
     *
     * @param filter - Filter function
     * @returns Number of deleted entries
     */
    deleteWhere(filter: (entry: CostEntry) => boolean): number;
    /**
     * Export entries to a string format
     *
     * @param options - Export options
     * @returns Formatted string
     */
    export(options: ExportOptions): string;
    /**
     * Import entries from JSON
     *
     * @param data - JSON string or array of entries
     * @returns Import result
     */
    import(data: string | CostEntry[]): ImportResult;
    /**
     * Add a budget alert
     *
     * @param alert - Budget alert configuration
     */
    addBudgetAlert(alert: BudgetAlert): void;
    /**
     * Check budget alerts and trigger callbacks
     */
    private checkBudgetAlerts;
    /**
     * Get available models with pricing
     */
    getAvailableModels(): Record<string, ModelPricing>;
    /**
     * Add or update pricing for a model
     *
     * @param model - Model identifier
     * @param pricing - Pricing information
     */
    setPricing(model: string, pricing: ModelPricing): void;
    /**
     * Get the data file path
     */
    getDataFilePath(): string;
    /**
     * Force save (useful when autoSave is disabled)
     */
    forceSave(): void;
}
export declare const tracker: CostTracker;
//# sourceMappingURL=tracker.d.ts.map