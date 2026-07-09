"use client";

import { useForm } from "react-hook-form";
import { useState, useRef, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import * as apiAuth from "@/services/apiAuth";
import { getAllRoles, getPermissionsCatalog } from "@/services/apiRoles";
import { useAuth } from "@/providers/AuthProvider";
import { getRoleStyle } from "@/components/Roles/role-utils";
import PasswordStrengthIndicator from "@/components/PasswordStrengthIndicator";

const DEFAULT_AVATAR = "/placeholder.svg";

const adminAddUserSchema = z.object({
  email: z.string().email({ message: "بريد إلكتروني غير صالح" }),
  password: z
    .string()
    .min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل")
    .regex(/[A-Z]/, "يجب أن تحتوي على حرف كبير واحد على الأقل")
    .regex(/[a-z]/, "يجب أن تحتوي على حرف صغير واحد على الأقل")
    .regex(/[0-9]/, "يجب أن تحتوي على رقم واحد على الأقل")
    .regex(
      /[^A-Za-z0-9]/,
      "يجب أن تحتوي على رمز خاص واحد على الأقل (!@#$%^&*)",
    ),
  phone: z.string().min(1, "رقم الهاتف مطلوب"),
  full_name: z.string().min(1, "الاسم الكامل مطلوب"),
});

type AdminAddUserData = z.infer<typeof adminAddUserSchema>;

function FormField({
  label,
  required,
  error,
  children,
  hint,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div>
      <label className="mb-2 flex items-center gap-1 text-sm font-medium text-gray-900 dark:text-white">
        {label}
        {required && <span className="text-orange-500">*</span>}
      </label>
      {children}
      {error && <p className="mt-1.5 text-sm text-red-500">{error}</p>}
      {hint && !error && (
        <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
          {hint}
        </p>
      )}
    </div>
  );
}

function SectionHeader({
  icon,
  title,
  subtitle,
}: {
  icon: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-5 flex items-start gap-3 border-b border-gray-100 pb-4 dark:border-[#172036]">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500 dark:bg-orange-900/30">
        <span className="material-symbols-outlined text-xl">{icon}</span>
      </div>
      <div>
        <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
        {subtitle && (
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

const inputClass =
  "h-12 w-full rounded-xl border border-gray-200 bg-gray-50/80 px-4 text-sm text-gray-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 dark:border-[#172036] dark:bg-[#15203c] dark:text-white";

function generateSecurePassword(): string {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghjkmnpqrstuvwxyz";
  const digits = "23456789";
  const symbols = "!@#$%&*";
  const all = upper + lower + digits + symbols;

  const pick = (chars: string) => chars[Math.floor(Math.random() * chars.length)];
  const base = [pick(upper), pick(lower), pick(digits), pick(symbols)];

  for (let i = 0; i < 8; i++) base.push(pick(all));

  return base.sort(() => Math.random() - 0.5).join("");
}

export default function AddUserPage() {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const phoneCheckTimeout = useRef<NodeJS.Timeout | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm<AdminAddUserData>({
    resolver: zodResolver(adminAddUserSchema),
    mode: "onBlur",
  });

  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingPhone, setIsCheckingPhone] = useState(false);
  const [phoneAvailable, setPhoneAvailable] = useState<boolean | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");

  const isSuperAdmin = currentUser?.role === "super_admin";

  const { data: roles = [], isLoading: rolesLoading } = useQuery({
    queryKey: ["roles"],
    queryFn: getAllRoles,
  });

  const { data: catalog } = useQuery({
    queryKey: ["permissions-catalog"],
    queryFn: getPermissionsCatalog,
  });

  const assignableRoles = useMemo(
    () =>
      roles.filter((role) => isSuperAdmin || role.slug !== "super_admin"),
    [roles, isSuperAdmin],
  );

  useEffect(() => {
    if (assignableRoles.length > 0 && !selectedRole) {
      const defaultRole =
        assignableRoles.find((r) => r.slug === "admin")?.slug ||
        assignableRoles[0].slug;
      setSelectedRole(defaultRole);
    }
  }, [assignableRoles, selectedRole]);

  const selectedRoleData = assignableRoles.find((r) => r.slug === selectedRole);
  const selectedRoleStyle = getRoleStyle(selectedRole);
  const permissionLabels = useMemo(() => {
    const permissions = catalog?.permissions || [];
    return (selectedRoleData?.permissions || []).map(
      (key) => permissions.find((p) => p.key === key)?.label_ar || key,
    );
  }, [catalog?.permissions, selectedRoleData?.permissions]);

  const password = watch("password", "");
  const fullName = watch("full_name", "");
  const email = watch("email", "");
  const phone = watch("phone", "");
  const avatarPreview = previewUrl || DEFAULT_AVATAR;

  const formProgress = useMemo(() => {
    let filled = 0;
    const total = 5;
    if (fullName.trim()) filled++;
    if (selectedRole) filled++;
    if (email.trim() && !errors.email) filled++;
    if (phone.trim()) filled++;
    if (password && passwordChecksMet(password)) filled++;
    return Math.round((filled / total) * 100);
  }, [fullName, selectedRole, email, phone, password, phoneAvailable, errors.email]);

  const applyImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("يرجى اختيار ملف صورة صحيح");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("حجم الصورة يجب أن يكون أقل من 5MB");
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setProfilePicture(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleProfilePictureChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file) applyImageFile(file);
    e.target.value = "";
  };

  const handleRemoveProfilePicture = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setProfilePicture(null);
    setPreviewUrl(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) applyImageFile(file);
  };

  const checkPhoneAvailability = async (phoneNumber: string) => {
    const phoneRegex = /^(\+?20)?[0-9]{10,11}$/;
    if (!phoneRegex.test(phoneNumber.replace(/[\s\-()]/g, ""))) {
      setPhoneAvailable(null);
      return;
    }

    try {
      setIsCheckingPhone(true);
      const data = await apiAuth.checkPhoneAvailability(phoneNumber);
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
    } catch {
      setPhoneAvailable(null);
    } finally {
      setIsCheckingPhone(false);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPhoneAvailable(null);
    if (phoneCheckTimeout.current) clearTimeout(phoneCheckTimeout.current);
    phoneCheckTimeout.current = setTimeout(() => {
      checkPhoneAvailability(value);
    }, 800);
  };

  const handleGeneratePassword = () => {
    const generated = generateSecurePassword();
    setValue("password", generated, { shouldValidate: true });
    setShowPassword(true);
    toast.success("تم إنشاء كلمة مرور قوية");
  };

  const submit = async (data: AdminAddUserData) => {
    if (isSubmitting) return;
    if (phoneAvailable === false) {
      toast.error("رقم الهاتف مستخدم بالفعل");
      return;
    }
    if (!selectedRole) {
      toast.error("يرجى اختيار الدور");
      return;
    }

    try {
      setIsSubmitting(true);
      let imageUrl: string | undefined;

      if (profilePicture) {
        toast.loading("جاري رفع الصورة...", { id: "upload" });
        const formData = new FormData();
        formData.append("image", profilePicture);
        formData.append("bucket", "avatars");
        formData.append("folder", "profile-pictures");

        const uploadResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/upload/image`,
          { method: "POST", body: formData, credentials: "include" },
        );

        if (!uploadResponse.ok) throw new Error("فشل في رفع الصورة");

        const uploadData = await uploadResponse.json();
        imageUrl = uploadData.data.url;
        toast.success("تم رفع الصورة", { id: "upload" });
      }

      const response = (await apiAuth.createAdminUser({
        email: data.email,
        password: data.password,
        full_name: data.full_name,
        phone: data.phone,
        role: selectedRole,
        image_url: imageUrl,
      })) as { success: boolean; message?: string };

      if (response.success) {
        toast.success("تم إنشاء الحساب بنجاح");
        router.push("/dashboard/users/");
      } else {
        throw new Error(response.message || "فشل في إنشاء الحساب");
      }
    } catch (error: unknown) {
      const errorMessage =
        (error as { message?: string })?.message || "حدث خطأ غير متوقع";
      toast.error(`فشل الإنشاء: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white dark:border-[#172036] dark:bg-[#0c1427]">
        <div className="h-1 bg-linear-to-l from-orange-500 via-amber-400 to-orange-300" />
        <div className="p-6 sm:p-8">
          <Link
            href="/dashboard/users/"
            className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition hover:text-orange-600 dark:text-gray-400 dark:hover:text-orange-400"
          >
            <span className="material-symbols-outlined text-lg">
              arrow_forward
            </span>
            العودة للمستخدمين
          </Link>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
                إضافة مستخدم جديد
              </h1>
              <p className="mt-2 max-w-xl text-gray-600 dark:text-gray-400">
                أنشئ حساباً جديداً للوحة التحكم، حدّد الدور والصلاحيات، وأرسل
                بيانات الدخول للمستخدم.
              </p>
            </div>

            <div className="flex shrink-0 flex-col gap-2 sm:min-w-[220px]">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  اكتمال النموذج
                </span>
                <span className="font-bold text-orange-600 dark:text-orange-400">
                  {formProgress}%
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-gray-100 dark:bg-[#15203c]">
                <div
                  className="h-full rounded-full bg-linear-to-l from-orange-500 to-amber-400 transition-all duration-400 ease-out"
                  style={{ width: `${formProgress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(submit)}>
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Sidebar — preview & avatar */}
          <div className="lg:col-span-4">
            <div className="sticky top-6 space-y-4">
              {/* Live preview */}
              <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-[#172036] dark:bg-[#0c1427]">
                <div
                  className={`h-20 bg-linear-to-br ${selectedRoleStyle.gradient} relative`}
                >
                  <div className="absolute inset-0 bg-black/10" />
                </div>
                <div className="relative px-6 pb-6">
                  <div className="-mt-12 mb-4 flex justify-center">
                    <div className="relative h-24 w-24 overflow-hidden rounded-2xl ring-4 ring-white shadow-lg dark:ring-[#0c1427]">
                      <Image
                        src={avatarPreview}
                        alt="معاينة المستخدم"
                        fill
                        className="object-cover"
                        unoptimized={!!previewUrl}
                      />
                    </div>
                  </div>

                  <div className="text-center">
                    <h3 className="truncate text-lg font-bold text-gray-900 dark:text-white">
                      {fullName.trim() || "اسم المستخدم"}
                    </h3>
                    <p
                      dir="ltr"
                      className="mt-1 truncate text-sm text-gray-500 dark:text-gray-400"
                    >
                      {email.trim() || "email@example.com"}
                    </p>
                    {phone.trim() && (
                      <p
                        dir="ltr"
                        className="mt-0.5 text-sm text-gray-500 dark:text-gray-400"
                      >
                        {phone}
                      </p>
                    )}
                    {selectedRoleData && (
                      <span
                        className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${selectedRoleStyle.badge}`}
                      >
                        <span className="material-symbols-outlined text-sm">
                          {selectedRoleStyle.icon}
                        </span>
                        {selectedRoleData.name_ar}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Avatar upload */}
              <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white dark:border-[#172036] dark:bg-[#0c1427]">
                <div className="border-b border-gray-100 px-5 py-4 dark:border-[#172036]">
                  <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                    <span className="material-symbols-outlined text-orange-500">
                      add_a_photo
                    </span>
                    الصورة الشخصية
                    <span className="text-xs font-normal text-gray-400">
                      (اختياري)
                    </span>
                  </h2>
                </div>
                <div className="p-5">
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    className={`relative rounded-xl border-2 border-dashed p-5 text-center transition ${
                      isDragging
                        ? "border-orange-400 bg-orange-50 dark:bg-orange-900/20"
                        : "border-gray-200 hover:border-orange-200 dark:border-[#172036] dark:hover:border-orange-800"
                    }`}
                  >
                    <span className="material-symbols-outlined mb-2 text-3xl text-gray-400">
                      cloud_upload
                    </span>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      اسحب الصورة أو
                    </p>
                    <label className="mt-2 inline-flex cursor-pointer items-center gap-1 rounded-lg bg-orange-50 px-3 py-1.5 text-sm font-medium text-orange-600 transition hover:bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400 dark:hover:bg-orange-900/50">
                      اختر ملف
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleProfilePictureChange}
                      />
                    </label>
                    <p className="mt-2 text-xs text-gray-500">PNG, JPG — حتى 5MB</p>
                  </div>

                  {profilePicture && (
                    <button
                      type="button"
                      onClick={handleRemoveProfilePicture}
                      className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-gray-200 py-2 text-sm text-gray-600 transition hover:bg-gray-50 dark:border-[#172036] dark:text-gray-400 dark:hover:bg-[#15203c]"
                    >
                      <span className="material-symbols-outlined text-base">
                        delete
                      </span>
                      إزالة الصورة
                    </button>
                  )}
                </div>
              </div>

              {/* Tips */}
              <div className="rounded-2xl border border-blue-100 bg-blue-50/80 p-5 dark:border-blue-900/40 dark:bg-blue-900/20">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-blue-800 dark:text-blue-300">
                  <span className="material-symbols-outlined text-lg">tips_and_updates</span>
                  نصائح سريعة
                </h3>
                <ul className="space-y-2 text-xs text-blue-700 dark:text-blue-300/90">
                  <li className="flex gap-2">
                    <span className="material-symbols-outlined shrink-0 text-sm">check</span>
                    اختر الدور المناسب قبل الإنشاء
                  </li>
                  <li className="flex gap-2">
                    <span className="material-symbols-outlined shrink-0 text-sm">check</span>
                    كلمة المرور يجب أن تستوفي جميع المتطلبات
                  </li>
                  <li className="flex gap-2">
                    <span className="material-symbols-outlined shrink-0 text-sm">check</span>
                    يمكنك إدارة الأدوار من{" "}
                    <Link
                      href="/dashboard/roles/"
                      className="font-medium underline hover:no-underline"
                    >
                      صفحة الأدوار
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Main form */}
          <div className="lg:col-span-8">
            <div className="space-y-6">
              {/* Role selection */}
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-[#172036] dark:bg-[#0c1427] md:p-8">
                <SectionHeader
                  icon="admin_panel_settings"
                  title="الدور والصلاحيات"
                  subtitle="حدد مستوى الوصول للمستخدم الجديد"
                />

                {rolesLoading ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-24 animate-pulse rounded-xl bg-gray-100 dark:bg-[#15203c]"
                      />
                    ))}
                  </div>
                ) : assignableRoles.length === 0 ? (
                  <p className="text-sm text-gray-500">لا توجد أدوار متاحة</p>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {assignableRoles.map((role) => {
                      const style = getRoleStyle(role.slug);
                      const isSelected = selectedRole === role.slug;
                      return (
                        <button
                          key={role.id}
                          type="button"
                          onClick={() => setSelectedRole(role.slug)}
                          className={`group relative overflow-hidden rounded-xl border-2 p-4 text-right transition ${
                            isSelected
                              ? "border-orange-400 bg-orange-50/50 shadow-md shadow-orange-500/10 dark:border-orange-500 dark:bg-orange-900/20"
                              : "border-gray-100 bg-gray-50/50 hover:border-orange-200 dark:border-[#172036] dark:bg-[#15203c] dark:hover:border-orange-800"
                          }`}
                        >
                          {isSelected && (
                            <span className="absolute left-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-white">
                              <span className="material-symbols-outlined text-sm">
                                check
                              </span>
                            </span>
                          )}
                          <div className="flex items-start gap-3">
                            <div
                              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-linear-to-br ${style.gradient} text-white shadow-md`}
                            >
                              <span className="material-symbols-outlined text-xl">
                                {style.icon}
                              </span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-semibold text-gray-900 dark:text-white">
                                  {role.name_ar}
                                </span>
                                {role.is_system && (
                                  <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-medium text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                                    نظام
                                  </span>
                                )}
                              </div>
                              {role.description && (
                                <p className="mt-1 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">
                                  {role.description}
                                </p>
                              )}
                              <p className="mt-2 text-xs font-medium text-gray-400">
                                {role.permissions.length} صلاحية
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {selectedRoleData && permissionLabels.length > 0 && (
                  <div className="overflow-hidden">
                      <div className="mt-5 rounded-xl border border-gray-100 bg-gray-50/80 p-4 dark:border-[#172036] dark:bg-[#15203c]">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                          صلاحيات هذا الدور
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {permissionLabels.slice(0, 8).map((label) => (
                            <span
                              key={label}
                              className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-xs font-medium text-gray-700 shadow-sm dark:bg-[#0c1427] dark:text-gray-300"
                            >
                              <span className="material-symbols-outlined text-sm text-green-500">
                                verified
                              </span>
                              {label}
                            </span>
                          ))}
                          {permissionLabels.length > 8 && (
                            <span className="inline-flex items-center rounded-lg bg-orange-100 px-2.5 py-1 text-xs font-medium text-orange-700 dark:bg-orange-900/40 dark:text-orange-300">
                              +{permissionLabels.length - 8} أخرى
                            </span>
                          )}
                        </div>
                      </div>
                  </div>
                )}
              </div>

              {/* Account details */}
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-[#172036] dark:bg-[#0c1427] md:p-8">
                <SectionHeader
                  icon="person"
                  title="البيانات الشخصية"
                  subtitle="معلومات الهوية والتواصل"
                />

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <FormField
                      label="الاسم الكامل"
                      required
                      error={errors.full_name?.message}
                    >
                      <div className="relative">
                        <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-lg text-gray-400">
                          badge
                        </span>
                        <input
                          type="text"
                          placeholder="مثال: أحمد محمد"
                          {...register("full_name")}
                          className={`${inputClass} pr-10`}
                        />
                      </div>
                    </FormField>
                  </div>

                  <FormField
                    label="البريد الإلكتروني"
                    required
                    error={errors.email?.message}
                  >
                    <div className="relative">
                      <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-lg text-gray-400">
                        mail
                      </span>
                      <input
                        type="email"
                        dir="ltr"
                        placeholder="name@example.com"
                        {...register("email")}
                        className={`${inputClass} pr-10 text-left`}
                      />
                    </div>
                  </FormField>

                  <FormField
                    label="رقم الهاتف"
                    required
                    error={errors.phone?.message}
                    hint={
                      !errors.phone && phoneAvailable
                        ? "رقم الهاتف متاح ✓"
                        : "صيغة مصرية: 01xxxxxxxxx"
                    }
                  >
                    <div className="relative">
                      <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-lg text-gray-400">
                        call
                      </span>
                      <input
                        type="text"
                        dir="ltr"
                        placeholder="01234567890"
                        {...register("phone", { onChange: handlePhoneChange })}
                        className={`${inputClass} pl-10 pr-10 text-left ${
                          phoneAvailable === true
                            ? "border-green-400 focus:border-green-400 focus:ring-green-400/20"
                            : phoneAvailable === false
                              ? "border-red-400 focus:border-red-400 focus:ring-red-400/20"
                              : ""
                        }`}
                      />
                      <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        {isCheckingPhone ? (
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
                        ) : phoneAvailable === true ? (
                          <span className="material-symbols-outlined text-green-500">
                            check_circle
                          </span>
                        ) : phoneAvailable === false ? (
                          <span className="material-symbols-outlined text-red-500">
                            cancel
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </FormField>
                </div>
              </div>

              {/* Security */}
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-[#172036] dark:bg-[#0c1427] md:p-8">
                <SectionHeader
                  icon="lock"
                  title="بيانات الدخول"
                  subtitle="كلمة مرور آمنة للوصول إلى اللوحة"
                />

                <FormField
                  label="كلمة المرور"
                  required
                  error={errors.password?.message}
                >
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-lg text-gray-400">
                        lock
                      </span>
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="كلمة مرور قوية"
                        {...register("password")}
                        className={`${inputClass} pl-10 pr-10`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <span className="material-symbols-outlined text-xl">
                          {showPassword ? "visibility_off" : "visibility"}
                        </span>
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={handleGeneratePassword}
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600 dark:border-[#172036] dark:bg-[#15203c] dark:text-gray-300 dark:hover:border-orange-700 dark:hover:text-orange-400"
                    >
                      <span className="material-symbols-outlined text-lg">
                        autorenew
                      </span>
                      <span className="hidden sm:inline">توليد</span>
                    </button>
                  </div>
                  <div className="mt-2">
                    <PasswordStrengthIndicator password={password} />
                  </div>
                </FormField>
              </div>

              {/* Actions */}
              <div className="flex flex-col-reverse gap-3 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:flex-row sm:justify-end dark:border-[#172036] dark:bg-[#0c1427]">
                <button
                  type="button"
                  onClick={() => router.push("/dashboard/users/")}
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-6 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:border-[#172036] dark:text-gray-300 dark:hover:bg-[#15203c]"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-8 py-3 text-sm font-medium text-white shadow-lg shadow-orange-500/25 transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-lg">
                        progress_activity
                      </span>
                      جاري الإنشاء...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-lg">
                        person_add
                      </span>
                      إنشاء الحساب
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

function passwordChecksMet(password: string): boolean {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
}
