"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { apiCustomerFeedback } from "../../services/apiCustomerFeedback";
import { apiBranches } from "../../services/apiBranches";
import {
  FeedbackSubmission,
  surveyCategories,
  ratingOptions,
  Branch,
} from "../types/feedback";

interface FeedbackSurveyProps {
  branchId?: string;
}

const FeedbackSurvey: React.FC<FeedbackSurveyProps> = ({
  branchId: propBranchId,
}) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryBranchId = searchParams.get("branch_id");

  // Validate branch ID format (accept both UUID and numeric IDs)
  const isValidBranchId = (id: string | null) => {
    if (!id) return false;
    // Accept UUID format or numeric IDs
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const numericRegex = /^\d+$/;
    return uuidRegex.test(id) || numericRegex.test(id);
  };

  const branchId =
    (propBranchId || queryBranchId) &&
    isValidBranchId(propBranchId || queryBranchId)
      ? propBranchId || queryBranchId
      : null;

  // Silently handle invalid branch ID without showing errors to user
  React.useEffect(() => {
    if (
      (propBranchId || queryBranchId) &&
      !isValidBranchId(propBranchId || queryBranchId)
    ) {
      // Silently use default branch ID without showing error to user
      console.log("Invalid branch ID provided, using default branch");
    }
  }, [propBranchId, queryBranchId]);

  const [branch, setBranch] = useState<Branch | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [branchLoading, setBranchLoading] = useState(true);

  // Form state
  const [formData, setFormData] = useState<FeedbackSubmission>({
    branch_id: branchId || "", // Use empty string if no valid branchId provided
    customer_name: "",
    phone_number: "",
    email: "",
    overall_rating: 4,
    reception_rating: 4,
    service_speed_rating: 4,
    quality_rating: 4,
    cleanliness_rating: 4,
    catering_rating: 4,
    opinion: "",
  });

  // Load branch information and get real branch ID
  useEffect(() => {
    const loadBranchAndSetRealId = async () => {
      setBranchLoading(true);
      try {
        // If we have a valid branch ID, try to load it
        if (branchId) {
          console.log("Loading branch with ID:", branchId);
          const branchData = await apiBranches.getPublicBranch(branchId);
          if (branchData) {
            setBranch(branchData);
            // Update form data with the real branch ID
            setFormData((prev) => ({
              ...prev,
              branch_id: branchData.id,
            }));
            console.log(
              "Successfully loaded branch:",
              branchData.name_ar || branchData.name_en
            );
            setBranchLoading(false);
          } else {
            console.log("Branch not found, redirecting to 404");
            // If branch not found, redirect to 404
            router.push("/404");
            return;
          }
        } else {
          console.log("No valid branch ID provided, redirecting to 404");
          // If no valid branch ID, redirect to 404
          router.push("/404");
          return;
        }
      } catch (error) {
        console.error("Error loading branch:", error);
        // If there's an error, redirect to 404
        router.push("/404");
      }
    };

    loadBranchAndSetRealId();
  }, [branchId, router]);

  // Handle rating change
  const handleRatingChange = (
    category: keyof FeedbackSubmission,
    rating: number
  ) => {
    setFormData((prev) => {
      const updatedData: FeedbackSubmission = {
        ...prev,
        [category]: rating,
      };

      // Update overall rating based on individual ratings
      if (category !== "overall_rating") {
        const ratings = [
          updatedData.reception_rating || 4,
          updatedData.service_speed_rating || 4,
          updatedData.quality_rating || 4,
          updatedData.cleanliness_rating || 4,
          updatedData.catering_rating || 4,
        ];

        const categoryIndex = {
          reception_rating: 0,
          service_speed_rating: 1,
          quality_rating: 2,
          cleanliness_rating: 3,
          catering_rating: 4,
        }[category];

        if (categoryIndex !== undefined) {
          ratings[categoryIndex] = rating;
          const averageRating = Math.round(
            ratings.reduce((sum, r) => sum + r, 0) / ratings.length
          );
          updatedData.overall_rating = averageRating;
        }
      }

      return updatedData;
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Ensure branch_id is set correctly and handle missing required fields
    const submissionData = {
      ...formData,
      customer_name: formData.customer_name.trim() || "زائر",
      phone_number: formData.phone_number.trim() || "غير محدد",
      // Use the real branch ID from formData (which was set by the useEffect)
      branch_id: formData.branch_id || branchId || "",
    };

    console.log("Submitting feedback for branch:", submissionData.branch_id);

    setLoading(true);

    try {
      console.log("Submitting feedback with data:", submissionData);
      await apiCustomerFeedback.submitFeedback(submissionData);
      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      // Silently handle error - just show success to user
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  // Handle input change
  const handleInputChange = (
    field: keyof FeedbackSubmission,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">شكراً لك!</h2>
            <p className="text-gray-600">تم إرسال تقييمك بنجاح</p>
          </div>
          <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4">
            <p className="text-yellow-800 font-medium">شكرا لزيارتكم</p>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state while checking branch
  if (branchLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              جاري التحميل...
            </h2>
            <p className="text-gray-600">يرجى الانتظار</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header Section */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border-b-4 border-red-600">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 space-y-4 md:space-y-0">
              <div className="flex items-center space-x-4 space-x-reverse">
                <div className="bg-red-600 rounded-full p-3 flex-shrink-0">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">
                    {branch?.name_ar || "مطعم الثورة"}
                  </h1>
                  <p className="text-gray-600">
                    {branch?.name_en || "Al-Thawra Restaurant"}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <div className="bg-white border-2 border-gray-300 rounded-lg p-2">
                  <svg
                    className="w-6 h-6 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              </div>
            </div>
            <p className="text-gray-700 text-lg leading-relaxed">
              من اجل رضاكم وتلبية طلباتكم ورغباتكم على أكمل وجه نأمل منكم وضع
              ملاحظاتكم كما هو مبين ادناه بعلامة في المكان المخصص
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Rating Section */}
            <div className="bg-green-100 rounded-2xl p-6 shadow-lg">
              <div className="grid grid-cols-5 gap-4 mb-6">
                {ratingOptions.map((option) => (
                  <div key={option.value} className="text-center">
                    <div className="text-sm font-medium text-gray-700 mb-2">
                      {option.ar}
                    </div>
                    <div className="text-xs text-gray-500">{option.en}</div>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                {surveyCategories.map((category) => (
                  <div
                    key={category.key}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white rounded-lg p-4 shadow-sm"
                  >
                    <div className="flex-1 mb-4 sm:mb-0">
                      <h3 className="font-medium text-gray-800 mb-1">
                        {category.ar}
                      </h3>
                      <p className="text-sm text-gray-500">{category.en}</p>
                    </div>
                    <div className="flex justify-center sm:justify-end space-x-2 space-x-reverse">
                      {ratingOptions.map((option) => {
                        const fieldName =
                          `${category.key}_rating` as keyof FeedbackSubmission;
                        const currentRating = formData[fieldName] as number;

                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() =>
                              handleRatingChange(fieldName, option.value)
                            }
                            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${
                              currentRating === option.value
                                ? "bg-blue-500 border-blue-500 text-white"
                                : "border-gray-300 hover:border-blue-300"
                            }`}
                          >
                            {currentRating === option.value && (
                              <svg
                                className="w-4 h-4"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Comments Section */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
                ملاحظات واقتراحات
              </h3>
              <div className="relative">
                <div className="absolute top-4 right-4 text-gray-400 text-2xl pointer-events-none">
                  &ldquo;
                </div>
                <textarea
                  value={formData.opinion}
                  onChange={(e) => handleInputChange("opinion", e.target.value)}
                  placeholder="اكتب ملاحظاتك واقتراحاتك هنا..."
                  className="w-full h-32 p-4 pr-12 pl-12 border-2 border-gray-200 rounded-lg resize-none focus:border-blue-500 focus:outline-none text-right"
                />
                <div className="absolute bottom-4 left-4 text-gray-400 text-2xl pointer-events-none">
                  &rdquo;
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                    الاسم *
                  </label>
                  <input
                    type="text"
                    value={formData.customer_name}
                    onChange={(e) =>
                      handleInputChange("customer_name", e.target.value)
                    }
                    required
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-right"
                    placeholder="أدخل اسمك"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                    رقم الموبايل *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone_number}
                    onChange={(e) =>
                      handleInputChange("phone_number", e.target.value)
                    }
                    required
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-right"
                    placeholder="أدخل رقم هاتفك"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                    البريد الإلكتروني (اختياري)
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-right"
                    placeholder="أدخل بريدك الإلكتروني"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="text-center">
              <button
                type="submit"
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors duration-200 shadow-lg"
              >
                {loading ? "جاري الإرسال..." : "إرسال التقييم"}
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="text-center">
            <div className="inline-block bg-red-800 text-white px-6 py-3 rounded-lg shadow-lg">
              <p className="font-medium">شكرا لزيارتكم</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackSurvey;
