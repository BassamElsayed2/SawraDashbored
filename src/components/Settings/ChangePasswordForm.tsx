"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import * as apiAuth from "@/services/apiAuth";
import toast from "react-hot-toast";

const ChangePasswordForm: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const router = useRouter();

  // تحليل قوة كلمة المرور
  const passwordStrength = useMemo(() => {
    const checks = {
      length: newPassword.length >= 8,
      lowercase: /[a-z]/.test(newPassword),
      uppercase: /[A-Z]/.test(newPassword),
      number: /[0-9]/.test(newPassword),
      special: /[^a-zA-Z0-9]/.test(newPassword),
    };

    const passedChecks = Object.values(checks).filter(Boolean).length;
    const strength =
      passedChecks === 5 ? "strong" : passedChecks >= 3 ? "medium" : "weak";

    return { checks, strength, passedChecks };
  }, [newPassword]);

  const handleChangePassword = async () => {
    setMessage("");
    setLoading(true);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage("يرجى ملء جميع الحقول.");
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("كلمة السر الجديدة غير متطابقة.");
      setLoading(false);
      return;
    }

    // التحقق من قوة كلمة المرور
    if (newPassword.length < 8) {
      setMessage("كلمة المرور يجب أن تكون 8 أحرف على الأقل.");
      setLoading(false);
      return;
    }

    if (!/[a-z]/.test(newPassword)) {
      setMessage("كلمة المرور يجب أن تحتوي على حرف صغير واحد على الأقل.");
      setLoading(false);
      return;
    }

    if (!/[A-Z]/.test(newPassword)) {
      setMessage("كلمة المرور يجب أن تحتوي على حرف كبير واحد على الأقل.");
      setLoading(false);
      return;
    }

    if (!/[0-9]/.test(newPassword)) {
      setMessage("كلمة المرور يجب أن تحتوي على رقم واحد على الأقل.");
      setLoading(false);
      return;
    }

    if (!/[^a-zA-Z0-9]/.test(newPassword)) {
      setMessage(
        "كلمة المرور يجب أن تحتوي على حرف خاص واحد على الأقل (!@#$%^&*)."
      );
      setLoading(false);
      return;
    }

    try {
      // Call backend API to change password
      const response = (await apiAuth.changePassword(
        currentPassword,
        newPassword
      )) as { success: boolean; message?: string };

      if (response.success) {
        toast.success("تم تحديث كلمة السر بنجاح. سيتم تسجيل خروجك.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");

        // Redirect to login after a short delay
        setTimeout(() => {
          router.push("/auth/signin");
        }, 1500);
      } else {
        setMessage(response.message || "حدث خطأ أثناء تحديث كلمة السر.");
      }
    } catch (err: unknown) {
      const errorMessage =
        (err as { data?: { message?: string }; message?: string })?.data
          ?.message ||
        (err as { message?: string })?.message ||
        "حدث خطأ غير متوقع.";
      setMessage(errorMessage);
    }

    setLoading(false);
  };

  return (
    <>
      <form>
        <div className="sm:grid sm:grid-cols-2 sm:gap-[25px]">
          <div className="mb-[20px] sm:mb-0 relative" id="passwordHideShow">
            <label className="mb-[10px] text-black dark:text-white font-medium block">
              الرقم السري الحالي
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
              id="password"
              placeholder="Type password"
            />
          </div>

          <div className="mb-[20px] sm:mb-0 relative" id="passwordHideShow2">
            <label className="mb-[10px] text-black dark:text-white font-medium block">
              الرقم السري الجديد
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
              id="password2"
              placeholder="Type password"
            />

            {/* مؤشر قوة كلمة المرور */}
            {newPassword && (
              <div className="mt-3 space-y-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div
                      key={level}
                      className={`h-1 flex-1 rounded-full transition-all ${
                        level <= passwordStrength.passedChecks
                          ? passwordStrength.strength === "strong"
                            ? "bg-green-500"
                            : passwordStrength.strength === "medium"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                          : "bg-gray-200 dark:bg-gray-700"
                      }`}
                    />
                  ))}
                </div>

                <div className="space-y-1">
                  {[
                    { key: "length", label: "8 أحرف على الأقل" },
                    { key: "uppercase", label: "حرف كبير (A-Z)" },
                    { key: "lowercase", label: "حرف صغير (a-z)" },
                    { key: "number", label: "رقم (0-9)" },
                    { key: "special", label: "حرف خاص (!@#$%^&*)" },
                  ].map((requirement) => (
                    <div
                      key={requirement.key}
                      className="flex items-center gap-2 text-xs"
                    >
                      <span
                        className={`${
                          passwordStrength.checks[
                            requirement.key as keyof typeof passwordStrength.checks
                          ]
                            ? "text-green-600 dark:text-green-400"
                            : "text-gray-400 dark:text-gray-500"
                        }`}
                      >
                        {passwordStrength.checks[
                          requirement.key as keyof typeof passwordStrength.checks
                        ]
                          ? "✓"
                          : "○"}
                      </span>
                      <span
                        className={`${
                          passwordStrength.checks[
                            requirement.key as keyof typeof passwordStrength.checks
                          ]
                            ? "text-green-700 dark:text-green-300"
                            : "text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        {requirement.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div
            className="sm:col-span-2 mb-[20px] sm:mb-0 relative"
            id="passwordHideShow3"
          >
            <label className="mb-[10px] text-black dark:text-white font-medium block">
              تاكيد الرقم السري
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
              id="password3"
              placeholder="Type password"
            />
          </div>
        </div>

        {message && <div className="text-sm text-red-500 mt-4">{message}</div>}

        <div className="mt-[20px] md:mt-[25px]">
          <button
            type="button"
            onClick={handleChangePassword}
            disabled={loading}
            className="font-medium inline-block transition-all rounded-md md:text-md py-[10px] md:py-[12px] px-[20px] md:px-[22px] bg-primary-500 text-white hover:bg-primary-400"
          >
            <span className="inline-block relative ltr:pl-[29px] rtl:pr-[29px]">
              <i className="material-symbols-outlined ltr:left-0 rtl:right-0 absolute top-1/2 -translate-y-1/2">
                check
              </i>
              {loading ? "جاري التحديث..." : "تاكيد"}
            </span>
          </button>
        </div>
      </form>
    </>
  );
};

export default ChangePasswordForm;
