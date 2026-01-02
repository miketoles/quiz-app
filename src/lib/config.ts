// App Configuration
// These settings can be changed via environment variables

export const config = {
  // App name displayed in the UI
  appName: import.meta.env.VITE_APP_NAME || 'NRT Team Quiz Game',

  // Whether authentication is required
  // Set VITE_AUTH_REQUIRED=true in .env to enable authentication
  // Default is false (no auth required, guest mode)
  authRequired: import.meta.env.VITE_AUTH_REQUIRED === 'true',
}
