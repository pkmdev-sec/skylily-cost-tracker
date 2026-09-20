/**
 * Custom Error Classes - Skylily Cost Tracker 🌸
 */

/**
 * Base error class for all cost tracker errors
 */
export class CostTrackerError extends Error {
  public readonly code: string;
  public readonly timestamp: string;

  constructor(message: string, code: string = 'COST_TRACKER_ERROR') {
    super(message);
    this.name = 'CostTrackerError';
    this.code = code;
    this.timestamp = new Date().toISOString();
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      timestamp: this.timestamp,
      stack: this.stack,
    };
  }
}

/**
 * Error thrown when an invalid model is specified
 */
export class InvalidModelError extends CostTrackerError {
  public readonly model: string;
  public readonly availableModels: string[];

  constructor(model: string, availableModels: string[]) {
    super(
      `Invalid model "${model}". Available models: ${availableModels.join(', ')}`,
      'INVALID_MODEL'
    );
    this.name = 'InvalidModelError';
    this.model = model;
    this.availableModels = availableModels;
  }
}

/**
 * Error thrown when token count is invalid
 */
export class InvalidTokenCountError extends CostTrackerError {
  public readonly field: string;
  public readonly value: unknown;

  constructor(field: 'inputTokens' | 'outputTokens', value: unknown) {
    super(
      `Invalid ${field}: expected non-negative number, got ${typeof value === 'number' ? value : typeof value}`,
      'INVALID_TOKEN_COUNT'
    );
    this.name = 'InvalidTokenCountError';
    this.field = field;
    this.value = value;
  }
}

/**
 * Error thrown when data file operations fail
 */
export class DataFileError extends CostTrackerError {
  public readonly filePath: string;
  public readonly operation: 'read' | 'write' | 'parse';
  public readonly cause?: Error;

  constructor(operation: 'read' | 'write' | 'parse', filePath: string, cause?: Error) {
    super(
      `Failed to ${operation} data file: ${filePath}${cause ? ` - ${cause.message}` : ''}`,
      'DATA_FILE_ERROR'
    );
    this.name = 'DataFileError';
    this.filePath = filePath;
    this.operation = operation;
    this.cause = cause;
  }
}

/**
 * Error thrown when provider is invalid
 */
export class InvalidProviderError extends CostTrackerError {
  public readonly provider: string;

  constructor(provider: string) {
    super(
      `Invalid provider: "${provider}". Provider must be a non-empty string.`,
      'INVALID_PROVIDER'
    );
    this.name = 'InvalidProviderError';
    this.provider = provider;
  }
}

/**
 * Error thrown when date range is invalid
 */
export class InvalidDateRangeError extends CostTrackerError {
  public readonly days: number;

  constructor(days: number) {
    super(
      `Invalid date range: days must be a positive number, got ${days}`,
      'INVALID_DATE_RANGE'
    );
    this.name = 'InvalidDateRangeError';
    this.days = days;
  }
}

/**
 * Error thrown when trying to export to unsupported format
 */
export class UnsupportedExportFormatError extends CostTrackerError {
  public readonly format: string;
  public readonly supportedFormats: string[];

  constructor(format: string, supportedFormats: string[] = ['json', 'csv']) {
    super(
      `Unsupported export format: "${format}". Supported: ${supportedFormats.join(', ')}`,
      'UNSUPPORTED_EXPORT_FORMAT'
    );
    this.name = 'UnsupportedExportFormatError';
    this.format = format;
    this.supportedFormats = supportedFormats;
  }
}
