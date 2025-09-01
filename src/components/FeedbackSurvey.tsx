import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { apiCustomerFeedback } from "../../services/apiCustomerFeedback";
import { apiBranches } from "../../services/apiBranches";
import { FeedbackSubmission, surveyCategories, Branch } from "../types/feedback";
import { FaStar } from "react-icons/fa";
import Confetti from "react-confetti";
import { motion } from "framer-motion";
import { useRef } from "react";
interface FeedbackSurveyProps {
  branchId?: string;
}

const FeedbackSurvey: React.FC<FeedbackSurveyProps> = ({ branchId: propBranchId }) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryBranchId = searchParams.get("branch_id");
  const modalRef = useRef<HTMLDivElement>(null);
const [modalSize, setModalSize] = useState({ width: 0, height: 0 });

useEffect(() => {
  if (modalRef.current) {
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        setModalSize({ width, height });
      }
    });
    observer.observe(modalRef.current);
    return () => observer.disconnect();
  }
}, []);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
  }, []);

  const [showConfetti, setShowConfetti] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const isValidId = (id: string | null): id is string => {
    if (!id) return false;
    return /^[0-9a-f-]+$/i.test(id) || /^\d+$/.test(id);
  };

  const candidateId = propBranchId ?? queryBranchId;
  const branchId = isValidId(candidateId) ? candidateId : null;

  const [branch, setBranch] = useState<Branch | null>(null);
  const [loading, setLoading] = useState(false);
  const [branchLoading, setBranchLoading] = useState(true);

  const [formData, setFormData] = useState<FeedbackSubmission>({
    branch_id: branchId || "",
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

  const [fieldErrors, setFieldErrors] = useState({
    customer_name: "",
    phone_number: "",
  });

  useEffect(() => {
    const loadBranch = async () => {
      setBranchLoading(true);
      try {
        if (branchId) {
          const branchData = await apiBranches.getPublicBranch(branchId);
          if (branchData) {
            setBranch(branchData);
            setFormData((prev) => ({ ...prev, branch_id: branchData.id }));
            setBranchLoading(false);
          } else {
            router.push("/404");
          }
        } else {
          router.push("/404");
        }
      } catch {
        router.push("/404");
      }
    };
    loadBranch();
  }, [branchId, router]);

  const ratingLabels = ["سيئ", "ضعيف", "جيد", "ممتاز", "رائع"];

  const handleRatingChange = (category: keyof FeedbackSubmission, rating: number) => {
    setFormData((prev) => {
      const updated = { ...prev, [category]: rating };
      if (category !== "overall_rating") {
        const ratings = [
          updated.reception_rating || 4,
          updated.service_speed_rating || 4,
          updated.quality_rating || 4,
          updated.cleanliness_rating || 4,
          updated.catering_rating || 4,
        ];
        updated.overall_rating = Math.round(ratings.reduce((a, b) => a + b, 0) / ratings.length);
      }
      return updated;
    });

    if (rating === 5) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
    }
  };

  const handleInputChange = (field: keyof FeedbackSubmission, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let errors: any = {};
    if (!formData.customer_name.trim()) {
      errors.customer_name = "من فضلك أدخل اسمك";
    }
    if (!formData.phone_number.trim() || !/^\d{8,15}$/.test(formData.phone_number.trim())) {
      errors.phone_number = "من فضلك أدخل رقم هاتف صحيح";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      await apiCustomerFeedback.submitFeedback({
        ...formData,
        customer_name: formData.customer_name.trim() || "زائر",
        phone_number: formData.phone_number.trim() || "غير محدد",
      });
      setShowModal(true);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    } catch {
      alert("حدث خطأ أثناء الإرسال، حاول مرة أخرى");
    } finally {
      setLoading(false);
    }
  };

  if (branchLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-100 via-white to-red-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl font-bold text-red-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 py-12 px-6 relative">
      {showConfetti && <Confetti width={windowSize.width} height={windowSize.height} numberOfPieces={300} recycle={false} />}

{showModal && (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-lg flex items-center justify-center z-50">
<motion.div
      ref={modalRef}
      className="relative bg-gradient-to-br from-white to-red-50 rounded-3xl shadow-2xl p-10 max-w-lg w-full text-center overflow-hidden"
      initial={{ scale: 0.7, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.7, opacity: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >      
      <div className="absolute inset-0">
        <Confetti
          width={400} 
          height={400} 
          numberOfPieces={200}
          recycle={false}
          gravity={0.3}
        />
      </div>

      <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg animate-bounce relative z-10">
        <svg
          className="w-10 h-10 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={3}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>

      <h2 className="text-4xl font-extrabold text-red-700 mb-3 relative z-10">
        🎉 شكراً لك!
      </h2>
      <p className="text-red-600 text-lg mb-6 relative z-10">تم إرسال تقييمك بنجاح</p>

      <button
        onClick={() => {
          setShowModal(false);
          router.push("/");
        }}
        className="px-8 py-3 bg-gradient-to-r from-red-500 to-red-700 text-white rounded-2xl font-semibold hover:scale-105 transition relative z-10"
      >
        العودة للصفحة الرئيسية
      </button>
      </motion.div>
  </div>
)}


      <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-2xl p-10">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between mb-10">
          <div className="flex items-center gap-5">
            <div className="bg-gradient-to-br from-red-500 to-red-700 rounded-full p-4 shadow-xl">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-extrabold text-gray-900">{branch?.name_ar}</h1>
            </div>
          </div>
        </header>

        <p className="text-gray-700 text-lg text-center mb-10">نرحب برأيك وملاحظاتك لتحسين خدماتنا. يرجى تقييم تجربتك والإدلاء بأي اقتراحات.</p>

        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="bg-red-50 rounded-2xl p-6 shadow-inner">
            {surveyCategories.map((category) => {
              const fieldName = `${category.key}_rating` as keyof FeedbackSubmission;
              const currentRating = formData[fieldName] as number;

              return (
                <div key={category.key} className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white rounded-xl p-5 shadow-md mb-5">
                  <div>
                    <h3 className="font-semibold text-gray-900">{category.ar}</h3>
                    <p className="text-gray-500 text-sm">{category.en}</p>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar
                          key={star}
                          size={28}
                          className={`cursor-pointer ${star <= currentRating ? "text-yellow-400" : "text-gray-300"}`}
                          onClick={() => handleRatingChange(fieldName, star)}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{ratingLabels[currentRating - 1]}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">ملاحظات واقتراحات</h3>
            <textarea
              value={formData.opinion}
              onChange={(e) => handleInputChange("opinion", e.target.value)}
              placeholder="اكتب ملاحظاتك واقتراحاتك هنا..."
              className="w-full h-32 p-4 border-2 border-gray-200 rounded-lg resize-none focus:border-red-500 text-right"
            />
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                {fieldErrors.customer_name && (
                  <p className="text-red-600 text-sm mb-1">{fieldErrors.customer_name}</p>
                )}
                <input
                  type="text"
                  placeholder="أدخل اسمك"
                  value={formData.customer_name}
                  onChange={(e) => handleInputChange("customer_name", e.target.value)}
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-red-500 text-right"
                />
              </div>
              <div>
                {fieldErrors.phone_number && (
                  <p className="text-red-600 text-sm mb-1">{fieldErrors.phone_number}</p>
                )}
                <input
                  type="tel"
                  placeholder="أدخل رقم هاتفك"
                  value={formData.phone_number}
                  onChange={(e) => handleInputChange("phone_number", e.target.value)}
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-red-500 text-right"
                />
              </div>
              <input
                type="email"
                placeholder=" (اختياري) أدخل بريدك الإلكتروني"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-red-500 text-right md:col-span-2"
              />
            </div>
          </div>

          <div className="text-center">
            <button
              type="submit"
              disabled={loading}
              className="px-12 py-4 bg-gradient-to-r from-red-500 to-red-700 text-white rounded-full text-xl font-bold shadow-lg hover:scale-105 transition"
            >
              {loading ? "جاري الإرسال..." : "إرسال التقييم"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeedbackSurvey;
