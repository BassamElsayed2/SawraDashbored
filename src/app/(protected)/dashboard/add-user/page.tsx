"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
import React from "react";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUpSchema } from "@/components/Social/SettingsForm/lib/validations/schema";
import { z } from "zod";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import * as apiAuth from "@/services/apiAuth";
import PasswordStrengthIndicator from "@/components/PasswordStrengthIndicator";

type SignUpData = z.infer<typeof signUpSchema>;

export default function SignUpForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm<SignUpData>({
    resolver: zodResolver(signUpSchema),
  });

  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingPhone, setIsCheckingPhone] = useState(false);
  const [phoneAvailable, setPhoneAvailable] = useState<boolean | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Watch password for strength indicator
  const password = watch("password", "");

  const handleProfilePictureChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // التحقق من نوع الملف
      if (!file.type.startsWith("image/")) {
        toast.error("يرجى اختيار ملف صورة صحيح (PNG, JPG, GIF, etc.)");
        e.target.value = ""; // مسح الحقل
        return;
      }

      // التحقق من حجم الملف (5MB كحد أقصى)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        toast.error("حجم الصورة يجب أن يكون أقل من 5MB");
        e.target.value = ""; // مسح الحقل
        return;
      }

      setProfilePicture(file);
    }
  };

  const handleRemoveProfilePicture = () => {
    setProfilePicture(null);
  };

  // Check phone availability
  const checkPhoneAvailability = async (phoneNumber: string) => {
    // تحقق من صحة رقم الهاتف المصري
    const phoneRegex = /^(\+?20)?[0-9]{10,11}$/;

    if (
      !phoneNumber ||
      !phoneRegex.test(phoneNumber.replace(/[\s\-()]/g, ""))
    ) {
      setPhoneAvailable(null);
      return;
    }

    try {
      setIsCheckingPhone(true);
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL
        }/temp-admin/check-phone?phone=${encodeURIComponent(phoneNumber)}`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        console.error("Failed to check phone availability");
        setPhoneAvailable(null);
        return;
      }

      const data = await response.json();

      if (data.success) {
        setPhoneAvailable(!data.exists);
        if (data.exists) {
          setError("phone", {
            type: "manual",
            message: "رقم الهاتف مستخدم بالفعل",
          });
        } else {
          clearErrors("phone");
        }
      }
    } catch (error) {
      console.error("Error checking phone:", error);
      setPhoneAvailable(null);
    } finally {
      setIsCheckingPhone(false);
    }
  };

  // Debounce phone check
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPhoneAvailable(null);

    // Clear previous timeout
    if (phoneCheckTimeout.current) {
      clearTimeout(phoneCheckTimeout.current);
    }

    // Set new timeout
    phoneCheckTimeout.current = setTimeout(() => {
      checkPhoneAvailability(value);
    }, 800);
  };

  const phoneCheckTimeout = React.useRef<NodeJS.Timeout | null>(null);

  const submit = async (data: SignUpData) => {
    if (isSubmitting) return;

    // Check if phone is available
    if (phoneAvailable === false) {
      toast.error("رقم الهاتف مستخدم بالفعل. يرجى استخدام رقم آخر.");
      return;
    }

    try {
      setIsSubmitting(true);

      let imageUrl = "";

      // رفع الصورة إن وجدت
      if (profilePicture) {
        try {
          toast.loading("جاري رفع الصورة...", { id: "upload" });

          const formData = new FormData();
          formData.append("image", profilePicture);

          const uploadResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/upload/image`,
            {
              method: "POST",
              body: formData,
              credentials: "include",
            }
          );

          if (!uploadResponse.ok) {
            throw new Error("فشل في رفع الصورة");
          }

          const uploadData = await uploadResponse.json();
          imageUrl = uploadData.data.url;
          toast.success("تم رفع الصورة بنجاح", { id: "upload" });
        } catch (error) {
          console.error("Image upload failed:", error);
          toast.error("فشل في رفع الصورة", { id: "upload" });
          // Continue without image
        }
      }

      // إنشاء المستخدم - دور admin افتراضي
      const response = (await apiAuth.createAdminUser({
        email: data.email,
        password: data.password,
        full_name: data.full_name || "",
        phone: data.phone,
        role: "admin", // جميع المستخدمين المضافين من لوحة التحكم هم admins
        job_title: data.job_title || "",
        address: data.address || "",
        about: data.about || "",
        image_url: imageUrl,
      })) as { success: boolean; message?: string };

      if (response.success) {
        toast.success("تم إنشاء حساب المدير بنجاح");
        router.push("/dashboard/");
      } else {
        throw new Error(response.message || "فشل في إنشاء الحساب");
      }
    } catch (error: unknown) {
      console.error("Error creating admin user:", error);

      // تصفية الرسائل الحساسة لتجنب تسريب المعلومات
      const errorMessage =
        (error as { data?: { message?: string }; message?: string })?.data
          ?.message ||
        (error as { message?: string })?.message ||
        "حدث خطأ غير متوقع";

      // قائمة الكلمات الحساسة التي لا يجب عرضها
      const sensitiveWords = [
        "password",
        "token",
        "secret",
        "hash",
        "jwt",
        "sql",
        "database",
      ];
      const hasSensitiveInfo = sensitiveWords.some((word) =>
        errorMessage.toLowerCase().includes(word)
      );

      // استخدام رسالة عامة إذا كانت تحتوي على معلومات حساسة
      const safeErrorMessage = hasSensitiveInfo
        ? "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى."
        : errorMessage;

      toast.error(`فشل التسجيل: ${safeErrorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(submit)}>
        <div className="gap-[25px]">
          <div className="xl:col-span-3 2xl:col-span-2">
            <div className="trezo-card bg-white dark:bg-[#0c1427] mb-[25px] p-[20px] md:p-[25px] rounded-md">
              <div className="trezo-card-header mb-[20px] md:mb-[25px] flex items-center justify-between">
                <div className="trezo-card-title">
                  <h5 className="!mb-0">تسجيل حساب جديد</h5>
                </div>
              </div>
              <div className="trezo-card-content">
                <div className="sm:grid sm:grid-cols-2 sm:gap-[25px]">
                  {/* Email */}
                  <div className="mb-[20px] sm:mb-0">
                    <label className="mb-[10px] block font-medium text-black dark:text-white">
                      البريد الإلكتروني *
                    </label>
                    <input
                      type="email"
                      {...register("email")}
                      className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Password */}
                  <div className="mb-[20px] sm:mb-0">
                    <label className="mb-[10px] block font-medium text-black dark:text-white">
                      كلمة المرور *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        {...register("password")}
                        className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] pr-[50px] block w-full outline-0 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute left-4 rtl:right-4 rtl:left-auto top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        {showPassword ? (
                          <i className="ri-eye-off-line text-xl"></i>
                        ) : (
                          <i className="ri-eye-line text-xl"></i>
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.password.message}
                      </p>
                    )}
                    <PasswordStrengthIndicator password={password} />
                  </div>

                  {/* Phone */}
                  <div className="mb-[20px] sm:mb-0">
                    <label className="mb-[10px] block font-medium text-black dark:text-white">
                      رقم الهاتف *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        {...register("phone", {
                          onChange: handlePhoneChange,
                        })}
                        className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] pr-[50px] block w-full outline-0 transition-all"
                        placeholder="01234567890"
                        dir="ltr"
                      />
                      {isCheckingPhone && (
                        <div className="absolute left-4 rtl:right-4 rtl:left-auto top-1/2 -translate-y-1/2">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-500"></div>
                        </div>
                      )}
                      {!isCheckingPhone && phoneAvailable !== null && (
                        <div className="absolute left-4 rtl:right-4 rtl:left-auto top-1/2 -translate-y-1/2">
                          {phoneAvailable ? (
                            <svg
                              className="w-5 h-5 text-green-500"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="w-5 h-5 text-red-500"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </div>
                      )}
                    </div>
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.phone.message}
                      </p>
                    )}
                    {!errors.phone && phoneAvailable && (
                      <p className="text-green-600 dark:text-green-400 text-sm mt-1 flex items-center gap-1">
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        رقم الهاتف متاح
                      </p>
                    )}
                  </div>

                  {/* Optional Fields */}

                  {/* Full Name */}
                  <div className="mb-[20px] sm:mb-0">
                    <label className="mb-[10px] block font-medium text-black dark:text-white">
                      الاسم الكامل *
                    </label>
                    <input
                      type="text"
                      {...register("full_name")}
                      className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all"
                    />
                  </div>

                  {/* Job Title */}
                  <div className="mb-[20px] sm:mb-0">
                    <label className="mb-[10px] block font-medium text-black dark:text-white">
                      الوظيفة
                    </label>
                    <input
                      type="text"
                      {...register("job_title")}
                      className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all"
                    />
                  </div>

                  {/* Address */}
                  <div className="mb-[20px] sm:mb-0">
                    <label className="mb-[10px] block font-medium text-black dark:text-white">
                      العنوان
                    </label>
                    <input
                      type="text"
                      {...register("address")}
                      className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all"
                    />
                  </div>

                  {/* About */}
                  <div className="sm:col-span-2 mb-[20px] sm:mb-0">
                    <label className="mb-[10px] block font-medium text-black dark:text-white">
                      عنك
                    </label>
                    <textarea
                      {...register("about")}
                      className="h-[140px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] p-[17px] block w-full outline-0 transition-all"
                    ></textarea>
                  </div>

                  {/* Profile Picture */}
                  <div className="mb-[20px] sm:mb-0">
                    <label className="mb-[10px] block font-medium text-black dark:text-white">
                      صورة الملف الشخصي
                    </label>
                    <div className="relative flex items-center justify-center overflow-hidden rounded-md py-[88px] px-[20px] border border-gray-200 dark:border-[#172036]">
                      <div className="flex items-center justify-center">
                        <div className="w-[35px] h-[35px] border border-gray-100 dark:border-[#15203c] flex items-center justify-center rounded-md text-primary-500 text-lg ltr:mr-[12px] rtl:ml-[12px]">
                          <i className="ri-upload-2-line"></i>
                        </div>
                        <p className="leading-[1.5]">
                          <strong className="text-black dark:text-white">
                            انقر للتحميل
                          </strong>
                          <br /> ملفك هنا
                        </p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="absolute top-0 left-0 right-0 bottom-0 rounded-md z-[1] opacity-0 cursor-pointer"
                        onChange={handleProfilePictureChange}
                      />
                    </div>

                    {profilePicture && (
                      <div className="mt-[10px]">
                        <div className="relative w-[80px] h-[80px]">
                          <Image
                            src={URL.createObjectURL(profilePicture)}
                            alt="profile-preview"
                            width={80}
                            height={80}
                            className="rounded-md"
                          />
                          <button
                            type="button"
                            className="absolute top-[-5px] right-[-5px] bg-orange-500 text-white w-[20px] h-[20px] flex items-center justify-center rounded-full text-xs rtl:right-auto rtl:left-[-5px]"
                            onClick={handleRemoveProfilePicture}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-[20px] sm:mt-[25px]">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="font-medium inline-block transition-all rounded-md 2xl:text-md py-[10px] md:py-[12px] px-[20px] md:px-[22px] bg-primary-500 text-white hover:bg-primary-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "جاري الإنشاء..." : "إنشاء حساب"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </>
  );
}
