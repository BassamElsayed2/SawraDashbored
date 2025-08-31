// Feature flags for Branch QR Code Feedback System
// These flags enable safe deployment and rollback capabilities

export const featureFlags = {
  ENABLE_QR_CODE_GENERATION:
    process.env.NEXT_PUBLIC_ENABLE_QR_CODE_GENERATION === "true" || true, // Default to true for development
  ENABLE_FEEDBACK_SURVEY:
    process.env.NEXT_PUBLIC_ENABLE_FEEDBACK_SURVEY === "true" || true, // Default to true for development
  ENABLE_FEEDBACK_DASHBOARD:
    process.env.NEXT_PUBLIC_ENABLE_FEEDBACK_DASHBOARD === "true" || true, // Default to true for development
  ENABLE_FEEDBACK_ANALYTICS:
    process.env.NEXT_PUBLIC_ENABLE_FEEDBACK_ANALYTICS === "true" || true, // Default to true for development
  ENABLE_QR_FEEDBACK_SYSTEM:
    process.env.NEXT_PUBLIC_ENABLE_QR_FEEDBACK_SYSTEM === "true" || true, // Default to true for development
};

// Helper function to check if any feedback feature is enabled
export const isFeedbackSystemEnabled = () => {
  return (
    featureFlags.ENABLE_QR_FEEDBACK_SYSTEM ||
    featureFlags.ENABLE_QR_CODE_GENERATION ||
    featureFlags.ENABLE_FEEDBACK_SURVEY ||
    featureFlags.ENABLE_FEEDBACK_DASHBOARD ||
    featureFlags.ENABLE_FEEDBACK_ANALYTICS
  );
};

// Helper function to check if specific feature is enabled
export const isFeatureEnabled = (feature: keyof typeof featureFlags) => {
  return featureFlags[feature];
};
