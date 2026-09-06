/**
 * PM2 Ecosystem Configuration - LeFriApp V3.0
 * WEBLIFETECH Contabo VPS Production Standard
 */

module.exports = {
  apps: [
    {
      name: 'lefri-app',
      script: 'dist/index.cjs',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '600M',
      env_production: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || 8080,
        DEFAULT_LLM_PROVIDER: process.env.DEFAULT_LLM_PROVIDER || 'openai',
        DEFAULT_LLM_MODEL: process.env.DEFAULT_LLM_MODEL || 'gpt-4o-mini'
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 8080
      },
      error_file: 'logs/pm2-error.log',
      out_file: 'logs/pm2-out.log',
      merge_logs: true,
      time: true
    }
  ]
};
