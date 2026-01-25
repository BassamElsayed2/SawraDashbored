"use client";

import { useCategories } from "@/components/news/categories/useCategories";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";

import {
  Editor,
  EditorProvider,
  BtnBold,
  BtnBulletList,
  BtnClearFormatting,
  BtnItalic,
  BtnLink,
  BtnNumberedList,
  BtnRedo,
  BtnStrikeThrough,
  BtnStyles,
  BtnUnderline,
  BtnUndo,
  HtmlButton,
  Separator,
  Toolbar,
} from "react-simple-wysiwyg";
import {
  getProductById,
  updateProduct,
  uploadProductImage,
  ProductWithTypes,
  ProductType,
  ProductSize,
} from "@/services/apiProducts";
import { useEffect, useState } from "react";
import { Controller, SubmitHandler, useForm, FieldErrors } from "react-hook-form";
import Image from "next/image";
import toast from "react-hot-toast";
import {
  compressImage,
  needsCompression,
  formatFileSize,
} from "../../../../../lib/image-compression";
import { BranchSelector } from "@/components/BranchSelector";
import {
  updateProductBranches,
  getProductBranches,
} from "@/services/apiBranchProducts";

interface ProductFormData {
  title_ar: string;
  title_en: string;
  category_id: string;
  description_ar: string;
  description_en: string;
  image_url?: string;
}

// Extended errors type to include dynamic nested paths for types and sizes
type ExtendedFieldErrors = FieldErrors<ProductFormData> & {
  types?: Array<{
    name_ar?: { message?: string };
    name_en?: { message?: string };
    sizes?: Array<{
      size_ar?: { message?: string };
      size_en?: { message?: string };
      price?: { message?: string };
      offer_price?: { message?: string };
    }>;
  }>;
};

