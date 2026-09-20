/**
 * Cost Tracker - Skylily 🌸
 * 
 * Track and optimize LLM API costs across multiple providers.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { EventEmitter } from 'node:events';

import {
  CostTrackerError,
  InvalidModelError,
  InvalidTokenCountError,
  InvalidProviderError,
  InvalidDateRangeError,
  DataFileError,
  UnsupportedExportFormatError,
} from './errors.js';

import type {
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

/**
 * Default pricing for popular LLM models (per 1M tokens in USD)
 * Last updated: January 2025
 */
export const PRICING: Record<string, ModelPricing> = {
  // OpenAI Models
  'gpt-4o': { inputPer1M: 2.5, outputPer1M: 10 },
  'gpt-4o-mini': { inputPer1M: 0.15, outputPer1M: 0.6 },
  'gpt-4.1': { inputPer1M: 2, outputPer1M: 8 },
  'gpt-4.1-mini': { inputPer1M: 0.15, outputPer1M: 0.6 },
  'gpt-4.1-nano': { inputPer1M: 0.05, outputPer1M: 0.2 },
  'gpt-5.2-codex': { inputPer1M: 3, outputPer1M: 12 },
  'o3': { inputPer1M: 20, outputPer1M: 60 },
  'o3-mini': { inputPer1M: 1.10, outputPer1M: 4.40 },
  'o4-mini': { inputPer1M: 1.10, outputPer1M: 4.40 },
  
  // Anthropic Models
  'claude-opus-4': { inputPer1M: 15, outputPer1M: 75 },
  'claude-sonnet-4': { inputPer1M: 3, outputPer1M: 15 },
  'claude-haiku': { inputPer1M: 0.25, outputPer1M: 1.25 },
  'claude-3.5-sonnet': { inputPer1M: 3, outputPer1M: 15 },
  'claude-3-opus': { inputPer1M: 15, outputPer1M: 75 },
  
  // Google Models
  'gemini-2.5-pro': { inputPer1M: 2.5, outputPer1M: 10 },
  'gemini-2.5-flash': { inputPer1M: 0.5, outputPer1M: 1.5 },
  'gemini-2.5-flash-lite': { inputPer1M: 0.25, outputPer1M: 0.75 },
  'gemini-2.0-flash': { inputPer1M: 0.1, outputPer1M: 0.4 },
  
  // Perplexity Models
  'sonar-pro': { inputPer1M: 3, outputPer1M: 15 },
  'sonar': { inputPer1M: 1, outputPer1M: 5 },
  'sonar-deep-research': { inputPer1M: 5, outputPer1M: 25 },
};

/**
 * Default configuration values
 */
const DEFAULT_CONFIG: Required<CostTrackerConfig> = {
  dataFile: '~/.cost-tracker.json',
  autoSave: true,
  customPricing: {},
  strictMode: false,
  defaultProvider: 'unknown',
};

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
export class CostTracker extends EventEmitter {
  private dataFile: string;
  private entries: CostEntry[] = [];
  private config: Required<CostTrackerConfig>;
  private pricing: Record<string, ModelPricing>;
  private budgetAlerts: BudgetAlert[] = [];
  
  /**
   * Create a new CostTracker instance
   * 
   * @param config - Configuration options
   */
  constructor(config: CostTrackerConfig = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.dataFile = this.expandPath(this.config.dataFile);
    this.pricing = { ...PRICING, ...this.config.customPricing };
    this.load();
  }
  
  /**
   * Expand ~ to home directory
   */
  private expandPath(filePath: string): string {
    if (filePath.startsWith('~')) {
      const home = process.env.HOME || process.env.USERPROFILE || '';
      return path.join(home, filePath.slice(1));
    }
    return filePath;
  }
  
