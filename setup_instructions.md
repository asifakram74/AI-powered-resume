# Testing Setup Instructions

## 🎯 Complete Setup Guide for Testing Infrastructure

Follow these steps to set up comprehensive testing for your AI-powered resume application.

---

## 📦 Step 1: Install Dependencies

### Install Testing Libraries

```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event
npm install --save-dev jest jest-environment-jsdom ts-jest @types/jest
npm install --save-dev @playwright/test
```

### For TypeScript projects

```bash
npm install --save-dev @types/react @types/node typescript
```

---

## 📁 Step 2: Create Configuration Files

### 1. Create `jest.config.js` in root directory

Copy the content from the "Jest Configuration & Setup" artifact.

### 2. Create `jest.setup.js` in root directory

Copy the content from the "Jest Setup File" artifact.

### 3. Create `playwright.config.ts` in root directory

Copy the content from the "Playwright Configuration" artifact.

---

## 🗂️ Step 3: Create Test Directory Structure

```bash
# Create test directories
mkdir -p __tests__/auth
mkdir -p __tests__/personas
mkdir -p __tests__/resumes
mkdir -p __tests__/coverletters
mkdir -p __tests__/ats
mkdir -p __tests__/integration
mkdir -p e2e
mkdir -p test-files

# Create sample files for testing
touch __tests__/auth/login.test.tsx
touch __tests__/personas/personas.test.tsx
touch __tests__/resumes/resumes.test.tsx
touch __tests__/coverletters/coverletters.test.tsx
touch __tests__/ats/ats-checker.test.tsx
touch __tests__/integration/cross-module.test.tsx
touch e2e/complete-workflow.spec.ts
```

---

## 📝 Step 4: Copy Test Files

Copy the test files from the artifacts into your project:

1. **Authentication Tests** → `__tests__/auth/login.test.tsx`
2. **Personas Tests** → `__tests__/personas/personas.test.tsx`
3. **Resumes Tests** → `__tests__/resumes/resumes.test.tsx`
4. **Cover Letters & ATS Tests** → Split into respective directories
5. **Integration & E2E Tests** → `__tests__/integration/` and `e2e/`

---

## ⚙️ Step 5: Update package.json

### Add Test Scripts

Copy the scripts from the "Package.json Test Scripts & Dependencies" artifact.

### Verify your package.json has:

```json
{
  "scripts": {
    "test": "jest --watch",
    "test:ci": "jest --ci --coverage --maxWorkers=2",
    "test:unit": "jest --testPathPattern='__tests__/(auth|personas|resumes|coverletters|ats)' --coverage",
    "test:integration": "jest --testPathPattern='__tests__/integration'",
    "test:e2e": "playwright test",
    "test:all": "npm run test:ci && npm run test:e2e",
    "build": "npm run test:ci && next build"
  }
}
```

---

## 🌐 Step 6: Install Playwright Browsers

```bash
npx playwright install --with-deps
```

This installs Chromium, Firefox, and WebKit browsers needed for E2E testing.

---

## 🔧 Step 7: Configure Environment Variables

### Create `.env.test` file

```bash
# .env.test
NEXT_PUBLIC_API_URL=http://localhost:3000/api
DATABASE_URL=postgresql://test:test@localhost:5432/test_db
JWT_SECRET=test-secret-key
OPENAI_API_KEY=test-api-key
```

### Update `.gitignore`

```
# Testing
coverage/
.nyc_output/
playwright-report/
test-results/
*.log

# Environment
.env.test.local
.env.local
```

---

## 🚀 Step 8: Run Your First Test

```bash
# Run all tests
npm test

# If tests pass, you're all set! 🎉
```

---

## 🔄 Step 9: Set Up CI/CD (GitHub Actions)

### Create `.github/workflows/ci.yml`

```bash
mkdir -p .github/workflows
touch .github/workflows/ci.yml
```

Copy the content from the "GitHub Actions CI/CD Pipeline" artifact.

### Add GitHub Secrets

In your GitHub repository, go to Settings → Secrets and add:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- `STAGING_URL`
- `SLACK_WEBHOOK` (optional)
- `SNYK_TOKEN` (optional, for security scanning)

---

## 🪝 Step 10: Set Up Git Hooks (Optional but Recommended)

### Install Husky

```bash
npm install --save-dev husky
npx husky install
```

### Add Pre-commit Hook

```bash
npx husky add .husky/pre-commit "npm run lint && npm run test:ci"
```

### Add Pre-push Hook

```bash
npx husky add .husky/pre-push "npm run test:all"
```

### Update package.json

```json
{
  "scripts": {
    "prepare": "husky install"
  }
}
```

---

## 📊 Step 11: Configure Coverage Thresholds

Your `jest.config.js` should already have:

```javascript
coverageThreshold: {
  global: {
    branches: 70,
    functions: 70,
    lines: 70,
    statements: 70,
  },
}
```

This ensures minimum 70% code coverage.

---

## 🧪 Step 12: Create Sample Test Data

### Create `test-files` directory

```bash
mkdir -p test-files
```

