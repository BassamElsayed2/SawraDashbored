import { z } from "zod";
import { surveyCategories, ratingOptions } from "../types/feedback";

// Phone number validation regex (exactly 11 digits)
const phoneRegex = /^[0-9]{11}$/;

// Feedback form validation schema matching the database structure
export const feedbackFormSchema = z.object({
  // Customer information
  customer_name: z
    .string()
    .min(2, "الاسم يجب أن يكون على الأقل حرفين")
    .max(255, "الاسم يجب أن لا يتجاوز 255 حرف")
    .trim(),

  phone_number: z
    .string()
    .regex(phoneRegex, "رقم الهاتف يجب أن يكون 11 رقم فقط")
    .length(11, "رقم الهاتف يجب أن يكون 11 رقم فقط"),

  email: z
    .string()
    .email("البريد الإلكتروني غير صحيح")
    .optional()
    .or(z.literal("")), // Allow empty string

  // Overall rating (1-4 scale as per database constraint)
  overall_rating: z
    .number()
    .min(1, "التقييم العام يجب أن يكون بين 1 و 4")
    .max(4, "التقييم العام يجب أن يكون بين 1 و 4"),

  // Individual category ratings (matching database columns)
  reception_rating: z
    .number()
    .min(1, "تقييم الاستقبال يجب أن يكون بين 1 و 4")
    .max(4, "تقييم الاستقبال يجب أن يكون بين 1 و 4")
    .optional(),

  service_speed_rating: z
    .number()
    .min(1, "تقييم سرعة الخدمة يجب أن يكون بين 1 و 4")
    .max(4, "تقييم سرعة الخدمة يجب أن يكون بين 1 و 4")
    .optional(),

  quality_rating: z
    .number()
    .min(1, "تقييم الجودة يجب أن يكون بين 1 و 4")
    .max(4, "تقييم الجودة يجب أن يكون بين 1 و 4")
    .optional(),

  cleanliness_rating: z
    .number()
    .min(1, "تقييم النظافة يجب أن يكون بين 1 و 4")
    .max(4, "تقييم النظافة يجب أن يكون بين 1 و 4")
    .optional(),

  catering_rating: z
    .number()
    .min(1, "تقييم التقديم يجب أن يكون بين 1 و 4")
    .max(4, "تقييم التقديم يجب أن يكون بين 1 و 4")
    .optional(),

  // Branch information
  branch_id: z.string().uuid("معرف الفرع غير صحيح"),

  // Additional feedback (optional)
  opinion: z
    .string()
    .max(1000, "التعليق الإضافي يجب أن لا يتجاوز 1000 حرف")
    .optional()
    .or(z.literal("")),
});

// Test schema for development (relaxed branch_id validation)
export const feedbackFormTestSchema = z.object({
  // Customer information
  customer_name: z
    .string()
    .min(2, "الاسم يجب أن يكون على الأقل حرفين")
    .max(255, "الاسم يجب أن لا يتجاوز 255 حرف")
    .trim(),

  phone_number: z
    .string()
    .regex(phoneRegex, "رقم الهاتف يجب أن يكون 11 رقم فقط")
    .length(11, "رقم الهاتف يجب أن يكون 11 رقم فقط"),

  email: z
    .string()
    .email("البريد الإلكتروني غير صحيح")
    .optional()
    .or(z.literal("")), // Allow empty string

  // Overall rating (1-4 scale as per database constraint)
  overall_rating: z
    .number()
    .min(1, "التقييم العام يجب أن يكون بين 1 و 4")
    .max(4, "التقييم العام يجب أن يكون بين 1 و 4"),

  // Individual category ratings (matching database columns)
  reception_rating: z
    .number()
    .min(1, "تقييم الاستقبال يجب أن يكون بين 1 و 4")
    .max(4, "تقييم الاستقبال يجب أن يكون بين 1 و 4")
    .optional(),

  service_speed_rating: z
    .number()
    .min(1, "تقييم سرعة الخدمة يجب أن يكون بين 1 و 4")
    .max(4, "تقييم سرعة الخدمة يجب أن يكون بين 1 و 4")
    .optional(),

  quality_rating: z
    .number()
    .min(1, "تقييم الجودة يجب أن يكون بين 1 و 4")
    .max(4, "تقييم الجودة يجب أن يكون بين 1 و 4")
    .optional(),

  cleanliness_rating: z
    .number()
    .min(1, "تقييم النظافة يجب أن يكون بين 1 و 4")
    .max(4, "تقييم النظافة يجب أن يكون بين 1 و 4")
    .optional(),

  catering_rating: z
    .number()
    .min(1, "تقييم التقديم يجب أن يكون بين 1 و 4")
    .max(4, "تقييم التقديم يجب أن يكون بين 1 و 4")
    .optional(),

  // Branch information (relaxed for testing)
  branch_id: z.string().min(1, "معرف الفرع مطلوب"),

  // Additional feedback (optional)
  opinion: z
    .string()
    .max(1000, "التعليق الإضافي يجب أن لا يتجاوز 1000 حرف")
    .optional()
    .or(z.literal("")),
});

