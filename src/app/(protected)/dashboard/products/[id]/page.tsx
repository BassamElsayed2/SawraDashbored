"use client";

import { useCategories } from "@/components/products/categories/useCategories";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import {
  getProductById,
  updateProduct,
  uploadProductImage,
  ProductWithTypes,
} from "@/services/apiProducts";
import { useEffect, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useImageUpload } from "@/hooks/useImageUpload";
import { useProductTypesSizes } from "@/hooks/useProductTypesSizes";
import { BranchSelector } from "@/components/BranchSelector";
import {
  updateProductBranches,
  getProductBranches,
} from "@/services/apiBranchProducts";
import { ProductDescriptionEditor } from "@/components/products/ProductDescriptionEditor";
import { ProductImageField } from "@/components/products/ProductImageField";
import { ProductTypesSection } from "@/components/products/ProductTypesSection";
import { ProductFormActions } from "@/components/products/ProductFormActions";
import {
  scrollToFirstProductFormError,
  applyProductValidationErrors,
  validateProductTypesAndSizes,
  buildTypesWithSizesForUpdate,
} from "@/lib/product-form-utils";

interface ProductFormData {
  title_ar: string;
  title_en: string;
  category_id: string;
  description_ar: string;
  description_en: string;
  image_url?: string;
}

