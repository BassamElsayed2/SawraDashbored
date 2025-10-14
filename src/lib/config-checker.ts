// Configuration checker for the feedback system
export const configChecker = {
  // Check if all required environment variables are set
  checkEnvironmentVariables: () => {
    const requiredVars = [
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    ];

    const missingVars = requiredVars.filter((varName) => !process.env[varName]);

    if (missingVars.length > 0) {
      return false;
    }

    return true;
  },

  // Check if Supabase is properly configured
  checkSupabaseConfig: () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return false;
    }

    if (!supabaseUrl.startsWith("https://")) {
      return false;
    }

    if (supabaseKey.length < 50) {
      return false;
    }

    return true;
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

  // Run all checks
  runAllChecks: () => {
    const envCheck = configChecker.checkEnvironmentVariables();
    const supabaseCheck = configChecker.checkSupabaseConfig();

    return envCheck && supabaseCheck;
  },
};

// Export for use in components
export const debugConfig = () => {
  if (process.env.NODE_ENV === "development") {
    configChecker.runAllChecks();
  }
};
