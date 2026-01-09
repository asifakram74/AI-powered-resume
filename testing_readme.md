# Testing Guide - AI-Powered Resume Application

## 📋 Table of Contents
- [Quick Start](#quick-start)
- [Test Structure](#test-structure)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [Pre-Build Checklist](#pre-build-checklist)
- [CI/CD Integration](#cicd-integration)
- [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Install Playwright Browsers
```bash
npm run playwright:install
```

### 3. Run All Tests
```bash
npm test
```

---

## 📁 Test Structure

```
your-project/
├── __tests__/
│   ├── auth/
│   │   └── login.test.tsx           # Authentication tests
│   ├── personas/
│   │   └── personas.test.tsx        # Personas module tests
│   ├── resumes/
│   │   └── resumes.test.tsx         # Resumes module tests
│   ├── coverletters/
│   │   └── coverletters.test.tsx    # Cover letters tests
│   ├── ats/
│   │   └── ats-checker.test.tsx     # ATS checker tests
│   └── integration/
│       └── cross-module.test.tsx    # Integration tests
├── e2e/
│   └── complete-workflow.spec.ts    # End-to-end tests
├── jest.config.js                   # Jest configuration
├── jest.setup.js                    # Jest setup file
├── playwright.config.ts             # Playwright configuration
└── TESTING.md                       # This file
```

---

## 🏃 Running Tests

### Unit & Integration Tests (Jest)

```bash
# Run all tests in watch mode
npm test

# Run tests once (CI mode)
npm run test:ci

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- __tests__/auth/login.test.tsx

# Run tests matching pattern
npm test -- --testNamePattern="AUTH-001"

# Debug tests
npm run test:debug
```

### End-to-End Tests (Playwright)

```bash
# Run all E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run E2E tests in headed mode (see browser)
npm run test:e2e:headed

# Run specific browser only
npx playwright test --project=chromium

# Run specific test file
npx playwright test e2e/complete-workflow.spec.ts

# Run tests in debug mode
npx playwright test --debug
```

### Run All Tests (Complete Suite)

```bash
# This runs unit + integration + e2e tests
npm run test:all
```

---

## ✍️ Writing Tests

### Unit Test Example

```typescript
// __tests__/components/Button.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Button from '@/components/Button'

describe('Button Component', () => {
  test('should render button with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  test('should call onClick when clicked', async () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    await userEvent.click(screen.getByText('Click me'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  test('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>)
    expect(screen.getByText('Click me')).toBeDisabled()
  })
})
```

### Integration Test Example

```typescript
// __tests__/integration/user-flow.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '@/pages/_app'

describe('User Flow Integration', () => {
  test('should create persona and generate resume', async () => {
    // Mock API calls
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: '1', name: 'John Doe' })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'resume-1', content: 'Resume content' })
      })

    render(<App />)
    
    // Create persona
    await userEvent.click(screen.getByText('Create Persona'))
    await userEvent.type(screen.getByLabelText('Name'), 'John Doe')
    await userEvent.click(screen.getByText('Save'))
    
    // Generate resume
    await userEvent.click(screen.getByText('Generate Resume'))
    await userEvent.selectOptions(screen.getByLabelText('Persona'), '1')
    await userEvent.click(screen.getByText('Generate'))
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })
  })
})
```

### E2E Test Example

```typescript
// e2e/login-flow.spec.ts
import { test, expect } from '@playwright/test'

test('user can login and access dashboard', async ({ page }) => {
  await page.goto('/')
  
  await page.fill('input[name="email"]', 'test@example.com')
  await page.fill('input[name="password"]', 'password123')
  await page.click('button[type="submit"]')
  
  await expect(page).toHaveURL('/dashboard')
  await expect(page.locator('h1')).toContainText('Dashboard')
})
```

---

## ✅ Pre-Build Checklist

### Before Creating a Build

**Run this command to ensure all tests pass:**

```bash
npm run test:all
```

This will:
1. ✅ Run all unit tests
2. ✅ Run all integration tests
3. ✅ Generate coverage report
4. ✅ Run E2E tests on all browsers
5. ✅ Verify build succeeds

### Manual Verification Checklist

Before deploying, manually verify:

- [ ] All tests pass (`npm run test:all`)
- [ ] Test coverage meets threshold (70%+)
- [ ] No console errors in development
- [ ] Build completes successfully (`npm run build`)
- [ ] Environment variables are set correctly
- [ ] Database migrations are up to date
- [ ] API endpoints are accessible

---

## 🔄 CI/CD Integration

### GitHub Actions

Our CI/CD pipeline automatically:
1. Runs linting on every push
2. Runs unit tests on every PR
3. Runs integration tests on develop/main branches
4. Runs E2E tests before deployment
5. Generates test coverage reports
6. Blocks merge if tests fail

### Pre-commit Hook

Install pre-commit hooks to run tests before committing:

```bash
# Install husky
npm install --save-dev husky

# Setup pre-commit hook
npx husky install
npx husky add .husky/pre-commit "npm run pre-commit"
```

This will run:
- ESLint
- Unit tests
- Type checking

### Pre-push Hook

```bash
# Setup pre-push hook
npx husky add .husky/pre-push "npm run pre-push"
```

This will run:
- All tests (unit + integration + e2e)

---

## 🎯 Test Coverage Requirements

### Coverage Thresholds

Minimum coverage requirements (enforced by Jest):
- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

### View Coverage Report

```bash
# Generate and view coverage
npm run test:coverage

# Open HTML report
open coverage/lcov-report/index.html
```

### Coverage by Module

| Module | Target Coverage | Current Status |
|--------|----------------|----------------|
| Authentication | 90% | ✅ |
| Personas | 85% | ✅ |
| Resumes | 85% | ⚠️ 80% |
| Cover Letters | 85% | ⚠️ 78% |
| ATS Checker | 80% | ✅ |
| UI Components | 75% | ✅ |

---

## 🐛 Debugging Tests

### Debug Jest Tests

```bash
# Run in debug mode
npm run test:debug

# In VS Code, add breakpoint and run:
# F5 -> Select "Jest Debug"
```

### Debug Playwright Tests

```bash
# Open Playwright Inspector
npx playwright test --debug

# Step through test in UI mode
npm run test:e2e:ui
```

### Common Debug Commands

```bash
# Show verbose output
npm test -- --verbose

# Run only failed tests
npm test -- --onlyFailures

# Run tests serially (easier to debug)
npm test -- --runInBand

# Show full error messages
npm test -- --no-coverage
```

---

## 🔧 Troubleshooting

### Issue: Tests timeout

**Solution:**
```typescript
// Increase timeout for specific test
test('slow test', async () => {
  // test code
}, 10000) // 10 second timeout

// Or globally in jest.config.js
testTimeout: 10000
```

### Issue: Mock not working

**Solution:**
```typescript
// Clear mocks between tests
beforeEach(() => {
  jest.clearAllMocks()
})

// Reset mocks completely
afterEach(() => {
  jest.resetAllMocks()
})
```

### Issue: Playwright browser not found

**Solution:**
```bash
# Reinstall browsers
npx playwright install --with-deps
```

### Issue: Test fails locally but passes in CI

**Solution:**
```bash
# Run tests in CI mode locally
npm run test:ci

# Check for environment-specific issues
# Ensure .env.test exists with correct values
```

### Issue: Port already in use

**Solution:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

---

## 📊 Test Reports

### Jest HTML Report

After running tests, view the report:
```bash
open coverage/lcov-report/index.html
```

### Playwright HTML Report

After running E2E tests:
```bash
npx playwright show-report
```

### CI/CD Reports

Test reports are automatically generated and uploaded to:
- GitHub Actions Artifacts
- Codecov (for coverage)
- Slack notifications (for failures)

---

## 🎓 Best Practices

### 1. Test Naming Convention

```typescript
// ✅ Good - Descriptive
test('AUTH-001: should login successfully with valid credentials', () => {})

// ❌ Bad - Vague
test('login works', () => {})
```

### 2. Arrange-Act-Assert Pattern

```typescript
test('should add item to cart', async () => {
  // Arrange
  render(<ShoppingCart />)
  const addButton = screen.getByText('Add to Cart')
  
  // Act
  await userEvent.click(addButton)
  
  // Assert
  expect(screen.getByText('1 item')).toBeInTheDocument()
})
```

### 3. Don't Test Implementation Details

```typescript
// ❌ Bad - Testing internal state
expect(component.state.count).toBe(1)

// ✅ Good - Testing user-visible behavior
expect(screen.getByText('Count: 1')).toBeInTheDocument()
```

### 4. Use Data-testid for Complex Queries

```typescript
// In component
<button data-testid="submit-button">Submit</button>

// In test
const submitButton = screen.getByTestId('submit-button')
```

### 5. Mock External Dependencies

```typescript
// Mock API calls
jest.mock('@/lib/api', () => ({
  fetchUser: jest.fn().mockResolvedValue({ id: '1', name: 'John' })
}))
```

---

## 📝 Test Checklist for New Features

When adding a new feature, ensure:

- [ ] Unit tests for all new functions
- [ ] Integration tests for user flows
- [ ] E2E test for critical path
- [ ] Error handling tested
- [ ] Edge cases covered
- [ ] Accessibility tested
- [ ] Responsive design tested
- [ ] Performance tested (if applicable)
- [ ] Documentation updated

---

## 🆘 Getting Help

### Resources
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library Docs](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/docs/intro)

### Team Contacts
- QA Lead: [Your Email]
- DevOps: [DevOps Email]
- Team Slack: #qa-testing

---

## 📈 Continuous Improvement

We're always looking to improve our testing:
- Weekly test review meetings
- Monthly test coverage analysis
- Quarterly test strategy updates

**Last Updated:** January 2026  
**Version:** 1.0