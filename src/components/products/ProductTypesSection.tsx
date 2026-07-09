"use client";

import type { FieldErrors, FieldValues } from "react-hook-form";
import type { ProductSize, ProductType } from "@/services/apiProducts";
import type { ProductExtendedFieldErrors } from "@/lib/product-form-utils";

interface ProductTypesSectionProps<T extends FieldValues = FieldValues> {
  types: ProductType[];
  sizesByType: Record<number, ProductSize[]>;
  errors: FieldErrors<T>;
  addType: () => void;
  removeType: (index: number) => void;
  updateType: (index: number, field: keyof ProductType, value: string) => void;
  addSize: (typeIndex: number) => void;
  removeSize: (typeIndex: number, sizeIndex: number) => void;
  updateSize: (
    typeIndex: number,
    sizeIndex: number,
    field: keyof ProductSize,
    value: string | number | undefined
  ) => void;
  onPriceValidation?: (
    typeIndex: number,
    sizeIndex: number,
    value: string
  ) => void;
}

export function ProductTypesSection<T extends FieldValues = FieldValues>({
  types,
  sizesByType,
  errors,
  addType,
  removeType,
  updateType,
  addSize,
  removeSize,
  updateSize,
  onPriceValidation,
}: ProductTypesSectionProps<T>) {
  const extendedErrors = errors as ProductExtendedFieldErrors;

  return (
    <div className="app-card bg-white dark:bg-[#0c1427] mb-[25px] p-[20px] md:p-[25px] rounded-md">
      <div className="app-card-header mb-[20px] md:mb-[25px] flex items-center justify-between">
        <div className="app-card-title">
          <h5 className="!mb-0">أنواع وأحجام المنتج</h5>
        </div>
        <button
          type="button"
          onClick={addType}
          className="font-medium inline-block transition-all rounded-md md:text-md py-[8px] px-[16px] bg-primary-500 text-white hover:bg-primary-400"
        >
          <i className="material-symbols-outlined ltr:mr-2 rtl:ml-2">add</i>
          إضافة نوع
        </button>
      </div>

      <div className="app-card-content">
        {types.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            لا توجد أنواع للمنتج. اضغط على &quot;إضافة نوع&quot; لإضافة نوع
            جديد.
          </p>
        ) : (
          <div className="space-y-6">
            {types.map((type, typeIndex) => (
              <div
                key={typeIndex}
                className="border border-gray-200 dark:border-[#172036] rounded-md p-4"
              >
                <div className="flex items-center justify-between mb-4">
                  <h6 className="text-black dark:text-white font-medium">
                    نوع {typeIndex + 1}
                  </h6>
                  <button
                    type="button"
                    onClick={() => removeType(typeIndex)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <i className="material-symbols-outlined">delete</i>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="mb-[10px] text-black dark:text-white font-medium block">
                      اسم النوع (بالعربي)
                    </label>
                    <input
                      type="text"
                      data-type-index={typeIndex}
                      data-field="name_ar"
                      className="h-[45px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
                      placeholder="مثل: رول، مثلث، عادي"
                      value={type.name_ar}
                      onChange={(e) =>
                        updateType(typeIndex, "name_ar", e.target.value)
                      }
                    />
                    {extendedErrors?.types?.[typeIndex]?.name_ar?.message && (
                      <span className="text-red-700 text-sm mt-1 block">
                        {extendedErrors.types[typeIndex]?.name_ar?.message}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="mb-[10px] text-black dark:text-white font-medium block">
                      اسم النوع (بالانجليزي)
                    </label>
                    <input
                      type="text"
                      data-type-index={typeIndex}
                      data-field="name_en"
                      className="h-[45px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
                      placeholder="مثل: Roll, Triangle, Regular"
                      value={type.name_en}
                      onChange={(e) =>
                        updateType(typeIndex, "name_en", e.target.value)
                      }
                    />
                    {extendedErrors?.types?.[typeIndex]?.name_en?.message && (
                      <span className="text-red-700 text-sm mt-1 block">
                        {extendedErrors.types[typeIndex]?.name_en?.message}
                      </span>
                    )}
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-[#172036] pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <h6 className="text-black dark:text-white font-medium">
                      أحجام النوع {typeIndex + 1}
                    </h6>
                    <button
                      type="button"
                      onClick={() => addSize(typeIndex)}
                      className="font-medium inline-block transition-all rounded-md text-sm py-[6px] px-[12px] bg-green-500 text-white hover:bg-green-400"
                    >
                      <i className="material-symbols-outlined ltr:mr-1 rtl:ml-1 text-sm">
                        add
                      </i>
                      إضافة حجم
                    </button>
                  </div>

                  {(sizesByType[typeIndex] || []).length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                      لا توجد أحجام لهذا النوع. اضغط على &quot;إضافة حجم&quot;
                      لإضافة حجم جديد.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {(sizesByType[typeIndex] || []).map((size, sizeIndex) => (
                        <div
                          key={sizeIndex}
                          className="border border-gray-200 dark:border-[#172036] rounded-md p-3"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h6 className="text-black dark:text-white font-medium text-sm">
                              حجم {sizeIndex + 1}
                            </h6>
                            <button
                              type="button"
                              onClick={() => removeSize(typeIndex, sizeIndex)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <i className="material-symbols-outlined text-sm">
                                delete
                              </i>
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="mb-[8px] text-black dark:text-white font-medium block text-sm">
                                اسم الحجم (بالعربي)
                              </label>
                              <input
                                type="text"
                                data-type-index={typeIndex}
                                data-size-index={sizeIndex}
                                data-field="size_ar"
                                className="h-[40px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[15px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
                                placeholder="مثل: صغير، متوسط، كبير"
                                value={size.size_ar}
                                onChange={(e) =>
                                  updateSize(
                                    typeIndex,
                                    sizeIndex,
                                    "size_ar",
                                    e.target.value
                                  )
                                }
                              />
                              {extendedErrors?.types?.[typeIndex]?.sizes?.[
                                sizeIndex
                              ]?.size_ar?.message && (
                                <span className="text-red-700 text-xs mt-1 block">
                                  {
                                    extendedErrors.types[typeIndex]?.sizes?.[
                                      sizeIndex
                                    ]?.size_ar?.message
                                  }
                                </span>
                              )}
                            </div>

                            <div>
                              <label className="mb-[8px] text-black dark:text-white font-medium block text-sm">
                                اسم الحجم (بالانجليزي)
                              </label>
                              <input
                                type="text"
                                data-type-index={typeIndex}
                                data-size-index={sizeIndex}
                                data-field="size_en"
                                className="h-[40px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[15px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
                                placeholder="مثل: Small, Medium, Large"
                                value={size.size_en}
                                onChange={(e) =>
                                  updateSize(
                                    typeIndex,
                                    sizeIndex,
                                    "size_en",
                                    e.target.value
                                  )
                                }
                              />
                              {extendedErrors?.types?.[typeIndex]?.sizes?.[
                                sizeIndex
                              ]?.size_en?.message && (
                                <span className="text-red-700 text-xs mt-1 block">
                                  {
                                    extendedErrors.types[typeIndex]?.sizes?.[
                                      sizeIndex
                                    ]?.size_en?.message
                                  }
                                </span>
                              )}
                            </div>

                            <div>
                              <label className="mb-[8px] text-black dark:text-white font-medium block text-sm">
                                السعر الأساسي
                              </label>
                              <input
                                type="number"
                                data-type-index={typeIndex}
                                data-size-index={sizeIndex}
                                data-field="price"
                                className="h-[40px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[15px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
                                placeholder="0.00"
                                value={size.price}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  const numValue =
                                    value === "" ? 0 : Number(value);
                                  updateSize(
                                    typeIndex,
                                    sizeIndex,
                                    "price",
                                    numValue
                                  );
                                  onPriceValidation?.(
                                    typeIndex,
                                    sizeIndex,
                                    value
                                  );
                                }}
                                onBlur={(e) =>
                                  onPriceValidation?.(
                                    typeIndex,
                                    sizeIndex,
                                    e.target.value
                                  )
                                }
                              />
                              {extendedErrors?.types?.[typeIndex]?.sizes?.[
                                sizeIndex
                              ]?.price?.message && (
                                <span className="text-red-700 text-xs mt-1 block">
                                  {
                                    extendedErrors.types[typeIndex]?.sizes?.[
                                      sizeIndex
                                    ]?.price?.message
                                  }
                                </span>
                              )}
                            </div>

                            <div>
                              <label className="mb-[8px] text-black dark:text-white font-medium block text-sm">
                                سعر العرض (اختياري)
                              </label>
                              <input
                                type="number"
                                className="h-[40px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[15px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
                                placeholder="0.00"
                                value={size.offer_price || ""}
                                onChange={(e) =>
                                  updateSize(
                                    typeIndex,
                                    sizeIndex,
                                    "offer_price",
                                    e.target.value
                                      ? Number(e.target.value)
                                      : undefined
                                  )
                                }
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
