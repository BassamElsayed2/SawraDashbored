"use client";

import { useState, useEffect } from "react";

interface PasswordStrengthIndicatorProps {
  password: string;
}

interface PasswordRequirement {
  label: string;
  regex: RegExp;
  met: boolean;
}

export default function PasswordStrengthIndicator({
  password,
}: PasswordStrengthIndicatorProps) {
  const [requirements, setRequirements] = useState<PasswordRequirement[]>([
    { label: "8 أحرف على الأقل", regex: /.{8,}/, met: false },
    { label: "حرف كبير (A-Z)", regex: /[A-Z]/, met: false },
    { label: "حرف صغير (a-z)", regex: /[a-z]/, met: false },
    { label: "رقم واحد (0-9)", regex: /[0-9]/, met: false },
    {
      label: "رمز خاص (!@#$%^&*)",
      regex: /[^A-Za-z0-9]/,
      met: false,
    },
  ]);

  useEffect(() => {
    setRequirements((prev) =>
      prev.map((req) => ({
        ...req,
        met: req.regex.test(password),
      }))
    );
  }, [password]);

  const allRequirementsMet = requirements.every((req) => req.met);
  const metCount = requirements.filter((req) => req.met).length;

  // Calculate strength
  let strength = "ضعيفة";
  let strengthColor = "bg-red-500";

  if (metCount >= 5) {
    strength = "قوية";
    strengthColor = "bg-green-500";
  } else if (metCount >= 3) {
    strength = "متوسطة";
    strengthColor = "bg-yellow-500";
  }

  if (!password) return null;

  return (
    <div className="mt-3 p-4 rounded-lg bg-gray-50 dark:bg-[#0a0e19] border border-gray-200 dark:border-[#172036]">
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            قوة كلمة المرور: {strength}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {metCount}/5
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${strengthColor}`}
            style={{ width: `${(metCount / 5) * 100}%` }}
          />
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
          المتطلبات:
        </p>
        {requirements.map((req, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            {req.met ? (
              <svg
                className="w-4 h-4 text-green-500 flex-shrink-0"
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
                className="w-4 h-4 text-gray-400 dark:text-gray-600 flex-shrink-0"
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
            <span
              className={`${
                req.met
                  ? "text-green-600 dark:text-green-400"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              {req.label}
            </span>
          </div>
        ))}
      </div>

      {allRequirementsMet && (
        <div className="mt-3 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
          <div className="flex items-center gap-2">
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
            <span className="text-sm font-medium text-green-700 dark:text-green-300">
              كلمة المرور قوية ومقبولة! ✓
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
