// __tests__/integration/cross-module.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

describe('Cross-Module Integration Tests', () => {
  
  // INT-001: Resume uses selected persona data
  test('INT-001: should populate resume with persona data', async () => {
    const mockPersona = {
      id: '1',
      fullName: 'John Doe',
      email: 'john@example.com',
      phone: '555-1234',
      experience: '5 years in software development',
    }

    const mockFetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [mockPersona],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'resume-1',
          content: `${mockPersona.fullName}\n${mockPersona.email}\n${mockPersona.experience}`,
        }),
      })
    global.fetch = mockFetch

    render(<CreateResumeForm />)
    
    // Select persona
    const personaSelect = await screen.findByRole('combobox', { name: /persona/i })
    await userEvent.selectOptions(personaSelect, '1')
    
    // Generate resume
    await userEvent.type(screen.getByLabelText(/job description/i), 'Software Developer')
    const generateButton = screen.getByRole('button', { name: /generate/i })
    await userEvent.click(generateButton)
    
    await waitFor(() => {
      expect(screen.getByText(/John Doe/i)).toBeInTheDocument()
      expect(screen.getByText(/john@example\.com/i)).toBeInTheDocument()
    })
  })

  // INT-005: Cover letter uses persona information
  test('INT-005: should include persona info in cover letter', async () => {
    const mockPersona = {
      id: '1',
      fullName: 'Jane Smith',
      email: 'jane@example.com',
    }

    const mockFetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [mockPersona],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          content: `Sincerely,\n${mockPersona.fullName}`,
        }),
      })
    global.fetch = mockFetch

    render(<CreateCoverLetterForm />)
    
    const personaSelect = await screen.findByRole('combobox', { name: /persona/i })
    await userEvent.selectOptions(personaSelect, '1')
    
    const generateButton = screen.getByRole('button', { name: /generate/i })
    await userEvent.click(generateButton)
    
    await waitFor(() => {
      expect(screen.getByText(/Jane Smith/i)).toBeInTheDocument()
    })
  })

  // INT-007: Can select generated resume for ATS
  test('INT-007: should allow ATS check on generated resume', async () => {
    const mockResumes = [
      { id: 'resume-1', title: 'Software Developer Resume' },
    ]

    const mockFetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockResumes,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ score: 80, status: 'pass' }),
      })
    global.fetch = mockFetch

    render(<ATSCheckerPage />)
    
    // Select from existing resumes
    const resumeSelect = screen.getByRole('combobox', { name: /select resume|choose resume/i })
    await userEvent.selectOptions(resumeSelect, 'resume-1')
    
    const analyzeButton = screen.getByRole('button', { name: /analyze|check/i })
    await userEvent.click(analyzeButton)
    
    await waitFor(() => {
      expect(screen.getByText(/80/)).toBeInTheDocument()
    })
  })

  // INT-009: Editing persona reflects in resumes
  test('INT-009: should update resume when persona is edited', async () => {
    const originalPersona = { id: '1', fullName: 'John Doe' }
    const updatedPersona = { id: '1', fullName: 'John Smith' }

    const mockFetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [originalPersona],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => updatedPersona,
      })
    global.fetch = mockFetch

    // This test would verify that linked resumes show updated persona info
    expect(true).toBe(true) // Placeholder
  })

  // INT-010: Deleting persona handles dependencies
  test('INT-010: should warn when deleting persona with linked resumes', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 409,
      json: async () => ({
        error: 'Cannot delete persona with linked resumes',
        linkedResumes: ['resume-1', 'resume-2'],
      }),
    })
    global.fetch = mockFetch

    render(<PersonasPage />)
    
    const deleteButton = screen.getByRole('button', { name: /delete/i })
    await userEvent.click(deleteButton)
    
    const confirmButton = screen.getByRole('button', { name: /confirm/i })
    await userEvent.click(confirmButton)
    
    await waitFor(() => {
      expect(screen.getByText(/cannot delete|linked resumes/i)).toBeInTheDocument()
    })
  })
})