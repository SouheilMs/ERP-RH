import { defineConfig } from 'cypress';

export default defineConfig({
    e2e: {
        baseUrl: 'http://localhost:4200',
        supportFile: 'cypress/support/e2e.ts',
        specPattern: 'cypress/e2e/**/*.cy.ts',
        videosFolder: 'cypress/videos',
        screenshotsFolder: 'cypress/screenshots',
        video: true,
        screenshotOnRunFailure: true,

        setupNodeEvents(on, config) {
            // implement node event listeners here
        },
    },

    // Configuration pour CI (GitLab, GitHub Actions, etc.)
    chromeWebSecurity: false,

    // Augmenter les timeouts pour CI
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    pageLoadTimeout: 60000,

    // Configuration du navigateur pour environnement CI
    experimentalMemoryManagement: true,
    numTestsKeptInMemory: 10,
});