"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  getBranches,
  updateBranch,
  deleteBranch,
  generateQRCode,
  getQRCode,
  BranchQRCode,
} from "@/services/apiBranchQR";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import dynamic from "next/dynamic";

// Load GoogleMapPicker dynamically to avoid SSR issues
const GoogleMapPicker = dynamic(
  () => import("../../../../components/GoogleMapPicker"),
  { ssr: false }
);

import { getImageUrl as getImageUrlFromLib } from "@/lib/image-url";

const getImageUrl = (branch: Branch): string =>
  getImageUrlFromLib(branch.image_url || branch.image);

export interface Branch {
  id: string;
  name_ar: string;
  name_en: string;
  area_ar: string;
  area_en: string;
  address_ar: string;
  address_en: string;
  works_hours: string;
  phone: string;
  email?: string;
  google_map: string;
  image?: string; // Legacy field
  image_url?: string; // Current field
  lat?: number;
  lng?: number;
  is_active?: boolean;
  created_at: string;
}

type FormData = {
  name_ar: string;
  name_en: string;
  address_ar: string;
  address_en: string;
  phone: string;
  email?: string;
  google_map?: string;
  lat?: number;
  lng?: number;
};

const BranchesList: React.FC = () => {
  const [branchesList, setBranchesList] = useState<Branch[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [qrCodes, setQrCodes] = useState<{ [key: string]: BranchQRCode }>({});
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [selectedQRCode, setSelectedQRCode] = useState<BranchQRCode | null>(
    null
  );
  const [generatingQR, setGeneratingQR] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    show: boolean;
    branchId: string;
    branchName: string;
  } | null>(null);
  const branchesPerPage = 8;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<FormData>();

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const data = await getBranches();
        setBranchesList(data as Branch[]);
        // Fetch QR codes for all branches
        await fetchQRCodes(data as Branch[]);
      } catch {
        toast.error("فشل في جلب الفروع");
      }
    };

    fetchBranches();
  }, []);

  const fetchQRCodes = async (branches: Branch[]) => {
    try {
      const qrCodesMap: { [key: string]: BranchQRCode } = {};

      // Fetch QR codes for each branch
      for (const branch of branches) {
        const qrCode = await getQRCode(branch.id);
        if (qrCode) {
          qrCodesMap[branch.id] = qrCode;
        }
        // If qrCode is null, it means it doesn't exist yet - this is normal
      }

      setQrCodes(qrCodesMap);
    } catch {
      // Error fetching QR codes
    }
  };

  const handleGenerateQRCode = async (branchId: string) => {
    setGeneratingQR(branchId);

    try {
      toast.loading("جاري إنشاء رمز QR...", { id: "generate-qr" });
      const qrCode = await generateQRCode(branchId);

      // Update qrCodes state
      setQrCodes((prev) => ({
        ...prev,
        [branchId]: qrCode,
      }));

      toast.success("تم إنشاء رمز QR بنجاح", { id: "generate-qr" });
    } catch {
      toast.error("فشل في إنشاء رمز QR", { id: "generate-qr" });
    } finally {
      setGeneratingQR(null);
    }
  };

  const handleViewQRCode = (qrCode: BranchQRCode) => {
    setSelectedQRCode(qrCode);
    setIsQRModalOpen(true);
  };

  const handleDownloadQRCode = async (qrCode: BranchQRCode) => {
    try {
      const link = document.createElement("a");
      link.href = qrCode.qr_code_url;
      link.download = `qr-code-branch-${qrCode.branch_id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("تم تحميل رمز QR بنجاح");
    } catch {
      toast.error("فشل في تحميل رمز QR");
    }
  };

  const handleDeleteClick = (id: string, branchName: string) => {
    setDeleteConfirm({ show: true, branchId: id, branchName });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    const { branchId, branchName } = deleteConfirm;
    setDeleteConfirm(null);

    try {
      toast.loading("جاري حذف الفرع...", { id: "delete-branch" });
      await deleteBranch(branchId);
      setBranchesList((prev) =>
        prev.filter((branch) => branch.id !== branchId)
      );
      toast.success(`تم حذف الفرع "${branchName}" بنجاح`, {
        id: "delete-branch",
      });
    } catch {
      toast.error("فشل في حذف الفرع", { id: "delete-branch" });
    }
  };

  const cancelDelete = () => {
    if (deleteConfirm) {
      toast("تم إلغاء الحذف", { icon: "ℹ️" });
    }
    setDeleteConfirm(null);
  };

  const handleEditClick = (branch: Branch) => {
    setSelectedBranch(branch);
    setValue("name_ar", branch.name_ar);
    setValue("name_en", branch.name_en);
    setValue("address_ar", branch.address_ar);
    setValue("address_en", branch.address_en);
    setValue("phone", branch.phone);
    setValue("email", branch.email || "");
    setValue("google_map", branch.google_map || "");
    setValue("lat", branch.lat || 0);
    setValue("lng", branch.lng || 0);
    setPreviewImage(getImageUrl(branch));
    setIsEditModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const onEditSubmit = async (data: FormData) => {
    if (!selectedBranch) return;
    setLoading(true);

    try {
      let imageUrl: string | undefined = undefined;

      // Upload image if a new one is selected
      if (selectedImage) {
        try {
          toast("جاري رفع الصورة...", { icon: "📤" });
          const { uploadBranchImage } = await import("@/services/apiUpload");
          const uploadResponse = await uploadBranchImage(selectedImage);
          imageUrl = uploadResponse.imageUrl;
          toast.success("تم رفع الصورة بنجاح");
        } catch {
          toast.error("فشل في رفع الصورة، سيتم التحديث بدون تغيير الصورة");
          // Continue without changing image
        }
      }

      const updatedData = {
        ...data,
        ...(imageUrl && { image_url: imageUrl }), // Only update image if new one was uploaded
      };

      await updateBranch(selectedBranch.id, updatedData);

      // Refresh the list
      const branches = await getBranches();
      setBranchesList(branches as Branch[]);

      toast.success("تم تحديث الفرع بنجاح");
      setIsEditModalOpen(false);
      reset();
      setSelectedImage(null);
      setPreviewImage(null);
      setSelectedBranch(null);
    } catch {
      toast.error("حدث خطأ أثناء التحديث");
    } finally {
      setLoading(false);
    }
  };

  // ✅ البحث والفلترة
  const filteredBranches = branchesList.filter((branch) => {
    const matchesSearch =
      branch.name_ar.toLowerCase().includes(searchQuery.toLowerCase()) ||
      branch.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      branch.area_ar.toLowerCase().includes(searchQuery.toLowerCase()) ||
      branch.area_en.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const totalPages = Math.ceil(filteredBranches.length / branchesPerPage);
  const paginatedBranches = filteredBranches.slice(
    (currentPage - 1) * branchesPerPage,
    currentPage * branchesPerPage
  );

  return (
    <div className="trezo-card bg-white dark:bg-[#0c1427] mb-[25px] p-[20px] md:p-[25px] rounded-md">
      <div className="trezo-tabs branches-tabs">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-[20px] md:mb-[25px] gap-4">
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <input
                type="text"
                placeholder="ابحث عن فرع..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-[#15203c] dark:text-white"
              />
              <i className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                search
              </i>
            </div>
          </div>
          <Link
            href="/dashboard/branches/create-branch"
            className="inline-block transition-all rounded-md font-medium px-[13px] py-[6px] text-primary-500 border border-primary-500 hover:bg-primary-500 hover:text-white"
          >
            <span className="relative pl-6">
              <i className="material-symbols-outlined absolute left-0 top-1/2 -translate-y-1/2">
                add
              </i>
              أضف فرع جديد
            </span>
          </Link>
        </div>

        <div className="table-responsive overflow-x-auto">
          <table className="w-full">
            <thead className="text-black dark:text-white text-end">
              <tr>
                {[
                  "اسم الفرع",
                  "المنطقة",
                  "الصوره",
                  "رقم الهاتف",
                  "التاريخ",
                  "أجرأت",
                ].map((head, i) => (
                  <th
                    key={i}
                    className="font-medium ltr:text-left rtl:text-right px-[20px] py-[11px] bg-gray-50 dark:bg-[#15203c]"
                  >
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedBranches.map((branch) => (
                <tr
                  key={branch.id}
                  className="border-t border-gray-100 dark:border-gray-800"
                >
                  <td className="py-3 px-3 font-semibold">
                    <div>
                      <div className="font-bold">{branch.name_ar}</div>
                      <div className="text-sm text-gray-500">
                        {branch.name_en}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <div>
                      <div className="font-medium">{branch.area_ar}</div>
                      <div className="text-sm text-gray-500">
                        {branch.area_en}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    {branch.image_url || branch.image ? (
                      <Image
                        src={getImageUrl(branch)}
                        alt={branch.name_ar}
                        width={60}
                        height={40}
                        className="rounded"
                      />
                    ) : (
                      <div className="w-[60px] h-[40px] bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center text-gray-400 text-xs">
                        لا توجد صورة
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-3">{branch.phone || "غير محدد"}</td>
                  <td className="py-3 px-3">
                    {new Date(branch.created_at).toLocaleDateString("ar-EG")}
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditClick(branch)}
                        className="text-primary-500 leading-none"
                      >
                        <i className="material-symbols-outlined !text-md">
                          edit
                        </i>
                      </button>
                      <button
                        onClick={() =>
                          handleDeleteClick(branch.id, branch.name_ar)
                        }
                        className="text-danger-500 leading-none"
                      >
                        <i className="material-symbols-outlined !text-md">
                          delete
                        </i>
                      </button>
                      {qrCodes[branch.id] ? (
                        <>
                          <button
                            onClick={() => handleViewQRCode(qrCodes[branch.id])}
                            className="text-blue-500 leading-none"
                            title="عرض رمز QR"
                          >
                            <i className="material-symbols-outlined !text-md">
                              qr_code
                            </i>
                          </button>
                          <button
                            onClick={() =>
                              handleDownloadQRCode(qrCodes[branch.id])
                            }
                            className="text-green-500 leading-none"
                            title="تحميل رمز QR"
                          >
                            <i className="material-symbols-outlined !text-md">
                              download
                            </i>
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleGenerateQRCode(branch.id)}
                          disabled={generatingQR === branch.id}
                          className="text-blue-500 leading-none disabled:opacity-50"
                          title="إنشاء رمز QR"
                        >
                          <i className="material-symbols-outlined !text-md">
                            {generatingQR === branch.id
                              ? "hourglass_empty"
                              : "qr_code_2"}
                          </i>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedBranches.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-5 text-center text-gray-400">
                    لا توجد فروع.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Edit Modal */}
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-[#0c1427] p-6 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-black dark:text-white">
                  تعديل الفرع
                </h3>
                <button
                  onClick={() => {
                    setIsEditModalOpen(false);
                    reset();
                    setSelectedImage(null);
                    setPreviewImage(null);
                    setSelectedBranch(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <i className="material-symbols-outlined">close</i>
                </button>
              </div>

              <form onSubmit={handleSubmit(onEditSubmit)}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block font-medium text-black dark:text-white">
                      اسم الفرع (ar)
                    </label>
                    <input
                      {...register("name_ar", {
                        required: true,
                        minLength: {
                          value: 3,
                          message: "الاسم يجب أن يكون 3 أحرف على الأقل",
                        },
                      })}
                      className="h-[45px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-4 block w-full outline-0 transition-all"
                    />
                    {errors.name_ar && (
                      <p className="text-red-500 mt-1">
                        {errors.name_ar.message || "مطلوب"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block font-medium text-black dark:text-white">
                      اسم الفرع (en)
                    </label>
                    <input
                      {...register("name_en", {
                        required: true,
                        minLength: {
                          value: 3,
                          message: "الاسم يجب أن يكون 3 أحرف على الأقل",
                        },
                      })}
                      className="h-[45px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-4 block w-full outline-0 transition-all"
                    />
                    {errors.name_en && (
                      <p className="text-red-500 mt-1">
                        {errors.name_en.message || "مطلوب"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block font-medium text-black dark:text-white">
                      العنوان (ar)
                    </label>
                    <input
                      {...register("address_ar", {
                        required: true,
                        minLength: {
                          value: 3,
                          message: "العنوان يجب أن يكون 3 أحرف على الأقل",
                        },
                      })}
                      className="h-[45px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-4 block w-full outline-0 transition-all"
                    />
                    {errors.address_ar && (
                      <p className="text-red-500 mt-1">
                        {errors.address_ar.message || "مطلوب"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block font-medium text-black dark:text-white">
                      العنوان (en)
                    </label>
                    <input
                      {...register("address_en", {
                        required: true,
                        minLength: {
                          value: 3,
                          message: "العنوان يجب أن يكون 3 أحرف على الأقل",
                        },
                      })}
                      className="h-[45px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-4 block w-full outline-0 transition-all"
                    />
                    {errors.address_en && (
                      <p className="text-red-500 mt-1">
                        {errors.address_en.message || "مطلوب"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block font-medium text-black dark:text-white">
                      رقم الهاتف
                    </label>
                    <input
                      {...register("phone", {
                        required: true,
                        minLength: {
                          value: 3,
                          message: "رقم الهاتف يجب أن يكون 3 أحرف على الأقل",
                        },
                      })}
                      className="h-[45px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-4 block w-full outline-0 transition-all"
                    />
                    {errors.phone && (
                      <p className="text-red-500 mt-1">
                        {errors.phone.message || "مطلوب"}
                      </p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-2 block font-medium text-black dark:text-white">
                      اختر موقع الفرع على الخريطة
                    </label>
                    <GoogleMapPicker
                      onLocationSelect={(lat, lng) => {
                        setValue("lat", lat);
                        setValue("lng", lng);
                        toast.success(
                          `تم تحديد الموقع: ${lat.toFixed(4)}, ${lng.toFixed(
                            4
                          )}`
                        );
                      }}
                      initialLat={selectedBranch?.lat || 24.7136}
                      initialLng={selectedBranch?.lng || 46.6753}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block font-medium text-black dark:text-white">
                      خط العرض - Latitude (يمكن التعديل)
                    </label>
                    <input
                      type="number"
                      step="any"
                      {...register("lat", { valueAsNumber: true })}
                      placeholder="24.7136"
                      className="h-[45px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-4 block w-full outline-0 transition-all focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                    />
                    {errors.lat && (
                      <p className="text-red-500 mt-1">{errors.lat.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block font-medium text-black dark:text-white">
                      خط الطول - Longitude (يمكن التعديل)
                    </label>
                    <input
                      type="number"
                      step="any"
                      {...register("lng", { valueAsNumber: true })}
                      placeholder="46.6753"
                      className="h-[45px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-4 block w-full outline-0 transition-all focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                    />
                    {errors.lng && (
                      <p className="text-red-500 mt-1">{errors.lng.message}</p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-2 block font-medium text-black dark:text-white">
                      الموقع الجغرافي (google map) - اختياري
                    </label>
                    <input
                      {...register("google_map")}
                      placeholder="رابط خريطة جوجل"
                      className="h-[45px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-4 block w-full outline-0 transition-all"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-2 block font-medium text-black dark:text-white">
                      الصورة
                    </label>
                    <div className="relative flex items-center justify-center overflow-hidden rounded-md py-8 px-4 border border-gray-200 dark:border-[#172036]">
                      <div className="flex items-center justify-center">
                        <div className="w-8 h-8 border border-gray-100 dark:border-[#15203c] flex items-center justify-center rounded-md text-primary-500 text-lg ltr:mr-3 rtl:ml-3">
                          <i className="ri-upload-2-line"></i>
                        </div>
                        <p className="text-black dark:text-white">
                          <strong>اضغط لرفع الصورة</strong>
                          <br /> JPG, PNG, WEBP (الحد الأقصى 50 ميجابايت)
                        </p>
                      </div>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={handleFileChange}
                      />
                    </div>

                    {previewImage && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        <div className="relative w-[50px] h-[50px]">
                          <Image
                            src={previewImage}
                            alt="preview"
                            width={50}
                            height={50}
                            className="rounded-md"
                          />
                          <button
                            type="button"
                            className="absolute top-[-5px] right-[-5px] bg-orange-500 text-white w-[20px] h-[20px] flex items-center justify-center rounded-full text-xs"
                            onClick={() => {
                              setSelectedImage(null);
                              setPreviewImage(null);
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditModalOpen(false);
                      reset();
                      setSelectedImage(null);
                      setPreviewImage(null);
                      setSelectedBranch(null);
                    }}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 disabled:opacity-50"
                  >
                    {loading ? "جارٍ الحفظ..." : "حفظ التغييرات"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* QR Code Modal */}
        {isQRModalOpen && selectedQRCode && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-[#0c1427] p-6 rounded-lg w-full max-w-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-black dark:text-white">
                  رمز QR للفرع
                </h3>
                <button
                  onClick={() => {
                    setIsQRModalOpen(false);
                    setSelectedQRCode(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <i className="material-symbols-outlined">close</i>
                </button>
              </div>

              <div className="text-center">
                <div className="mb-4">
                  <Image
                    src={selectedQRCode.qr_code_url}
                    alt="QR Code"
                    width={200}
                    height={200}
                    className="mx-auto border border-gray-200 rounded-lg"
                    style={{ maxWidth: "200px", maxHeight: "200px" }}
                  />
                </div>

                <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                  <p className="mb-2">
                    رمز QR يؤدي إلى صفحة الاستطلاع الخاصة بهذا الفرع
                  </p>

                  {/* Survey Link */}
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md mb-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      رابط الاستطلاع:
                    </p>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={
                          selectedQRCode.survey_url ||
                          `https://cp.elsawra.net/feedback-survey/${selectedQRCode.branch_id}`
                        }
                        readOnly
                        className="flex-1 text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-gray-700 dark:text-gray-300"
                      />
                      <button
                        onClick={() => {
                          const url =
                            selectedQRCode.survey_url ||
                            `https://cp.elsawra.net/feedback-survey/${selectedQRCode.branch_id}`;
                          navigator.clipboard.writeText(url);
                          toast.success("تم نسخ الرابط");
                        }}
                        className="text-blue-500 hover:text-blue-600"
                        title="نسخ الرابط"
                      >
                        <i className="material-symbols-outlined !text-sm">
                          content_copy
                        </i>
                      </button>
                    </div>
                  </div>

                  <p className="text-xs">
                    تاريخ الإنشاء:{" "}
                    {selectedQRCode.created_at
                      ? new Date(selectedQRCode.created_at).toLocaleDateString(
                          "ar-EG"
                        )
                      : "غير محدد"}
                  </p>
                </div>

                <div className="flex gap-2 justify-center">
                  <button
                    onClick={() => handleDownloadQRCode(selectedQRCode)}
                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                  >
                    <i className="material-symbols-outlined !text-sm ml-1">
                      download
                    </i>
                    تحميل
                  </button>
                  <button
                    onClick={() => {
                      setIsQRModalOpen(false);
                      setSelectedQRCode(null);
                    }}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    إغلاق
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-4">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 rounded-md mx-1 text-sm ${
                  currentPage === i + 1
                    ? "bg-primary-500 text-white"
                    : "bg-gray-200"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-[#0c1427] p-6 rounded-lg max-w-md w-full mx-4">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mr-4">
                  <i className="material-symbols-outlined text-red-600 dark:text-red-400 text-2xl">
                    warning
                  </i>
                </div>
                <h3 className="text-xl font-semibold text-black dark:text-white">
                  تأكيد الحذف
                </h3>
              </div>

              <p className="text-gray-600 dark:text-gray-300 mb-6">
                هل أنت متأكد من حذف الفرع{" "}
                <span className="font-bold text-black dark:text-white">
                  &ldquo;{deleteConfirm.branchName}&rdquo;
                </span>
                ؟
                <br />
                <span className="text-red-600 dark:text-red-400 text-sm">
                  هذا الإجراء لا يمكن التراجع عنه.
                </span>
              </p>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={cancelDelete}
                  className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                >
                  إلغاء
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition-all flex items-center gap-2"
                >
                  <i className="material-symbols-outlined text-sm">delete</i>
                  حذف الفرع
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BranchesList;
