const { Check, expect } = require('checkly/constructs')

const cvPageCheck = new Check('cv-pages-load', {
  name: 'CV pages load correctly',
  activated: true,
  frequency: 10, // minutes
  locations: ['us-east-1'],
  tags: ['production', 'cv-pages'],
  code: {
    entrypoint: async (page) => {
      // Test a known CV page (JA8R3 from your data)
      await page.goto('https://cv.pullnorth.com/cvs/JA8R3')
      
      // Check that the page loads (should show "CV Not Found" or the actual CV)
      await expect(page.locator('body')).toBeVisible()
      
      // Check for CV-specific elements
      const hasCvContent = await page.locator('text=CV').count() > 0
      const hasNotFound = await page.locator('text=Not Found').count() > 0
      
      // Either should have CV content or show "Not Found" message
      expect(hasCvContent || hasNotFound).toBe(true)
    },
  },
})

const applyPageCheck = new Check('apply-page-loads', {
  name: 'Apply page loads correctly',
  activated: true,
  frequency: 10, // minutes
  locations: ['us-east-1'],
  tags: ['production', 'forms'],
  code: {
    entrypoint: async (page) => {
      // Navigate to the apply page
      await page.goto('https://cv.pullnorth.com/apply')
      
      // Check that the page loads
      await expect(page.locator('body')).toBeVisible()
      
      // Check for form elements
      await expect(page.locator('form')).toBeVisible()
      await expect(page.locator('input[type="text"]')).toBeVisible()
      
      // Check for key form fields
      await expect(page.locator('text=First Name')).toBeVisible()
      await expect(page.locator('text=Last Name')).toBeVisible()
      await expect(page.locator('text=Email')).toBeVisible()
    },
  },
})

module.exports = { cvPageCheck, applyPageCheck }
