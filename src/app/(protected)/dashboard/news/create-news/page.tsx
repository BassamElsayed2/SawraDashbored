"use client";

import { useEffect, useState } from "react";

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
import { useCategories } from "@/components/news/categories/useCategories";
import { useForm, FieldErrors, Path } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createProduct,
  uploadProductImage,
  ProductWithTypes,
  ProductType,
  ProductSize,
} from "@/services/apiProducts";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { UUID } from "crypto";

import { checkAuth } from "@/services/apiAuth";
import Image from "next/image";
import Link from "next/link";
import {
  compressImage,
  needsCompression,
  formatFileSize,
} from "../../../../../lib/image-compression";
import { BranchSelector } from "@/components/BranchSelector";
import { updateProductBranches } from "@/services/apiBranchProducts";

type ProductFormValues = {
  title_ar: string;
  title_en: string;
  category_id: UUID;
  description_ar: string;
  description_en: string;
  user_id: UUID;
  image: File | null;
  types: ProductType[];
};

// Extended errors type to include dynamic nested paths for types and sizes
type ExtendedFieldErrors = FieldErrors<ProductFormValues> & {
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
    useForm<ProductFormValues>({
      defaultValues: {
        types: [],
      },
    });

  const { errors } = formState;

  // دالة للتمرير تلقائياً للحقل الذي يحتوي على خطأ
  const scrollToFirstError = (errors: FieldErrors<ProductFormValues>) => {
    // البحث عن أول حقل يحتوي على خطأ
    const findFirstErrorField = (errors: FieldErrors<ProductFormValues> | Record<string, unknown>, path = ""): string | null => {
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
      router.push("/dashboard/news");
    },
    onError: (error) => {
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
          // مثال: types.0.sizes.1.price -> types.0.sizes.1.price
          const fieldPath = err.field as Path<ProductFormValues>;

          // محاولة ربط الخطأ بالحقل المناسب
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
          if (errorMessage.includes("timeout")) {
            errorMessage = "انتهت مهلة الطلب، يرجى المحاولة مرة أخرى";
          } else if (errorMessage.includes("Network") || errorMessage.includes("fetch")) {
            errorMessage = "خطأ في الاتصال بالخادم، يرجى التحقق من الاتصال بالإنترنت";
          } else if (errorMessage.includes("تعذر رفع صورة المنتج")) {
            errorMessage = "فشل رفع صورة المنتج، يرجى المحاولة مرة أخرى";
          }
        }
        
        toast.error(errorMessage);
      }
    },
  });

  // Upload image
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);

  // Selected branches
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);

  const handleFileChange = async (
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
        setIsCompressing(true);

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
          setValue("image", compressionResult.compressedFile);
        } else {
          // الصورة لا تحتاج ضغط
          setSelectedImage(file);
          setValue("image", file);
        }
      } catch {
        toast.error("حدث خطأ أثناء ضغط الصورة، سيتم استخدام الصورة الأصلية");
        setSelectedImage(file);
        setValue("image", file);
      } finally {
        setIsCompressing(false);
      }
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setValue("image", null);
  };

  // Types and Sizes management
  const [types, setTypes] = useState<ProductType[]>([]);

  const addType = () => {
    const newType: ProductType = {
      name_ar: "",
      name_en: "",
    };
    setTypes([...types, newType]);
  };

  const removeType = (index: number) => {
    setTypes(types.filter((_, i) => i !== index));
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

  // Sizes management for each type
  const [sizesByType, setSizesByType] = useState<{
    [key: number]: ProductSize[];
  }>({});

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

    // تحقق من وجود أنواع
    if (types.length === 0) {
      const errorMsg = "يجب إضافة نوع واحد على الأقل للمنتج";
      setError("types" as Path<ProductFormValues>, {
        type: "manual",
        message: errorMsg,
      });
      toast.error(errorMsg);
      return;
    }

    // تحقق من وجود أحجام لكل نوع
    for (let i = 0; i < types.length; i++) {
      const typeSizes = sizesByType[i] || [];
      if (typeSizes.length === 0) {
        const errorMsg = `يجب إضافة حجم واحد على الأقل للنوع ${
          types[i].name_ar || `النوع ${i + 1}`
        }`;
        setError(`types.${i}.sizes` as Path<ProductFormValues>, {
          type: "manual",
          message: errorMsg,
        });
        toast.error(errorMsg);
        return;
      }
      
      // التحقق من أسماء الأنواع
      if (!types[i].name_ar || types[i].name_ar.trim() === "") {
        const errorMsg = "اسم النوع بالعربية مطلوب";
        setError(`types.${i}.name_ar` as Path<ProductFormValues>, {
          type: "manual",
          message: errorMsg,
        });
        toast.error(errorMsg);
        return;
      }
      if (!types[i].name_en || types[i].name_en.trim() === "") {
        const errorMsg = "اسم النوع بالإنجليزية مطلوب";
        setError(`types.${i}.name_en` as Path<ProductFormValues>, {
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
          setError(`types.${i}.sizes.${j}.size_ar` as Path<ProductFormValues>, {
            type: "manual",
            message: errorMsg,
          });
          toast.error(errorMsg);
          return;
        }
        if (!size.size_en || size.size_en.trim() === "") {
          const errorMsg = "اسم الحجم بالإنجليزية مطلوب";
          setError(`types.${i}.sizes.${j}.size_en` as Path<ProductFormValues>, {
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
          setError(`types.${i}.sizes.${j}.price` as Path<ProductFormValues>, {
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
          setError(`types.${i}.sizes.${j}.offer_price` as Path<ProductFormValues>, {
            type: "manual",
            message: errorMsg,
          });
          toast.error(errorMsg);
          return;
        }
      }
    }

    try {
      setIsUploadingImage(true);

      // ارفع الصورة أولاً
      const uploadedImageUrl = await uploadProductImage(selectedImage);

      // تحضير البيانات مع الأحجام
      // إزالة الحقول غير المطلوبة عند الإنشاء (product_id, type_id, id)
      const typesWithSizes = types.map((type, typeIndex) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, product_id, ...typeData } = type;
        const cleanSizes = (sizesByType[typeIndex] || []).map((size) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id: sizeId, type_id, ...sizeData } = size;
          return sizeData;
        });

        return {
          ...typeData,
          sizes: cleanSizes,
        };
      });

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
            <div className="trezo-card bg-white dark:bg-[#0c1427] mb-[25px] p-[20px] md:p-[25px] rounded-md">
              <div className="trezo-card-header mb-[20px] md:mb-[25px] flex items-center justify-between">
                <div className="trezo-card-title">
                  <h5 className="!mb-0">أضف منتج</h5>
                </div>
              </div>

              <div className="trezo-card-content">
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

                  <div className="sm:col-span-2 mb-[20px] sm:mb-0">
                    <label className="mb-[10px] text-black dark:text-white font-medium block">
                      وصف المنتج (بالعربي)
                    </label>
                    <EditorProvider>
                      <Editor
                        value={editorAr}
                        onChange={(e) => {
                          setEditorAr(e.target.value);
                          setValue("description_ar", e.target.value, {
                            shouldDirty: true,
                            shouldValidate: true,
                          });
                        }}
                        style={{ minHeight: "200px" }}
                        className="rsw-editor"
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

                  <div className="sm:col-span-2 mb-[20px] sm:mb-0">
                    <label className="mb-[10px] text-black dark:text-white font-medium block">
                      وصف المنتج (بالانجليزي)
                    </label>
                    <EditorProvider>
                      <Editor
                        value={editorEn}
                        onChange={(e) => {
                          setEditorEn(e.target.value);
                          setValue("description_en", e.target.value, {
                            shouldDirty: true,
                            shouldValidate: true,
                          });
                        }}
                        style={{ minHeight: "200px" }}
                        className="rsw-editor"
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

                  <div className="sm:col-span-2 mb-[20px] sm:mb-0">
                    <label className="mb-[10px] text-black dark:text-white font-medium block">
                      صورة المنتج
                    </label>

                    <div id="fileUploader">
                      <div className="relative flex items-center justify-center overflow-hidden rounded-md py-[88px] px-[20px] border border-gray-200 dark:border-[#172036]">
                        <div className="flex flex-col items-center justify-center text-center">
                          <div className="w-[35px] h-[35px] border border-gray-100 dark:border-[#15203c] flex items-center justify-center rounded-md text-primary-500 text-lg mb-3">
                            <i className="ri-upload-2-line"></i>
                          </div>
                          <p className="leading-[1.5] mb-2">
                            <strong className="text-black dark:text-white">
                              اضغط لرفع
                            </strong>
                            <br /> صورة المنتج من هنا
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            حجم الصورة: حتى 50 ميجابايت (سيتم ضغطها تلقائياً إلى
                            600KB)
                          </p>
                        </div>

                        <input
                          type="file"
                          id="image"
                          accept="image/*"
                          className="absolute top-0 left-0 right-0 bottom-0 rounded-md z-[1] opacity-0 cursor-pointer"
                          onChange={handleFileChange}
                        />
                        {errors?.image?.message && (
                          <span className="text-red-700 text-sm">
                            {errors.image.message}
                          </span>
                        )}
                      </div>

                      {/* Image Preview */}
                      {selectedImage && (
                        <div className="mt-[10px] flex items-center gap-2">
                          <div className="relative w-[50px] h-[50px]">
                            <Image
                              src={URL.createObjectURL(selectedImage)}
                              alt="product-preview"
                              width={50}
                              height={50}
                              className="rounded-md object-cover w-full h-full"
                            />
                            <button
                              type="button"
                              className="absolute top-[-5px] right-[-5px] bg-orange-500 text-white w-[20px] h-[20px] flex items-center justify-center rounded-full text-xs rtl:right-auto rtl:left-[-5px]"
                              onClick={handleRemoveImage}
                            >
                              ✕
                            </button>
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {selectedImage.name}
                          </span>
                        </div>
                      )}
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
                                              setError(`types.${typeIndex}.sizes.${sizeIndex}.price` as Path<ProductFormValues>, {
                                                type: "manual",
                                                message: "السعر مطلوب",
                                              });
                                            } else {
                                              clearErrors(`types.${typeIndex}.sizes.${sizeIndex}.price` as Path<ProductFormValues>);
                                            }
                                          }}
                                          onBlur={(e) => {
                                            const value = e.target.value;
                                            const numValue = value === "" ? 0 : Number(value);
                                            // التحقق عند فقدان التركيز
                                            if (value === "" || isNaN(numValue) || numValue <= 0) {
                                              setError(`types.${typeIndex}.sizes.${sizeIndex}.price` as Path<ProductFormValues>, {
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

        <div className="trezo-card mb-[25px]">
          <div className="trezo-card-content">
            <button
              type="reset"
              className="font-medium inline-block transition-all rounded-md md:text-md ltr:mr-[15px] rtl:ml-[15px] py-[10px] md:py-[12px] px-[20px] md:px-[22px] bg-danger-500 text-white hover:bg-danger-400"
            >
              ألغاء
            </button>

            <button
              type="submit"
              disabled={isPending || isUploadingImage || isCompressing}
              className="font-medium inline-block transition-all rounded-md md:text-md py-[10px] md:py-[12px] px-[20px] md:px-[22px] bg-primary-500 text-white hover:bg-primary-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="inline-block relative ltr:pl-[29px] rtl:pr-[29px]">
                {isCompressing ? (
                  <>
                    <i className="material-symbols-outlined ltr:left-0 rtl:right-0 absolute top-1/2 -translate-y-1/2 animate-spin">
                      sync
                    </i>
                    جاري ضغط الصورة...
                  </>
                ) : isUploadingImage ? (
                  <>
                    <i className="material-symbols-outlined ltr:left-0 rtl:right-0 absolute top-1/2 -translate-y-1/2 animate-spin">
                      sync
                    </i>
                    جاري رفع الصورة...
                  </>
                ) : isPending ? (
                  <>
                    <i className="material-symbols-outlined ltr:left-0 rtl:right-0 absolute top-1/2 -translate-y-1/2 animate-spin">
                      sync
                    </i>
                    جاري الإنشاء...
                  </>
                ) : (
                  <>
                    <i className="material-symbols-outlined ltr:left-0 rtl:right-0 absolute top-1/2 -translate-y-1/2">
                      add
                    </i>
                    انشاء منتج
                  </>
                )}
              </span>
            </button>
          </div>
        </div>
      </form>
    </>
  );
};

export default CreateProductForm;
