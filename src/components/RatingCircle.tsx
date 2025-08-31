"use client";

import React from "react";
import { ratingOptions } from "../types/feedback";

interface RatingCircleProps {
  value: number;
  selected: boolean;
  onClick: (value: number) => void;
  category: string;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
}

export const RatingCircle: React.FC<RatingCircleProps> = ({
  value,
  selected,
  onClick,
  category,
  disabled = false,
  size = "md",
}) => {
  const ratingOption = ratingOptions.find((option) => option.value === value);

  if (!ratingOption) {
    return null;
  }

  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-12 h-12 text-sm",
    lg: "w-16 h-16 text-base",
  };

  const baseClasses = `
    rounded-full border-2 flex items-center justify-center cursor-pointer
    transition-all duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
    hover:scale-105 active:scale-95
    ${sizeClasses[size]}
  `;

  const stateClasses = selected
    ? "bg-red-600 border-red-600 text-white shadow-lg"
    : "bg-white border-gray-300 text-gray-700 hover:border-red-400 hover:bg-red-50";

  const disabledClasses = disabled
    ? "opacity-50 cursor-not-allowed hover:scale-100 active:scale-100"
    : "";

  const handleClick = () => {
    if (!disabled) {
      onClick(value);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleClick();
    }
  };

  return (
    <button
      type="button"
      className={`${baseClasses} ${stateClasses} ${disabledClasses}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      aria-label={`${ratingOption.ar} - ${ratingOption.en}`}
      aria-describedby={`rating-description-${category}-${value}`}
      role="radio"
      aria-checked={selected}
      tabIndex={disabled ? -1 : 0}
    >
      <span className="font-medium" dir="rtl">
        {ratingOption.ar}
      </span>
      <span id={`rating-description-${category}-${value}`} className="sr-only">
        تقييم {ratingOption.ar} ({ratingOption.en}) للفئة {category}
      </span>
    </button>
  );
};

interface RatingCategoryProps {
  category: string;
  categoryLabel: string;
  selectedRating: number;
  onRatingChange: (rating: number) => void;
  disabled?: boolean;
  error?: string;
  required?: boolean;
}

export const RatingCategory: React.FC<RatingCategoryProps> = ({
  category,
  categoryLabel,
  selectedRating,
  onRatingChange,
  disabled = false,
  error,
  required = true,
}) => {
  return (
    <div
      className="space-y-3"
      role="group"
      aria-labelledby={`category-${category}`}
    >
      <div className="flex items-center justify-between">
        <label
          id={`category-${category}`}
          className="text-lg font-medium text-gray-900"
          dir="rtl"
        >
          {categoryLabel}
          {required && <span className="text-red-500 mr-1">*</span>}
        </label>
        {selectedRating > 0 && (
          <span className="text-sm text-gray-600" dir="rtl">
            التقييم:{" "}
            {ratingOptions.find((opt) => opt.value === selectedRating)?.ar}
          </span>
        )}
      </div>

      <div className="flex justify-center space-x-4 space-x-reverse">
        {ratingOptions.map((option) => (
          <RatingCircle
            key={option.value}
            value={option.value}
            selected={selectedRating === option.value}
            onClick={onRatingChange}
            category={category}
            disabled={disabled}
            size="md"
          />
        ))}
      </div>

      {error && (
        <p className="text-red-600 text-sm text-center" dir="rtl">
          {error}
        </p>
      )}
    </div>
  );
};

interface RatingScaleLegendProps {
  className?: string;
}

export const RatingScaleLegend: React.FC<RatingScaleLegendProps> = ({
  className = "",
}) => {
  return (
    <div className={`bg-gray-50 p-4 rounded-lg ${className}`}>
      <h3 className="text-sm font-medium text-gray-900 mb-2" dir="rtl">
        مقياس التقييم:
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {ratingOptions.map((option) => (
          <div
            key={option.value}
            className="flex items-center space-x-2 space-x-reverse"
          >
            <div className="w-4 h-4 rounded-full bg-red-600 border-2 border-red-600"></div>
            <span className="text-xs text-gray-700" dir="rtl">
              {option.value} = {option.ar}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
