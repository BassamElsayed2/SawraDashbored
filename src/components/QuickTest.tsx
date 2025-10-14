"use client";

import React, { useState } from "react";
import { apiCustomerFeedback } from "@/services/apiCustomerFeedback";
import { FeedbackSubmission } from "../types/feedback";

const QuickTest: React.FC = () => {
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const testFeedbackSubmission = async () => {
    setLoading(true);
    setResult("");

    try {
      const testFeedback: FeedbackSubmission = {
        branch_id: "550e8400-e29b-41d4-a716-446655440000",
        customer_name: "أحمد محمد",
        phone_number: "+966501234567",
        email: "ahmed@example.com",
        overall_rating: 4,
        reception_rating: 4,
        service_speed_rating: 3,
        quality_rating: 4,
        cleanliness_rating: 4,
        catering_rating: 3,
        opinion: "خدمة ممتازة، الطعام لذيذ والنظافة ممتازة. شكراً لكم!",
      };

      const feedback = (await apiCustomerFeedback.submitFeedback(
        testFeedback
      )) as { id: string };
      setResult(`✅ تم إرسال التقييم بنجاح! ID: ${feedback.id}`);
    } catch (error) {
      setResult(
        `❌ خطأ في إرسال التقييم: ${
          error instanceof Error ? error.message : "خطأ غير معروف"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        اختبار سريع لنظام التقييم
      </h1>

      <div className="space-y-4">
        <button
          onClick={testFeedbackSubmission}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition-colors"
        >
          {loading ? "جاري الإرسال..." : "إرسال تقييم تجريبي"}
        </button>

        {result && (
          <div
            className={`p-4 rounded-lg ${
              result.includes("✅")
                ? "bg-green-100 border border-green-400 text-green-700"
                : "bg-red-100 border border-red-400 text-red-700"
            }`}
          >
            <p className="font-medium">{result}</p>
          </div>
        )}

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">
            معلومات الاختبار:
          </h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• يختبر إرسال تقييم كامل مع جميع البيانات</li>
            <li>• يستخدم أسماء الأعمدة الصحيحة من قاعدة البيانات</li>
            <li>• يتحقق من أن النظام يعمل بشكل صحيح</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default QuickTest;