### Add sample files for testing

```bash
# Create a sample PDF for ATS testing
echo "Sample Resume Content" > test-files/sample-resume.pdf

# Create sample job descriptions
cat > test-files/job-descriptions.json << EOF
{
  "softwareDeveloper": "Looking for a senior software developer with React, Node.js experience...",
  "frontendEngineer": "Seeking frontend engineer with TypeScript and modern frameworks..."
}
EOF
```

---

## ✅ Step 13: Verify Installation

Run this verification script:

```bash
#!/bin/bash
# verify-setup.sh

echo "🔍 Verifying test setup..."

# Check if test files exist
if [ -f "jest.config.js" ]; then
  echo "✅ jest.config.js found"
else
  echo "❌ jest.config.js missing"
fi

if [ -f "playwright.config.ts" ]; then
  echo "✅ playwright.config.ts found"
else
  echo "❌ playwright.config.ts missing"
fi

# Check if dependencies are installed
if npm list @testing-library/react &> /dev/null; then
  echo "✅ Testing libraries installed"
else
  echo "❌ Testing libraries missing"
fi

# Run a quick test
echo "🧪 Running quick test..."
npm run test:ci

if [ $? -eq 0 ]; then
  echo "✅ All tests passed!"
else
  echo "❌ Some tests failed"
fi

echo "✨ Setup verification complete!"
```

Run it:
```bash
chmod +x verify-setup.sh
./verify-setup.sh
```

---

## 🎓 Step 14: Train Your Team

### Create TESTING.md Documentation

Copy the "TESTING.md - Developer Guide" artifact to your repository root.

### Schedule Training Session

- Walk through test structure
- Demo running tests
- Show debugging techniques
- Explain CI/CD pipeline

---

## 📋 Step 15: Create Pre-Build Checklist

Create a `PRE_BUILD_CHECKLIST.md` file:

```markdown
# Pre-Build Checklist

Before creating a production build, verify:

## Automated Checks
- [ ] `npm run lint` passes with no errors
- [ ] `npm run test:ci` passes all unit tests
- [ ] `npm run test:integration` passes
- [ ] `npm run test:e2e` passes on all browsers
- [ ] Test coverage meets 70% threshold
- [ ] `npm run build` completes successfully

## Manual Checks
- [ ] All features work in development
- [ ] No console errors in browser
- [ ] Responsive design tested (mobile, tablet, desktop)
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] API endpoints responding correctly

## Documentation
- [ ] README updated with new features
- [ ] CHANGELOG updated
- [ ] API documentation current

## Security
- [ ] `npm audit` shows no high/critical vulnerabilities
- [ ] No sensitive data in logs
- [ ] Authentication working correctly

## Performance
- [ ] Lighthouse score > 90
- [ ] Page load time < 3 seconds
- [ ] No memory leaks detected

**Once all items checked, proceed with build!**
```

---

## 🔍 Troubleshooting Common Setup Issues

### Issue 1: Jest can't find modules

**Solution:**
```javascript
// In jest.config.js, add moduleNameMapper
moduleNameMapper: {
  '^@/(.*)$': '<rootDir>/$1',
  '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
}
```

### Issue 2: Playwright tests fail to start

**Solution:**
```bash
# Reinstall browsers
npx playwright install --with-deps

# Check if dev server is running
npm run dev
```

### Issue 3: TypeScript errors in tests

**Solution:**
```json
// In tsconfig.json, add to compilerOptions
{
  "compilerOptions": {
    "types": ["jest", "@testing-library/jest-dom", "node"]
  },
  "include": ["**/*.ts", "**/*.tsx", "**/*.test.ts", "**/*.test.tsx"]
}
```

### Issue 4: Tests running too slow

**Solution:**
```bash
# Run tests in parallel with max workers
npm test -- --maxWorkers=4

# Or use test sharding for large suites
npm test -- --shard=1/4
```

---

## 📈 What's Next?

After setup is complete:

1. **Run your first test suite**: `npm run test:all`
2. **Check coverage**: `npm run test:coverage`
3. **Review test reports**: Open `coverage/lcov-report/index.html`
4. **Set up monitoring**: Integrate with services like Codecov or SonarQube
5. **Document your tests**: Add comments and update TESTING.md

---

## 🎉 Success Criteria

You'll know setup is complete when:

- ✅ All test scripts run without errors
- ✅ Coverage report generates successfully
- ✅ CI/CD pipeline runs on GitHub
- ✅ Pre-commit hooks prevent bad commits
- ✅ Build fails if tests don't pass
- ✅ Team understands how to run tests

---

## 📞 Need Help?

If you encounter issues:

1. Check the [Troubleshooting](#troubleshooting-common-setup-issues) section
2. Review error messages carefully
3. Check Jest/Playwright documentation
4. Ask in team Slack channel
5. Create an issue in the repository

---

## 📚 Additional Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**Setup Time Estimate**: 2-3 hours  
**Last Updated**: January 2026  
**Maintained By**: QA Team

---

## ✨ You're All Set!

Your testing infrastructure is now complete. Happy testing! 🚀