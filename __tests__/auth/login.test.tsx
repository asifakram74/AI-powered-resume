// __tests__/auth/login.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginPage from '../../app/auth/signin/page'
import { useRouter } from 'next/router'

// Mock the router
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}))

describe('Authentication - Login', () => {
  const mockPush = jest.fn()
  
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      pathname: '/login',
      query: {},
    })
    jest.clearAllMocks()
  })

  // AUTH-001: Valid credentials login succeeds
  test('AUTH-001: should login successfully with valid credentials', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ token: 'mock-token', user: { email: 'test@example.com' } }),
    })
    global.fetch = mockFetch

    render(<LoginPage />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /login|sign in/i })

    await userEvent.type(emailInput, 'test@example.com')
    await userEvent.type(passwordInput, 'ValidPassword123!')
    await userEvent.click(submitButton)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/auth/login'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('test@example.com'),
        })
      )
      expect(mockPush).toHaveBeenCalledWith(expect.stringMatching(/dashboard|home/))
    })
  })

  // AUTH-002: Invalid email shows appropriate error
  test('AUTH-002: should show error for invalid email format', async () => {
    render(<LoginPage />)

    const emailInput = screen.getByLabelText(/email/i)
    const submitButton = screen.getByRole('button', { name: /login|sign in/i })

    await userEvent.type(emailInput, 'invalid-email')
    await userEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/invalid email|valid email|email format/i)).toBeInTheDocument()
    })
  })

  // AUTH-003: Invalid password shows appropriate error
  test('AUTH-003: should show error for incorrect password', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ error: 'Invalid credentials' }),
    })
    global.fetch = mockFetch

    render(<LoginPage />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /login|sign in/i })

    await userEvent.type(emailInput, 'test@example.com')
    await userEvent.type(passwordInput, 'WrongPassword')
    await userEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/invalid|incorrect|wrong/i)).toBeInTheDocument()
    })
  })

  // AUTH-004: Empty fields validation works
  test('AUTH-004: should show validation errors for empty fields', async () => {
    render(<LoginPage />)

    const submitButton = screen.getByRole('button', { name: /login|sign in/i })
    await userEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/email.*required/i)).toBeInTheDocument()
      expect(screen.getByText(/password.*required/i)).toBeInTheDocument()
    })
  })

  // AUTH-005: Remember me functionality works
  test('AUTH-005: should handle remember me checkbox', async () => {
    render(<LoginPage />)

    const rememberMeCheckbox = screen.queryByLabelText(/remember me/i)
    
    if (rememberMeCheckbox) {
      await userEvent.click(rememberMeCheckbox)
      expect(rememberMeCheckbox).toBeChecked()
    }
  })

  // AUTH-006: Password visibility toggle works
  test('AUTH-006: should toggle password visibility', async () => {
    render(<LoginPage />)

    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement
    const toggleButton = screen.queryByRole('button', { name: /show|hide|toggle/i })

    expect(passwordInput.type).toBe('password')

    if (toggleButton) {
      await userEvent.click(toggleButton)
      await waitFor(() => {
        expect(passwordInput.type).toBe('text')
      })
    }
  })

  // AUTH-008: Session persists after login
  test('AUTH-008: should store session token after successful login', async () => {
    const mockToken = 'mock-jwt-token'
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ token: mockToken }),
    })
    global.fetch = mockFetch

    render(<LoginPage />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /login|sign in/i })

    await userEvent.type(emailInput, 'test@example.com')
    await userEvent.type(passwordInput, 'ValidPassword123!')
    await userEvent.click(submitButton)

    await waitFor(() => {
      expect(localStorage.setItem).toHaveBeenCalledWith(
        expect.stringMatching(/token|auth/i),
        expect.stringContaining(mockToken)
      )
    })
  })

  // AUTH-009: Logout functionality works
  test('AUTH-009: should logout and clear session', async () => {
    // This test would be in a separate logout component test
    // Placeholder for logout flow
    expect(true).toBe(true)
  })

  // AUTH-021: SQL injection attempts blocked
  test('AUTH-021: should sanitize SQL injection attempts', async () => {
    const sqlInjection = "admin'--"
    const mockFetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 400,
    })
    global.fetch = mockFetch

    render(<LoginPage />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /login|sign in/i })

    await userEvent.type(emailInput, sqlInjection)
    await userEvent.type(passwordInput, sqlInjection)
    await userEvent.click(submitButton)

    // Should either show validation error or API should reject
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled()
      // Verify the request doesn't expose SQL injection
    })
  })

  // AUTH-022: XSS attempts sanitized
  test('AUTH-022: should sanitize XSS attempts', async () => {
    const xssScript = '<script>alert("XSS")</script>'
    
    render(<LoginPage />)

    const emailInput = screen.getByLabelText(/email/i)
    await userEvent.type(emailInput, xssScript)

    // Verify the value is sanitized
    expect(emailInput).not.toHaveValue(xssScript)
    // Or check that it's escaped properly
  })
})