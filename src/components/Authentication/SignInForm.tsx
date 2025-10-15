"use client";

import React, { useState } from "react";
import Image from "next/image";
// import Link from "next/link";

import { useSignIn } from "./useSignIn";

const SignInForm: React.FC = () => {
  // State variables for email and password
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  // Custom hook to handle sign-in logic
  const { login, isPending, isError } = useSignIn();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email || !password) {
      return;
    }

    login({ email, password });
  };

  return (
    <>
      <div className="auth-main-content bg-white dark:bg-[#0a0e19] py-[60px] md:py-[80px] lg:py-[135px]">
        <div className="mx-auto px-[12.5px] md:max-w-[720px] lg:max-w-[960px] xl:max-w-[1255px]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-[25px] items-center">
            <div className="xl:ltr:-mr-[25px] xl:rtl:-ml-[25px] 2xl:ltr:-mr-[45px] 2xl:rtl:-ml-[45px] rounded-[25px] order-2 lg:order-1">
              <Image
                src="/images/sign-in.jpg"
                alt="sign-in-image"
                className="rounded-[25px]"
                width={646}
                height={804}
              />
            </div>

            <div className=" xl:ltr:pl-[90px] xl:rtl:pr-[90px] 2xl:ltr:pl-[120px] 2xl:rtl:pr-[120px] order-1 lg:order-2">
              <button className="transition-none relative flex items-center outline-none">
                <Image
                  src="/images/logo-icon.svg"
                  alt="logo-icon"
                  width={26}
                  height={26}
                />
                <span className="font-bold text-black dark:text-white relative ltr:ml-[8px] rtl:mr-[8px] top-px text-xl">
                  ENS
                </span>
              </button>

              <div className="my-[17px] md:my-[25px]">
                <h1 className="!font-semibold !text-[22px] md:!text-xl lg:!text-2xl !mb-[5px] md:!mb-[7px]">
                  مرحبا
                </h1>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-[15px] relative">
                  <label className="mb-[10px] md:mb-[12px] text-black dark:text-white font-medium block">
                    عنوان البريد الإلكتروني
                  </label>
                  <input
                    type="text"
                    className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
                    placeholder="example@trezo.com"
                    id="email"
                    autoComplete="email"
                    value={email}
                    disabled={isPending}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="mb-[15px] relative" id="passwordHideShow">
                  <label className="mb-[10px] md:mb-[12px] text-black dark:text-white font-medium block">
                    كلمة المرور
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
                    id="password"
                    placeholder="اكتب كلمة المرور"
                    autoComplete="current-password"
                    value={password}
                    disabled={isPending}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    className="absolute text-lg ltr:right-[20px] rtl:left-[20px] bottom-[12px] transition-all hover:text-primary-500"
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    <i
                      className={`ri-${
                        showPassword ? "eye-line" : "eye-off-line"
                      }`}
                    ></i>
                  </button>
                </div>

                {isError && (
                  <div className="text-red-500 text-sm mb-4">
                    البريد الإلكتروني أو كلمة المرور غير صالحة
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isPending || !email || !password}
                  className="md:text-md block w-full text-center transition-all rounded-md font-medium mt-[20px] md:mt-[25px] py-[12px] px-[25px] text-white bg-primary-500 hover:bg-primary-400 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <span className="flex items-center justify-center gap-[5px]">
                    {isPending ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5 text-white"
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
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        <span>جارٍ تسجيل الدخول...</span>
                      </>
                    ) : (
                      <>
                        <i className="material-symbols-outlined">login</i>
                        <span>تسجيل الدخول</span>
                      </>
                    )}
                  </span>
                </button>
              </form>

              {/* <Link
                href="/authentication/forgot-password"
                className="inline-block text-primary-500 transition-all font-semibold hover:underline"
              >
                هل نسيت كلمة السر؟
              </Link> */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignInForm;
