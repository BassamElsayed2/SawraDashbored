// TypeScript interfaces for Branch QR Code Feedback System
// Following existing patterns from the codebase

export interface Branch {
  id?: string;
  name_ar: string;
  name_en: string;
  address_ar?: string;
  address_en?: string;
  phone?: string;
  email?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface BranchQRCode {
  id?: string;
  branch_id: string;
  qr_code_url: string;
  qr_code_metadata?: {
    generated_at?: string;
    survey_url?: string;
    branch_name?: string;
    [key: string]: string | number | boolean | undefined;
  };
  created_at?: string;
  updated_at?: string;
}

// Main customer feedback interface matching the database schema
export interface CustomerFeedback {
  id?: string;
  branch_id: string | number; // Can be string (UUID) or number (bigint from branches)
  customer_name: string;
  phone_number: string;
  email?: string;
  overall_rating: number; // 1-4 scale as per database constraint
  created_at?: string;
  updated_at?: string;
  opinion?: string; // Additional feedback text

  // Individual category ratings (all columns exist in the database)
  reception_rating?: number; // 1-4 scale
  service_speed_rating?: number; // 1-4 scale (corrected field name)
  quality_rating?: number; // 1-4 scale
  cleanliness_rating?: number; // 1-4 scale
  catering_rating?: number; // 1-4 scale
}

// Separate ratings table interface (for feedback_ratings table)
export interface FeedbackRating {
  id?: string;
  feedback_id: string;
  category:
    | "reception"
    | "order_delivery"
    | "service_speed"
    | "food_quality"
    | "cleanliness";
  rating: number; // 1-4 scale
  created_at?: string;
}

// Form submission interface for the main feedback form
export interface FeedbackSubmission {
  branch_id: string | number; // Can be string (UUID) or number (bigint from branches)
  customer_name: string;
  phone_number: string;
  email?: string;
  overall_rating: number; // 1-4 scale
  reception_rating?: number;
  service_speed_rating?: number;
  quality_rating?: number;
  cleanliness_rating?: number;
  catering_rating?: number;
  opinion?: string; // Additional feedback text
}

// Alternative submission interface for ratings array approach
export interface FeedbackSubmissionWithRatings {
  branch_id: string;
  customer_name: string;
  phone_number: string;
  email?: string;
  overall_rating: number;
  ratings: {
    category: FeedbackRating["category"];
    rating: number;
  }[];
  opinion?: string; // Additional feedback text
}

export interface FeedbackWithRatings extends CustomerFeedback {
  ratings?: FeedbackRating[];
  branch?: Branch;
}

export interface FeedbackFilters {
  branchId?: string;
  startDate?: string;
  endDate?: string;
  rating?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export interface FeedbackAnalytics {
  total_feedback: number;
  average_rating: number;
  rating_distribution: {
    rating: number;
    count: number;
    percentage: number;
  }[];
  category_averages: {
    category: string;
    average_rating: number;
    total_ratings: number;
  }[];
  branch_performance: {
    branch_id: string;
    branch_name: string;
    total_feedback: number;
    average_rating: number;
  }[];
}

// Survey categories matching the physical feedback card and database constraints
export const surveyCategories = [
  { key: "reception", ar: "الاستقبال والترحيب", en: "Reception and Welcome" },
  { key: "service_speed", ar: "سرعة الخدمة", en: "Service Speed" },
  { key: "quality", ar: "جودة الطعام", en: "Food Quality" },
  { key: "cleanliness", ar: "مستوي النظافه", en: "Cleanliness Level" },
  {
    key: "catering",
    ar: "طريقة تقديم الطلب",
    en: "Order Delivery Method",
  },
] as const;

// Database column mapping for individual ratings
export const databaseColumns = {
  reception: "reception_rating",
  service_speed: "Speed_service_rating", // Note the exact casing from DB
  food_quality: "quality_rating",
  cleanliness: "Cleanliness_rating", // Note the exact casing from DB
  catering: "Catering_rating", // Note the exact casing from DB
} as const;

export const ratingOptions = [
  { value: 4, ar: "ممتاز", en: "Excellent" },
  { value: 3, ar: "جيد", en: "Good" },
  { value: 2, ar: "مقبول", en: "Acceptable" },
  { value: 1, ar: "ضعيف", en: "Poor" },
] as const;

export type SurveyCategory = (typeof surveyCategories)[number]["key"];
export type RatingValue = (typeof ratingOptions)[number]["value"];
export type DatabaseColumn =
  (typeof databaseColumns)[keyof typeof databaseColumns];