export default function EditProductPage() {
  const [serverImage, setServerImage] = useState<string | null>(null);
  const {
    selectedImage,
    previewImage,
    handleFileInputChange,
    clearImage,
  } = useImageUpload();
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const {
    types,
    sizesByType,
    initializeFromProduct,
    addType,
    removeType,
    updateType,
    addSize,
    removeSize,
    updateSize,
  } = useProductTypesSizes();

  // Selected branches
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(true);

  const { register, handleSubmit, reset, control, setError, clearErrors, formState: { errors } } = useForm({
    defaultValues: {
      title_ar: "",
      title_en: "",
      category_id: "",
      description_ar: "",
      description_en: "",
    },
  });

  //get id
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  //get categories
  const { data: categories } = useCategories();

  const { data: product } = useQuery({
    queryKey: ["product", id],
    queryFn: () => {
      if (!id) throw new Error("No ID provided");
      return getProductById(id);
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (product) {
      reset({
        title_ar: product.title_ar || "",
        title_en: product.title_en || "",
        category_id: product.category_id?.toString() || "",
        description_ar: product.description_ar || "",
        description_en: product.description_en || "",
      });

      if (product.image_url) {
        setServerImage(product.image_url);
      }

      initializeFromProduct(product.types);
    }
  }, [product, reset, initializeFromProduct]);

  // Load product branches
  useEffect(() => {
    const loadBranches = async () => {
      if (!id) return;

      try {
        setLoadingBranches(true);
        const branches = await getProductBranches(id);
        setSelectedBranches(branches.map((b: { id: string }) => b.id));
      } catch (error) {
        console.error("Failed to load product branches:", error);
        toast.error("فشل في تحميل فروع المنتج");
      } finally {
        setLoadingBranches(false);
      }
    };

    if (id) {
      loadBranches();
    }
  }, [id]);

  const queryClient = useQueryClient();

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      scrollToFirstProductFormError(errors);
    }
  }, [errors]);

  const onSubmit: SubmitHandler<ProductFormData> = async (data) => {
    // مسح جميع الأخطاء السابقة
    clearErrors();
    
    try {
      if (!id) throw new Error("No ID found");

      if (
        !validateProductTypesAndSizes(types, sizesByType, (field, error) => {
          // @ts-expect-error - Dynamic path not in form type, but works at runtime
          setError(field, error);
        })
      ) {
        return;
      }

      setIsSubmitting(true);
      let uploadedImageUrl: string | undefined;

      if (selectedImage) {
        setIsUploadingImage(true);
        uploadedImageUrl = await uploadProductImage(selectedImage);
        setIsUploadingImage(false);
      }

      const typesWithSizes = buildTypesWithSizesForUpdate(types, sizesByType);

      const updatedData: Partial<ProductWithTypes> = {
        ...data,
        image_url: uploadedImageUrl || serverImage || undefined,
        types: typesWithSizes,
      };

      // تنفيذ التحديث في Supabase
      await updateProduct(id, updatedData);

      // Update product branches
      if (selectedBranches.length > 0) {
        await updateProductBranches(id, selectedBranches);
      }

      // يمكنك هنا إعادة التوجيه أو عرض رسالة نجاح
      toast.success("تم تحديث المنتج والفروع بنجاح");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      router.push("/dashboard/products");
    } catch (error) {
      if (!applyProductValidationErrors(error, setError, clearErrors)) {
        let errorMessage = "حدث خطأ ما";

        if (error instanceof Error) {
          errorMessage = error.message;

          if (errorMessage.includes("Product not found")) {
            errorMessage = "المنتج غير موجود";
          } else if (errorMessage.includes("timeout")) {
            errorMessage = "انتهت مهلة الطلب، يرجى المحاولة مرة أخرى";
          } else if (
            errorMessage.includes("Network") ||
            errorMessage.includes("fetch")
          ) {
            errorMessage =
              "خطأ في الاتصال بالخادم، يرجى التحقق من الاتصال بالإنترنت";
          }
        }

        toast.error(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
      setIsUploadingImage(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className=" gap-[25px]">
        <div className="lg:col-span-2">
          <div className="app-card bg-white dark:bg-[#0c1427] mb-[25px] p-[20px] md:p-[25px] rounded-md">
            <div className="app-card-header mb-[20px] md:mb-[25px] flex items-center justify-between">
              <div className="app-card-title">
                <h5 className="!mb-0">تعديل منتج</h5>
              </div>
            </div>

            <div className="trezo-card-content">
              <div className="sm:grid sm:grid-cols-2 sm:gap-[25px]">
                {/* العنوانين */}
                <div>
                  <label className="block font-medium mb-2">العنوان (ع)</label>
                  <input
                    {...register("title_ar")}
                    data-field="title_ar"
                    className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
                  />
                  {errors?.title_ar?.message && (
                    <span className="text-red-700 text-sm mt-1 block">
                      {errors.title_ar.message}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block font-medium mb-2">العنوان (EN)</label>
                  <input
                    {...register("title_en")}
                    data-field="title_en"
                    className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
                  />
                  {errors?.title_en?.message && (
                    <span className="text-red-700 text-sm mt-1 block">
                      {errors.title_en.message}
                    </span>
                  )}
                </div>

                {/* التصنيف */}
                {product && (
                  <div className="mb-[20px] sm:mb-0">
                    <label className="mb-[10px] text-black dark:text-white font-medium block">
                      التصنيف
                    </label>
                    <select
                      {...register("category_id")}
                      data-field="category_id"
                      className="h-[55px] rounded-md border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[13px] block w-full outline-0 cursor-pointer transition-all focus:border-primary-500"
                    >
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
                    {errors?.category_id?.message && (
                      <span className="text-red-700 text-sm mt-1 block">
                        {errors.category_id.message}
                      </span>
                    )}
                  </div>
                )}

                {/* Branch Selector */}
                <div className="sm:col-span-2 mb-[20px]">
                  {!loadingBranches && (
                    <BranchSelector
                      selectedBranches={selectedBranches}
                      onChange={setSelectedBranches}
                      label="الفروع المتاح فيها المنتج"
                      description="اختر الفروع التي سيكون هذا المنتج متاحاً فيها"
                      required={true}
                    />
                  )}
                  {loadingBranches && (
                    <div className="text-center py-4">
                      <span className="text-gray-500">
                        جاري تحميل الفروع...
                      </span>
                    </div>
                  )}
                </div>

                <Controller
                  control={control}
                  name="description_ar"
                  render={({ field }) => (
                    <ProductDescriptionEditor
                      label="وصف المنتج (بالعربي)"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="description_en"
                  render={({ field }) => (
                    <ProductDescriptionEditor
                      label="وصف المنتج (بالانجليزي)"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />

                <ProductImageField
                  previewImage={previewImage}
                  selectedImage={selectedImage}
                  serverImage={serverImage}
                  onFileChange={handleFileInputChange}
                  onClearSelected={clearImage}
                  onClearServer={() => setServerImage(null)}
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
          />
        </div>
      </div>

      <ProductFormActions
        submitLabel="حفظ التعديلات"
        pendingLabel="جاري الحفظ..."
        isPending={isSubmitting}
        isUploadingImage={isUploadingImage}
        showCancel={false}
      />
    </form>
  );
}
