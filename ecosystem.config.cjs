module.exports = {
  apps: [
    {
      name: 'lefri-app',
      script: 'dist/index.js',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '500M',
      env_production: {
        NODE_ENV: 'production',
        PORT: 8080,
        DEFAULT_LLM_PROVIDER: process.env.DEFAULT_LLM_PROVIDER || 'gemini',
        DEFAULT_LLM_MODEL: process.env.DEFAULT_LLM_MODEL || 'gemini-1.5-flash'
      }
    }
  ]
};
