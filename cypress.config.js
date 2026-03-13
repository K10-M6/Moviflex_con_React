import { defineConfig } from "cypress";

export default defineConfig({
  projectId: 'k8nwm4',
  allowCypressEnv: false,

  reporter: 'cypress-mochawesome-reporter',
  e2e: {
    baseUrl: "https://moviflexconreact-production.up.railway.app",
    pageLoadTimeout: 120000, // espera hasta 120s a que cargue la página

    setupNodeEvents(on, config) {
      require('cypress-mochawesome-reporter/plugin')(on);
    },
  },
});