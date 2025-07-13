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
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateNews, uploadImages } from "../../../../../../services/apiNews";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { UUID } from "crypto";

import { getCurrentUser } from "../../../../../../services/apiauth";
import Image from "next/image";
import Link from "next/link";

type NewsFormValues = {
  title_ar: string;
  title_en: string;
  category_id: UUID;
  status: string;
  yt_code?: string;
  content_ar: string;
  content_en: string;
  user_id: UUID;
  images: File[];
  price?: number;
  offers?: number;

  price_medium?: number;
  price_large?: number;
  price_family?: number;
};

const CreateNewsForm: React.FC = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const [userId, setUserId] = useState<UUID | null>(null);

  //get categories
  const { data: categories } = useCategories();

  // Text Editor
  const [editorAr, setEditorAr] = useState("اكتب الخبر بالعربية...");
  const [editorEn, setEditorEn] = useState("Write the news in English...");

  const { register, handleSubmit, setValue, formState } =
    useForm<NewsFormValues>();

  const { errors } = formState;

  const [selectedCategoryName, setSelectedCategoryName] = useState("");

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    const selected = categories?.find(
      (cat) => cat.id.toString() === selectedId
    );
    setSelectedCategoryName(selected?.name_en.toLowerCase() || "");
    setValue("category_id", selectedId as UUID);
  };

  useEffect(() => {
    async function fetchUser() {
      const user = await getCurrentUser();
      if (user?.id) {
        setUserId(user.id as UUID);
        setValue("user_id", user.id as UUID);
      }
    }

    fetchUser();
  }, [setValue]);

  const { mutate, isPending } = useMutation({
    mutationFn: CreateNews,
    onSuccess: () => {
      toast.success("تم نشر المنتج بنجاح");
      queryClient.invalidateQueries({ queryKey: ["news"] });
      router.push("/dashboard/news");
    },
    onError: (error) => toast.error("حدث خطأ ما" + error.message),
  });

  // Upload images
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files);

      // التحقق من عدد الصور
      if (selectedImages.length + filesArray.length > 5) {
        toast.error("يمكنك رفع 5 صور كحد أقصى");
        return;
      }

      // التحقق من نوع وحجم الصور
      const validFiles = filesArray.filter((file) => {
        // التحقق من نوع الملف
        if (!file.type.startsWith("image/")) {
          toast.error(`الملف ${file.name} ليس صورة`);
          return false;
        }

        // التحقق من حجم الملف (50MB كحد أقصى)
        if (file.size > 50 * 1024 * 1024) {
          toast.error(`حجم الصورة ${file.name} يجب أن لا يتجاوز 50MB`);
          return false;
        }

        return true;
      });

      setSelectedImages((prevImages) => [...prevImages, ...validFiles]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setSelectedImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: NewsFormValues) => {
    if (!userId) {
      toast.error("حدث خطأ: لم يتم تحديد المستخدم");
      return;
    }

    // تحقق أن category_id موجود وصحيح
    if (!data.category_id || data.category_id.trim() === "") {
      toast.error("الرجاء اختيار التصنيف");
      return;
    }

    // تحقق من وجود صور
    if (selectedImages.length === 0) {
      toast.error("يجب إضافة صورة واحدة على الأقل");
      return;
    }

    try {
      setIsUploadingImages(true);
      // ارفع الصور أولاً
      const uploadedImageUrls = await uploadImages(selectedImages);

      const finalData = {
        ...data,
        user_id: userId,
        category_id: data.category_id, // UUID
        images: uploadedImageUrls,

        // تأكد من تحويل القيم الرقمية
        price: data.price ? Number(data.price) : undefined,
        offers: data.offers ? Number(data.offers) : undefined,

        price_medium: data.price_medium ? Number(data.price_medium) : undefined,
        price_large: data.price_large ? Number(data.price_large) : undefined,
        price_family: data.price_family ? Number(data.price_family) : undefined,
      };

      mutate(finalData);
    } catch (error: Error | unknown) {
      toast.error("حدث خطأ أثناء رفع الصور");
      console.error("Image upload error:", error);
    } finally {
      setIsUploadingImages(false);
    }
  };

  return (
    <>
      <div className="mb-[25px] md:flex items-center justify-between">
        <h5 className="!mb-0"> انشاء منتج</h5>

        <ol className="breadcrumb mt-[12px] md:mt-0 rtl:flex-row-reverse">
          <li className="breadcrumb-item inline-block relative text-sm mx-[11px] ltr:first:ml-0 rtl:first:mr-0 ltr:last:mr-0 rtl:last:ml-0">
            <Link
              href="/dashboard"
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
                      onChange={handleCategoryChange}
                    >
                      {categories?.map((category) => (
                        <option
                          key={category.id}
                          value={category.id.toString()}
                        >
                          {category.name_ar}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-[20px] sm:mb-0">
                    <label className="mb-[10px] text-black dark:text-white font-medium block">
                      الحاله
                    </label>
                    <select
                      className="h-[55px] rounded-md border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[13px] block w-full outline-0 cursor-pointer transition-all focus:border-primary-500"
                      {...register("status")}
                    >
                      <option value="">(اختياري) اختر الحالة</option>

                      <option value="trend">رائج</option>
                      <option value="offer">عرض جديد</option>
                      <option value="most_sold">الاكثر مبيعا</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2 mb-[20px] sm:mb-0">
                    <label className="mb-[10px] text-black dark:text-white font-medium block">
                      المكونات (بالعربي)
                    </label>
                    <EditorProvider>
                      <Editor
                        value={editorAr}
                        onChange={(e) => {
                          setEditorAr(e.target.value);
                          setValue("content_ar", e.target.value, {
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
                      المكونات (بالانجليزي)
                    </label>
                    <EditorProvider>
                      <Editor
                        value={editorEn}
                        onChange={(e) => {
                          setEditorEn(e.target.value);
                          setValue("content_en", e.target.value, {
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

                  <div className="mb-[20px] sm:mb-0">
                    <label className="mb-[10px] text-black dark:text-white font-medium block">
                      لاضافه مقطع من اليوتيوب
                    </label>
                    <input
                      type="text"
                      className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
                      placeholder="th0VZq9lNhR"
                      id="yt_code"
                      {...register("yt_code")}
                    />
                  </div>

                  {selectedCategoryName === "crepe" ||
                  selectedCategoryName === "crepe pizza" ? (
                    <>
                      <div className="mb-[20px]">
                        <label className="mb-[10px] block font-medium text-black dark:text-white">
                          سعر مثلث الحجم المتوسط
                        </label>
                        <input
                          type="number"
                          className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
                          {...register("price", {
                            required: "ادخل السعر المتوسط",
                          })}
                        />
                      </div>

                      <div className="mb-[20px]">
                        <label className="mb-[10px] block font-medium text-black dark:text-white">
                          سعر مثلث الحجم الكبير
                        </label>
                        <input
                          type="number"
                          className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
                          {...register("price_medium", {
                            required: "ادخل السعر الكبير",
                          })}
                        />
                      </div>

                      <div className="mb-[20px]">
                        <label className="mb-[10px] block font-medium text-black dark:text-white">
                          سعر رول الحجم المتوسط
                        </label>
                        <input
                          type="number"
                          className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
                          {...register("price_large", {
                            required: "ادخل السعر المتوسط",
                          })}
                        />
                      </div>

                      <div className="mb-[20px]">
                        <label className="mb-[10px] block font-medium text-black dark:text-white">
                          سعر رول الحجم الكبير
                        </label>
                        <input
                          type="number"
                          className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
                          {...register("price_family", {
                            required: "ادخل السعر الكبير",
                          })}
                        />
                      </div>
                    </>
                  ) : selectedCategoryName === "pizza" ? (
                    <>
                      <div className="mb-[20px]">
                        <label className="mb-[10px] block font-medium text-black dark:text-white">
                          سعر الحجم الصغير
                        </label>
                        <input
                          type="number"
                          className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
                          {...register("price", {
                            required: "ادخل السعر الصغير",
                          })}
                        />
                      </div>

                      <div className="mb-[20px]">
                        <label className="mb-[10px] block font-medium text-black dark:text-white">
                          سعر الحجم المتوسط
                        </label>
                        <input
                          type="number"
                          className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
                          {...register("price_medium", {
                            required: "ادخل السعر المتوسط",
                          })}
                        />
                      </div>
                      <div className="mb-[20px]">
                        <label className="mb-[10px] block font-medium text-black dark:text-white">
                          سعر الحجم الكبير
                        </label>
                        <input
                          type="number"
                          className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
                          {...register("price_large", {
                            required: "ادخل السعر الكبير",
                          })}
                        />
                      </div>
                    </>
                  ) : selectedCategoryName === "sandwiches" ? (
                    <>
                      <div className="mb-[20px]">
                        <label className="mb-[10px] block font-medium text-black dark:text-white">
                          سعر الحجم المتوسط
                        </label>
                        <input
                          type="number"
                          className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
                          {...register("price", {
                            required: "ادخل السعر المتوسط",
                          })}
                        />
                      </div>
                      <div className="mb-[20px]">
                        <label className="mb-[10px] block font-medium text-black dark:text-white">
                          سعر الحجم الكبير
                        </label>
                        <input
                          type="number"
                          className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
                          {...register("price_large", {
                            required: "ادخل السعر الكبير",
                          })}
                        />
                      </div>
                    </>
                  ) : (
                    <div className="mb-[20px]">
                      <label className="mb-[10px] block font-medium text-black dark:text-white">
                        السعر
                      </label>
                      <input
                        type="number"
                        className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
                        {...register("price", { required: "ادخل السعر" })}
                      />
                    </div>
                  )}

                  <div className="mb-[20px] sm:mb-0">
                    <label className="mb-[10px] text-black dark:text-white font-medium block">
                      العروض
                    </label>
                    <input
                      type="number"
                      className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
                      placeholder="أدخل الخصم (اختياري)"
                      id="offers"
                      {...register("offers")}
                    />
                  </div>

                  <div className="sm:col-span-2 mb-[20px] sm:mb-0">
                    <label className="mb-[10px] text-black dark:text-white font-medium block">
                      الصور الخاصة بالمنتج
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
                            <br /> الصور من هنا
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            الحد الأقصى: 5 صور
                            <br />
                            حجم الصورة: حتى 50 ميجابايت
                          </p>
                        </div>

                        <input
                          type="file"
                          id="images"
                          multiple
                          accept="image/*"
                          className="absolute top-0 left-0 right-0 bottom-0 rounded-md z-[1] opacity-0 cursor-pointer"
                          onChange={handleFileChange}
                        />
                        {errors?.images?.message && (
                          <span className="text-red-700 text-sm">
                            {errors.images.message}
                          </span>
                        )}
                      </div>

                      {/* Image Previews */}
                      <div className="mt-[10px] flex flex-wrap gap-2">
                        {selectedImages.map((image, index) => (
                          <div
                            key={index}
                            className="relative w-[50px] h-[50px]"
                          >
                            <Image
                              src={URL.createObjectURL(image)}
                              alt="product-preview"
                              width={50}
                              height={50}
                              className="rounded-md"
                            />
                            <button
                              type="button"
                              className="absolute top-[-5px] right-[-5px] bg-orange-500 text-white w-[20px] h-[20px] flex items-center justify-center rounded-full text-xs rtl:right-auto rtl:left-[-5px]"
                              onClick={() => handleRemoveImage(index)}
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
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
              disabled={isPending || isUploadingImages}
              className="font-medium inline-block transition-all rounded-md md:text-md py-[10px] md:py-[12px] px-[20px] md:px-[22px] bg-primary-500 text-white hover:bg-primary-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="inline-block relative ltr:pl-[29px] rtl:pr-[29px]">
                {isUploadingImages ? (
                  <>
                    <i className="material-symbols-outlined ltr:left-0 rtl:right-0 absolute top-1/2 -translate-y-1/2 animate-spin">
                      sync
                    </i>
                    جاري رفع الصور...
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
                    انشاء خبر
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

export default CreateNewsForm;
