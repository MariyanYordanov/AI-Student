# Testing Guide

This document describes how to run tests for the Aily application.

## Setup

Before running tests, install dependencies:

```bash
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

## Backend Testing

### Running Tests

Run all backend tests with coverage:

```bash
cd backend
npm test
```

Watch mode for development:

```bash
npm run test:watch
```

Generate coverage report:

```bash
npm run test:coverage
```

### Test Structure

Backend tests are located in `src/__tests__/` directory and follow the same structure as source code:

```
backend/src/
  __tests__/
    utils/
      knowledge-decay.test.ts
    middleware/
      auth.test.ts
    routes/
      auth.test.ts
      sessions.test.ts
```

### Test Examples

#### Unit Test Example

File: `backend/src/__tests__/utils/knowledge-decay.test.ts`

Tests for the knowledge decay algorithm that simulates forgetting:

```typescript
describe('Knowledge Decay Utility', () => {
  it('should not decay knowledge within 3-day grace period', () => {
    const lastReviewed = new Date(baseTime.getTime() - 2 * 24 * 60 * 60 * 1000);
    const currentLevel = 0.8;

    const decayed = calculateKnowledgeDecay(currentLevel, lastReviewed, baseTime);

    expect(decayed).toBe(currentLevel);
  });
});
```

#### Integration Test Example

For testing API endpoints with supertest:

```typescript
import request from 'supertest';
import app from '../index';

describe('Auth API', () => {
  it('should register a new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123'
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
  });
});
```

### Recommended Test Coverage

Aim for these coverage thresholds:

- Statements: 50%+
- Branches: 50%+
- Functions: 50%+
- Lines: 50%+

Current coverage threshold configured in jest.config.js

## Frontend Testing

### Running Tests

Run all frontend tests with coverage:

```bash
cd frontend
npm test
```

Watch mode for development:

```bash
npm run test:watch
```

Generate coverage report:

```bash
npm run test:coverage
```

### Test Structure

Frontend tests are located in `src/__tests__/` directory:

```
frontend/src/
  __tests__/
    components/
      Navbar.test.tsx
      ChatMessage.test.tsx
    pages/
      Dashboard.test.tsx
    stores/
      authStore.test.ts
```

### Test Examples

#### Component Test Example

File: `frontend/src/__tests__/components/Navbar.test.tsx`

```typescript
import { render, screen } from '@testing-library/react';
import { Navbar } from '../../components/Navbar';

describe('Navbar Component', () => {
  it('renders navbar without crashing', () => {
    render(<Navbar />);
    expect(screen.queryByRole('navigation')).toBeInTheDocument();
  });
});
```

#### Store Test Example

Testing Zustand stores:

```typescript
import { useAuthStore } from '../../stores/authStore';
import { renderHook, act } from '@testing-library/react';

describe('Auth Store', () => {
  it('should initialize with no user', () => {
    const { result } = renderHook(() => useAuthStore());

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
  });

  it('should set user on login', async () => {
    const { result } = renderHook(() => useAuthStore());

    await act(async () => {
      await result.current.login('test@example.com', 'password');
    });

    expect(result.current.user).toBeDefined();
    expect(result.current.token).toBeDefined();
  });
});
```

#### Hook Test Example

Testing custom hooks:

```typescript
import { useTheme } from '../../hooks/useTheme';
import { renderHook, act } from '@testing-library/react';

describe('useTheme Hook', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should initialize with light theme', () => {
    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBe('light');
  });

  it('should toggle theme', () => {
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.theme).toBe('dark');
  });
});
```

### Recommended Test Coverage

Aim for these coverage thresholds:

- Statements: 50%+
- Branches: 50%+
- Functions: 50%+
- Lines: 50%+

Current coverage threshold configured in jest.config.js

## Writing Tests

### Best Practices

1. **Test Behavior, Not Implementation**
   - Focus on what the code does, not how it does it
   - Avoid testing internal state directly

2. **Use Descriptive Test Names**
   - `it('should calculate decay correctly for days 4-7')`
   - `it('should display error message when login fails')`

3. **Follow AAA Pattern**
   - Arrange: Set up test data and conditions
   - Act: Execute the code being tested
   - Assert: Verify the results

4. **Keep Tests Independent**
   - Each test should be runnable in isolation
   - Use beforeEach/afterEach for setup and cleanup

5. **Mock External Dependencies**
   - Mock API calls with jest.mock()
   - Mock localStorage with jest mocks
   - Mock router and navigation

### Common Patterns

#### Mocking API Calls

```typescript
jest.mock('../../services/api', () => ({
  login: jest.fn().mockResolvedValue({
    user: { id: '123', email: 'test@example.com' }
  })
}));
```

#### Testing Async Code

```typescript
it('should handle async operations', async () => {
  const promise = fetchData();

  await waitFor(() => {
    expect(screen.getByText('Loaded')).toBeInTheDocument();
  });
});
```

#### Testing Error States

```typescript
it('should show error message on failed request', async () => {
  jest.mock('../../services/api', () => ({
    login: jest.fn().mockRejectedValue(new Error('Invalid credentials'))
  }));

  render(<LoginForm />);

  await act(async () => {
    fireEvent.click(screen.getByText('Login'));
  });

  expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
});
```

## CI/CD Integration

### GitHub Actions Example

Create `.github/workflows/test.yml`:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [18.x, 20.x]

    steps:
      - uses: actions/checkout@v3

      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}

      - name: Install backend dependencies
        run: cd backend && npm install

      - name: Run backend tests
        run: cd backend && npm test

      - name: Install frontend dependencies
        run: cd frontend && npm install

      - name: Run frontend tests
        run: cd frontend && npm test

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./backend/coverage/lcov.info,./frontend/coverage/lcov.info
```

## Troubleshooting

### Tests Timing Out

If tests timeout, increase the jest timeout:

```typescript
jest.setTimeout(10000);
```

### Module Not Found Errors

Ensure jest.config.js has correct path mappings:

```javascript
moduleNameMapper: {
  '^@/(.*)$': '<rootDir>/src/$1',
}
```

### localStorage is not defined

localStorage mocks are set up in `frontend/src/setupTests.ts`

### Cannot find module 'react'

Run `npm install` in the appropriate directory

## Test Reporting

### Generate Coverage Reports

Backend:
```bash
cd backend
npm run test:coverage
open coverage/lcov-report/index.html
```

Frontend:
```bash
cd frontend
npm run test:coverage
open coverage/lcov-report/index.html
```

### View Coverage in Terminal

```bash
npm test -- --coverage --coverage-reporters=text
```

## Continuous Improvement

### Adding New Tests

When adding new features:
1. Write tests first (TDD approach recommended)
2. Implement the feature
3. Verify tests pass
4. Commit tests with feature code

### Reviewing Coverage

Review coverage reports regularly:
- Identify untested code paths
- Add tests for critical functionality
- Maintain or improve coverage thresholds

### Test Maintenance

- Update tests when requirements change
- Remove tests for deleted features
- Refactor test code like production code
- Keep test dependencies up to date

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Supertest](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://testingjavascript.com/)
