"use client";

import { useEffect, useState } from "react";
import { useCategories } from "@/components/products/categories/useCategories";
import { useForm, Path } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createProduct,
  uploadProductImage,
  ProductWithTypes,
} from "@/services/apiProducts";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { UUID } from "crypto";
import { checkAuth } from "@/services/apiAuth";
import Link from "next/link";
import { useImageUpload } from "@/hooks/useImageUpload";
import { useProductTypesSizes } from "@/hooks/useProductTypesSizes";
import { BranchSelector } from "@/components/BranchSelector";
import { updateProductBranches } from "@/services/apiBranchProducts";
import { ProductDescriptionEditor } from "@/components/products/ProductDescriptionEditor";
import { ProductImageField } from "@/components/products/ProductImageField";
import { ProductTypesSection } from "@/components/products/ProductTypesSection";
import { ProductFormActions } from "@/components/products/ProductFormActions";
import {
  scrollToFirstProductFormError,
  applyProductValidationErrors,
  validateProductTypesAndSizes,
  buildTypesWithSizesForCreate,
} from "@/lib/product-form-utils";

type ProductFormValues = {
  title_ar: string;
  title_en: string;
  category_id: UUID;
  description_ar: string;
  description_en: string;
  user_id: UUID;
  image: File | null;
};

