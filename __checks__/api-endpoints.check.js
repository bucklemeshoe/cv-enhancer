const { Check, expect } = require('checkly/constructs')

const apiCheck = new Check('api-endpoints', {
  name: 'API endpoints are responding',
  activated: true,
  frequency: 5, // minutes
  locations: ['us-east-1'],
  tags: ['production', 'api'],
  code: {
    entrypoint: async (page) => {
      // Test the submissions API endpoint
      const response = await page.request.get('https://cv.pullnorth.com/api/admin/submissions?limit=1&offset=0')
      
      // Check that the API responds with 200 status
      expect(response.status()).toBe(200)
      
      // Check that the response contains expected structure
      const data = await response.json()
      expect(data).toHaveProperty('submissions')
      expect(data).toHaveProperty('count')
      expect(data).toHaveProperty('page')
    },
  },
})

const submitApiCheck = new Check('submit-api', {
  name: 'Submit application API endpoint',
  activated: true,
  frequency: 15, // minutes
  locations: ['us-east-1'],
  tags: ['production', 'api'],
  code: {
    entrypoint: async (page) => {
      // Test that the submit endpoint exists (should return 405 for GET request)
      const response = await page.request.get('https://cv.pullnorth.com/api/submit-application')
      
      // Should return 405 Method Not Allowed for GET request
      expect(response.status()).toBe(405)
    },
  },
})

module.exports = { apiCheck, submitApiCheck }