// Alternative schema for the ratings array approach (for feedback_ratings table)
export const feedbackRatingsSchema = z.object({
  feedback_id: z.string().uuid("معرف التقييم غير صحيح"),
  ratings: z
    .array(
      z.object({
        category: z.enum([
          "reception",
          "order_delivery",
          "service_speed",
          "food_quality",
          "cleanliness",
        ] as const),
        rating: z
          .number()
          .min(1, "التقييم يجب أن يكون بين 1 و 4")
          .max(4, "التقييم يجب أن يكون بين 1 و 4"),
      })
    )
    .min(1, "يجب تقييم فئة واحدة على الأقل"),
});

// Type for the form data
export type FeedbackFormData = z.infer<typeof feedbackFormSchema>;
export type FeedbackFormTestData = z.infer<typeof feedbackFormTestSchema>;
export type FeedbackRatingsData = z.infer<typeof feedbackRatingsSchema>;

// Validation helper functions
export const feedbackValidation = {
  // Validate individual rating (1-4 scale)
  validateRating: (rating: number): boolean => {
    return rating >= 1 && rating <= 4;
  },

  // Validate phone number (exactly 11 digits)
  validatePhoneNumber: (phone: string): boolean => {
    return phoneRegex.test(phone) && phone.length === 11;
  },

  // Validate email (optional)
  validateEmail: (email: string): boolean => {
    if (!email) return true; // Email is optional
    return z.string().email().safeParse(email).success;
  },

  // Calculate overall rating from individual ratings
  calculateOverallRating: (ratings: number[]): number => {
    if (ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, rating) => acc + rating, 0);
    return Math.round(sum / ratings.length);
  },

  // Calculate overall rating from individual category ratings
  calculateOverallFromCategories: (categoryRatings: {
    reception_rating?: number;
    service_speed_rating?: number;
    quality_rating?: number;
    cleanliness_rating?: number;
    catering_rating?: number;
  }): number => {
    const ratings = Object.values(categoryRatings).filter(
      (rating) => rating !== undefined
    ) as number[];
    if (ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, rating) => acc + rating, 0);
    return Math.round(sum / ratings.length);
  },

  // Check if all ratings are completed
  areAllRatingsCompleted: (ratings: number[]): boolean => {
    return (
      ratings.length === surveyCategories.length &&
      ratings.every((rating) => rating >= 1 && rating <= 4)
    );
  },

  // Get rating label in Arabic
  getRatingLabel: (rating: number): string => {
    const ratingOption = ratingOptions.find(
      (option) => option.value === rating
    );
    return ratingOption ? ratingOption.ar : "غير محدد";
  },

  // Get category label in Arabic
  getCategoryLabel: (categoryKey: string): string => {
    const category = surveyCategories.find((cat) => cat.key === categoryKey);
    return category ? category.ar : "غير محدد";
  },

  // Map database column names to category keys
  getCategoryFromColumn: (columnName: string): string => {
    const columnMap: Record<string, string> = {
      reception_rating: "reception",
      Speed_service_rating: "service_speed",
      quality_rating: "food_quality",
      Cleanliness_rating: "cleanliness",
      Catering_rating: "catering",
    };
    return columnMap[columnName] || columnName;
  },

  // Map category keys to database column names
  getColumnFromCategory: (categoryKey: string): string => {
    const categoryMap: Record<string, string> = {
      reception: "reception_rating",
      service_speed: "Speed_service_rating",
      food_quality: "quality_rating",
      cleanliness: "Cleanliness_rating",
      catering: "Catering_rating",
    };
    return categoryMap[categoryKey] || categoryKey;
  },
};

