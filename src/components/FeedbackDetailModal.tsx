"use client";

import React from "react";
import { FeedbackWithRatings } from "../types/feedback";

interface FeedbackDetailModalProps {
  feedback: FeedbackWithRatings;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (feedbackId: string) => void;
}

export const FeedbackDetailModal: React.FC<FeedbackDetailModalProps> = ({
  feedback,
  isOpen,
  onClose,
  onDelete,
}) => {
  if (!isOpen || !feedback) {
    return null;
  }

  const getRatingLabel = (rating: number): string => {
    const labels = {
      1: "ضعيف",
      2: "مقبول",
      3: "جيد",
      4: "ممتاز",
    };
    return labels[rating as keyof typeof labels] || "غير محدد";
  };

  const getRatingColor = (rating: number): string => {
    const colors = {
      1: "text-red-600 bg-red-100",
      2: "text-orange-600 bg-orange-100",
      3: "text-yellow-600 bg-yellow-100",
      4: "text-green-600 bg-green-100",
    };
    return colors[rating as keyof typeof colors] || "text-gray-600 bg-gray-100";
  };

  const getCategoryLabel = (category: string): string => {
    const categories = {
      reception: "الاستقبال والترحيب",
      order_delivery: "طريقة تقديم الطلب",
      service_speed: "سرعة الخدمة",
      food_quality: "جودة الطعام",
      cleanliness: "مستوي النظافه",
    };
    return categories[category as keyof typeof categories] || category;
  };

  const handleDelete = () => {
    if (confirm("هل أنت متأكد من حذف هذا التقييم؟")) {
      onDelete(feedback.id!);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay - Fixed gray background */}
        <div
          className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        ></div>

        {/* Modal panel - Improved positioning and styling */}
        <div className="inline-block align-bottom bg-white rounded-lg text-right overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full relative z-10">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3
                className="text-lg leading-6 font-medium text-gray-900"
                dir="rtl"
              >
                تفاصيل التقييم
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="space-y-6">
              {/* Customer Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4
                  className="text-md font-semibold text-gray-900 mb-3"
                  dir="rtl"
                >
                  معلومات العميل
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      className="block text-sm font-medium text-gray-700"
                      dir="rtl"
                    >
                      الاسم الكامل
                    </label>
                    <p className="text-sm text-gray-900 mt-1" dir="rtl">
                      {feedback.customer_name || "غير محدد"}
                    </p>
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium text-gray-700"
                      dir="rtl"
                    >
                      رقم الهاتف
                    </label>
                    <p className="text-sm text-gray-900 mt-1" dir="rtl">
                      {feedback.phone_number || "غير محدد"}
                    </p>
                  </div>
                  {feedback.email && (
                    <div className="md:col-span-2">
                      <label
                        className="block text-sm font-medium text-gray-700"
                        dir="rtl"
                      >
                        البريد الإلكتروني
                      </label>
                      <p className="text-sm text-gray-900 mt-1" dir="rtl">
                        {feedback.email || "غير محدد"}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Branch Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4
                  className="text-md font-semibold text-gray-900 mb-3"
                  dir="rtl"
                >
                  معلومات الفرع
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <p
                      className=" text-sm font-bold text-gray-700 !mb-0"
                      dir="rtl"
                    >
                      اسم الفرع :
                    </p>
                    <p className="text-sm text-gray-900 " dir="rtl">
                      {feedback.branch?.name_ar ||
                        feedback.branch?.name_en ||
                        "فرع غير محدد"}
                    </p>
                  </div>
                  {feedback.branch?.address_ar && (
                    <div className="flex items-center gap-2">
                      <p
                        className=" text-sm font-bold text-gray-700 !mb-0"
                        dir="rtl"
                      >
                        الموقع :
                      </p>
                      <p className="text-sm text-gray-900 " dir="rtl">
                        {feedback.branch.address_ar}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Overall Rating */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4
                  className="text-md font-semibold text-gray-900 mb-3"
                  dir="rtl"
                >
                  التقييم العام
                </h4>
                <div className="flex items-center space-x-3 space-x-reverse">
                  <span
                    className={`px-3 py-1 text-sm font-medium rounded-full ${getRatingColor(
                      feedback.overall_rating || 0
                    )}`}
                    dir="rtl"
                  >
                    {feedback.overall_rating || 0} ⭐{" "}
                    {getRatingLabel(feedback.overall_rating || 0)}
                  </span>
                </div>
              </div>

              {/* Detailed Ratings */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4
                  className="text-md font-semibold text-gray-900 mb-3"
                  dir="rtl"
                >
                  التقييمات التفصيلية
                </h4>
                <div className="space-y-3">
                  {feedback.ratings && feedback.ratings.length > 0 ? (
                    feedback.ratings.map((rating) => (
                      <div
                        key={rating.category}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm text-gray-700" dir="rtl">
                          {getCategoryLabel(rating.category)}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getRatingColor(
                            rating.rating
                          )}`}
                          dir="rtl"
                        >
                          {rating.rating} ⭐ {getRatingLabel(rating.rating)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <>
                      {feedback.reception_rating && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700" dir="rtl">
                            الاستقبال والترحيب
                          </span>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${getRatingColor(
                              feedback.reception_rating
                            )}`}
                            dir="rtl"
                          >
                            {feedback.reception_rating} ⭐{" "}
                            {getRatingLabel(feedback.reception_rating)}
                          </span>
                        </div>
                      )}
                      {feedback.speed_service_rating && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700" dir="rtl">
                            سرعة الخدمة
                          </span>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${getRatingColor(
                              feedback.speed_service_rating
                            )}`}
                            dir="rtl"
                          >
                            {feedback.speed_service_rating} ⭐{" "}
                            {getRatingLabel(feedback.speed_service_rating)}
                          </span>
                        </div>
                      )}
                      {feedback.quality_rating && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700" dir="rtl">
                            جودة الطعام
                          </span>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${getRatingColor(
                              feedback.quality_rating
                            )}`}
                            dir="rtl"
                          >
                            {feedback.quality_rating} ⭐{" "}
                            {getRatingLabel(feedback.quality_rating)}
                          </span>
                        </div>
                      )}
                      {feedback.cleanliness_rating && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700" dir="rtl">
                            مستوي النظافه
                          </span>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${getRatingColor(
                              feedback.cleanliness_rating
                            )}`}
                            dir="rtl"
                          >
                            {feedback.cleanliness_rating} ⭐{" "}
                            {getRatingLabel(feedback.cleanliness_rating)}
                          </span>
                        </div>
                      )}
                      {feedback.catering_rating && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700" dir="rtl">
                            طريقة تقديم الطلب
                          </span>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${getRatingColor(
                              feedback.catering_rating
                            )}`}
                            dir="rtl"
                          >
                            {feedback.catering_rating} ⭐{" "}
                            {getRatingLabel(feedback.catering_rating)}
                          </span>
                        </div>
                      )}
                      {!feedback.reception_rating &&
                        !feedback.speed_service_rating &&
                        !feedback.quality_rating &&
                        !feedback.cleanliness_rating &&
                        !feedback.catering_rating && (
                          <div className="text-sm text-gray-500" dir="rtl">
                            لا توجد تقييمات تفصيلية متاحة
                          </div>
                        )}
                    </>
                  )}
                </div>
              </div>

              {/* Customer Opinion */}
              {feedback.opinion && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4
                    className="text-md font-semibold text-gray-900 mb-3"
                    dir="rtl"
                  >
                    رأي العميل
                  </h4>
                  <div className="bg-white rounded-lg p-3 border">
                    <p
                      className="text-sm text-gray-900 leading-relaxed"
                      dir="rtl"
                    >
                      {feedback.opinion}
                    </p>
                  </div>
                </div>
              )}

              {/* Submission Date */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4
                  className="text-md font-semibold text-gray-900 mb-3"
                  dir="rtl"
                >
                  تاريخ التقييم
                </h4>
                <p className="text-sm text-gray-900" dir="rtl">
                  {feedback.created_at
                    ? new Date(feedback.created_at).toLocaleDateString(
                        "ar-EG",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      ) +
                      " - " +
                      new Date(feedback.created_at).toLocaleTimeString(
                        "ar-EG",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )
                    : "غير محدد"}
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={handleDelete}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors duration-200"
              dir="rtl"
            >
              حذف التقييم
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors duration-200"
              dir="rtl"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
