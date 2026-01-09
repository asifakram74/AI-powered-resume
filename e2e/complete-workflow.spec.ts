// e2e/complete-workflow.spec.ts
// Playwright E2E Tests
import { test, expect } from '@playwright/test'

test.describe('Complete User Workflow - E2E', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to app and login
    await page.goto('https://app.resumaic.com/')
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'TestPassword123!')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard')
  })

  test('E2E-001: Complete workflow - Create Persona → Generate Resume → ATS Check', async ({ page }) => {
    // Step 1: Create Persona
    await page.click('text=Personas')
    await page.click('button:has-text("Create Persona")')
    
    await page.fill('input[name="fullName"]', 'John Doe')
    await page.fill('input[name="email"]', 'john@example.com')
    await page.fill('input[name="phone"]', '555-1234')
    await page.click('button:has-text("Save")')
    
    await expect(page.locator('text=Success')).toBeVisible()
    
    // Step 2: Generate Resume
    await page.click('text=Resumes')
    await page.click('button:has-text("Create Resume")')
    
    await page.selectOption('select[name="persona"]', { label: 'John Doe' })
    await page.fill('textarea[name="jobDescription"]', 
      'Looking for a Senior Software Developer with React and Node.js experience'
    )
    await page.click('button:has-text("Generate")')
    
    await expect(page.locator('text=Generating')).toBeVisible()
    await expect(page.locator('text=John Doe')).toBeVisible({ timeout: 30000 })
    
    // Step 3: ATS Check
    await page.click('text=ATS Checker')
    await page.selectOption('select[name="resume"]', { index: 0 })
    await page.click('button:has-text("Analyze")')
    
    await expect(page.locator('text=Score')).toBeVisible({ timeout: 15000 })
    await expect(page.locator('[data-testid="ats-score"]')).toBeVisible()
  })

  test('E2E-002: Generate Resume and Download as PDF', async ({ page }) => {
    await page.click('text=Resumes')
    await page.click('button:has-text("Create Resume")')
    
    await page.selectOption('select[name="persona"]', { index: 0 })
    await page.fill('textarea[name="jobDescription"]', 'Software Engineer position')
    await page.click('button:has-text("Generate")')
    
    await page.waitForSelector('text=Download', { timeout: 30000 })
    
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('button:has-text("Download PDF")')
    ])
    
    expect(download.suggestedFilename()).toContain('.pdf')
  })

  test('E2E-003: Create Cover Letter and verify company name', async ({ page }) => {
    await page.click('text=Cover Letters')
    await page.click('button:has-text("Create Cover Letter")')
    
    await page.fill('input[name="company"]', 'Tech Innovations Inc')
    await page.fill('input[name="position"]', 'Senior Developer')
    await page.selectOption('select[name="persona"]', { index: 0 })
    await page.fill('textarea[name="jobDescription"]', 'We need a talented developer')
    
    await page.click('button:has-text("Generate")')
    
    await expect(page.locator('text=Tech Innovations Inc')).toBeVisible({ timeout: 30000 })
    await expect(page.locator('text=Dear')).toBeVisible()
  })

  test('E2E-004: Upload resume to ATS Checker', async ({ page }) => {
    await page.click('text=ATS Checker')
    
    // Upload file
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles('./test-files/sample-resume.pdf')
    
    await expect(page.locator('text=Analyzing')).toBeVisible()
    await expect(page.locator('[data-testid="ats-score"]')).toBeVisible({ timeout: 15000 })
    
    const score = await page.locator('[data-testid="ats-score"]').textContent()
    expect(parseInt(score)).toBeGreaterThan(0)
  })

  test('E2E-005: Edit and re-generate resume', async ({ page }) => {
    await page.click('text=Resumes')
    
    // Click on existing resume
    await page.click('.resume-card >> nth=0')
    
    // Edit content
    await page.click('button:has-text("Edit")')
    await page.fill('textarea[name="content"]', 'Updated experience section...')
    await page.click('button:has-text("Save")')
    
    await expect(page.locator('text=Updated')).toBeVisible()
  })

  test('E2E-006: Delete persona and verify confirmation', async ({ page }) => {
    await page.click('text=Personas')
    
    await page.click('button:has-text("Delete") >> nth=0')
    await expect(page.locator('text=Are you sure')).toBeVisible()
    
    await page.click('button:has-text("Cancel")')
    await expect(page.locator('.persona-card')).toBeVisible()
  })

  test('E2E-007: Responsive design check', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.click('text=Personas')
    
    await expect(page.locator('.mobile-menu, .hamburger')).toBeVisible()
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 })
    await expect(page.locator('nav')).toBeVisible()
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 })
    await expect(page.locator('nav')).toBeVisible()
  })

  test('E2E-008: Session persistence after refresh', async ({ page }) => {
    await page.click('text=Personas')
    await expect(page.locator('.persona-card')).toBeVisible()
    
    await page.reload()
    
    // Should still be logged in
    await expect(page).toHaveURL('**/personas')
    await expect(page.locator('.persona-card')).toBeVisible()
  })

  test('E2E-009: Error handling - Network failure', async ({ page }) => {
    // Simulate offline
    await page.context().setOffline(true)
    
    await page.click('text=Resumes')
    await page.click('button:has-text("Create Resume")')
    await page.click('button:has-text("Generate")')
    
    await expect(page.locator('text=network error|offline|connection/i')).toBeVisible()
    
    await page.context().setOffline(false)
  })

  test('E2E-010: Logout and verify session cleared', async ({ page }) => {
    await page.click('button:has-text("Logout"), [aria-label="Logout"]')
    
    await expect(page).toHaveURL('**/login')
    
    // Try to access protected route
    await page.goto('https://app.resumaic.com/dashboard')
    await expect(page).toHaveURL('**/login')
  })
})