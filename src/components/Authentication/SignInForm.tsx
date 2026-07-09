"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useSignIn } from "./useSignIn";

const features = [
  { icon: "restaurant_menu", label: "إدارة القوائم والعروض" },
  { icon: "storefront", label: "متابعة الفروع والطلبات" },
  { icon: "analytics", label: "تقارير وإحصائيات فورية" },
];

const SignInForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { login, isPending, isError } = useSignIn();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email || !password) return;
    login({ email, password });
  };

  return (
    <div className="auth-main-content relative min-h-screen overflow-hidden bg-gradient-to-br from-primary-50 via-white to-purple-50 dark:from-[#0a0e19] dark:via-[#0c1427] dark:to-[#0a0e19]">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary-200/40 blur-3xl dark:bg-primary-900/20"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-purple-200/40 blur-3xl dark:bg-purple-900/20"
      />

      <div className="relative mx-auto flex min-h-screen max-w-[1255px] flex-col items-center justify-center px-4 py-16 md:px-8 lg:py-10">
        <div className="mb-6 flex flex-wrap justify-center gap-2 lg:hidden">          {features.map((feature) => (
            <span
              key={feature.label}
              className="inline-flex items-center gap-1.5 rounded-full border border-primary-200 bg-white/70 px-3 py-1.5 text-xs font-medium text-primary-700 backdrop-blur-sm dark:border-primary-800 dark:bg-[#0c1427]/70 dark:text-primary-300"
            >
              <i className="material-symbols-outlined text-[14px]">
                {feature.icon}
              </i>
              {feature.label}
            </span>
          ))}
        </div>

        <div className="grid w-full grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="relative order-2 hidden overflow-hidden rounded-3xl shadow-2xl lg:block">            <Image
              src="/images/sign-in1.jpg"
              alt="لوحة تحكم إدارة المطاعم"
              className="h-[560px] w-full object-cover"
              width={600}
              height={600}
              priority
              sizes="(max-width: 1024px) 0vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e19]/90 via-[#0a0e19]/40 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-end p-8 text-white">
              <p className="mb-2 text-sm font-medium text-primary-200">
                نظام إدارة المطاعم
              </p>
              <h2 className="mb-6 text-white! text-2xl font-bold leading-snug xl:text-3xl">
                كل ما تحتاجه لإدارة مطعمك في مكان واحد
              </h2>
              <ul className="space-y-3">
                {features.map((feature) => (
                  <li
                    key={feature.label}
                    className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 backdrop-blur-sm"
                  >                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-500/80">
                      <i className="material-symbols-outlined text-[20px]">
                        {feature.icon}
                      </i>
                    </span>
                    <span className="text-sm font-medium">{feature.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="order-1 lg:order-2">            <div className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-xl backdrop-blur-md dark:border-[#172036] dark:bg-[#0c1427]/90 md:p-10">
              <div className="mb-8 flex items-center gap-3">
                <Image
                  src="/images/logo-icon.png"
                  alt="ENS"
                  width={150}
                  height={150}
                  className="w-14"
                  style={{ height: "auto" }}
                />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    لوحة التحكم
                  </p>
                </div>
              </div>

              <div className="mb-8">
                <h1 className="mb-2 text-2xl font-bold text-black dark:text-white md:text-3xl">
                  مرحباً بعودتك
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                  سجّل دخولك للوصول إلى لوحة إدارة المطعم
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label
                    htmlFor="email"
                    className="mb-[10px] block font-medium text-black dark:text-white md:mb-[12px]"
                  >
                    عنوان البريد الإلكتروني
                  </label>
                  <input
                    type="email"
                    id="email"
                    autoComplete="email"
                    dir="ltr"
                    placeholder="name@example.com"
                    value={email}
                    disabled={isPending}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block h-[55px] w-full rounded-md border border-gray-200 bg-white px-[17px] text-left text-black outline-0 transition-all placeholder:text-gray-500 focus:border-primary-500 disabled:opacity-60 dark:border-[#172036] dark:bg-[#0c1427] dark:text-white dark:placeholder:text-gray-400"
                  />
                </div>

                <div className="relative" id="passwordHideShow">
                  <label
                    htmlFor="password"
                    className="mb-[10px] block font-medium text-black dark:text-white md:mb-[12px]"
                  >
                    كلمة المرور
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    autoComplete="current-password"
                    placeholder="اكتب كلمة المرور"
                    value={password}
                    disabled={isPending}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block h-[55px] w-full rounded-md border border-gray-200 bg-white px-[17px] text-black outline-0 transition-all placeholder:text-gray-500 focus:border-primary-500 disabled:opacity-60 dark:border-[#172036] dark:bg-[#0c1427] dark:text-white dark:placeholder:text-gray-400"
                  />
                  <button
                    type="button"
                    aria-label={
                      showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"
                    }
                    className="absolute bottom-[12px] text-lg transition-all hover:text-primary-500 ltr:right-[20px] rtl:left-[20px]"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    <i
                      className={`ri-${showPassword ? "eye-line" : "eye-off-line"}`}
                    />
                  </button>
                </div>

                {isError && (
                  <div className="flex items-center gap-2 rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-600 dark:border-danger-800 dark:bg-danger-900/20 dark:text-danger-400">                    <i className="material-symbols-outlined text-[18px]">
                      error
                    </i>
                    <span>البريد الإلكتروني أو كلمة المرور غير صالحة</span>
                  </div>
                )}
                <button
                  type="submit"
                  disabled={isPending || !email || !password}
                  className="mt-[20px] flex h-[55px] w-full items-center justify-center gap-2 rounded-md bg-primary-500 font-medium text-white transition-all hover:bg-primary-400 disabled:cursor-not-allowed disabled:opacity-60 md:mt-[25px]"
                >
                  {isPending ? (
                    <>
                      <svg
                        className="h-5 w-5 animate-spin text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      <span>جارٍ تسجيل الدخول...</span>
                    </>
                  ) : (
                    <>
                      <i className="material-symbols-outlined">login</i>
                      <span>تسجيل الدخول</span>
                    </>
                  )}
                </button>
              </form>

              <p className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                <i className="material-symbols-outlined text-[16px]">shield</i>
                <span>وصول آمن للمسؤولين المعتمدين فقط</span>
              </p>
            </div>
          </div>
        </div>      </div>
    </div>
  );
};

export default SignInForm;
