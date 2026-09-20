/**
 * Error Classes Tests - Skylily 🌸
 */

import { describe, it, expect } from 'vitest';
import {
  CostTrackerError,
  InvalidModelError,
  InvalidTokenCountError,
  InvalidProviderError,
  InvalidDateRangeError,
  DataFileError,
  UnsupportedExportFormatError,
} from '../src/errors.js';

describe('CostTrackerError', () => {
  it('should create base error with message', () => {
    const error = new CostTrackerError('Test error');
    expect(error.message).toBe('Test error');
    expect(error.name).toBe('CostTrackerError');
    expect(error.code).toBe('COST_TRACKER_ERROR');
    expect(error.timestamp).toBeDefined();
  });

  it('should create error with custom code', () => {
    const error = new CostTrackerError('Test error', 'CUSTOM_CODE');
    expect(error.code).toBe('CUSTOM_CODE');
  });

  it('should serialize to JSON', () => {
    const error = new CostTrackerError('Test error');
    const json = error.toJSON();
    
    expect(json.name).toBe('CostTrackerError');
    expect(json.code).toBe('COST_TRACKER_ERROR');
    expect(json.message).toBe('Test error');
    expect(json.timestamp).toBeDefined();
    expect(json.stack).toBeDefined();
  });

  it('should have stack trace', () => {
    const error = new CostTrackerError('Test error');
    expect(error.stack).toContain('CostTrackerError');
  });
});

describe('InvalidModelError', () => {
  it('should create error with model info', () => {
    const error = new InvalidModelError('unknown-model', ['gpt-4o', 'claude-sonnet-4']);
    
    expect(error.name).toBe('InvalidModelError');
    expect(error.code).toBe('INVALID_MODEL');
    expect(error.model).toBe('unknown-model');
    expect(error.availableModels).toEqual(['gpt-4o', 'claude-sonnet-4']);
    expect(error.message).toContain('unknown-model');
    expect(error.message).toContain('gpt-4o');
  });
});

describe('InvalidTokenCountError', () => {
  it('should create error for invalid inputTokens', () => {
    const error = new InvalidTokenCountError('inputTokens', -100);
    
    expect(error.name).toBe('InvalidTokenCountError');
    expect(error.code).toBe('INVALID_TOKEN_COUNT');
    expect(error.field).toBe('inputTokens');
    expect(error.value).toBe(-100);
    expect(error.message).toContain('inputTokens');
  });

  it('should create error for invalid outputTokens', () => {
    const error = new InvalidTokenCountError('outputTokens', 'not a number');
    
    expect(error.field).toBe('outputTokens');
    expect(error.value).toBe('not a number');
    expect(error.message).toContain('string');
  });
});

describe('InvalidProviderError', () => {
  it('should create error with provider', () => {
    const error = new InvalidProviderError('');
    
    expect(error.name).toBe('InvalidProviderError');
    expect(error.code).toBe('INVALID_PROVIDER');
    expect(error.provider).toBe('');
  });
});

describe('InvalidDateRangeError', () => {
  it('should create error with days', () => {
    const error = new InvalidDateRangeError(-5);
    
    expect(error.name).toBe('InvalidDateRangeError');
    expect(error.code).toBe('INVALID_DATE_RANGE');
    expect(error.days).toBe(-5);
    expect(error.message).toContain('-5');
  });
});

describe('DataFileError', () => {
  it('should create error for read operation', () => {
    const error = new DataFileError('read', '/path/to/file.json');
    
    expect(error.name).toBe('DataFileError');
    expect(error.code).toBe('DATA_FILE_ERROR');
    expect(error.filePath).toBe('/path/to/file.json');
    expect(error.operation).toBe('read');
    expect(error.message).toContain('read');
  });

  it('should include cause when provided', () => {
    const cause = new Error('ENOENT: file not found');
    const error = new DataFileError('read', '/path/to/file.json', cause);
    
    expect(error.cause).toBe(cause);
    expect(error.message).toContain('file not found');
  });

  it('should handle write operation', () => {
    const error = new DataFileError('write', '/path/to/file.json');
    expect(error.operation).toBe('write');
  });

  it('should handle parse operation', () => {
    const error = new DataFileError('parse', '/path/to/file.json');
    expect(error.operation).toBe('parse');
  });
});

describe('UnsupportedExportFormatError', () => {
  it('should create error with format', () => {
    const error = new UnsupportedExportFormatError('xml');
    
    expect(error.name).toBe('UnsupportedExportFormatError');
    expect(error.code).toBe('UNSUPPORTED_EXPORT_FORMAT');
    expect(error.format).toBe('xml');
    expect(error.supportedFormats).toEqual(['json', 'csv']);
    expect(error.message).toContain('xml');
    expect(error.message).toContain('json');
  });

  it('should allow custom supported formats', () => {
    const error = new UnsupportedExportFormatError('xml', ['json', 'csv', 'yaml']);
    expect(error.supportedFormats).toEqual(['json', 'csv', 'yaml']);
  });
});

describe('Error inheritance', () => {
  it('all errors should be instances of CostTrackerError', () => {
    expect(new InvalidModelError('test', [])).toBeInstanceOf(CostTrackerError);
    expect(new InvalidTokenCountError('inputTokens', -1)).toBeInstanceOf(CostTrackerError);
    expect(new InvalidProviderError('')).toBeInstanceOf(CostTrackerError);
    expect(new InvalidDateRangeError(-1)).toBeInstanceOf(CostTrackerError);
    expect(new DataFileError('read', '/path')).toBeInstanceOf(CostTrackerError);
    expect(new UnsupportedExportFormatError('xml')).toBeInstanceOf(CostTrackerError);
  });

  it('all errors should be instances of Error', () => {
    expect(new CostTrackerError('test')).toBeInstanceOf(Error);
    expect(new InvalidModelError('test', [])).toBeInstanceOf(Error);
  });
});
