const { Check, expect } = require('checkly/constructs')

// Homepage check
const homepageCheck = new Check('homepage-loads', {
  name: 'Homepage loads successfully',
  activated: true,
  frequency: 10, // minutes
  locations: ['us-east-1'],
  tags: ['production', 'critical'],
  code: {
    entrypoint: async (page) => {
      await page.goto('https://cv.pullnorth.com')
      await expect(page).toHaveTitle(/CV Builder|Pull North/)
      await expect(page.locator('h1')).toBeVisible()
      await expect(page.locator('text=Apply')).toBeVisible()
    },
  },
})

// API check
const apiCheck = new Check('api-endpoints', {
  name: 'API endpoints are responding',
  activated: true,
  frequency: 5, // minutes
  locations: ['us-east-1'],
  tags: ['production', 'api'],
  code: {
    entrypoint: async (page) => {
      const response = await page.request.get('https://cv.pullnorth.com/api/admin/submissions?limit=1&offset=0')
      expect(response.status()).toBe(200)
      const data = await response.json()
      expect(data).toHaveProperty('submissions')
    },
  },
})

// Apply page check
const applyPageCheck = new Check('apply-page-loads', {
  name: 'Apply page loads correctly',
  activated: true,
  frequency: 10, // minutes
  locations: ['us-east-1'],
  tags: ['production', 'forms'],
  code: {
    entrypoint: async (page) => {
      await page.goto('https://cv.pullnorth.com/apply')
      await expect(page.locator('body')).toBeVisible()
      await expect(page.locator('form')).toBeVisible()
      await expect(page.locator('text=First Name')).toBeVisible()
    },
  },
})

module.exports = { homepageCheck, apiCheck, applyPageCheck }
