# Contributing to skylily-cost-tracker 🌸

First off, thank you for considering contributing to skylily-cost-tracker! It's people like you that make this project better for everyone.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Submitting Changes](#submitting-changes)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)
- [Reporting Issues](#reporting-issues)

---

## Code of Conduct

This project adheres to a code of conduct. By participating, you are expected to uphold this code:

- **Be respectful** - Treat everyone with respect. Disagreements are okay; personal attacks are not.
- **Be inclusive** - Welcome newcomers and help them get started.
- **Be constructive** - Provide helpful feedback. If you don't like something, suggest an improvement.
- **Be patient** - Not everyone has the same level of experience. Take time to explain things.

---

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Git
- A code editor (VS Code recommended)
- npm, yarn, or pnpm

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/skylily-cost-tracker.git
   cd skylily-cost-tracker
   ```
3. Add upstream remote:
   ```bash
   git remote add upstream https://github.com/skylily/skylily-cost-tracker.git
   ```

---

## Development Setup

### Install Dependencies

```bash
npm install
```

### Build the Project

```bash
npm run build
```

### Run Tests

```bash
npm test
```

### Run in Watch Mode

```bash
npm run dev          # TypeScript watch
npm run test:watch   # Test watch
```

### Project Structure

```
skylily-cost-tracker/
├── src/
│   ├── index.ts          # Main exports
│   ├── tracker.ts        # CostTracker class
│   ├── errors.ts         # Custom error classes
│   ├── types.ts          # TypeScript types
│   └── cli.ts            # CLI implementation
├── tests/
│   ├── tracker.test.ts   # Core tests
│   ├── errors.test.ts    # Error tests
│   └── cli.test.ts       # CLI tests
├── examples/             # Usage examples
└── ...
```

---

## Making Changes

### Branch Naming

Use descriptive branch names:

- `feature/add-mistral-pricing` - New features
- `fix/negative-token-validation` - Bug fixes
- `docs/update-api-reference` - Documentation
- `refactor/simplify-stats-calculation` - Refactoring
- `test/increase-coverage` - Test improvements

### Create a Branch

```bash
git checkout -b feature/your-feature-name
```

### Make Your Changes

1. Write your code
2. Add tests for new functionality
3. Update documentation if needed
4. Run tests to ensure everything passes:
   ```bash
   npm test
   ```

### Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Formatting, missing semicolons, etc.
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(tracker): add support for custom metadata

fix(stats): handle empty entries array

docs(readme): add integration examples

test(errors): increase coverage for error classes
```

---

## Submitting Changes

### Before Submitting

1. **Update your branch** with the latest upstream changes:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run all checks**:
   ```bash
   npm run build
   npm test
   npm run typecheck
   ```

3. **Update CHANGELOG.md** (for significant changes):
   ```markdown
   ## [Unreleased]
   
   ### Added
   - Your new feature description
   ```

### Create a Pull Request

1. Push your branch to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

2. Go to GitHub and create a Pull Request

3. Fill out the PR template:
   - Describe what you changed and why
   - Link any related issues
   - Include screenshots if applicable

4. Wait for review and address any feedback

---

## Coding Standards

### TypeScript

- Use strict TypeScript (`strict: true`)
- Avoid `any` types - use `unknown` or proper types
- Export types from `types.ts`
- Use interfaces for objects, types for unions/intersections

### Code Style

- Use 2-space indentation
- Use single quotes for strings
- Add trailing commas in multiline structures
- Maximum line length: 100 characters

### Naming Conventions

- **Classes**: PascalCase (`CostTracker`)
- **Functions/Methods**: camelCase (`getStats`)
- **Constants**: UPPER_SNAKE_CASE (`PRICING`)
- **Interfaces**: PascalCase, no `I` prefix (`CostEntry`)
- **Types**: PascalCase (`RecordOptions`)
- **Files**: kebab-case (`cost-tracker.ts`) or camelCase (`costTracker.ts`)

### Documentation

- Use JSDoc comments for public APIs
- Include `@param`, `@returns`, `@throws`, `@example` tags
- Keep comments up to date with code changes

```typescript
/**
 * Records a cost entry for an API call.
 * 
 * @param options - Recording options
 * @returns The recorded cost entry
 * @throws {InvalidProviderError} If provider is empty
 * @throws {InvalidTokenCountError} If tokens are negative
 * 
 * @example
 * ```typescript
 * const entry = tracker.record({
 *   provider: 'openai',
 *   model: 'gpt-4o',
 *   inputTokens: 1000,
 *   outputTokens: 500,
 * });
 * ```
 */
record(options: RecordOptions): CostEntry {
  // ...
}
```

---

## Testing

### Test Requirements

- All new features must have tests
- Bug fixes should include a regression test
- Aim for 80%+ code coverage

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- tests/tracker.test.ts

# Run tests matching a pattern
npm test -- -t "record"
```

### Writing Tests

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CostTracker } from '../src/index.js';

describe('CostTracker', () => {
  let tracker: CostTracker;
  
  beforeEach(() => {
    tracker = new CostTracker({ dataFile: '/tmp/test.json' });
  });
  
  describe('record', () => {
    it('should record an entry with correct cost', () => {
      const entry = tracker.record({
        provider: 'openai',
        model: 'gpt-4o',
        inputTokens: 1000,
        outputTokens: 500,
      });
      
      expect(entry.cost).toBeGreaterThan(0);
    });
    
    it('should throw for invalid tokens', () => {
      expect(() => {
        tracker.record({
          provider: 'openai',
          model: 'gpt-4o',
          inputTokens: -1,
          outputTokens: 500,
        });
      }).toThrow(InvalidTokenCountError);
    });
  });
});
```

---

## Documentation

### README Updates

- Update README.md for new features
- Include code examples
- Update the pricing table when adding new models

### Examples

- Add examples to the `examples/` directory
- Include comments explaining what the example demonstrates
- Test your examples before committing

### API Documentation

- Update JSDoc comments in source code
- Keep the API reference in README.md in sync

---

## Reporting Issues

### Bug Reports

Include:
- Node.js version
- Operating system
- Steps to reproduce
- Expected behavior
- Actual behavior
- Code sample if applicable

### Feature Requests

Include:
- Use case description
- Proposed API (if applicable)
- Example usage

### Security Issues

**Do not** open a public issue for security vulnerabilities. Instead, email [security@skylily.dev] directly.

---

## Questions?

Feel free to:
- Open a Discussion on GitHub
- Ask in the PR comments
- Check existing issues for similar questions

---

Thank you for contributing! 🌸
