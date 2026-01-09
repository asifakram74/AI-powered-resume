// __tests__/coverletters/coverletters.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CoverLettersPage from '../../app/dashboard/cover-letter/page'
import CreateCoverLetterForm from '../../pages/cover-letter/AddEditCoverLetter'

describe('Cover Letters Module', () => {
  
  describe('Create Cover Letter', () => {
    // COV-001: Create button works
    test('COV-001: should display create cover letter button', () => {
      render(<CoverLettersPage />)
      const createButton = screen.getByRole('button', { name: /create.*cover letter|new.*cover letter/i })
      expect(createButton).toBeInTheDocument()
    })

    // COV-003: Company name field available
    test('COV-003: should have company name field', () => {
      render(<CreateCoverLetterForm />)
      const companyInput = screen.getByLabelText(/company.*name/i)
      expect(companyInput).toBeInTheDocument()
    })

    // COV-004: Position title field available
    test('COV-004: should have position title field', () => {
      render(<CreateCoverLetterForm />)
      const positionInput = screen.getByLabelText(/position|job.*title/i)
      expect(positionInput).toBeInTheDocument()
    })

    // COV-007: Generate button triggers AI
    test('COV-007: should trigger AI generation for cover letter', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          id: 'cover-1',
          content: 'Dear Hiring Manager, I am writing to express...',
        }),
      })
      global.fetch = mockFetch

      render(<CreateCoverLetterForm />)
      
      await userEvent.type(screen.getByLabelText(/company/i), 'Tech Corp')
      await userEvent.type(screen.getByLabelText(/position/i), 'Software Developer')
      await userEvent.type(screen.getByLabelText(/job.*description/i), 'Looking for a React developer')
      
      const generateButton = screen.getByRole('button', { name: /generate/i })
      await userEvent.click(generateButton)
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/cover-letters/generate'),
          expect.any(Object)
        )
      })
    })

    // COV-008: Loading indicator shows
    test('COV-008: should show loading during generation', async () => {
      const mockFetch = jest.fn().mockImplementation(() =>
        new Promise(resolve =>
          setTimeout(() => resolve({
            ok: true,
            json: async () => ({ content: 'Cover letter content' }),
          }), 100)
        )
      )
      global.fetch = mockFetch

      render(<CreateCoverLetterForm />)
      
      const generateButton = screen.getByRole('button', { name: /generate/i })
      await userEvent.click(generateButton)
      
      expect(screen.getByText(/generating|loading/i)).toBeInTheDocument()
    })

    // COV-010: Error handling
    test('COV-010: should handle generation errors', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Generation failed' }),
      })
      global.fetch = mockFetch

      render(<CreateCoverLetterForm />)
      
      const generateButton = screen.getByRole('button', { name: /generate/i })
      await userEvent.click(generateButton)
      
      await waitFor(() => {
        expect(screen.getByText(/error|failed/i)).toBeInTheDocument()
      })
    })
  })

  describe('Cover Letter Quality', () => {
    const mockCoverLetter = {
      content: `Dear Hiring Manager at Tech Corp,

I am writing to express my interest in the Software Developer position at your company. 
With 5 years of experience in React and TypeScript, I am confident in my ability to contribute.

My experience includes building scalable web applications and leading development teams.
I am excited about the opportunity to bring my skills to Tech Corp.

Thank you for your consideration.

Sincerely,
John Doe`
    }

    // COV-011: Letter addresses company correctly
    test('COV-011: should include company name in letter', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => mockCoverLetter,
      })
      global.fetch = mockFetch

      render(<CreateCoverLetterForm />)
      
      await userEvent.type(screen.getByLabelText(/company/i), 'Tech Corp')
      const generateButton = screen.getByRole('button', { name: /generate/i })
      await userEvent.click(generateButton)
      
      await waitFor(() => {
        expect(screen.getByText(/Tech Corp/i)).toBeInTheDocument()
      })
    })

    // COV-016: No generic template language
    test('COV-016: should not contain generic placeholders', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => mockCoverLetter,
      })
      global.fetch = mockFetch

      render(<CreateCoverLetterForm />)
      
      const generateButton = screen.getByRole('button', { name: /generate/i })
      await userEvent.click(generateButton)
      
      await waitFor(() => {
        expect(screen.queryByText(/\[company name\]|\[your name\]|\[position\]/i)).not.toBeInTheDocument()
      })
    })

    // COV-017: Proper business letter format
    test('COV-017: should have proper letter structure', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => mockCoverLetter,
      })
      global.fetch = mockFetch

      render(<CreateCoverLetterForm />)
      
      const generateButton = screen.getByRole('button', { name: /generate/i })
      await userEvent.click(generateButton)
      
      await waitFor(() => {
        // Check for salutation
        expect(screen.getByText(/Dear.*Hiring Manager/i)).toBeInTheDocument()
        // Check for closing
        expect(screen.getByText(/Sincerely/i)).toBeInTheDocument()
      })
    })
  })

  describe('View Cover Letters', () => {
    // COV-021: All cover letters listed
    test('COV-021: should display all cover letters', async () => {
      const mockLetters = [
        { id: '1', company: 'Tech Corp', position: 'Developer', createdAt: '2024-01-01' },
        { id: '2', company: 'StartupXYZ', position: 'Engineer', createdAt: '2024-01-02' },
      ]

      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => mockLetters,
      })
      global.fetch = mockFetch

      render(<CoverLettersPage />)
      
      await waitFor(() => {
        expect(screen.getByText(/Tech Corp/i)).toBeInTheDocument()
        expect(screen.getByText(/StartupXYZ/i)).toBeInTheDocument()
      })
    })
  })

  describe('Download Cover Letter', () => {
    // COV-030: Download as PDF
    test('COV-030: should download cover letter as PDF', async () => {
      const mockBlob = new Blob(['PDF content'], { type: 'application/pdf' })
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        blob: async () => mockBlob,
      })
      global.fetch = mockFetch

      global.URL.createObjectURL = jest.fn(() => 'blob:mock-url')

      render(<CoverLettersPage />)
      
      const downloadButton = screen.getByRole('button', { name: /download/i })
      await userEvent.click(downloadButton)
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled()
      })
    })
  })
})