const CreateProductForm: React.FC = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const [userId, setUserId] = useState<UUID | null>(null);

  //get categories
  const { data: categories } = useCategories();

  // Text Editor
  const [editorAr, setEditorAr] = useState("اكتب وصف المنتج بالعربية...");
  const [editorEn, setEditorEn] = useState(
    "Write the product description in English..."
  );

  const { register, handleSubmit, setValue, formState, setError, clearErrors } =
    useForm<ProductFormValues>();

  const { errors } = formState;

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      scrollToFirstProductFormError(errors);
    }
  }, [errors]);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    setValue("category_id", selectedId as UUID);
  };

  useEffect(() => {
    async function fetchUser() {
      const user = await checkAuth();
      if (user?.id) {
        setUserId(user.id as UUID);
        setValue("user_id", user.id as UUID);
      }
    }

    fetchUser();
  }, [setValue]);

  const { mutate, isPending } = useMutation({
    mutationFn: async (productData: ProductWithTypes) => {
      // Create the product first
      const newProduct = await createProduct(productData);

      // If branches are selected, link them to the product
      if (selectedBranches.length > 0 && newProduct?.id) {
        await updateProductBranches(newProduct.id, selectedBranches);
      }

      return newProduct;
    },
    onSuccess: () => {
      toast.success("تم إنشاء المنتج وربطه بالفروع بنجاح");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      router.push("/dashboard/products");
    },
    onError: (error) => {
      if (!applyProductValidationErrors(error, setError, clearErrors)) {
        let errorMessage = "حدث خطأ ما";

        if (error instanceof Error) {
          errorMessage = error.message;

          if (errorMessage.includes("timeout")) {
            errorMessage = "انتهت مهلة الطلب، يرجى المحاولة مرة أخرى";
          } else if (
            errorMessage.includes("Network") ||
            errorMessage.includes("fetch")
          ) {
            errorMessage =
              "خطأ في الاتصال بالخادم، يرجى التحقق من الاتصال بالإنترنت";
          } else if (errorMessage.includes("تعذر رفع صورة المنتج")) {
            errorMessage = "فشل رفع صورة المنتج، يرجى المحاولة مرة أخرى";
          }
        }

        toast.error(errorMessage);
      }
    },
  });

  const {
    selectedImage,
    previewImage,
    isCompressing,
    handleFileInputChange,
    clearImage,
  } = useImageUpload();

  const [isUploadingImage, setIsUploadingImage] = useState(false);

  useEffect(() => {
    if (selectedImage) {
      setValue("image", selectedImage);
    }
  }, [selectedImage, setValue]);

  const handleRemoveImage = () => {
    clearImage();
    setValue("image", null);
  };

  // Selected branches
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);

  const {
    types,
    sizesByType,
    addType,
    removeType,
    updateType,
    addSize,
    removeSize,
    updateSize,
  } = useProductTypesSizes();

  const handlePriceValidation = (
    typeIndex: number,
    sizeIndex: number,
    value: string
  ) => {
    const numValue = value === "" ? 0 : Number(value);
    const fieldPath =
      `types.${typeIndex}.sizes.${sizeIndex}.price` as Path<ProductFormValues>;

    if (value === "" || isNaN(numValue) || numValue <= 0) {
      setError(fieldPath, { type: "manual", message: "السعر مطلوب" });
    } else {
      clearErrors(fieldPath);
    }
  };

  const onSubmit = async (data: ProductFormValues) => {
    // مسح جميع الأخطاء السابقة
    clearErrors();
    
    if (!userId) {
      toast.error("حدث خطأ: لم يتم تحديد المستخدم");
      return;
    }

    // تحقق أن category_id موجود وصحيح
    if (!data.category_id || data.category_id.trim() === "") {
      toast.error("الرجاء اختيار التصنيف");
      return;
    }

    // تحقق من وجود صورة
    if (!selectedImage) {
      toast.error("يجب إضافة صورة واحدة على الأقل");
      return;
    }

    // تحقق من اختيار فرع واحد على الأقل
    if (selectedBranches.length === 0) {
      toast.error("يجب اختيار فرع واحد على الأقل");
      return;
    }

    if (
      !validateProductTypesAndSizes(types, sizesByType, (field, error) => {
        setError(field as Path<ProductFormValues>, error);
      })
    ) {
      return;
    }

    try {
      setIsUploadingImage(true);

      const uploadedImageUrl = await uploadProductImage(selectedImage);
      const typesWithSizes = buildTypesWithSizesForCreate(types, sizesByType);

      const finalData: ProductWithTypes = {
        title_ar: data.title_ar,
        title_en: data.title_en,
        description_ar: data.description_ar,
        description_en: data.description_en,
        category_id: data.category_id,
        image_url: uploadedImageUrl,
        types: typesWithSizes,
      };

      mutate(finalData);
    } catch {
      toast.error("حدث خطأ أثناء رفع الصورة");
    } finally {
      setIsUploadingImage(false);
    }
  };

  return (
    <>
      <div className="mb-[25px] md:flex items-center justify-between">
        <h5 className="!mb-0"> انشاء منتج</h5>

        <ol className="breadcrumb mt-[12px] md:mt-0 rtl:flex-row-reverse">
          <li className="breadcrumb-item inline-block relative text-sm mx-[11px] ltr:first:ml-0 rtl:first:mr-0 ltr:last:mr-0 rtl:last:ml-0">
            <Link
              href="/dashboard/"
              className="inline-block relative ltr:pl-[22px] rtl:pr-[22px] transition-all hover:text-primary-500"
            >
              <i className="material-symbols-outlined absolute ltr:left-0 rtl:right-0 !text-lg -mt-px text-primary-500 top-1/2 -translate-y-1/2">
                home
              </i>
              رئيسية
            </Link>
          </li>
          <li className="breadcrumb-item inline-block  relative text-sm mx-[11px] ltr:first:ml-0 rtl:first:mr-0 ltr:last:mr-0 rtl:last:ml-0">
            المنتجات
          </li>
          <li className="breadcrumb-item inline-block  relative text-sm mx-[11px] ltr:first:ml-0 rtl:first:mr-0 ltr:last:mr-0 rtl:last:ml-0">
            انشاء منتج
          </li>
        </ol>
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className=" gap-[25px]">
          <div className="lg:col-span-2">
            <div className="app-card bg-white dark:bg-[#0c1427] mb-[25px] p-[20px] md:p-[25px] rounded-md">
              <div className="app-card-header mb-[20px] md:mb-[25px] flex items-center justify-between">
                <div className="app-card-title">
                  <h5 className="!mb-0">أضف منتج</h5>
                </div>
              </div>

              <div className="app-card-content">
                <div className="sm:grid sm:grid-cols-2 sm:gap-[25px]">
                  <div className="mb-[20px] sm:mb-0">
                    <label className="mb-[10px] text-black dark:text-white font-medium block">
                      عنوان المنتج (بالعربي)
                    </label>
                    <input
                      type="text"
                      className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
                      placeholder="يجب الايزيد عن 100 حرف"
                      id="title_ar"
                      {...register("title_ar", {
                        required: "يجب ادخال عنوان المنتج",
                        max: {
                          value: 100,
                          message: "يجب الايزيد عن 100 حرف",
                        },
                      })}
                      data-field="title_ar"
                    />
                    {errors?.title_ar?.message && (
                      <span className="text-red-700 text-sm">
                        {errors.title_ar.message}
                      </span>
                    )}
                  </div>
                  <div className="mb-[20px] sm:mb-0">
                    <label className="mb-[10px] text-black dark:text-white font-medium block">
                      عنوان المنتج (بالانجليزي)
                    </label>
                    <input
                      type="text"
                      className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
                      placeholder="يجب الايزيد عن 100 حرف"
                      id="title_en"
                      {...register("title_en", {
                        required: "يجب ادخال عنوان المنتج",
                        max: {
                          value: 100,
                          message: "يجب الايزيد عن 100 حرف",
                        },
                      })}
                      data-field="title_en"
                    />
                    {errors?.title_en?.message && (
                      <span className="text-red-700 text-sm">
                        {errors.title_en.message}
                      </span>
                    )}
                  </div>

                  <input type="hidden" {...register("user_id")} />

                  <div className="mb-[20px] sm:mb-0">
                    <label className="mb-[10px] text-black dark:text-white font-medium block">
                      التصنيف
                    </label>
                    <select
                      className="h-[55px] rounded-md border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[13px] block w-full outline-0 cursor-pointer transition-all focus:border-primary-500"
                      {...register("category_id")}
                      data-field="category_id"
                      onChange={handleCategoryChange}
                    >
                      <option value="">اختر التصنيف</option>
                      {Array.isArray(categories) &&
                        categories
                          .filter((category) => category.id)
                          .map((category) => (
                            <option
                              key={category.id}
                              value={category.id!.toString()}
                            >
                              {category.name_ar}
                            </option>
                          ))}
                    </select>
                  </div>

                  {/* Branch Selector */}
                  <div className="sm:col-span-2 mb-[20px]">
                    <BranchSelector
                      selectedBranches={selectedBranches}
                      onChange={setSelectedBranches}
                      label="الفروع المتاح فيها المنتج"
                      description="اختر الفروع التي سيكون هذا المنتج متاحاً فيها"
                      required={true}
                    />
                  </div>

                  <ProductDescriptionEditor
                    label="وصف المنتج (بالعربي)"
                    value={editorAr}
                    onChange={(value) => {
                      setEditorAr(value);
                      setValue("description_ar", value, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    }}
                  />

                  <ProductDescriptionEditor
                    label="وصف المنتج (بالانجليزي)"
                    value={editorEn}
                    onChange={(value) => {
                      setEditorEn(value);
                      setValue("description_en", value, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    }}
                  />

                  <ProductImageField
                    previewImage={previewImage}
                    selectedImage={selectedImage}
                    onFileChange={handleFileInputChange}
                    onClearSelected={handleRemoveImage}
                    imageError={errors?.image?.message}
                    requireImage
                  />
                </div>
              </div>
            </div>

            <ProductTypesSection
              types={types}
              sizesByType={sizesByType}
              errors={errors}
              addType={addType}
              removeType={removeType}
              updateType={updateType}
              addSize={addSize}
              removeSize={removeSize}
              updateSize={updateSize}
              onPriceValidation={handlePriceValidation}
            />
          </div>
        </div>

        <ProductFormActions
          submitLabel="انشاء منتج"
          pendingLabel="جاري الإنشاء..."
          isPending={isPending}
          isUploadingImage={isUploadingImage}
          isCompressing={isCompressing}
        />
      </form>
    </>
  );
};

export default CreateProductForm;
