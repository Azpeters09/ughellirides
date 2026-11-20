module.exports = {
  apps: [{
    name: 'ughellirides',
    script: 'server.js',
    // dotenv is loaded inside server.js, so keys/settings live in the .env file.
    // .env.example documents every variable (PORT, ADMIN_TOKEN, SUPABASE_URL,
    // SUPABASE_SERVICE_ROLE_KEY, DB_PATH).
    env: {
      PORT: 8787,
      ADMIN_TOKEN: process.env.ADMIN_TOKEN || 'CHANGE-ME-in-production'
    }
  }]
};
