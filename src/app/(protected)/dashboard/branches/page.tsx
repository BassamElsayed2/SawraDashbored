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
import { getImageUrl as getImageUrlFromLib } from "@/lib/image-url";
import type { Branch, BranchFormData } from "@/components/branches/types";
import { BranchEditModal } from "@/components/branches/BranchEditModal";
import { BranchQRModal } from "@/components/branches/BranchQRModal";
import { BranchDeleteDialog } from "@/components/branches/BranchDeleteDialog";

const getImageUrl = (branch: Branch): string =>
  getImageUrlFromLib(branch.image_url || branch.image);

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
  } = useForm<BranchFormData>();

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

  const onEditSubmit = async (data: BranchFormData) => {
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

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    reset();
    setSelectedImage(null);
    setPreviewImage(null);
    setSelectedBranch(null);
  };

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

        {isEditModalOpen && selectedBranch && (
          <BranchEditModal
            branch={selectedBranch}
            previewImage={previewImage}
            loading={loading}
            register={register}
            errors={errors}
            setValue={setValue}
            onSubmit={handleSubmit(onEditSubmit)}
            onFileChange={handleFileChange}
            onClearImage={() => {
              setSelectedImage(null);
              setPreviewImage(null);
            }}
            onClose={closeEditModal}
          />
        )}

        {isQRModalOpen && selectedQRCode && (
          <BranchQRModal
            qrCode={selectedQRCode}
            onClose={() => {
              setIsQRModalOpen(false);
              setSelectedQRCode(null);
            }}
            onDownload={handleDownloadQRCode}
          />
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

        {deleteConfirm && (
          <BranchDeleteDialog
            branchName={deleteConfirm.branchName}
            onConfirm={confirmDelete}
            onCancel={cancelDelete}
          />
        )}
      </div>
    </div>
  );
};

export default BranchesList;
