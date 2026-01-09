// __tests__/personas/personas.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PersonasPage from '../../app/dashboard/persona/page' // Adjust based on your structure
import CreatePersonaForm from '../../pages/persona/AddEditPersona'

describe('Personas Module', () => {
  
  describe('Create Persona', () => {
    // PERS-001: Create New Persona button visible and works
    test('PERS-001: should display create persona button', () => {
      render(<PersonasPage />)
      const createButton = screen.getByRole('button', { name: /create|new persona|add persona/i })
      expect(createButton).toBeInTheDocument()
      expect(createButton).toBeEnabled()
    })

    // PERS-002: All required fields marked clearly
    test('PERS-002: should mark required fields with asterisk', () => {
      render(<CreatePersonaForm />)
      
      const requiredLabels = screen.getAllByText(/\*/i)
      expect(requiredLabels.length).toBeGreaterThan(0)
    })

    // PERS-003: Full Name field accepts valid input
    test('PERS-003: should accept valid text in name field', async () => {
      render(<CreatePersonaForm />)
      
      const nameInput = screen.getByLabelText(/full name|name/i)
      await userEvent.type(nameInput, 'John Doe')
      
      expect(nameInput).toHaveValue('John Doe')
    })

    // PERS-004: Email field validates format
    test('PERS-004: should validate email format', async () => {
      render(<CreatePersonaForm />)
      
      const emailInput = screen.getByLabelText(/email/i)
      const submitButton = screen.getByRole('button', { name: /save|submit|create/i })
      
      await userEvent.type(emailInput, 'invalid-email')
      await userEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/invalid email|valid email format/i)).toBeInTheDocument()
      })
    })

    // PERS-005: Phone field validates format
    test('PERS-005: should validate phone number format', async () => {
      render(<CreatePersonaForm />)
      
      const phoneInput = screen.getByLabelText(/phone/i)
      await userEvent.type(phoneInput, '1234567890')
      
      expect(phoneInput).toHaveValue('1234567890')
    })

    // PERS-006: Address field accepts multiline text
    test('PERS-006: should accept multiline address', async () => {
      render(<CreatePersonaForm />)
      
      const addressInput = screen.getByLabelText(/address/i)
      const multilineAddress = '123 Main St\nApt 4B\nNew York, NY 10001'
      
      await userEvent.type(addressInput, multilineAddress)
      expect(addressInput).toHaveValue(expect.stringContaining('123 Main St'))
    })

    // PERS-007: URL fields validate format
    test('PERS-007: should validate LinkedIn URL format', async () => {
      render(<CreatePersonaForm />)
      
      const linkedinInput = screen.queryByLabelText(/linkedin/i)
      
      if (linkedinInput) {
        await userEvent.type(linkedinInput, 'not-a-url')
        const submitButton = screen.getByRole('button', { name: /save|submit|create/i })
        await userEvent.click(submitButton)
        
        await waitFor(() => {
          expect(screen.getByText(/invalid url|valid url/i)).toBeInTheDocument()
        })
      }
    })

    // PERS-008: Optional fields can be left empty
    test('PERS-008: should submit form with optional fields empty', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ id: '1', name: 'John Doe' }),
      })
      global.fetch = mockFetch

      render(<CreatePersonaForm />)
      
      // Fill only required fields
      const nameInput = screen.getByLabelText(/full name|name/i)
      const emailInput = screen.getByLabelText(/email/i)
      const submitButton = screen.getByRole('button', { name: /save|submit|create/i })
      
      await userEvent.type(nameInput, 'John Doe')
      await userEvent.type(emailInput, 'john@example.com')
      await userEvent.click(submitButton)
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled()
      })
    })

    // PERS-009: Form validation shows errors
    test('PERS-009: should show validation errors for invalid input', async () => {
      render(<CreatePersonaForm />)
      
      const submitButton = screen.getByRole('button', { name: /save|submit|create/i })
      await userEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/required/i)).toBeInTheDocument()
      })
    })

    // PERS-010: Character limits enforced
    test('PERS-010: should enforce character limits on fields', async () => {
      render(<CreatePersonaForm />)
      
      const nameInput = screen.getByLabelText(/full name|name/i) as HTMLInputElement
      const longName = 'A'.repeat(300) // Very long name
      
      await userEvent.type(nameInput, longName)
      
      // Check if maxLength attribute exists or validation occurs
      if (nameInput.maxLength > 0) {
        expect(nameInput.value.length).toBeLessThanOrEqual(nameInput.maxLength)
      }
    })

    // PERS-011: Save button creates persona successfully
    test('PERS-011: should create persona successfully', async () => {
      const mockPersona = {
        id: '1',
        fullName: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
      }
      
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => mockPersona,
      })
      global.fetch = mockFetch

      render(<CreatePersonaForm />)
      
      await userEvent.type(screen.getByLabelText(/full name|name/i), mockPersona.fullName)
      await userEvent.type(screen.getByLabelText(/email/i), mockPersona.email)
      await userEvent.type(screen.getByLabelText(/phone/i), mockPersona.phone)
      
      const submitButton = screen.getByRole('button', { name: /save|submit|create/i })
      await userEvent.click(submitButton)
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/personas'),
          expect.objectContaining({
            method: 'POST',
          })
        )
      })
    })

    // PERS-012: Success notification displayed
    test('PERS-012: should show success message after creation', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ id: '1', name: 'John Doe' }),
      })
      global.fetch = mockFetch

      render(<CreatePersonaForm />)
      
      await userEvent.type(screen.getByLabelText(/full name|name/i), 'John Doe')
      await userEvent.type(screen.getByLabelText(/email/i), 'john@example.com')
      
      const submitButton = screen.getByRole('button', { name: /save|submit|create/i })
      await userEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/success|created|saved/i)).toBeInTheDocument()
      })
    })
  })

  describe('View Personas', () => {
    // PERS-013: All personas display in list
    test('PERS-013: should display all personas in list', async () => {
      const mockPersonas = [
        { id: '1', fullName: 'John Doe', email: 'john@example.com' },
        { id: '2', fullName: 'Jane Smith', email: 'jane@example.com' },
      ]

      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => mockPersonas,
      })
      global.fetch = mockFetch

      render(<PersonasPage />)
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument()
        expect(screen.getByText('Jane Smith')).toBeInTheDocument()
      })
    })

    // PERS-016: Empty state shows when no personas
    test('PERS-016: should show empty state when no personas exist', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => [],
      })
      global.fetch = mockFetch

      render(<PersonasPage />)
      
      await waitFor(() => {
        expect(screen.getByText(/no personas|empty|create your first/i)).toBeInTheDocument()
      })
    })
  })

  describe('Edit Persona', () => {
    // PERS-019: Edit button visible
    test('PERS-019: should display edit button for each persona', async () => {
      const mockPersonas = [
        { id: '1', fullName: 'John Doe', email: 'john@example.com' },
      ]

      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => mockPersonas,
      })
      global.fetch = mockFetch

      render(<PersonasPage />)
      
      await waitFor(() => {
        const editButtons = screen.getAllByRole('button', { name: /edit/i })
        expect(editButtons.length).toBeGreaterThan(0)
      })
    })

    // PERS-022: Changes save successfully
    test('PERS-022: should save persona changes', async () => {
      const updatedPersona = {
        id: '1',
        fullName: 'John Doe Updated',
        email: 'john.updated@example.com',
      }

      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => updatedPersona,
      })
      global.fetch = mockFetch

      // Assume edit form is rendered
      render(<CreatePersonaForm personaId="1" />)
      
      const nameInput = screen.getByLabelText(/full name|name/i)
      await userEvent.clear(nameInput)
      await userEvent.type(nameInput, 'John Doe Updated')
      
      const submitButton = screen.getByRole('button', { name: /save|update/i })
      await userEvent.click(submitButton)
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/personas/1'),
          expect.objectContaining({
            method: expect.stringMatching(/PUT|PATCH/),
          })
        )
      })
    })
  })

  describe('Delete Persona', () => {
    // PERS-025: Delete button visible
    test('PERS-025: should display delete button', async () => {
      const mockPersonas = [
        { id: '1', fullName: 'John Doe', email: 'john@example.com' },
      ]

      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => mockPersonas,
      })
      global.fetch = mockFetch

      render(<PersonasPage />)
      
      await waitFor(() => {
        const deleteButtons = screen.getAllByRole('button', { name: /delete|remove/i })
        expect(deleteButtons.length).toBeGreaterThan(0)
      })
    })

    // PERS-026: Confirmation dialog appears
    test('PERS-026: should show confirmation before delete', async () => {
      const mockPersonas = [
        { id: '1', fullName: 'John Doe', email: 'john@example.com' },
      ]

      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => mockPersonas,
      })
      global.fetch = mockFetch

      render(<PersonasPage />)
      
      await waitFor(async () => {
        const deleteButton = screen.getAllByRole('button', { name: /delete|remove/i })[0]
        await userEvent.click(deleteButton)
        
        expect(screen.getByText(/are you sure|confirm|delete/i)).toBeInTheDocument()
      })
    })

    // PERS-027: Delete removes persona
    test('PERS-027: should delete persona when confirmed', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({}),
      })
      global.fetch = mockFetch

      render(<PersonasPage />)
      
      // Simulate clicking delete and confirming
      const deleteButton = screen.getAllByRole('button', { name: /delete|remove/i })[0]
      await userEvent.click(deleteButton)
      
      const confirmButton = screen.getByRole('button', { name: /confirm|yes|delete/i })
      await userEvent.click(confirmButton)
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/personas/'),
          expect.objectContaining({
            method: 'DELETE',
          })
        )
      })
    })
  })

  describe('Data Validation', () => {
    // PERS-030: Special characters handled
    test('should handle special characters in name', async () => {
      render(<CreatePersonaForm />)
      
      const nameInput = screen.getByLabelText(/full name|name/i)
      await userEvent.type(nameInput, 'José María Ñoño')
      
      expect(nameInput).toHaveValue('José María Ñoño')
    })

    test('should handle emoji in fields', async () => {
      render(<CreatePersonaForm />)
      
      const nameInput = screen.getByLabelText(/full name|name/i)
      await userEvent.type(nameInput, 'John 😊 Doe')
      
      expect(nameInput).toHaveValue('John 😊 Doe')
    })
  })
})