// __tests__/ats/ats-checker.test.tsx
describe('ATS Checker Module', () => {
  
  describe('Upload Resume', () => {
    // ATS-001: File upload button visible
    test('ATS-001: should display file upload button', () => {
      render(<ATSCheckerPage />)
      const uploadButton = screen.getByText(/upload|choose file/i)
      expect(uploadButton).toBeInTheDocument()
    })

    // ATS-002: Accepts PDF files
    test('ATS-002: should accept PDF file upload', async () => {
      render(<ATSCheckerPage />)
      
      const file = new File(['resume content'], 'resume.pdf', { type: 'application/pdf' })
      const input = screen.getByLabelText(/upload|choose file/i) as HTMLInputElement
      
      await userEvent.upload(input, file)
      
      expect(input.files[0]).toBe(file)
      expect(input.files).toHaveLength(1)
    })

    // ATS-003: Accepts Word files
    test('ATS-003: should accept Word file upload', async () => {
      render(<ATSCheckerPage />)
      
      const file = new File(['resume content'], 'resume.docx', { 
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
      })
      const input = screen.getByLabelText(/upload|choose file/i) as HTMLInputElement
      
      await userEvent.upload(input, file)
      
      expect(input.files[0]).toBe(file)
    })

    // ATS-004: File size limit enforced
    test('ATS-004: should reject files exceeding size limit', async () => {
      render(<ATSCheckerPage />)
      
      // Create a file larger than 5MB (5 * 1024 * 1024 bytes)
      const largeContent = 'x'.repeat(6 * 1024 * 1024)
      const file = new File([largeContent], 'large-resume.pdf', { type: 'application/pdf' })
      const input = screen.getByLabelText(/upload|choose file/i) as HTMLInputElement
      
      await userEvent.upload(input, file)
      
      await waitFor(() => {
        expect(screen.getByText(/file.*too large|size limit|maximum.*5/i)).toBeInTheDocument()
      })
    })

    // ATS-005: Invalid file type rejected
    test('ATS-005: should reject invalid file types', async () => {
      render(<ATSCheckerPage />)
      
      const file = new File(['content'], 'resume.txt', { type: 'text/plain' })
      const input = screen.getByLabelText(/upload|choose file/i) as HTMLInputElement
      
      await userEvent.upload(input, file)
      
      await waitFor(() => {
        expect(screen.getByText(/invalid.*file.*type|only.*pdf.*doc/i)).toBeInTheDocument()
      })
    })
  })

  describe('ATS Analysis', () => {
    // ATS-009: Analysis starts automatically
    test('ATS-009: should start analysis after upload', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ 
          score: 75, 
          feedback: 'Good resume structure' 
        }),
      })
      global.fetch = mockFetch

      render(<ATSCheckerPage />)
      
      const file = new File(['resume content'], 'resume.pdf', { type: 'application/pdf' })
      const input = screen.getByLabelText(/upload/i) as HTMLInputElement
      
      await userEvent.upload(input, file)
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/ats/analyze'),
          expect.any(Object)
        )
      })
    })

    // ATS-010: Loading indicator during analysis
    test('ATS-010: should show loading during analysis', async () => {
      const mockFetch = jest.fn().mockImplementation(() =>
        new Promise(resolve =>
          setTimeout(() => resolve({
            ok: true,
            json: async () => ({ score: 75 }),
          }), 100)
        )
      )
      global.fetch = mockFetch

      render(<ATSCheckerPage />)
      
      const file = new File(['resume'], 'resume.pdf', { type: 'application/pdf' })
      const input = screen.getByLabelText(/upload/i) as HTMLInputElement
      await userEvent.upload(input, file)
      
      expect(screen.getByText(/analyzing|processing/i)).toBeInTheDocument()
    })

    // ATS-011: Analysis completes in reasonable time
    test('ATS-011: should complete analysis within 15 seconds', async () => {
      jest.setTimeout(20000)
      
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ score: 80 }),
      })
      global.fetch = mockFetch

      render(<ATSCheckerPage />)
      
      const startTime = Date.now()
      
      const file = new File(['resume'], 'resume.pdf', { type: 'application/pdf' })
      const input = screen.getByLabelText(/upload/i) as HTMLInputElement
      await userEvent.upload(input, file)
      
      await waitFor(() => {
        expect(screen.queryByText(/analyzing/i)).not.toBeInTheDocument()
      }, { timeout: 15000 })
      
      const endTime = Date.now()
      expect(endTime - startTime).toBeLessThan(15000)
    })
  })

  describe('ATS Score & Results', () => {
    const mockATSResults = {
      score: 75,
      status: 'pass',
      feedback: {
        missingKeywords: ['leadership', 'agile'],
        formatIssues: ['Use bullet points for experience'],
        recommendations: ['Add more quantifiable achievements'],
      }
    }

    // ATS-013: Overall score displayed
    test('ATS-013: should display ATS score', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => mockATSResults,
      })
      global.fetch = mockFetch

      render(<ATSCheckerPage />)
      
      const file = new File(['resume'], 'resume.pdf', { type: 'application/pdf' })
      const input = screen.getByLabelText(/upload/i) as HTMLInputElement
      await userEvent.upload(input, file)
      
      await waitFor(() => {
        expect(screen.getByText(/75/)).toBeInTheDocument()
      })
    })

    // ATS-015: Pass/Fail indication clear
    test('ATS-015: should show pass/fail status', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => mockATSResults,
      })
      global.fetch = mockFetch

      render(<ATSCheckerPage />)
      
      const file = new File(['resume'], 'resume.pdf', { type: 'application/pdf' })
      const input = screen.getByLabelText(/upload/i) as HTMLInputElement
      await userEvent.upload(input, file)
      
      await waitFor(() => {
        expect(screen.getByText(/pass/i)).toBeInTheDocument()
      })
    })

    // ATS-017: Missing keywords highlighted
    test('ATS-017: should display missing keywords', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => mockATSResults,
      })
      global.fetch = mockFetch

      render(<ATSCheckerPage />)
      
      const file = new File(['resume'], 'resume.pdf', { type: 'application/pdf' })
      const input = screen.getByLabelText(/upload/i) as HTMLInputElement
      await userEvent.upload(input, file)
      
      await waitFor(() => {
        expect(screen.getByText(/leadership/i)).toBeInTheDocument()
        expect(screen.getByText(/agile/i)).toBeInTheDocument()
      })
    })

    // ATS-023: Actionable suggestions given
    test('ATS-023: should provide actionable recommendations', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => mockATSResults,
      })
      global.fetch = mockFetch

      render(<ATSCheckerPage />)
      
      const file = new File(['resume'], 'resume.pdf', { type: 'application/pdf' })
      const input = screen.getByLabelText(/upload/i) as HTMLInputElement
      await userEvent.upload(input, file)
      
      await waitFor(() => {
        expect(screen.getByText(/quantifiable achievements/i)).toBeInTheDocument()
      })
    })
  })

  describe('Export ATS Report', () => {
    // ATS-028: Can download report
    test('ATS-028: should allow downloading analysis report', async () => {
      const mockBlob = new Blob(['ATS Report'], { type: 'application/pdf' })
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        blob: async () => mockBlob,
      })
      global.fetch = mockFetch

      global.URL.createObjectURL = jest.fn(() => 'blob:mock-url')

      render(<ATSCheckerPage />)
      
      // Assume analysis is complete and download button appears
      const downloadButton = screen.getByRole('button', { name: /download.*report/i })
      await userEvent.click(downloadButton)
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled()
      })
    })
  })
})