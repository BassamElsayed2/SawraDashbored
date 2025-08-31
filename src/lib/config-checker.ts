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
      console.error("❌ Missing environment variables:", missingVars);
      return false;
    }

    console.log("✅ All required environment variables are set");
    return true;
  },

  // Check if Supabase is properly configured
  checkSupabaseConfig: () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error("❌ Supabase configuration is missing");
      return false;
    }

    if (!supabaseUrl.startsWith("https://")) {
      console.error("❌ Invalid Supabase URL format");
      return false;
    }

    if (supabaseKey.length < 50) {
      console.error("❌ Invalid Supabase key format");
      return false;
    }

    console.log("✅ Supabase configuration is valid");
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

    console.log("📋 Feature flags status:");
    Object.entries(flags).forEach(([flag, value]) => {
      const status = value === "true" ? "✅ Enabled" : "❌ Disabled";
      console.log(`  ${flag}: ${status}`);
    });

    return flags;
  },

  // Run all checks
  runAllChecks: () => {
    console.log("🔍 Running configuration checks...\n");

    const envCheck = configChecker.checkEnvironmentVariables();
    const supabaseCheck = configChecker.checkSupabaseConfig();
    const flagsCheck = configChecker.checkFeatureFlags();

    console.log("\n📊 Summary:");
    console.log(`Environment Variables: ${envCheck ? "✅" : "❌"}`);
    console.log(`Supabase Config: ${supabaseCheck ? "✅" : "❌"}`);
    console.log(
      `Feature Flags: ${
        Object.values(flagsCheck).some((f) => f === "true") ? "✅" : "❌"
      }`
    );

    return envCheck && supabaseCheck;
  },
};

// Export for use in components
export const debugConfig = () => {
  if (process.env.NODE_ENV === "development") {
    configChecker.runAllChecks();
  }
};
