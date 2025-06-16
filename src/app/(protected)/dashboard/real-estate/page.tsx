"use client";

import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Menu, Dialog } from "@headlessui/react";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
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

interface Property {
  id: number;
  name_ar: string;
  name_en: string;
  city_ar: string;
  city_en: string;
  status: string;
  price: string;
  type: string;
  bedrooms: number;
  bathrooms: number;
  area: string;
  address_ar: string;
  address_en: string;
  description_ar: string;
  description_en: string;
  images: string[];
  created_at: string;
}

interface PropertyFormData {
  nameAr: string;
  nameEn: string;
  cityAr: string;
  cityEn: string;
  status: string;
  price: string;
  type: string;
  bedrooms: string;
  bathrooms: string;
  area: string;
  addressAr: string;
  addressEn: string;
  descriptionAr: string;
  descriptionEn: string;
}

const PropertyListContent = () => {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<number | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [descriptionAr, setDescriptionAr] = useState<string>("");
  const [descriptionEn, setDescriptionEn] = useState<string>("");
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const itemsPerPage = 6;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PropertyFormData>({
    defaultValues: {
      status: "for_rent",
      type: "apartment",
    },
  });

  const fetchProperties = async ({ pageParam = 1 }) => {
    try {
      let query = supabase.from("properties").select("*", { count: "exact" });

      if (searchQuery) {
        query = query.or(
          `name_ar.ilike.%${searchQuery}%,name_en.ilike.%${searchQuery}%,address_ar.ilike.%${searchQuery}%,address_en.ilike.%${searchQuery}%`
        );
      }

      const startRange = (pageParam - 1) * itemsPerPage;
      const endRange = startRange + itemsPerPage - 1;

      const { data, error, count } = await query
        .order("created_at", { ascending: false })
        .range(startRange, endRange);

      if (error) throw error;

      if (count) {
        setTotalPages(Math.ceil(count / itemsPerPage));
      }

      return (data || []) as Property[];
    } catch (error) {
      console.error("Error fetching properties:", error);
      throw error;
    }
  };

  const {
    data: properties = [],
    isLoading,
    error: queryError,
  } = useQuery<Property[], Error>({
    queryKey: ["properties", currentPage, searchQuery],
    queryFn: () => fetchProperties({ pageParam: currentPage }),
  });

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleDeleteClick = (id: number) => {
    setPropertyToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteProperty = async () => {
    if (!propertyToDelete) return;

    try {
      // First get the property to access its images
      const { data: property, error: fetchError } = await supabase
        .from("properties")
        .select("images")
        .eq("id", propertyToDelete)
        .single();

      if (fetchError) throw fetchError;

      // Delete images from storage
      if (property?.images && property.images.length > 0) {
        for (const imageUrl of property.images) {
          const imagePath = imageUrl.split("/").pop(); // Get the filename from URL
          if (imagePath) {
            const { error: deleteError } = await supabase.storage
              .from("property-images")
              .remove([imagePath]);

            if (deleteError) {
              console.error("Error deleting image:", deleteError);
            }
          }
        }
      }

      // Delete the property record
      const { error } = await supabase
        .from("properties")
        .delete()
        .eq("id", propertyToDelete);

      if (error) throw error;

      toast.success("تم حذف العقار بنجاح", {
        duration: 4000,
        position: "top-center",
        style: {
          background: "#10B981",
          color: "#fff",
          direction: "rtl",
        },
      });

      setIsDeleteModalOpen(false);
      setPropertyToDelete(null);
      router.refresh();
    } catch (error) {
      console.error("Error deleting property:", error);
      toast.error("حدث خطأ أثناء حذف العقار", {
        duration: 4000,
        position: "top-center",
        style: {
          background: "#EF4444",
          color: "#fff",
          direction: "rtl",
        },
      });
    }
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files);
      setSelectedImages((prevImages) => [...prevImages, ...filesArray]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setSelectedImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const uploadImages = async (files: File[]) => {
    const uploadedUrls: string[] = [];

    for (const file of files) {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("property-images")
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("property-images").getPublicUrl(filePath);

      uploadedUrls.push(publicUrl);
    }

    return uploadedUrls;
  };

  const handleEditClick = (property: Property) => {
    setSelectedProperty(property);
    setDescriptionAr(property.description_ar);
    setDescriptionEn(property.description_en);
    reset({
      nameAr: property.name_ar,
      nameEn: property.name_en,
      cityAr: property.city_ar,
      cityEn: property.city_en,
      status: property.status,
      price: property.price,
      type: property.type,
      bedrooms: property.bedrooms.toString(),
      bathrooms: property.bathrooms.toString(),
      area: property.area,
      addressAr: property.address_ar,
      addressEn: property.address_en,
    });
    setIsEditModalOpen(true);
  };

  const onSubmit = async (data: PropertyFormData) => {
    if (!selectedProperty) return;

    setIsSubmitting(true);

    try {
      // Get the old images that will be removed
      const oldImages = selectedProperty.images;
      const newImageUrls = [...oldImages];

      // Upload new images if any
      if (selectedImages.length > 0) {
        const uploadedUrls = await uploadImages(selectedImages);
        newImageUrls.push(...uploadedUrls);
      }

      // Delete removed images from storage
      const removedImages = oldImages.filter(
        (oldImage) => !newImageUrls.includes(oldImage)
      );

      for (const imageUrl of removedImages) {
        const imagePath = imageUrl.split("/").pop(); // Get the filename from URL
        if (imagePath) {
          const { error: deleteError } = await supabase.storage
            .from("property-images")
            .remove([imagePath]);

          if (deleteError) {
            console.error("Error deleting image:", deleteError);
          }
        }
      }

      // Update property
      const { error: updateError } = await supabase
        .from("properties")
        .update({
          name_ar: data.nameAr,
          name_en: data.nameEn,
          city_ar: data.cityAr,
          city_en: data.cityEn,
          status: data.status,
          price: data.price,
          type: data.type,
          bedrooms: parseInt(data.bedrooms),
          bathrooms: parseInt(data.bathrooms),
          area: data.area,
          address_ar: data.addressAr,
          address_en: data.addressEn,
          description_ar: descriptionAr,
          description_en: descriptionEn,
          images: newImageUrls,
        })
        .eq("id", selectedProperty.id);

      if (updateError) throw updateError;

      toast.success("تم تحديث العقار بنجاح", {
        duration: 4000,
        position: "top-center",
        style: {
          background: "#10B981",
          color: "#fff",
          padding: "16px",
          borderRadius: "8px",
        },
      });

      setIsEditModalOpen(false);
      router.refresh();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "حدث خطأ أثناء تحديث العقار";

      toast.error(errorMessage, {
        duration: 4000,
        position: "top-center",
        style: {
          background: "#EF4444",
          color: "#fff",
          padding: "16px",
          borderRadius: "8px",
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (queryError) {
    return (
      <div className="text-center text-red-500 p-4">
        حدث خطأ أثناء تحميل البيانات
      </div>
    );
  }

  return (
    <>
      <div className="trezo-card bg-white dark:bg-[#0c1427] mb-[25px] p-[20px] md:p-[25px] rounded-md">
        <div className="trezo-card-header sm:flex items-center justify-between">
          <div className="trezo-card-title">
            <form className="relative sm:w-[265px]">
              <label className="leading-none absolute ltr:left-[13px] rtl:right-[13px] text-black dark:text-white mt-px top-1/2 -translate-y-1/2">
                <i className="material-symbols-outlined !text-[20px]">search</i>
              </label>
              <input
                type="text"
                placeholder="ابحث عن عقار..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="bg-gray-50 border border-gray-50 h-[36px] text-xs rounded-md w-full block text-black pt-[11px] pb-[12px] ltr:pl-[38px] rtl:pr-[38px] ltr:pr-[13px] ltr:md:pr-[16px] rtl:pl-[13px] rtl:md:pl-[16px] placeholder:text-gray-500 outline-0 dark:bg-[#15203c] dark:text-white dark:border-[#15203c] dark:placeholder:text-gray-400"
              />
            </form>
          </div>

          <div className="trezo-card-subtitle mt-[15px] sm:mt-0">
            <Link
              href="/dashboard/real-estate/create-estate"
              className="inline-block transition-all rounded-md font-medium px-[13px] py-[6px] text-primary-500 border border-primary-500 hover:bg-primary-500 hover:text-white"
            >
              <span className="inline-block relative ltr:pl-[22px] rtl:pr-[22px]">
                <i className="material-symbols-outlined !text-[22px] absolute ltr:-left-[4px] rtl:-right-[4px] top-1/2 -translate-y-1/2">
                  add
                </i>
                إضافة عقار
              </span>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[25px] mb-[25px]">
        {isLoading ? (
          <div className="col-span-full text-center p-4">جاري التحميل...</div>
        ) : properties.length === 0 ? (
          <div className="col-span-full text-center p-4 text-gray-500 dark:text-gray-400">
            لا توجد عقارات متاحة
          </div>
        ) : (
          properties.map((property) => (
            <div
              key={property.id}
              className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md"
            >
              <div className="trezo-card-header mb-[20px] flex items-center justify-between">
                <div className="trezo-card-title">
                  <h5 className="!mb-0">{property.city_ar}</h5>
                </div>

                <div className="trezo-card-subtitle">
                  <Menu as="div" className="trezo-card-dropdown relative">
                    <Menu.Button className="trezo-card-dropdown-btn inline-block transition-all text-[26px] text-gray-500 dark:text-gray-400 leading-none hover:text-primary-500">
                      <span className="inline-block relative ltr:pr-[17px] ltr:md:pr-[20px] rtl:pl-[17px] rtl:ml:pr-[20px]">
                        <i className="ri-more-fill"></i>
                      </span>
                    </Menu.Button>

                    <Menu.Items className="transition-all bg-white shadow-3xl rounded-md top-full py-[15px] absolute ltr:right-0 rtl:left-0 w-[195px] z-[50] dark:bg-dark dark:shadow-none">
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={() => handleEditClick(property)}
                            className={`block w-full transition-all text-black cursor-pointer ltr:text-left rtl:text-right relative py-[8px] px-[20px] hover:bg-gray-50 dark:text-white dark:hover:bg-black ${
                              active ? "bg-gray-50 dark:bg-black" : ""
                            }`}
                          >
                            تعديل
                          </button>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={() => handleDeleteClick(property.id)}
                            className={`block w-full transition-all text-black cursor-pointer ltr:text-left rtl:text-right relative py-[8px] px-[20px] hover:bg-gray-50 dark:text-white dark:hover:bg-black ${
                              active ? "bg-gray-50 dark:bg-black" : ""
                            }`}
                          >
                            حذف
                          </button>
                        )}
                      </Menu.Item>
                    </Menu.Items>
                  </Menu>
                </div>
              </div>

              <div className="trezo-card-content">
                <div className="relative h-[200px] rounded-[5px] overflow-hidden mb-[20px]">
                  <Image
                    src={
                      property.images[0] || "/images/properties/property1.jpg"
                    }
                    alt={property.name_ar}
                    fill
                    quality={100}
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                  />
                </div>

                <div className="flex items-center justify-between mb-[9px]">
                  <h3 className="!text-lg !mb-0 !text-orange-500">
                    {property.price} ج.م
                  </h3>
                  <span
                    className={`inline-block rounded-[4px] text-xs py-px px-[9px] ${
                      property.status === "sale"
                        ? "bg-success-100 text-success-600"
                        : property.status === "rent"
                        ? "bg-secondary-100 text-secondary-600"
                        : "bg-orange-100 text-orange-600"
                    }`}
                  >
                    {property.status === "for_sale"
                      ? "للبيع"
                      : property.status === "for_rent"
                      ? "للإيجار"
                      : property.status === "sold"
                      ? "تم البيع"
                      : "معروض"}
                  </span>
                </div>

                <span className="block relative pt-px ltr:pl-[22px] rtl:pr-[22px]">
                  <i className="material-symbols-outlined text-primary-500 absolute ltr:-left-[2px] rtl:-right-[2px] top-1/2 -translate-y-1/2 !text-[19px]">
                    location_on
                  </i>
                  {property.address_ar}
                </span>

                <ul className="mt-[17px] py-[10px] border-y border-primary-50 dark:border-[#172036]">
                  <li className="inline-block relative ltr:pl-[24px] rtl:pr-[24px] ltr:mr-[20px] rtl:ml-[20px] ltr:last:mr-0 rtl:last:ml-0">
                    <i className="material-symbols-outlined absolute ltr:left-0 rtl:right-0 top-1/2 -translate-y-1/2 text-primary-500 !text-[18px]">
                      bed
                    </i>
                    {property.bedrooms} غرف نوم
                  </li>
                  <li className="inline-block relative ltr:pl-[24px] rtl:pr-[24px] ltr:mr-[20px] rtl:ml-[20px] ltr:last:mr-0 rtl:last:ml-0">
                    <i className="material-symbols-outlined absolute ltr:left-0 rtl:right-0 top-1/2 -translate-y-1/2 text-primary-500 !text-[18px]">
                      bathtub
                    </i>
                    {property.bathrooms} حمام
                  </li>
                  <li className="inline-block relative ltr:pl-[24px] rtl:pr-[24px] ltr:mr-[20px] rtl:ml-[20px] ltr:last:mr-0 rtl:last:ml-0">
                    <i className="material-symbols-outlined absolute ltr:left-0 rtl:right-0 top-1/2 -translate-y-1/2 text-primary-500 !text-[18px]">
                      square_foot
                    </i>
                    {property.area}
                  </li>
                </ul>
              </div>
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="trezo-card bg-white dark:bg-[#0c1427] mb-[25px] p-[20px] md:p-[25px] rounded-md">
          <div className="trezo-card-content">
            <div className="sm:flex sm:items-center justify-between">
              <p className="!mb-0">
                عرض {properties.length} من {totalPages * itemsPerPage} نتيجة
              </p>

              <ol className="mt-[10px] sm:mt-0">
                <li className="inline-block mx-[2px] ltr:first:ml-0 ltr:last:mr-0 rtl:first:mr-0 rtl:last:ml-0">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="w-[31px] h-[31px] block leading-[29px] relative text-center rounded-md border border-gray-100 dark:border-[#172036] transition-all hover:bg-primary-500 hover:text-white hover:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="opacity-0">0</span>
                    <i className="material-symbols-outlined left-0 right-0 absolute top-1/2 -translate-y-1/2">
                      chevron_right
                    </i>
                  </button>
                </li>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <li
                      key={page}
                      className="inline-block mx-[2px] ltr:first:ml-0 ltr:last:mr-0 rtl:first:mr-0 rtl:last:ml-0"
                    >
                      <button
                        onClick={() => handlePageChange(page)}
                        className={`w-[31px] h-[31px] block leading-[29px] relative text-center rounded-md border border-gray-100 dark:border-[#172036] transition-all hover:bg-primary-500 hover:text-white hover:border-primary-500 ${
                          currentPage === page
                            ? "bg-primary-500 text-white border-primary-500"
                            : ""
                        }`}
                      >
                        {page}
                      </button>
                    </li>
                  )
                )}

                <li className="inline-block mx-[2px] ltr:first:ml-0 ltr:last:mr-0 rtl:first:mr-0 rtl:last:ml-0">
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="w-[31px] h-[31px] block leading-[29px] relative text-center rounded-md border border-gray-100 dark:border-[#172036] transition-all hover:bg-primary-500 hover:text-white hover:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="opacity-0">0</span>
                    <i className="material-symbols-outlined left-0 right-0 absolute top-1/2 -translate-y-1/2">
                      chevron_left
                    </i>
                  </button>
                </li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      <Dialog
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        className="relative z-[9999]"
      >
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          aria-hidden="true"
        />
        <div className="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto">
          <Dialog.Panel className="mx-auto max-w-4xl w-full bg-white dark:bg-[#0c1427] rounded-lg p-6 shadow-2xl transform transition-all">
            <div className="flex items-center justify-between mb-6">
              <Dialog.Title className="text-xl font-semibold text-black dark:text-white">
                تعديل العقار
              </Dialog.Title>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                <i className="ri-close-line text-2xl"></i>
              </button>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="max-h-[calc(100vh-200px)] overflow-y-auto pr-2"
            >
              <div className="sm:grid sm:grid-cols-2 sm:gap-[25px]">
                <div className="mb-[20px] sm:mb-0">
                  <label className="mb-[10px] text-black dark:text-white font-medium block">
                    اسم العقار بالعربية
                  </label>
                  <input
                    type="text"
                    {...register("nameAr", { required: "هذا الحقل مطلوب" })}
                    className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
                    placeholder="اسم العقار بالعربية"
                  />
                  {errors.nameAr && (
                    <span className="text-red-500 text-sm mt-1">
                      {errors.nameAr.message}
                    </span>
                  )}
                </div>

                <div className="mb-[20px] sm:mb-0">
                  <label className="mb-[10px] text-black dark:text-white font-medium block">
                    اسم العقار بالإنجليزية
                  </label>
                  <input
                    type="text"
                    {...register("nameEn", { required: "هذا الحقل مطلوب" })}
                    className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
                    placeholder="اسم العقار بالإنجليزية"
                  />
                  {errors.nameEn && (
                    <span className="text-red-500 text-sm mt-1">
                      {errors.nameEn.message}
                    </span>
                  )}
                </div>

                <div className="mb-[20px] sm:mb-0">
                  <label className="mb-[10px] text-black dark:text-white font-medium block">
                    المدينة بالعربية
                  </label>
                  <input
                    type="text"
                    {...register("cityAr", { required: "هذا الحقل مطلوب" })}
                    className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
                    placeholder="المدينة بالعربية"
                  />
                  {errors.cityAr && (
                    <span className="text-red-500 text-sm mt-1">
                      {errors.cityAr.message}
                    </span>
                  )}
                </div>

                <div className="mb-[20px] sm:mb-0">
                  <label className="mb-[10px] text-black dark:text-white font-medium block">
                    المدينة بالإنجليزية
                  </label>
                  <input
                    type="text"
                    {...register("cityEn", { required: "هذا الحقل مطلوب" })}
                    className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
                    placeholder="المدينة بالإنجليزية"
                  />
                  {errors.cityEn && (
                    <span className="text-red-500 text-sm mt-1">
                      {errors.cityEn.message}
                    </span>
                  )}
                </div>

                <div className="mb-[20px] sm:mb-0">
                  <label className="mb-[10px] text-black dark:text-white font-medium block">
                    الحالة
                  </label>
                  <select
                    {...register("status", { required: "هذا الحقل مطلوب" })}
                    className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
                  >
                    <option value="for_rent">للإيجار</option>
                    <option value="for_sale">للبيع</option>
                    <option value="sold">تم البيع</option>
                  </select>
                  {errors.status && (
                    <span className="text-red-500 text-sm mt-1">
                      {errors.status.message}
                    </span>
                  )}
                </div>

                <div className="mb-[20px] sm:mb-0">
                  <label className="mb-[10px] text-black dark:text-white font-medium block">
                    السعر
                  </label>
                  <input
                    type="text"
                    {...register("price", { required: "هذا الحقل مطلوب" })}
                    className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
                    placeholder="السعر"
                  />
                  {errors.price && (
                    <span className="text-red-500 text-sm mt-1">
                      {errors.price.message}
                    </span>
                  )}
                </div>

                <div className="mb-[20px] sm:mb-0">
                  <label className="mb-[10px] text-black dark:text-white font-medium block">
                    النوع
                  </label>
                  <select
                    {...register("type", { required: "هذا الحقل مطلوب" })}
                    className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
                  >
                    <option value="apartment">شقة</option>
                    <option value="villa">فيلا</option>
                    <option value="house">منزل</option>
                  </select>
                  {errors.type && (
                    <span className="text-red-500 text-sm mt-1">
                      {errors.type.message}
                    </span>
                  )}
                </div>

                <div className="mb-[20px] sm:mb-0">
                  <label className="mb-[10px] text-black dark:text-white font-medium block">
                    عدد الغرف
                  </label>
                  <input
                    type="text"
                    {...register("bedrooms", { required: "هذا الحقل مطلوب" })}
                    className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
                    placeholder="عدد الغرف"
                  />
                  {errors.bedrooms && (
                    <span className="text-red-500 text-sm mt-1">
                      {errors.bedrooms.message}
                    </span>
                  )}
                </div>

                <div className="mb-[20px] sm:mb-0">
                  <label className="mb-[10px] text-black dark:text-white font-medium block">
                    عدد الحمام
                  </label>
                  <input
                    type="text"
                    {...register("bathrooms", { required: "هذا الحقل مطلوب" })}
                    className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
                    placeholder="عدد الحمام"
                  />
                  {errors.bathrooms && (
                    <span className="text-red-500 text-sm mt-1">
                      {errors.bathrooms.message}
                    </span>
                  )}
                </div>

                <div className="mb-[20px] sm:mb-0">
                  <label className="mb-[10px] text-black dark:text-white font-medium block">
                    المساحة
                  </label>
                  <input
                    type="text"
                    {...register("area", { required: "هذا الحقل مطلوب" })}
                    className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
                    placeholder="المساحة"
                  />
                  {errors.area && (
                    <span className="text-red-500 text-sm mt-1">
                      {errors.area.message}
                    </span>
                  )}
                </div>

                <div className="mb-[20px] sm:mb-0">
                  <label className="mb-[10px] text-black dark:text-white font-medium block">
                    العنوان بالعربية
                  </label>
                  <input
                    type="text"
                    {...register("addressAr", { required: "هذا الحقل مطلوب" })}
                    className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
                    placeholder="العنوان بالعربية"
                  />
                  {errors.addressAr && (
                    <span className="text-red-500 text-sm mt-1">
                      {errors.addressAr.message}
                    </span>
                  )}
                </div>

                <div className="mb-[20px] sm:mb-0">
                  <label className="mb-[10px] text-black dark:text-white font-medium block">
                    العنوان بالإنجليزية
                  </label>
                  <input
                    type="text"
                    {...register("addressEn", { required: "هذا الحقل مطلوب" })}
                    className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
                    placeholder="العنوان بالإنجليزية"
                  />
                  {errors.addressEn && (
                    <span className="text-red-500 text-sm mt-1">
                      {errors.addressEn.message}
                    </span>
                  )}
                </div>

                <div className="sm:col-span-2 mb-[20px] sm:mb-0">
                  <label className="mb-[10px] text-black dark:text-white font-medium block">
                    الوصف بالعربية
                  </label>
                  <EditorProvider>
                    <Editor
                      value={descriptionAr}
                      onChange={(e) => setDescriptionAr(e.target.value)}
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
                    الوصف بالانجليزية
                  </label>
                  <EditorProvider>
                    <Editor
                      value={descriptionEn}
                      onChange={(e) => setDescriptionEn(e.target.value)}
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
                    صور العقار
                  </label>
                  <div id="fileUploader">
                    <div className="relative flex items-center justify-center overflow-hidden rounded-md py-[88px] px-[20px] border border-gray-200 dark:border-[#172036]">
                      <div className="flex items-center justify-center">
                        <div className="w-[35px] h-[35px] border border-gray-100 dark:border-[#15203c] flex items-center justify-center rounded-md text-primary-500 text-lg ltr:mr-[12px] rtl:ml-[12px]">
                          <i className="ri-upload-2-line"></i>
                        </div>
                        <p className="leading-[1.5]">
                          <strong className="text-black dark:text-white">
                            انقر للرفع
                          </strong>
                          <br /> هنا
                        </p>
                      </div>
                      <input
                        type="file"
                        id="fileInput"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="absolute top-0 left-0 right-0 bottom-0 rounded-md z-[1] opacity-0 cursor-pointer"
                        multiple
                      />
                    </div>

                    {/* Image Previews */}
                    <div className="mt-[10px] flex flex-wrap gap-2">
                      {/* Show existing images */}
                      {selectedProperty?.images.map((image, index) => (
                        <div
                          key={`existing-${index}`}
                          className="relative w-[50px] h-[50px]"
                        >
                          <Image
                            src={image}
                            alt="property-preview"
                            width={50}
                            height={50}
                            className="rounded-md object-cover"
                          />
                        </div>
                      ))}
                      {/* Show newly selected images */}
                      {selectedImages.map((image, index) => (
                        <div
                          key={`new-${index}`}
                          className="relative w-[50px] h-[50px]"
                        >
                          <Image
                            src={URL.createObjectURL(image)}
                            alt="property-preview"
                            width={50}
                            height={50}
                            className="rounded-md object-cover"
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

                <div className="sm:col-span-2 mt-[20px] flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="font-medium inline-block transition-all rounded-md md:text-md py-[10px] md:py-[12px] px-[20px] md:px-[22px] bg-danger-500 text-white hover:bg-danger-400"
                  >
                    إلغاء
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="font-medium inline-block transition-all rounded-md md:text-md py-[10px] md:py-[12px] px-[20px] md:px-[22px] bg-primary-500 text-white hover:bg-primary-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "جاري التحديث..." : "تحديث العقار"}
                  </button>
                </div>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        className="relative z-[9999]"
      >
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          aria-hidden="true"
        />
        <div className="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto">
          <Dialog.Panel className="mx-auto max-w-md w-full bg-white dark:bg-[#0c1427] rounded-lg p-6 shadow-2xl transform transition-all">
            <div className="flex items-center justify-between mb-6">
              <Dialog.Title className="text-xl font-semibold text-black dark:text-white">
                تأكيد الحذف
              </Dialog.Title>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                <i className="ri-close-line text-2xl"></i>
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-600 dark:text-gray-300">
                هل أنت متأكد من حذف هذا العقار؟ لا يمكن التراجع عن هذا الإجراء.
              </p>
            </div>

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="font-medium inline-block transition-all rounded-md md:text-md py-[10px] md:py-[12px] px-[20px] md:px-[22px] bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-[#15203c] dark:text-gray-300 dark:hover:bg-[#1a2942]"
              >
                إلغاء
              </button>

              <button
                type="button"
                onClick={handleDeleteProperty}
                className="font-medium inline-block transition-all rounded-md md:text-md py-[10px] md:py-[12px] px-[20px] md:px-[22px] bg-danger-500 text-white hover:bg-danger-400"
              >
                حذف
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
};

export default PropertyListContent;
