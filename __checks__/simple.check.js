const { Check, expect } = require('checkly/constructs')

const simpleCheck = new Check('simple-test', {
  name: 'Simple test check',
  activated: true,
  frequency: 10,
  locations: ['us-east-1'],
  tags: ['test'],
  code: {
    entrypoint: async (page) => {
      await page.goto('https://example.com')
      await expect(page).toHaveTitle(/Example Domain/)
    },
  },
})

module.exports = { simpleCheck }