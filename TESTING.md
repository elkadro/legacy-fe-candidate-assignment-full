# Testing Guide

This document explains how to run tests for both the server and client.

## Server Tests (Jest)

### Setup

The server uses Jest with TypeScript support via `ts-jest`.

### Running Tests

```bash
cd server

# Run all tests
yarn test

# Run tests in watch mode
yarn test:watch

# Run tests with coverage
yarn test:coverage
```

### Test Structure

- **Unit Tests**: Located in `src/utils/__tests__/` and `src/middleware/__tests__/`
  - `signature.util.test.ts` - Tests for signature recovery and verification
  - `session.util.test.ts` - Tests for session management
  - `rateLimit.middleware.test.ts` - Tests for rate limiting middleware

- **Integration Tests**: Located in `src/__tests__/`
  - `auth.routes.test.ts` - Full API endpoint tests using supertest

### Test Coverage

The tests cover:
- ✅ Signature recovery and verification
- ✅ Session creation, retrieval, and destruction
- ✅ Rate limiting middleware
- ✅ API endpoint validation
- ✅ Error handling
- ✅ Input validation

## Client Tests (Vitest)

### Setup

The client uses Vitest with React Testing Library for component testing.

### Running Tests

```bash
cd client

# Run all tests
yarn test

# Run tests in watch mode
yarn test -- --watch

# Run tests with UI
yarn test:ui

# Run tests with coverage
yarn test:coverage
```

### Test Structure

- **Unit Tests**: Located in `src/services/__tests__/`
  - `api.service.test.ts` - Tests for API service with mocked axios
  - `api.integration.test.ts` - Integration tests requiring running backend

### Integration Tests

The integration tests (`api.integration.test.ts`) require a running backend server:

1. Start the backend:
   ```bash
   cd server
   yarn run dev
   ```

2. Set environment variable:
   ```bash
   # In client/.env.test
   VITE_API_BASE_URL=http://localhost:8000
   ```

3. Run integration tests:
   ```bash
   cd client
   yarn test -- api.integration.test.ts
   ```

**Note**: Integration tests are marked with `.skip` by default to prevent failures in CI/CD. Remove `.skip` when running locally.

## Test Commands Summary

### Server
```bash
cd server
yarn test              # Run all tests
yarn test:watch    # Watch mode
yarn test:coverage # With coverage report
```

### Client
```bash
cd client
yarn test              # Run all tests
yarn test -- --watch   # Watch mode
yarn test:ui       # UI mode
yarn test:coverage # With coverage
```

## Continuous Integration

For CI/CD pipelines:

```bash
# Server tests
cd server && yarn install && yarn test

# Client tests
cd client && yarn install && yarn test
```

## Writing New Tests

### Server Test Example

```typescript
import { describe, it, expect } from '@jest/globals';
import * as signatureUtil from '../signature.util';

describe('signature.util', () => {
  it('should do something', () => {
    const result = signatureUtil.someFunction();
    expect(result).toBe(expected);
  });
});
```

### Client Test Example

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import MyComponent from '../MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

## Coverage Goals

- **Server**: Aim for >80% coverage
- **Client**: Focus on critical paths (API services, utilities)

## Troubleshooting

### Server Tests Failing

- Ensure TypeScript is compiled: `yarn build`
- Check Jest configuration in `jest.config.js`
- Verify all dependencies are installed: `yarn install`

### Client Tests Failing

- Clear node_modules and reinstall: `rm -rf node_modules && yarn install`
- Check Vitest configuration in `vitest.config.ts`
- Verify test setup file exists: `src/test/setup.ts`

### Integration Tests Not Running

- Ensure backend server is running
- Check `VITE_API_BASE_URL` is set correctly
- Remove `.skip` from test cases if needed
- Check network connectivity

