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
        videoCompression: 15,
        retries: {
            runMode: 2,
            openMode: 0
        },

        setupNodeEvents(on, config) {
            // implement node event listeners here
            return config;
        },
    },

    // Configuration pour CI
    chromeWebSecurity: false,
    viewportWidth: 1280,
    viewportHeight: 720,

    // Timeouts
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    pageLoadTimeout: 60000,
    execTimeout: 60000,
    taskTimeout: 60000,

    // Performance optimization
    experimentalMemoryManagement: true,
    numTestsKeptInMemory: 10,
    experimentalModifyObstructiveThirdPartyCode: true,

    // Reporter configuration
    reporter: 'junit',
    reporterOptions: {
        mochaFile: 'cypress/results/test-results-[hash].xml',
        toConsole: true
    }
});