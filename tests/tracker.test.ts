/**
 * CostTracker Tests - Skylily 🌸
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { 
  CostTracker, 
  PRICING,
  InvalidModelError,
  InvalidTokenCountError,
  InvalidProviderError,
  InvalidDateRangeError,
  DataFileError,
  UnsupportedExportFormatError,
} from '../src/index.js';

const TEST_DATA_FILE = '/tmp/cost-tracker-test.json';

describe('CostTracker', () => {
  let tracker: CostTracker;
  
  beforeEach(() => {
    // Clean up test file
    if (fs.existsSync(TEST_DATA_FILE)) {
      fs.unlinkSync(TEST_DATA_FILE);
    }
    tracker = new CostTracker({ dataFile: TEST_DATA_FILE, autoSave: true });
  });
  
  afterEach(() => {
    if (fs.existsSync(TEST_DATA_FILE)) {
      fs.unlinkSync(TEST_DATA_FILE);
    }
  });
  
  describe('constructor', () => {
    it('should create tracker with default config', () => {
      const t = new CostTracker({ dataFile: TEST_DATA_FILE });
      expect(t).toBeInstanceOf(CostTracker);
      expect(t.getDataFilePath()).toBe(TEST_DATA_FILE);
    });
    
    it('should expand ~ in data file path', () => {
      const t = new CostTracker({ dataFile: '~/.test-tracker.json' });
      const home = process.env.HOME || process.env.USERPROFILE || '';
      expect(t.getDataFilePath()).toBe(path.join(home, '.test-tracker.json'));
    });
    
    it('should merge custom pricing', () => {
      const t = new CostTracker({ 
        dataFile: TEST_DATA_FILE,
        customPricing: { 'my-model': { inputPer1M: 5, outputPer1M: 10 } }
      });
      const models = t.getAvailableModels();
      expect(models['my-model']).toEqual({ inputPer1M: 5, outputPer1M: 10 });
    });
    
    it('should load existing data file', () => {
      const existingData = [
        { timestamp: '2025-01-01T00:00:00Z', provider: 'test', model: 'test', inputTokens: 100, outputTokens: 50, cost: 0.01 }
      ];
      fs.writeFileSync(TEST_DATA_FILE, JSON.stringify(existingData));
      
      const t = new CostTracker({ dataFile: TEST_DATA_FILE });
      expect(t.getEntries()).toHaveLength(1);
    });
    
    it('should throw DataFileError on invalid JSON', () => {
      fs.writeFileSync(TEST_DATA_FILE, 'not valid json');
      expect(() => new CostTracker({ dataFile: TEST_DATA_FILE })).toThrow(DataFileError);
    });
  });
  
  describe('record', () => {
    it('should record a cost entry with options object', () => {
      const entry = tracker.record({
        provider: 'openai',
        model: 'gpt-4o',
        inputTokens: 1000,
        outputTokens: 500,
        task: 'Test task',
      });
      
      expect(entry.provider).toBe('openai');
      expect(entry.model).toBe('gpt-4o');
      expect(entry.inputTokens).toBe(1000);
      expect(entry.outputTokens).toBe(500);
      expect(entry.task).toBe('Test task');
      expect(entry.cost).toBeGreaterThan(0);
      expect(entry.timestamp).toBeDefined();
    });
    
    it('should record with legacy positional arguments', () => {
      const entry = tracker.record('anthropic', 'claude-sonnet-4', 2000, 1000, 'Legacy task');
      
      expect(entry.provider).toBe('anthropic');
      expect(entry.model).toBe('claude-sonnet-4');
      expect(entry.inputTokens).toBe(2000);
      expect(entry.outputTokens).toBe(1000);
      expect(entry.task).toBe('Legacy task');
    });
    
    it('should calculate cost based on pricing', () => {
      const entry = tracker.record({
        provider: 'openai',
        model: 'gpt-4o',
        inputTokens: 1_000_000, // 1M tokens
        outputTokens: 1_000_000, // 1M tokens
      });
      
      // gpt-4o: $2.5 input + $10 output = $12.5
      expect(entry.cost).toBe(12.5);
    });
    
    it('should allow cost override', () => {
      const entry = tracker.record({
        provider: 'custom',
        model: 'custom-model',
        inputTokens: 1000,
        outputTokens: 500,
        costOverride: 0.99,
      });
      
      expect(entry.cost).toBe(0.99);
    });
    
    it('should include metadata when provided', () => {
      const entry = tracker.record({
        provider: 'openai',
        model: 'gpt-4o',
        inputTokens: 100,
        outputTokens: 50,
        metadata: { requestId: '123', userId: 'abc' },
      });
      
      expect(entry.metadata).toEqual({ requestId: '123', userId: 'abc' });
    });
    
    it('should throw InvalidProviderError for empty provider', () => {
      expect(() => tracker.record({
        provider: '',
        model: 'gpt-4o',
        inputTokens: 100,
        outputTokens: 50,
      })).toThrow(InvalidProviderError);
    });
    
    it('should throw InvalidTokenCountError for negative tokens', () => {
      expect(() => tracker.record({
        provider: 'openai',
        model: 'gpt-4o',
        inputTokens: -100,
        outputTokens: 50,
      })).toThrow(InvalidTokenCountError);
    });
    
    it('should throw InvalidTokenCountError for NaN tokens', () => {
      expect(() => tracker.record({
        provider: 'openai',
        model: 'gpt-4o',
        inputTokens: NaN,
        outputTokens: 50,
      })).toThrow(InvalidTokenCountError);
    });
    
    it('should emit record event', () => {
      const callback = vi.fn();
      tracker.on('record', callback);
      
      tracker.record({
        provider: 'openai',
        model: 'gpt-4o',
        inputTokens: 100,
        outputTokens: 50,
      });
      
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(expect.objectContaining({ provider: 'openai' }));
    });
    
    it('should save automatically when autoSave is true', () => {
      tracker.record({
        provider: 'openai',
        model: 'gpt-4o',
        inputTokens: 100,
        outputTokens: 50,
      });
      
      const newTracker = new CostTracker({ dataFile: TEST_DATA_FILE });
      expect(newTracker.getEntries()).toHaveLength(1);
    });
    
    it('should not save when autoSave is false', () => {
      const t = new CostTracker({ dataFile: TEST_DATA_FILE, autoSave: false });
      t.record({
        provider: 'openai',
        model: 'gpt-4o',
        inputTokens: 100,
        outputTokens: 50,
      });
      
      const newTracker = new CostTracker({ dataFile: TEST_DATA_FILE });
      expect(newTracker.getEntries()).toHaveLength(0);
    });
  });
  
  describe('calculateCost', () => {
    it('should calculate cost for known model', () => {
      const cost = tracker.calculateCost('gpt-4o', 1_000_000, 1_000_000);
      expect(cost).toBe(12.5);
    });
    
    it('should use default pricing for unknown model', () => {
      const cost = tracker.calculateCost('unknown-model', 1_000_000, 1_000_000);
      expect(cost).toBe(2); // default: $1/1M input + $1/1M output
    });
    
    it('should throw in strict mode for unknown model', () => {
      const t = new CostTracker({ dataFile: TEST_DATA_FILE, strictMode: true });
      expect(() => t.calculateCost('unknown-model', 1000, 500)).toThrow(InvalidModelError);
    });
  });
  
  describe('getStats', () => {
    beforeEach(() => {
      // Add test entries
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      tracker.record({ provider: 'openai', model: 'gpt-4o', inputTokens: 1000, outputTokens: 500, task: 'task1' });
      tracker.record({ provider: 'openai', model: 'gpt-4.1-mini', inputTokens: 2000, outputTokens: 1000, task: 'task2' });
      tracker.record({ provider: 'anthropic', model: 'claude-sonnet-4', inputTokens: 1500, outputTokens: 750 });
    });
    
    it('should return total cost', () => {
      const stats = tracker.getStats();
      expect(stats.total).toBeGreaterThan(0);
      expect(stats.entryCount).toBe(3);
    });
    
    it('should group by model', () => {
      const stats = tracker.getStats();
      expect(stats.byModel['gpt-4o']).toBeDefined();
      expect(stats.byModel['gpt-4.1-mini']).toBeDefined();
      expect(stats.byModel['claude-sonnet-4']).toBeDefined();
    });
    
    it('should group by provider', () => {
      const stats = tracker.getStats();
      expect(stats.byProvider['openai']).toBeDefined();
      expect(stats.byProvider['anthropic']).toBeDefined();
    });
    
    it('should calculate daily totals', () => {
      const stats = tracker.getStats();
      const today = new Date().toISOString().split('T')[0];
      expect(stats.daily[today]).toBeDefined();
    });
    
    it('should filter by days (legacy number argument)', () => {
      const stats = tracker.getStats(30);
      expect(stats.entryCount).toBe(3);
    });
    
    it('should filter by provider', () => {
      const stats = tracker.getStats({ provider: 'openai' });
      expect(stats.entryCount).toBe(2);
    });
    
    it('should filter by model', () => {
      const stats = tracker.getStats({ model: 'gpt-4o' });
      expect(stats.entryCount).toBe(1);
    });
    
    it('should filter by task pattern', () => {
      const stats = tracker.getStats({ taskPattern: /task/ });
      expect(stats.entryCount).toBe(2);
    });
    
    it('should throw InvalidDateRangeError for negative days', () => {
      expect(() => tracker.getStats({ days: -1 })).toThrow(InvalidDateRangeError);
    });
    
    it('should calculate token totals', () => {
      const stats = tracker.getStats();
      expect(stats.totalInputTokens).toBe(4500);
      expect(stats.totalOutputTokens).toBe(2250);
    });
    
    it('should include date range', () => {
      const stats = tracker.getStats({ days: 7 });
      expect(stats.dateRange.start).toBeDefined();
      expect(stats.dateRange.end).toBeDefined();
    });
  });
  
  describe('getEntries', () => {
    it('should return limited entries', () => {
      for (let i = 0; i < 20; i++) {
        tracker.record({ provider: 'openai', model: 'gpt-4o', inputTokens: 100, outputTokens: 50 });
      }
      
      const entries = tracker.getEntries(5);
      expect(entries).toHaveLength(5);
    });
    
    it('should return all entries if limit exceeds count', () => {
      tracker.record({ provider: 'openai', model: 'gpt-4o', inputTokens: 100, outputTokens: 50 });
      
      const entries = tracker.getEntries(100);
      expect(entries).toHaveLength(1);
    });
  });
  
  describe('getAllEntries', () => {
    it('should return copy of all entries', () => {
      tracker.record({ provider: 'openai', model: 'gpt-4o', inputTokens: 100, outputTokens: 50 });
      tracker.record({ provider: 'openai', model: 'gpt-4o', inputTokens: 200, outputTokens: 100 });
      
      const entries = tracker.getAllEntries();
      expect(entries).toHaveLength(2);
    });
  });
  
  describe('clear', () => {
    it('should clear all entries', () => {
      tracker.record({ provider: 'openai', model: 'gpt-4o', inputTokens: 100, outputTokens: 50 });
      expect(tracker.getEntries()).toHaveLength(1);
      
      tracker.clear();
      expect(tracker.getEntries()).toHaveLength(0);
    });
    
    it('should emit clear event', () => {
      const callback = vi.fn();
      tracker.on('clear', callback);
      
      tracker.clear();
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });
  
  describe('deleteWhere', () => {
    it('should delete matching entries', () => {
      tracker.record({ provider: 'openai', model: 'gpt-4o', inputTokens: 100, outputTokens: 50 });
      tracker.record({ provider: 'anthropic', model: 'claude-sonnet-4', inputTokens: 100, outputTokens: 50 });
      
      const deleted = tracker.deleteWhere(e => e.provider === 'openai');
      
      expect(deleted).toBe(1);
      expect(tracker.getEntries()).toHaveLength(1);
      expect(tracker.getEntries()[0].provider).toBe('anthropic');
    });
  });
  
  describe('export', () => {
    beforeEach(() => {
      tracker.record({ provider: 'openai', model: 'gpt-4o', inputTokens: 1000, outputTokens: 500, task: 'Test' });
    });
    
    it('should export to JSON', () => {
      const json = tracker.export({ format: 'json' });
      const parsed = JSON.parse(json);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].provider).toBe('openai');
    });
    
    it('should export to compact JSON', () => {
      const json = tracker.export({ format: 'json', pretty: false });
      expect(json).not.toContain('\n');
    });
    
    it('should export to CSV', () => {
      const csv = tracker.export({ format: 'csv' });
      const lines = csv.split('\n');
      expect(lines).toHaveLength(2);
      expect(lines[0]).toContain('timestamp,provider,model');
    });
    
    it('should export CSV without headers', () => {
      const csv = tracker.export({ format: 'csv', includeHeaders: false });
      const lines = csv.split('\n');
      expect(lines).toHaveLength(1);
      expect(lines[0]).not.toContain('timestamp,provider');
    });
    
    it('should throw for unsupported format', () => {
      expect(() => tracker.export({ format: 'xml' as any })).toThrow(UnsupportedExportFormatError);
    });
  });
  
  describe('import', () => {
    it('should import from JSON string', () => {
      const data = JSON.stringify([
        { timestamp: '2025-01-01T00:00:00Z', provider: 'test', model: 'test', inputTokens: 100, outputTokens: 50, cost: 0.01 }
      ]);
      
      const result = tracker.import(data);
      
      expect(result.imported).toBe(1);
      expect(result.failed).toBe(0);
      expect(tracker.getEntries()).toHaveLength(1);
    });
    
    it('should import from array', () => {
      const data = [
        { timestamp: '2025-01-01T00:00:00Z', provider: 'test', model: 'test', inputTokens: 100, outputTokens: 50, cost: 0.01 }
      ];
      
      const result = tracker.import(data);
      expect(result.imported).toBe(1);
    });
    
    it('should handle invalid JSON', () => {
      const result = tracker.import('not json');
      expect(result.failed).toBe(1);
      expect(result.errors).toHaveLength(1);
    });
    
    it('should handle entries with missing fields', () => {
      const data = [
        { timestamp: '2025-01-01T00:00:00Z' }, // missing provider and model
      ];
      
      const result = tracker.import(data as any);
      expect(result.failed).toBe(1);
      expect(result.imported).toBe(0);
    });
  });
  
  describe('budget alerts', () => {
    it('should trigger budget alert callback', () => {
      const callback = vi.fn();
      tracker.addBudgetAlert({
        limit: 0.001,
        threshold: 0.5,
        period: 'daily',
        onExceeded: callback,
      });
      
      tracker.record({
        provider: 'openai',
        model: 'gpt-4o',
        inputTokens: 1_000_000,
        outputTokens: 1_000_000,
      });
      
      expect(callback).toHaveBeenCalled();
    });
    
    it('should emit budgetExceeded event', () => {
      const callback = vi.fn();
      tracker.on('budgetExceeded', callback);
      
      tracker.addBudgetAlert({
        limit: 0.001,
        threshold: 0.5,
        period: 'daily',
      });
      
      tracker.record({
        provider: 'openai',
        model: 'gpt-4o',
        inputTokens: 1_000_000,
        outputTokens: 1_000_000,
      });
      
      expect(callback).toHaveBeenCalledWith(expect.objectContaining({ limit: 0.001, period: 'daily' }));
    });
  });
  
  describe('pricing', () => {
    it('should get available models', () => {
      const models = tracker.getAvailableModels();
      expect(models['gpt-4o']).toBeDefined();
      expect(models['claude-sonnet-4']).toBeDefined();
    });
    
    it('should set custom pricing', () => {
      tracker.setPricing('my-model', { inputPer1M: 5, outputPer1M: 10 });
      
      const models = tracker.getAvailableModels();
      expect(models['my-model']).toEqual({ inputPer1M: 5, outputPer1M: 10 });
    });
  });
  
  describe('forceSave', () => {
    it('should save when called', () => {
      const t = new CostTracker({ dataFile: TEST_DATA_FILE, autoSave: false });
      t.record({ provider: 'openai', model: 'gpt-4o', inputTokens: 100, outputTokens: 50 });
      
      t.forceSave();
      
      const newTracker = new CostTracker({ dataFile: TEST_DATA_FILE });
      expect(newTracker.getEntries()).toHaveLength(1);
    });
  });
});

describe('PRICING', () => {
  it('should contain OpenAI models', () => {
    expect(PRICING['gpt-4o']).toBeDefined();
    expect(PRICING['gpt-4.1-mini']).toBeDefined();
  });
  
  it('should contain Anthropic models', () => {
    expect(PRICING['claude-opus-4']).toBeDefined();
    expect(PRICING['claude-sonnet-4']).toBeDefined();
  });
  
  it('should contain Google models', () => {
    expect(PRICING['gemini-2.5-pro']).toBeDefined();
    expect(PRICING['gemini-2.5-flash']).toBeDefined();
  });
  
  it('should have valid pricing structure', () => {
    for (const [model, pricing] of Object.entries(PRICING)) {
      expect(pricing.inputPer1M).toBeGreaterThan(0);
      expect(pricing.outputPer1M).toBeGreaterThan(0);
    }
  });
});
