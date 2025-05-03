# Testing in 10x Astro Starter

This project uses a comprehensive testing strategy with both unit tests (Vitest) and E2E tests (Playwright).

## Unit Testing with Vitest

Unit tests are located in the `tests/unit` directory and use Vitest as the test runner, along with React Testing Library for component testing.

### Running Unit Tests

```bash
# Run tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Writing Unit Tests

- Create test files with `.test.ts` or `.test.tsx` extension
- Place tests in the `tests/unit` directory, mirroring the structure of the source code
- Use React Testing Library for component tests
- Leverage the utilities in `tests/unit/utils/test-utils.tsx` for common testing patterns

## End-to-End Testing with Playwright

E2E tests are located in the `tests/e2e` directory and use Playwright Test for browser automation.

### Running E2E Tests

```bash
# Run all E2E tests headlessly
npm run test:e2e

# Run tests with UI mode
npm run test:e2e:ui

# Generate tests with Codegen
npm run test:e2e:codegen
```

### Writing E2E Tests

- Create test files with `.spec.ts` extension
- Place tests in the `tests/e2e` directory
- Follow the Page Object Model pattern (examples in `tests/e2e/pages/`)
- Focus on user flows and critical paths

## Best Practices

### Unit Testing

- Test components in isolation
- Mock external dependencies
- Use `vi.mock()` for module mocking
- Leverage snapshots for UI components when appropriate
- Focus on testing behavior, not implementation details

### E2E Testing

- Test only key user flows
- Use data-testid attributes for reliable element selection
- Implement proper test isolation
- Use `expect(page).toHaveScreenshot()` for visual regression testing
- Leverage API testing when possible to speed up tests

## CI Integration

Tests are automatically run in CI via GitHub Actions. See `.github/workflows` for configuration details. 