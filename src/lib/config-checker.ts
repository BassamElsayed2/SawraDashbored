// Configuration checker for the feedback system
export const configChecker = {
  // Check if required env vars are set (Supabase no longer required)
  checkEnvironmentVariables: () => {
    const requiredVars: string[] = [];
    const missingVars = requiredVars.filter((varName) => !process.env[varName]);
    return missingVars.length === 0;
  },

  // Check feature flags
  checkFeatureFlags: () => {
    const flags = {
      ENABLE_FEEDBACK_SURVEY: process.env.NEXT_PUBLIC_ENABLE_FEEDBACK_SURVEY,
      ENABLE_FEEDBACK_DASHBOARD:
        process.env.NEXT_PUBLIC_ENABLE_FEEDBACK_DASHBOARD,
      ENABLE_FEEDBACK_ANALYTICS:
        process.env.NEXT_PUBLIC_ENABLE_FEEDBACK_ANALYTICS,
    };

    return flags;
  },

  // Run all checks (no Supabase dependency)
  runAllChecks: () => {
    return configChecker.checkEnvironmentVariables();
  },
};

// Export for use in components
export const debugConfig = () => {
  if (process.env.NODE_ENV === "development") {
    configChecker.runAllChecks();
  }
};
