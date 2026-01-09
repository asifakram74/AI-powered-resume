// jest.setup.js
import '@testing-library/jest-dom'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.test' })

// Mock fetch if needed
global.fetch = jest.fn()

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
}))

// Mock Next.js navigation (App Router)
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
  useSearchParams: jest.fn(),
  redirect: jest.fn(),
}))

// Mock fetch globally
global.fetch = jest.fn()

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
})

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(global, 'sessionStorage', {
  value: sessionStorageMock,
})

// Suppress console errors in tests (optional)
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
}

// Reset all mocks after each test
afterEach(() => {
  jest.clearAllMocks()
})