// Form validation messages (Arabic)
export const validationMessages = {
  required: "هذا الحقل مطلوب",
  invalidEmail: "البريد الإلكتروني غير صحيح",
  invalidPhone: "رقم الهاتف يجب أن يكون 11 رقم فقط",
  invalidRating: "التقييم يجب أن يكون بين 1 و 4",
  incompleteRatings: "يرجى تقييم جميع الفئات",
  nameTooShort: "الاسم يجب أن يكون على الأقل حرفين",
  nameTooLong: "الاسم يجب أن لا يتجاوز 255 حرف",
  phoneTooShort: "رقم الهاتف يجب أن يكون 11 رقم فقط",
  phoneTooLong: "رقم الهاتف يجب أن يكون 11 رقم فقط",
  feedbackTooLong: "التعليق الإضافي يجب أن لا يتجاوز 1000 حرف",
  invalidBranchId: "معرف الفرع غير صحيح",
  receptionRatingRequired: "تقييم الاستقبال مطلوب",
  serviceSpeedRatingRequired: "تقييم سرعة الخدمة مطلوب",
  qualityRatingRequired: "تقييم الجودة مطلوب",
  cleanlinessRatingRequired: "تقييم النظافة مطلوب",
  cateringRatingRequired: "تقييم التقديم مطلوب",
};

// Rate limiting configuration
export const rateLimitingConfig = {
  maxSubmissionsPerHour: 5,
  maxSubmissionsPerDay: 20,
  cooldownPeriod: 60 * 1000, // 1 minute in milliseconds
};

// Form submission validation
export const submissionValidation = {
  // Check if submission is allowed (rate limiting)
  isSubmissionAllowed: (lastSubmissionTime?: number): boolean => {
    if (!lastSubmissionTime) return true;
    const now = Date.now();
    return now - lastSubmissionTime >= rateLimitingConfig.cooldownPeriod;
  },

  // Get remaining time until next submission
  getRemainingCooldownTime: (lastSubmissionTime: number): number => {
    const now = Date.now();
    const elapsed = now - lastSubmissionTime;
    return Math.max(0, rateLimitingConfig.cooldownPeriod - elapsed);
  },

  // Format cooldown time for display
  formatCooldownTime: (milliseconds: number): string => {
    const seconds = Math.ceil(milliseconds / 1000);
    return `${seconds} ثانية`;
  },
};

// Accessibility helpers
export const accessibilityHelpers = {
  // Generate ARIA label for rating
  getRatingAriaLabel: (category: string, rating: number): string => {
    const categoryLabel = feedbackValidation.getCategoryLabel(category);
    const ratingLabel = feedbackValidation.getRatingLabel(rating);
    return `${categoryLabel}: ${ratingLabel}`;
  },

  // Generate ARIA description for rating scale
  getRatingScaleDescription: (): string => {
    return `مقياس التقييم من 1 إلى 4، حيث 1 = ضعيف، 2 = مقبول، 3 = جيد، 4 = ممتاز`;
  },

  // Generate form section description
  getFormSectionDescription: (
    section: "customer" | "ratings" | "feedback"
  ): string => {
    switch (section) {
      case "customer":
        return "معلومات العميل الأساسية";
      case "ratings":
        return "تقييم الخدمة في الفئات المختلفة";
      case "feedback":
        return "تعليقات إضافية (اختياري)";
      default:
        return "";
    }
  },
};
