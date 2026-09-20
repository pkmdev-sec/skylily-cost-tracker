/**
 * CLI Tests - Skylily 🌸
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';

const CLI_PATH = path.resolve(__dirname, '../dist/cli.js');
const TEST_DATA_FILE = '/tmp/cost-tracker-cli-test.json';

const runCli = (args: string): string => {
  const env = { ...process.env, COST_TRACKER_FILE: TEST_DATA_FILE };
  try {
    return execSync(`node ${CLI_PATH} ${args}`, { encoding: 'utf-8', env });
  } catch (error: any) {
    return error.stdout || error.stderr || '';
  }
};

describe('CLI', () => {
  beforeEach(() => {
    if (fs.existsSync(TEST_DATA_FILE)) {
      fs.unlinkSync(TEST_DATA_FILE);
    }
  });

  afterEach(() => {
    if (fs.existsSync(TEST_DATA_FILE)) {
      fs.unlinkSync(TEST_DATA_FILE);
    }
  });

  describe('--help', () => {
    it('should display help message', () => {
      const output = runCli('--help');
      expect(output).toContain('cost-tracker');
      expect(output).toContain('Commands:');
    });

    it('should display help when no args', () => {
      const output = runCli('');
      expect(output).toContain('cost-tracker');
    });
  });

  describe('pricing', () => {
    it('should display model pricing', () => {
      const output = runCli('pricing');
      expect(output).toContain('Model Pricing');
      expect(output).toContain('gpt-4o');
      expect(output).toContain('claude');
    });
  });

  describe('record', () => {
    it('should record an entry', () => {
      const output = runCli('record --provider openai --model gpt-4o --input 1000 --output 500');
      expect(output).toContain('Recorded');
      expect(output).toContain('gpt-4o');
    });
  });

  describe('stats', () => {
    it('should display statistics', () => {
      // First record some data
      runCli('record --provider openai --model gpt-4o --input 1000 --output 500');
      
      const output = runCli('stats');
      expect(output).toContain('Cost Statistics');
      expect(output).toContain('Total:');
    });

    it('should accept --days argument', () => {
      const output = runCli('stats --days 7');
      expect(output).toContain('7 days');
    });
  });

  describe('history', () => {
    it('should display recent entries', () => {
      runCli('record --provider openai --model gpt-4o --input 1000 --output 500 --task "Test task"');
      
      const output = runCli('history');
      expect(output).toContain('Recent Entries');
      expect(output).toContain('gpt-4o');
    });

    it('should limit entries', () => {
      // Record multiple entries
      runCli('record --provider openai --model gpt-4o --input 1000 --output 500');
      runCli('record --provider openai --model gpt-4o --input 1000 --output 500');
      runCli('record --provider openai --model gpt-4o --input 1000 --output 500');
      
      const output = runCli('history 2');
      const lines = output.split('\n').filter(l => l.includes('gpt-4o'));
      expect(lines.length).toBeLessThanOrEqual(2);
    });
  });
});
