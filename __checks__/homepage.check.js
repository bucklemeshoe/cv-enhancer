const { Check, expect } = require('checkly/constructs')

const homepageCheck = new Check('homepage-loads', {
  name: 'Homepage loads successfully',
  activated: true,
  frequency: 10, // minutes
  locations: ['us-east-1', 'us-west-1'],
  tags: ['production', 'critical'],
  code: {
    entrypoint: async (page) => {
      // Navigate to your CV Builder homepage
      await page.goto('https://cv.pullnorth.com')

      // Check that the page loads and contains expected content
      await expect(page).toHaveTitle(/CV Builder|Pull North/)

      // Check for key elements
      await expect(page.locator('h1')).toBeVisible()
      await expect(page.locator('text=Apply')).toBeVisible()

      // Check that the page is responsive
      await expect(page.locator('body')).toBeVisible()
    },
  },
})

module.exports = { homepageCheck }