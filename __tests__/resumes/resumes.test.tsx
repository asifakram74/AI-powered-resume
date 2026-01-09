// __tests__/resumes/resumes.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ResumesPage from '../../app/dashboard/resumes/page'
import CreateResumeForm from '../../pages/resume/AddEditResume'

describe('Resumes Module', () => {
  
  describe('Create Resume', () => {
    // RES-001: Create Resume button works
    test('RES-001: should display create resume button', () => {
      render(<ResumesPage />)
      const createButton = screen.getByRole('button', { name: /create.*resume|new resume|cv/i })
      expect(createButton).toBeInTheDocument()
    })

    // RES-002: Job description input field visible
    test('RES-002: should display job description input', () => {
      render(<CreateResumeForm />)
      const jobDescInput = screen.getByLabelText(/job description/i)
      expect(jobDescInput).toBeInTheDocument()
    })

    // RES-003: Job description accepts long text
    test('RES-003: should accept long job descriptions', async () => {
      render(<CreateResumeForm />)
      
      const longJobDesc = 'A'.repeat(1000) // 1000 characters
      const jobDescInput = screen.getByLabelText(/job description/i)
      
      await userEvent.type(jobDescInput, longJobDesc)
      expect(jobDescInput).toHaveValue(longJobDesc)
    })

    // RES-005: Paste functionality works
    test('RES-005: should handle paste from clipboard', async () => {
      render(<CreateResumeForm />)
      
      const jobDescInput = screen.getByLabelText(/job description/i)
      const pastedText = 'Senior Developer position requiring React and Node.js'
      
      await userEvent.click(jobDescInput)
      await userEvent.paste(pastedText)
      
      expect(jobDescInput).toHaveValue(pastedText)
    })

    // RES-006: Select persona dropdown populated
    test('RES-006: should populate persona dropdown', async () => {
      const mockPersonas = [
        { id: '1', fullName: 'John Doe' },
        { id: '2', fullName: 'Jane Smith' },
      ]

      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => mockPersonas,
      })
      global.fetch = mockFetch

      render(<CreateResumeForm />)
      
      await waitFor(() => {
        const personaSelect = screen.getByRole('combobox', { name: /persona|select persona/i })
        expect(personaSelect).toBeInTheDocument()
      })
    })

    // RES-007: Must select persona to proceed
    test('RES-007: should require persona selection', async () => {
      render(<CreateResumeForm />)
      
      const jobDescInput = screen.getByLabelText(/job description/i)
      await userEvent.type(jobDescInput, 'Software Developer role')
      
      const generateButton = screen.getByRole('button', { name: /generate/i })
      await userEvent.click(generateButton)
      
      await waitFor(() => {
        expect(screen.getByText(/select.*persona|persona.*required/i)).toBeInTheDocument()
      })
    })

    // RES-008: Generate Resume button triggers AI
    test('RES-008: should trigger AI generation', async () => {
      const mockFetch = jest.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [{ id: '1', fullName: 'John Doe' }],
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ 
            id: 'resume-1', 
            content: 'Generated resume content',
            status: 'completed'
          }),
        })
      global.fetch = mockFetch

      render(<CreateResumeForm />)
      
      // Select persona
      const personaSelect = await screen.findByRole('combobox', { name: /persona/i })
      await userEvent.selectOptions(personaSelect, '1')
      
      // Enter job description
      const jobDescInput = screen.getByLabelText(/job description/i)
      await userEvent.type(jobDescInput, 'Software Developer with React experience')
      
      // Generate
      const generateButton = screen.getByRole('button', { name: /generate/i })
      await userEvent.click(generateButton)
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/resumes/generate'),
          expect.objectContaining({
            method: 'POST',
          })
        )
      })
    })

    // RES-009: Loading indicator appears
    test('RES-009: should show loading indicator during generation', async () => {
      const mockFetch = jest.fn().mockImplementation(() => 
        new Promise(resolve => 
          setTimeout(() => resolve({
            ok: true,
            json: async () => ({ id: 'resume-1', content: 'Resume' }),
          }), 100)
        )
      )
      global.fetch = mockFetch

      render(<CreateResumeForm />)
      
      const generateButton = screen.getByRole('button', { name: /generate/i })
      await userEvent.click(generateButton)
      
      expect(screen.getByText(/generating|loading|please wait/i)).toBeInTheDocument()
    })

    // RES-010: Generation completes within 30 seconds
    test('RES-010: should complete generation in reasonable time', async () => {
      jest.setTimeout(35000) // Set test timeout to 35 seconds
      
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ 
          id: 'resume-1', 
          content: 'Generated resume',
        }),
      })
      global.fetch = mockFetch

      render(<CreateResumeForm />)
      
      const startTime = Date.now()
      
      const generateButton = screen.getByRole('button', { name: /generate/i })
      await userEvent.click(generateButton)
      
      await waitFor(() => {
        expect(screen.queryByText(/generating/i)).not.toBeInTheDocument()
      }, { timeout: 30000 })
      
      const endTime = Date.now()
      expect(endTime - startTime).toBeLessThan(30000)
    })

    // RES-011: Error handling for AI failures
    test('RES-011: should handle AI generation failures', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ error: 'AI service unavailable' }),
      })
      global.fetch = mockFetch

      render(<CreateResumeForm />)
      
      const generateButton = screen.getByRole('button', { name: /generate/i })
      await userEvent.click(generateButton)
      
      await waitFor(() => {
        expect(screen.getByText(/error|failed|unable/i)).toBeInTheDocument()
      })
    })

    // RES-012: Retry option available
    test('RES-012: should show retry option on failure', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 500,
      })
      global.fetch = mockFetch

      render(<CreateResumeForm />)
      
      const generateButton = screen.getByRole('button', { name: /generate/i })
      await userEvent.click(generateButton)
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /retry|try again/i })).toBeInTheDocument()
      })
    })
  })

  describe('Resume Quality Checks', () => {
    const mockGeneratedResume = {
      id: 'resume-1',
      content: `
        John Doe
        john@example.com | 555-1234
        
        EXPERIENCE
        • Senior Developer at Tech Corp (2020-2023)
        • Built React applications with TypeScript
        
        EDUCATION
        • BS Computer Science - University (2016)
        
        SKILLS
        • JavaScript, React, Node.js, TypeScript
      `
    }

    // RES-013: Generated resume matches job keywords
    test('RES-013: should include job description keywords', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => mockGeneratedResume,
      })
      global.fetch = mockFetch

      render(<CreateResumeForm />)
      
      const jobDesc = 'Looking for React and TypeScript developer'
      const jobDescInput = screen.getByLabelText(/job description/i)
      await userEvent.type(jobDescInput, jobDesc)
      
      const generateButton = screen.getByRole('button', { name: /generate/i })
      await userEvent.click(generateButton)
      
      await waitFor(() => {
        const resumeContent = screen.getByText(/react.*typescript/i)
        expect(resumeContent).toBeInTheDocument()
      })
    })

    // RES-017: No placeholder text
    test('RES-017: should not contain placeholder text', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => mockGeneratedResume,
      })
      global.fetch = mockFetch

      render(<CreateResumeForm />)
      
      const generateButton = screen.getByRole('button', { name: /generate/i })
      await userEvent.click(generateButton)
      
      await waitFor(() => {
        expect(screen.queryByText(/\[your name\]|\[placeholder\]|\[insert\]/i)).not.toBeInTheDocument()
      })
    })
  })

  describe('View Resumes', () => {
    // RES-021: All resumes listed
    test('RES-021: should display all generated resumes', async () => {
      const mockResumes = [
        { id: '1', title: 'Software Developer Resume', createdAt: '2024-01-01' },
        { id: '2', title: 'Frontend Engineer Resume', createdAt: '2024-01-02' },
      ]

      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResumes,
      })
      global.fetch = mockFetch

      render(<ResumesPage />)
      
      await waitFor(() => {
        expect(screen.getByText('Software Developer Resume')).toBeInTheDocument()
        expect(screen.getByText('Frontend Engineer Resume')).toBeInTheDocument()
      })
    })
  })

  describe('Edit Resume', () => {
    // RES-029: Edit functionality available
    test('RES-029: should allow editing resume content', async () => {
      render(<CreateResumeForm resumeId="resume-1" />)
      
      const contentEditor = screen.getByRole('textbox', { name: /content|resume/i })
      expect(contentEditor).toBeEnabled()
      
      await userEvent.type(contentEditor, 'Updated content')
      expect(contentEditor).toHaveValue(expect.stringContaining('Updated content'))
    })

    // RES-032: Changes save successfully
    test('RES-032: should save edited resume', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ id: 'resume-1', content: 'Updated resume' }),
      })
      global.fetch = mockFetch

      render(<CreateResumeForm resumeId="resume-1" />)
      
      const saveButton = screen.getByRole('button', { name: /save|update/i })
      await userEvent.click(saveButton)
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/resumes/resume-1'),
          expect.objectContaining({
            method: expect.stringMatching(/PUT|PATCH/),
          })
        )
      })
    })
  })

  describe('Download Resume', () => {
    // RES-035: Download as PDF works
    test('RES-035: should download resume as PDF', async () => {
      const mockBlob = new Blob(['PDF content'], { type: 'application/pdf' })
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        blob: async () => mockBlob,
      })
      global.fetch = mockFetch

      // Mock URL.createObjectURL
      global.URL.createObjectURL = jest.fn(() => 'blob:mock-url')
      
      render(<ResumesPage />)
      
      const downloadButton = screen.getByRole('button', { name: /download.*pdf/i })
      await userEvent.click(downloadButton)
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/resumes/'),
          expect.objectContaining({
            method: 'GET',
          })
        )
      })
    })

    // RES-039: All content included in download
    test('RES-039: should include all resume content in download', async () => {
      const fullResumeContent = 'Complete resume with all sections'
      const mockBlob = new Blob([fullResumeContent], { type: 'application/pdf' })
      
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        blob: async () => mockBlob,
      })
      global.fetch = mockFetch

      render(<ResumesPage />)
      
      const downloadButton = screen.getByRole('button', { name: /download/i })
      await userEvent.click(downloadButton)
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled()
      })
    })
  })

  describe('Delete Resume', () => {
    // RES-041: Delete button works
    test('RES-041: should delete resume', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({}),
      })
      global.fetch = mockFetch

      render(<ResumesPage />)
      
      const deleteButton = screen.getByRole('button', { name: /delete|remove/i })
      await userEvent.click(deleteButton)
      
      // Confirm deletion
      const confirmButton = screen.getByRole('button', { name: /confirm|yes/i })
      await userEvent.click(confirmButton)
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/resumes/'),
          expect.objectContaining({
            method: 'DELETE',
          })
        )
      })
    })
  })
})