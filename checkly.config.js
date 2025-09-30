module.exports = {
  projectName: 'CV Builder - Pull North',
  logicalId: 'cv-builder-pull-north',
  repoUrl: 'https://github.com/your-username/cv-builder',
  checks: {
    locations: ['us-east-1'],
    tags: ['production'],
    runtimeId: '2023.09',
    checkMatch: '**/__checks__/**/*.check.js',
    ignoreDirectoriesMatch: [
      'node_modules/**',
      '.git/**',
      '.next/**'
    ],
  },
  cli: {
    runLocation: 'us-east-1',
  },
}