export default function EditProductPage() {
  const [serverImage, setServerImage] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Types and Sizes management
  const [types, setTypes] = useState<ProductType[]>([]);
  const [sizesByType, setSizesByType] = useState<{
    [key: number]: ProductSize[];
  }>({});

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

      // Set types and sizes
      if (product.types) {
        setTypes(
          product.types.map((type) => ({
            id: type.id,
            product_id: type.product_id,
            name_ar: type.name_ar,
            name_en: type.name_en,
          }))
        );

        const sizesMap: { [key: number]: ProductSize[] } = {};
        product.types.forEach((type, index) => {
          if (type.sizes) {
            sizesMap[index] = type.sizes.map((size) => ({
              id: size.id,
              type_id: size.type_id,
              size_ar: size.size_ar,
              size_en: size.size_en,
              price: size.price,
              offer_price: size.offer_price,
            }));
          }
        });
        setSizesByType(sizesMap);
      }
    }
  }, [product, reset]);

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

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];

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

        setSelectedImage(compressionResult.compressedFile);
      } else {
        // الصورة لا تحتاج ضغط
        setSelectedImage(file);
      }
    } catch {
      toast.error("حدث خطأ أثناء ضغط الصورة، سيتم استخدام الصورة الأصلية");
      setSelectedImage(file);
    }
  };

  // Types management
  const addType = () => {
    const newType: ProductType = {
      name_ar: "",
      name_en: "",
    };
    setTypes([...types, newType]);
  };

  const removeType = (index: number) => {
    setTypes(types.filter((_, i) => i !== index));
    // Remove sizes for this type
    setSizesByType((prev) => {
      const newSizes = { ...prev };
      delete newSizes[index];
      // Shift remaining sizes
      const shiftedSizes: { [key: number]: ProductSize[] } = {};
      Object.keys(newSizes).forEach((key) => {
        const numKey = parseInt(key);
        if (numKey > index) {
          shiftedSizes[numKey - 1] = newSizes[numKey];
        } else {
          shiftedSizes[numKey] = newSizes[numKey];
        }
      });
      return shiftedSizes;
    });
  };

  const updateType = (
    index: number,
    field: keyof ProductType,
    value: string
  ) => {
    const updatedTypes = [...types];
    updatedTypes[index] = { ...updatedTypes[index], [field]: value };
    setTypes(updatedTypes);
  };

  // Sizes management
  const addSize = (typeIndex: number) => {
    const newSize: ProductSize = {
      size_ar: "",
      size_en: "",
      price: 0.01, // Minimum positive price to pass validation
      offer_price: undefined,
    };

    setSizesByType((prev) => ({
      ...prev,
      [typeIndex]: [...(prev[typeIndex] || []), newSize],
    }));
  };

  const removeSize = (typeIndex: number, sizeIndex: number) => {
    setSizesByType((prev) => ({
      ...prev,
      [typeIndex]: prev[typeIndex]?.filter((_, i) => i !== sizeIndex) || [],
    }));
  };

  const updateSize = (
    typeIndex: number,
    sizeIndex: number,
    field: keyof ProductSize,
    value: string | number | undefined
  ) => {
    setSizesByType((prev) => {
      const updatedSizes = [...(prev[typeIndex] || [])];
      // إذا كان الحقل هو price وكان القيمة غير صالحة، استخدم 0
      if (field === "price") {
        if (value === "" || value === null || value === undefined || isNaN(Number(value))) {
          updatedSizes[sizeIndex] = { ...updatedSizes[sizeIndex], [field]: 0 };
        } else {
          updatedSizes[sizeIndex] = { ...updatedSizes[sizeIndex], [field]: Number(value) };
        }
      } else {
        updatedSizes[sizeIndex] = { ...updatedSizes[sizeIndex], [field]: value };
      }
      return {
        ...prev,
        [typeIndex]: updatedSizes,
      };
    });
  };

  const queryClient = useQueryClient();

  // دالة للتمرير تلقائياً للحقل الذي يحتوي على خطأ
  const scrollToFirstError = (errors: FieldErrors<ProductFormData>) => {
    // البحث عن أول حقل يحتوي على خطأ
    const findFirstErrorField = (errors: FieldErrors<ProductFormData> | Record<string, unknown>, path = ""): string | null => {
      const errorsObj = errors as Record<string, unknown>;
      for (const key in errorsObj) {
        const currentPath = path ? `${path}.${key}` : key;
        const error = errorsObj[key];

        if (error && typeof error === "object" && "message" in error && error.message) {
          return currentPath;
        }

        if (error && typeof error === "object" && !("message" in error)) {
          const nestedError = findFirstErrorField(error as Record<string, unknown>, currentPath);
          if (nestedError) return nestedError;
        }
      }
      return null;
    };

    const firstErrorPath = findFirstErrorField(errors);
    if (!firstErrorPath) return;

    // تحويل مسار الخطأ إلى selector
    const pathParts = firstErrorPath.split(".");
    let selector = "";

    if (pathParts[0] === "title_ar") {
      selector = 'input[data-field="title_ar"], input[name="title_ar"], input[id="title_ar"]';
    } else if (pathParts[0] === "title_en") {
      selector = 'input[data-field="title_en"], input[name="title_en"], input[id="title_en"]';
    } else if (pathParts[0] === "category_id") {
      selector = 'select[data-field="category_id"], select[name="category_id"], select[id="category_id"]';
    } else if (pathParts[0] === "types") {
      // للأنواع والأحجام، نبحث عن أول input في النوع/الحجم
      const typeIndex = pathParts[1] ? parseInt(pathParts[1]) : 0;
      if (pathParts[2] === "name_ar") {
        selector = `input[data-type-index="${typeIndex}"][data-field="name_ar"]`;
      } else if (pathParts[2] === "name_en") {
        selector = `input[data-type-index="${typeIndex}"][data-field="name_en"]`;
      } else if (pathParts[2] === "sizes") {
        const sizeIndex = pathParts[3] ? parseInt(pathParts[3]) : 0;
        if (pathParts[4] === "size_ar") {
          selector = `input[data-type-index="${typeIndex}"][data-size-index="${sizeIndex}"][data-field="size_ar"]`;
        } else if (pathParts[4] === "size_en") {
          selector = `input[data-type-index="${typeIndex}"][data-size-index="${sizeIndex}"][data-field="size_en"]`;
        } else if (pathParts[4] === "price") {
          selector = `input[data-type-index="${typeIndex}"][data-size-index="${sizeIndex}"][data-field="price"]`;
        }
      }
    }

    // البحث عن العنصر والتمرير إليه
    setTimeout(() => {
      let element: HTMLElement | null = null;

      if (selector) {
        element = document.querySelector(selector) as HTMLElement;
      }

      // إذا لم نجد العنصر بالـ selector، نحاول البحث بطريقة أخرى
      if (!element) {
        // البحث عن أول input/select يحتوي على خطأ
        const allInputs = document.querySelectorAll("input, select, textarea");
        for (const input of Array.from(allInputs)) {
          const inputElement = input as HTMLElement;
          // التحقق إذا كان الحقل يحتوي على خطأ (عن طريق البحث عن رسالة الخطأ القريبة)
          const errorMessage = inputElement.parentElement?.querySelector(".text-red-700");
          if (errorMessage) {
            element = inputElement;
            break;
          }
        }
      }

      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        // إضافة focus للحقل
        if (element instanceof HTMLInputElement || element instanceof HTMLSelectElement || element instanceof HTMLTextAreaElement) {
          element.focus();
        }
      }
    }, 100);
  };

  // مراقبة الأخطاء والتمرير تلقائياً
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      scrollToFirstError(errors);
    }
  }, [errors]);

  const onSubmit: SubmitHandler<ProductFormData> = async (data) => {
    // مسح جميع الأخطاء السابقة
    clearErrors();
    
    try {
      if (!id) throw new Error("No ID found");

      // التحقق من وجود أنواع
      if (types.length === 0) {
        const errorMsg = "يجب إضافة نوع واحد على الأقل للمنتج";
        // @ts-expect-error - Dynamic path not in form type, but works at runtime
        setError("types", {
          type: "manual",
          message: errorMsg,
        });
        toast.error(errorMsg);
        return;
      }

      // التحقق من وجود أحجام لكل نوع
      for (let i = 0; i < types.length; i++) {
        const typeSizes = sizesByType[i] || [];
        if (typeSizes.length === 0) {
          const errorMsg = `يجب إضافة حجم واحد على الأقل للنوع ${
            types[i].name_ar || `النوع ${i + 1}`
          }`;
          // @ts-expect-error - Dynamic path not in form type, but works at runtime
          setError(`types.${i}.sizes`, {
            type: "manual",
            message: errorMsg,
          });
          toast.error(errorMsg);
          return;
        }
        
        // التحقق من أسماء الأنواع
        if (!types[i].name_ar || types[i].name_ar.trim() === "") {
          const errorMsg = "اسم النوع بالعربية مطلوب";
          // @ts-expect-error - Dynamic path not in form type, but works at runtime
          setError(`types.${i}.name_ar`, {
            type: "manual",
            message: errorMsg,
          });
          toast.error(errorMsg);
          return;
        }
        if (!types[i].name_en || types[i].name_en.trim() === "") {
          const errorMsg = "اسم النوع بالإنجليزية مطلوب";
          // @ts-expect-error - Dynamic path not in form type, but works at runtime
          setError(`types.${i}.name_en`, {
            type: "manual",
            message: errorMsg,
          });
          toast.error(errorMsg);
          return;
        }

        // التحقق من صحة بيانات كل حجم
        for (let j = 0; j < typeSizes.length; j++) {
          const size = typeSizes[j];
          if (!size.size_ar || size.size_ar.trim() === "") {
            const errorMsg = "اسم الحجم بالعربية مطلوب";
            // @ts-expect-error - Dynamic path not in form type, but works at runtime
            setError(`types.${i}.sizes.${j}.size_ar`, {
              type: "manual",
              message: errorMsg,
            });
            toast.error(errorMsg);
            return;
          }
          if (!size.size_en || size.size_en.trim() === "") {
            const errorMsg = "اسم الحجم بالإنجليزية مطلوب";
            // @ts-expect-error - Dynamic path not in form type, but works at runtime
            setError(`types.${i}.sizes.${j}.size_en`, {
              type: "manual",
              message: errorMsg,
            });
            toast.error(errorMsg);
            return;
          }
          // التحقق من السعر - يجب أن يكون رقم صحيح وموجب
          const priceValue = Number(size.price);
          if (
            size.price === undefined ||
            size.price === null ||
            isNaN(priceValue) ||
            priceValue <= 0 ||
            size.price === 0
          ) {
            const errorMsg = "السعر مطلوب";
            // @ts-expect-error - Dynamic path not in form type, but works at runtime
            setError(`types.${i}.sizes.${j}.price`, {
              type: "manual",
              message: errorMsg,
            });
            toast.error(errorMsg);
            return;
          }
          if (
            size.offer_price !== undefined &&
            size.offer_price !== null &&
            (isNaN(Number(size.offer_price)) || Number(size.offer_price) <= 0)
          ) {
            const errorMsg = "سعر العرض يجب أن يكون رقم موجب";
            // @ts-expect-error - Dynamic path not in form type, but works at runtime
            setError(`types.${i}.sizes.${j}.offer_price`, {
              type: "manual",
              message: errorMsg,
            });
            toast.error(errorMsg);
            return;
          }
        }
      }

      setIsSubmitting(true);
      let uploadedImageUrl: string | undefined;

      if (selectedImage) {
        setIsUploadingImage(true);
        uploadedImageUrl = await uploadProductImage(selectedImage);
        setIsUploadingImage(false);
      }

      // Prepare types with sizes
      const typesWithSizes = types.map((type, typeIndex) => ({
        ...type,
        sizes: sizesByType[typeIndex] || [],
      }));

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
      router.push("/dashboard/news");
    } catch (error) {
      // مسح الأخطاء السابقة
      clearErrors();
      
      // التحقق من وجود أخطاء التحقق
      if (
        error instanceof Error &&
        "validationErrors" in error &&
        Array.isArray((error as Error & { validationErrors: unknown[] }).validationErrors)
      ) {
        const validationErrors = (error as Error & { validationErrors: Array<{
          field: string;
          message: string;
        }> }).validationErrors;

        // معالجة كل خطأ وربطه بالحقل المناسب
        const errorMessages: string[] = [];
        validationErrors.forEach((err) => {
          // تحويل مسار الحقل إلى مسار يمكن استخدامه مع setError
          const fieldPath = err.field;

          // محاولة ربط الخطأ بالحقل المناسب
          // @ts-expect-error - Dynamic path not in form type, but works at runtime
          setError(fieldPath, {
            type: "server",
            message: err.message,
          });
          
          // جمع رسائل الخطأ لعرضها في toast
          errorMessages.push(err.message);
        });

        // عرض toast بجميع رسائل الخطأ
        if (errorMessages.length > 0) {
          // إزالة الرسائل المكررة
          const uniqueMessages = [...new Set(errorMessages)];
          toast.error(uniqueMessages.join(" - "));
        } else {
          toast.error("حدث خطأ في التحقق من البيانات");
        }
      } else {
        // للأخطاء الأخرى (غير التحقق)، عرض toast
        let errorMessage = "حدث خطأ ما";
        
        if (error instanceof Error) {
          errorMessage = error.message;
          
          // تحسين رسائل الخطأ الشائعة
          if (errorMessage.includes("Product not found")) {
            errorMessage = "المنتج غير موجود";
          } else if (errorMessage.includes("timeout")) {
            errorMessage = "انتهت مهلة الطلب، يرجى المحاولة مرة أخرى";
          } else if (errorMessage.includes("Network") || errorMessage.includes("fetch")) {
            errorMessage = "خطأ في الاتصال بالخادم، يرجى التحقق من الاتصال بالإنترنت";
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
          <div className="trezo-card bg-white dark:bg-[#0c1427] mb-[25px] p-[20px] md:p-[25px] rounded-md">
            <div className="trezo-card-header mb-[20px] md:mb-[25px] flex items-center justify-between">
              <div className="trezo-card-title">
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

                {/* الخبر بالعربية */}
                <div className="sm:col-span-2">
                  <EditorProvider>
                    <Controller
                      control={control}
                      name="description_ar"
                      render={({ field }) => (
                        <div className="sm:col-span-2">
                          <label className="block font-medium mb-2">
                            وصف المنتج (بالعربي)
                          </label>
                          <EditorProvider>
                            <Editor
                              style={{ minHeight: "200px" }}
                              value={field.value}
                              onChange={field.onChange}
                            >
                              <Toolbar>
                                <BtnUndo />
                                <BtnRedo />
                                <Separator />
                                <BtnBold />
                                <BtnItalic />
                                <BtnUnderline />
                                <BtnStrikeThrough />
                                <Separator />
                                <BtnNumberedList />
                                <BtnBulletList />
                                <Separator />
                                <BtnLink />
                                <BtnClearFormatting />
                                <HtmlButton />
                                <Separator />
                                <BtnStyles />
                              </Toolbar>
                            </Editor>
                          </EditorProvider>
                        </div>
                      )}
                    />
                  </EditorProvider>
                </div>

                {/* الخبر بالانجليزية */}
                <div className="sm:col-span-2">
                  <EditorProvider>
                    <Controller
                      control={control}
                      name="description_en"
                      render={({ field }) => (
                        <div className="sm:col-span-2">
                          <label className="block font-medium mb-2">
                            وصف المنتج (بالانجليزي)
                          </label>
                          <EditorProvider>
                            <Editor
                              style={{ minHeight: "200px" }}
                              value={field.value}
                              onChange={field.onChange}
                            >
                              <Toolbar>
                                <BtnUndo />
                                <BtnRedo />
                                <Separator />
                                <BtnBold />
                                <BtnItalic />
                                <BtnUnderline />
                                <BtnStrikeThrough />
                                <Separator />
                                <BtnNumberedList />
                                <BtnBulletList />
                                <Separator />
                                <BtnLink />
                                <BtnClearFormatting />
                                <HtmlButton />
                                <Separator />
                                <BtnStyles />
                              </Toolbar>
                            </Editor>
                          </EditorProvider>
                        </div>
                      )}
                    />
                  </EditorProvider>
                </div>

                {/* الصورة */}
                <div className="sm:col-span-2 mb-[20px] sm:mb-0">
                  <label className="mb-[10px] text-black dark:text-white font-medium block">
                    صورة المنتج
                  </label>

                  <div id="fileUploader">
                    <div className="relative flex items-center justify-center overflow-hidden rounded-md py-[88px] px-[20px] border border-gray-200 dark:border-[#172036]">
                      <div className="flex items-center justify-center">
                        <div className="w-[35px] h-[35px] border border-gray-100 dark:border-[#15203c] flex items-center justify-center rounded-md text-primary-500 text-lg ltr:mr-[12px] rtl:ml-[12px]">
                          <i className="ri-upload-2-line"></i>
                        </div>
                        <p className="leading-[1.5]">
                          <strong className="text-black dark:text-white">
                            اضغط لرفع
                          </strong>
                          <br /> صورة المنتج من هنا
                        </p>
                      </div>

                      <input
                        type="file"
                        id="image"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="absolute top-0 left-0 right-0 bottom-0 rounded-md z-[1] opacity-0 cursor-pointer"
                      />
                    </div>

                    {/* Image Preview */}
                    <div className="mt-[10px] flex flex-wrap gap-2">
                      {/* صورة السيرفر */}
                      {serverImage && (
                        <div className="relative w-[50px] h-[50px]">
                          <Image
                            src={serverImage}
                            alt="server-img"
                            width={50}
                            height={50}
                            className="rounded-md object-cover w-full h-full"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "/placeholder.png";
                            }}
                          />
                          <button
                            type="button"
                            className="absolute top-[-5px] right-[-5px] bg-red-600 text-white w-[20px] h-[20px] flex items-center justify-center rounded-full text-xs"
                            onClick={() => setServerImage(null)}
                          >
                            ✕
                          </button>
                        </div>
                      )}

                      {/* صورة الرفع الجديدة */}
                      {selectedImage && (
                        <div className="relative w-[50px] h-[50px]">
                          <Image
                            src={URL.createObjectURL(selectedImage)}
                            alt="selected-img"
                            width={50}
                            height={50}
                            className="rounded-md object-cover w-full h-full"
                          />
                          <button
                            type="button"
                            className="absolute top-[-5px] right-[-5px] bg-orange-500 text-white w-[20px] h-[20px] flex items-center justify-center rounded-full text-xs"
                            onClick={() => setSelectedImage(null)}
                          >
                            ✕
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Types and Sizes Section */}
          <div className="trezo-card bg-white dark:bg-[#0c1427] mb-[25px] p-[20px] md:p-[25px] rounded-md">
            <div className="trezo-card-header mb-[20px] md:mb-[25px] flex items-center justify-between">
              <div className="trezo-card-title">
                <h5 className="!mb-0">أنواع وأحجام المنتج</h5>
              </div>
              <button
                type="button"
                onClick={addType}
                className="font-medium inline-block transition-all rounded-md md:text-md py-[8px] px-[16px] bg-primary-500 text-white hover:bg-primary-400"
              >
                <i className="material-symbols-outlined ltr:mr-2 rtl:ml-2">
                  add
                </i>
                إضافة نوع
              </button>
            </div>

            <div className="trezo-card-content">
              {types.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  لا توجد أنواع للمنتج. اضغط على &quot;إضافة نوع&quot; لإضافة
                  نوع جديد.
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

                      {/* Type Details */}
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
                          {(errors as ExtendedFieldErrors)?.types?.[typeIndex]?.name_ar?.message && (
                            <span className="text-red-700 text-sm mt-1 block">
                              {(errors as ExtendedFieldErrors)?.types?.[typeIndex]?.name_ar?.message}
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
                          {(errors as ExtendedFieldErrors)?.types?.[typeIndex]?.name_en?.message && (
                            <span className="text-red-700 text-sm mt-1 block">
                              {(errors as ExtendedFieldErrors)?.types?.[typeIndex]?.name_en?.message}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Sizes for this type */}
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
                            لا توجد أحجام لهذا النوع. اضغط على &quot;إضافة
                            حجم&quot; لإضافة حجم جديد.
                          </p>
                        ) : (
                          <div className="space-y-3">
                            {(sizesByType[typeIndex] || []).map(
                              (size, sizeIndex) => (
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
                                      onClick={() =>
                                        removeSize(typeIndex, sizeIndex)
                                      }
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
                                      {(errors as ExtendedFieldErrors)?.types?.[typeIndex]?.sizes?.[sizeIndex]?.size_ar?.message && (
                                        <span className="text-red-700 text-xs mt-1 block">
                                          {(errors as ExtendedFieldErrors)?.types?.[typeIndex]?.sizes?.[sizeIndex]?.size_ar?.message}
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
                                      {(errors as ExtendedFieldErrors)?.types?.[typeIndex]?.sizes?.[sizeIndex]?.size_en?.message && (
                                        <span className="text-red-700 text-xs mt-1 block">
                                          {(errors as ExtendedFieldErrors)?.types?.[typeIndex]?.sizes?.[sizeIndex]?.size_en?.message}
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
                                          const numValue = value === "" ? 0 : Number(value);
                                          updateSize(
                                            typeIndex,
                                            sizeIndex,
                                            "price",
                                            numValue
                                          );
                                          // التحقق الفوري من السعر
                                          if (value === "" || isNaN(numValue) || numValue <= 0) {
                                            // @ts-expect-error - Dynamic path not in form type, but works at runtime
                                            setError(`types.${typeIndex}.sizes.${sizeIndex}.price`, {
                                              type: "manual",
                                              message: "السعر مطلوب",
                                            });
                                          } else {
                                            // @ts-expect-error - Dynamic path not in form type, but works at runtime
                                            clearErrors(`types.${typeIndex}.sizes.${sizeIndex}.price`);
                                          }
                                        }}
                                        onBlur={(e) => {
                                          const value = e.target.value;
                                          const numValue = value === "" ? 0 : Number(value);
                                          // التحقق عند فقدان التركيز
                                          if (value === "" || isNaN(numValue) || numValue <= 0) {
                                            // @ts-expect-error - Dynamic path not in form type, but works at runtime
                                            setError(`types.${typeIndex}.sizes.${sizeIndex}.price`, {
                                              type: "manual",
                                              message: "السعر مطلوب",
                                            });
                                          }
                                        }}
                                        />
                                      {(errors as ExtendedFieldErrors)?.types?.[typeIndex]?.sizes?.[sizeIndex]?.price?.message && (
                                        <span className="text-red-700 text-xs mt-1 block">
                                          {(errors as ExtendedFieldErrors)?.types?.[typeIndex]?.sizes?.[sizeIndex]?.price?.message}
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
                              )
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* الأزرار */}
      <div className="trezo-card mb-[25px]">
        <div className="trezo-card-content">
          <button
            type="reset"
            className="font-medium inline-block transition-all rounded-md md:text-md ltr:mr-[15px] rtl:ml-[15px] py-[10px] md:py-[12px] px-[20px] md:px-[22px] bg-danger-500 text-white hover:bg-danger-400"
          >
            إلغاء
          </button>

          <button
            type="submit"
            disabled={isSubmitting || isUploadingImage}
            className="font-medium inline-block transition-all rounded-md md:text-md py-[10px] md:py-[12px] px-[20px] md:px-[22px] bg-primary-500 text-white hover:bg-primary-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="inline-block relative ltr:pl-[29px] rtl:pr-[29px]">
              {isUploadingImage ? (
                <>
                  <i className="material-symbols-outlined ltr:left-0 rtl:right-0 absolute top-1/2 -translate-y-1/2 animate-spin">
                    sync
                  </i>
                  جاري رفع الصورة...
                </>
              ) : isSubmitting ? (
                <>
                  <i className="material-symbols-outlined ltr:left-0 rtl:right-0 absolute top-1/2 -translate-y-1/2 animate-spin">
                    sync
                  </i>
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <i className="material-symbols-outlined ltr:left-0 rtl:right-0 absolute top-1/2 -translate-y-1/2">
                    save
                  </i>
                  حفظ التعديلات
                </>
              )}
            </span>
          </button>
        </div>
      </div>
    </form>
  );
}