  /**
   * Load entries from the data file
   */
  private load(): void {
    try {
      if (fs.existsSync(this.dataFile)) {
        const content = fs.readFileSync(this.dataFile, 'utf-8');
        const data = JSON.parse(content);
        this.entries = Array.isArray(data) ? data : [];
        this.emit('load', this.entries);
      }
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new DataFileError('parse', this.dataFile, error);
      }
      throw new DataFileError('read', this.dataFile, error as Error);
    }
  }
  
  /**
   * Save entries to the data file
   */
  private save(): void {
    try {
      const dir = path.dirname(this.dataFile);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.dataFile, JSON.stringify(this.entries, null, 2));
      this.emit('save', this.entries);
    } catch (error) {
      throw new DataFileError('write', this.dataFile, error as Error);
    }
  }
  
  /**
   * Validate token count
   */
  private validateTokens(field: 'inputTokens' | 'outputTokens', value: unknown): number {
    const num = Number(value);
    if (typeof value !== 'number' || isNaN(num) || num < 0) {
      throw new InvalidTokenCountError(field, value);
    }
    return num;
  }
  
  /**
   * Calculate cost for given tokens and model
   */
  calculateCost(model: string, inputTokens: number, outputTokens: number): number {
    const pricing = this.pricing[model];
    if (!pricing && this.config.strictMode) {
      throw new InvalidModelError(model, Object.keys(this.pricing));
    }
    const { inputPer1M = 1, outputPer1M = 1 } = pricing || {};
    return (inputTokens / 1_000_000) * inputPer1M + (outputTokens / 1_000_000) * outputPer1M;
  }
  
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
  record(
    optionsOrProvider: RecordOptions | string,
    model?: string,
    inputTokens?: number,
    outputTokens?: number,
    task?: string
  ): CostEntry {
    // Handle both new options object and legacy positional arguments
    let opts: RecordOptions;
    
    if (typeof optionsOrProvider === 'string') {
      // Legacy positional arguments
      opts = {
        provider: optionsOrProvider,
        model: model || 'unknown',
        inputTokens: inputTokens || 0,
        outputTokens: outputTokens || 0,
        task,
      };
    } else {
      opts = optionsOrProvider;
    }
    
    // Validation
    if (!opts.provider || typeof opts.provider !== 'string') {
      throw new InvalidProviderError(String(opts.provider));
    }
    
    const validatedInput = this.validateTokens('inputTokens', opts.inputTokens);
    const validatedOutput = this.validateTokens('outputTokens', opts.outputTokens);
    
    // Calculate cost
    const cost = opts.costOverride ?? this.calculateCost(opts.model, validatedInput, validatedOutput);
    
    const entry: CostEntry = {
      timestamp: new Date().toISOString(),
      provider: opts.provider,
      model: opts.model,
      inputTokens: validatedInput,
      outputTokens: validatedOutput,
      cost,
      ...(opts.task && { task: opts.task }),
      ...(opts.metadata && { metadata: opts.metadata }),
    };
    
    this.entries.push(entry);
    
    if (this.config.autoSave) {
      this.save();
    }
    
    this.emit('record', entry);
    this.checkBudgetAlerts();
    
    return entry;
  }
  
  /**
   * Get cost statistics for a time period
   * 
   * @param options - Statistics options
   * @returns Cost statistics
   */
  getStats(options: StatsOptions | number = {}): CostStats {
    // Handle legacy number argument for days
    const opts: StatsOptions = typeof options === 'number' ? { days: options } : options;
    const days = opts.days ?? 30;
    
    if (days <= 0) {
      throw new InvalidDateRangeError(days);
    }
    
    const now = new Date();
    const startDate = opts.startDate 
      ? new Date(opts.startDate)
      : new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const endDate = opts.endDate ? new Date(opts.endDate) : now;
    
    let recent = this.entries.filter(e => {
      const entryDate = new Date(e.timestamp);
      return entryDate >= startDate && entryDate <= endDate;
    });
    
    // Apply filters
    if (opts.provider) {
      recent = recent.filter(e => e.provider === opts.provider);
    }
    if (opts.model) {
      recent = recent.filter(e => e.model === opts.model);
    }
    if (opts.taskPattern) {
      recent = recent.filter(e => e.task && opts.taskPattern!.test(e.task));
    }
    
    const byModel: Record<string, number> = {};
    const byProvider: Record<string, number> = {};
    const daily: Record<string, number> = {};
    let total = 0;
    let totalInputTokens = 0;
    let totalOutputTokens = 0;
    
    for (const entry of recent) {
      total += entry.cost;
      totalInputTokens += entry.inputTokens;
      totalOutputTokens += entry.outputTokens;
      byModel[entry.model] = (byModel[entry.model] ?? 0) + entry.cost;
      byProvider[entry.provider] = (byProvider[entry.provider] ?? 0) + entry.cost;
      
      const day = entry.timestamp.split('T')[0]!;
      daily[day] = (daily[day] ?? 0) + entry.cost;
    }
    
    return {
      total,
      byModel,
      byProvider,
      daily,
      entryCount: recent.length,
      totalInputTokens,
      totalOutputTokens,
      averageCost: recent.length > 0 ? total / recent.length : 0,
      dateRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
    };
  }
  
  /**
   * Get entries with optional limit
   * 
   * @param limit - Maximum number of entries to return
   * @returns Array of cost entries
   */
  getEntries(limit: number = 100): CostEntry[] {
    return this.entries.slice(-limit);
  }
  
  /**
   * Get all entries
   */
  getAllEntries(): CostEntry[] {
    return [...this.entries];
  }
  
  /**
   * Clear all entries
   */
  clear(): void {
    this.entries = [];
    if (this.config.autoSave) {
      this.save();
    }
    this.emit('clear');
  }
  
  /**
   * Delete entries matching a filter
   * 
   * @param filter - Filter function
   * @returns Number of deleted entries
   */
  deleteWhere(filter: (entry: CostEntry) => boolean): number {
    const before = this.entries.length;
    this.entries = this.entries.filter(e => !filter(e));
    const deleted = before - this.entries.length;
    
    if (deleted > 0 && this.config.autoSave) {
      this.save();
    }
    
    return deleted;
  }
  
  /**
   * Export entries to a string format
   * 
   * @param options - Export options
   * @returns Formatted string
   */
  export(options: ExportOptions): string {
    const { format, days, includeHeaders = true, pretty = true } = options;
    
    let entries = this.entries;
    if (days) {
      const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      entries = entries.filter(e => new Date(e.timestamp) >= cutoff);
    }
    
    if (format === 'json') {
      return pretty ? JSON.stringify(entries, null, 2) : JSON.stringify(entries);
    }
    
    if (format === 'csv') {
      const headers = ['timestamp', 'provider', 'model', 'inputTokens', 'outputTokens', 'cost', 'task'];
      const rows = entries.map(e => 
        headers.map(h => {
          const val = e[h as keyof CostEntry];
          return typeof val === 'string' && val.includes(',') ? `"${val}"` : String(val ?? '');
        }).join(',')
      );
      return includeHeaders ? [headers.join(','), ...rows].join('\n') : rows.join('\n');
    }
    
    throw new UnsupportedExportFormatError(format);
  }
  
  /**
   * Import entries from JSON
   * 
   * @param data - JSON string or array of entries
   * @returns Import result
   */
  import(data: string | CostEntry[]): ImportResult {
    const result: ImportResult = { imported: 0, failed: 0, errors: [] };
    
    let entries: unknown[];
    try {
      entries = typeof data === 'string' ? JSON.parse(data) : data;
    } catch (e) {
      result.errors.push(`Parse error: ${(e as Error).message}`);
      result.failed = 1;
      return result;
    }
    
    if (!Array.isArray(entries)) {
      result.errors.push('Data must be an array');
      result.failed = 1;
      return result;
    }
    
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i] as Partial<CostEntry>;
      try {
        if (!entry.timestamp || !entry.provider || !entry.model) {
          throw new Error('Missing required fields');
        }
        this.entries.push({
          timestamp: entry.timestamp,
          provider: entry.provider,
          model: entry.model,
          inputTokens: entry.inputTokens || 0,
          outputTokens: entry.outputTokens || 0,
          cost: entry.cost || 0,
          task: entry.task,
          metadata: entry.metadata,
        });
        result.imported++;
      } catch (e) {
        result.failed++;
        result.errors.push(`Entry ${i}: ${(e as Error).message}`);
      }
    }
    
    if (result.imported > 0 && this.config.autoSave) {
      this.save();
    }
    
    return result;
  }
  
  /**
   * Add a budget alert
   * 
   * @param alert - Budget alert configuration
   */
  addBudgetAlert(alert: BudgetAlert): void {
    this.budgetAlerts.push(alert);
  }
  
  /**
   * Check budget alerts and trigger callbacks
   */
  private checkBudgetAlerts(): void {
    for (const alert of this.budgetAlerts) {
      let days: number;
      switch (alert.period) {
        case 'daily': days = 1; break;
        case 'weekly': days = 7; break;
        case 'monthly': days = 30; break;
      }
      
      const stats = this.getStats({ days });
      const threshold = alert.limit * alert.threshold;
      
      if (stats.total >= threshold) {
        this.emit('budgetExceeded', { current: stats.total, limit: alert.limit, period: alert.period });
        alert.onExceeded?.(stats.total, alert.limit);
      }
    }
  }
  
  /**
   * Get available models with pricing
   */
  getAvailableModels(): Record<string, ModelPricing> {
    return { ...this.pricing };
  }
  
  /**
   * Add or update pricing for a model
   * 
   * @param model - Model identifier
   * @param pricing - Pricing information
   */
  setPricing(model: string, pricing: ModelPricing): void {
    this.pricing[model] = pricing;
  }
  
  /**
   * Get the data file path
   */
  getDataFilePath(): string {
    return this.dataFile;
  }
  
  /**
   * Force save (useful when autoSave is disabled)
   */
  forceSave(): void {
    this.save();
  }
}

// Default instance for convenience
export const tracker = new CostTracker();
