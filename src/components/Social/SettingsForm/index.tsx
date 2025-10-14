"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { useAdminProfile } from "@/components/MyProfile/useAdminProfile";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import apiClient from "@/services/api-client";
import { profileSchema } from "./lib/validations/schema";
import { z } from "zod";
import {
  compressImage,
  needsCompression,
  formatFileSize,
} from "../../../../src/lib/image-compression";
import toast from "react-hot-toast";

const SettingsForm: React.FC = () => {
  const { data: profile } = useAdminProfile();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
  });

  const [profilePicture, setProfilePicture] = useState<File | null>(null);

  // تحديث قيم الفورم عندما تتغير بيانات profile
  useEffect(() => {
    if (profile) {
      reset({
        ...profile,
        phone: profile.phone?.toString(),
      });
    }
  }, [profile, reset]);

  const handleProfilePictureChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];

      // التحقق من نوع الملف
      if (!file.type.startsWith("image/")) {
        toast.error(`الملف ${file.name} ليس صورة`);
        return;
      }

      // التحقق من حجم الملف (50MB كحد أقصى)
      if (file.size > 50 * 1024 * 1024) {
        toast.error(`حجم الصورة ${file.name} يجب أن لا يتجاوز 50MB`);
        return;
      }

      try {
        // فحص ما إذا كانت الصورة تحتاج ضغط
        if (needsCompression(file, 600)) {
          toast(`جاري ضغط الصورة ${file.name}...`, { icon: "ℹ️" });

          const compressionResult = await compressImage(file, {
            maxSizeKB: 600,
            quality: 0.8,
            maxWidth: 1920,
            maxHeight: 1080,
          });

          // عرض معلومات الضغط
          toast.success(
            `تم ضغط الصورة بنجاح! الحجم الأصلي: ${formatFileSize(
              compressionResult.originalSize
            )} → الحجم الجديد: ${formatFileSize(
              compressionResult.compressedSize
            )} (تم توفير ${compressionResult.compressionRatio}%)`
          );

          setProfilePicture(compressionResult.compressedFile);
        } else {
          // الصورة لا تحتاج ضغط
          setProfilePicture(file);
        }
      } catch (error) {
        console.error("خطأ في ضغط الصورة:", error);
        toast.error("حدث خطأ أثناء ضغط الصورة، سيتم استخدام الصورة الأصلية");
        setProfilePicture(file);
      }
    }
  };

  const handleRemoveProfilePicture = () => {
    setProfilePicture(null);
  };

  const uploadImage = async (file: File) => {
    try {
      const response = (await apiClient.uploadFile("/upload/image", file, {
        folder: "profile-pictures",
      })) as { data: { url?: string; imageUrl?: string } };
      return response.data.url || response.data.imageUrl || "";
    } catch (error) {
      console.error("Error uploading image:", error);
      throw new Error("فشل رفع الصورة");
    }
  };

  const submit = async (formData: z.infer<typeof profileSchema>) => {
    try {
      let image_url = profile?.image_url;

      if (profilePicture) {
        toast.loading("جارٍ رفع الصورة...");
        image_url = await uploadImage(profilePicture);
        toast.dismiss();
      }

      toast.loading("جارٍ تحديث الملف الشخصي...");

      // Update admin profile using the new endpoint
      await apiClient.put("/admin/profile", {
        full_name: formData.full_name,
        phone: formData.phone,
        job_title: formData.job_title,
        address: formData.address,
        about: formData.about,
        image_url: image_url,
      });

      toast.dismiss();
      toast.success("تم تحديث الملف الشخصي بنجاح");

      // Redirect to my profile page
      router.push("/dashboard/my-profile/");
    } catch (error: unknown) {
      toast.dismiss();
      if (error instanceof Error) {
        console.error("Update error:", error.message);
        toast.error(error.message || "حدث خطأ أثناء التحديث");
      } else {
        console.error("Unknown error", error);
        toast.error("حدث خطأ غير متوقع");
      }
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
                  <h5 className="!mb-0">إعدادات الملف الشخصي</h5>
                </div>
              </div>
              <div className="trezo-card-content">
                <div className="sm:grid sm:grid-cols-2 sm:gap-[25px]">
                  <div className="mb-[20px] sm:mb-0">
                    <label className="mb-[10px] block font-medium text-black dark:text-white">
                      الاسم الكامل
                    </label>
                    <input
                      type="text"
                      id="full_name"
                      {...register("full_name")}
                      className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all"
                    />
                    {errors.full_name && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.full_name.message}
                      </p>
                    )}
                  </div>

                  <div className="mb-[20px] sm:mb-0">
                    <label className="mb-[10px] block font-medium text-black dark:text-white">
                      عنوان البريد الإلكتروني
                    </label>
                    <input
                      type="text"
                      id="email"
                      {...register("email")}
                      className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="mb-[20px] sm:mb-0">
                    <label className="mb-[10px] block font-medium text-black dark:text-white">
                      رقم الهاتف
                    </label>
                    <input
                      type="text"
                      id="phone"
                      {...register("phone")}
                      className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all"
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.phone.message}
                      </p>
                    )}
                  </div>

                  <div className="mb-[20px] sm:mb-0">
                    <label className="mb-[10px] block font-medium text-black dark:text-white">
                      الوظيفة
                    </label>
                    <input
                      type="text"
                      id="job_title"
                      {...register("job_title")}
                      className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all"
                    />
                    {errors.job_title && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.job_title.message}
                      </p>
                    )}
                  </div>

                  <div className="mb-[20px] sm:mb-0">
                    <label className="mb-[10px] block font-medium text-black dark:text-white">
                      العنوان
                    </label>
                    <input
                      type="text"
                      id="address"
                      {...register("address")}
                      className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all"
                    />
                    {errors.address && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.address.message}
                      </p>
                    )}
                  </div>

                  <div className="sm:col-span-2 mb-[20px] sm:mb-0">
                    <label className="mb-[10px] block font-medium text-black dark:text-white">
                      عنك
                    </label>
                    <textarea
                      id="about"
                      {...register("about")}
                      className="h-[140px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] p-[17px] block w-full outline-0 transition-all"
                    ></textarea>
                    {errors.about && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.about.message}
                      </p>
                    )}
                  </div>

                  <div className="mb-[20px] sm:mb-0">
                    <label className="mb-[10px] block font-medium text-black dark:text-white">
                      صورة الملف الشخصي
                    </label>
                    <div id="fileUploader">
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
                          id="fileInput"
                          accept="image/*"
                          className="absolute top-0 left-0 right-0 bottom-0 rounded-md z-[1] opacity-0 cursor-pointer"
                          onChange={handleProfilePictureChange}
                        />
                      </div>

                      {(profilePicture || profile?.image_url) && (
                        <div className="mt-[10px]">
                          <div className="relative w-[80px] h-[80px]">
                            <Image
                              src={
                                profilePicture
                                  ? URL.createObjectURL(profilePicture)
                                  : profile?.image_url ||
                                    "/placeholder-user.jpg"
                              }
                              alt="profile-preview"
                              width={80}
                              height={80}
                              className="rounded-md"
                            />
                            {profilePicture && (
                              <button
                                type="button"
                                className="absolute top-[-5px] right-[-5px] bg-orange-500 text-white w-[20px] h-[20px] flex items-center justify-center rounded-full text-xs rtl:right-auto rtl:left-[-5px]"
                                onClick={handleRemoveProfilePicture}
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-[20px] sm:mt-[25px]">
                  <button
                    type="reset"
                    className="font-medium inline-block transition-all rounded-md 2xl:text-md ltr:mr-[15px] rtl:ml-[15px] py-[10px] md:py-[12px] px-[20px] md:px-[22px] bg-danger-500 text-white hover:bg-danger-400"
                  >
                    إلغاء
                  </button>

                  <button
                    type="submit"
                    className="font-medium inline-block transition-all rounded-md 2xl:text-md py-[10px] md:py-[12px] px-[20px] md:px-[22px] bg-primary-500 text-white hover:bg-primary-400"
                  >
                    <span className="inline-block relative ltr:pl-[29px] rtl:pr-[29px]">
                      <i className="material-symbols-outlined ltr:left-0 rtl:right-0 absolute top-1/2 -translate-y-1/2">
                        add
                      </i>
                      حفظ المعلومات
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </>
  );
};

export default SettingsForm;
