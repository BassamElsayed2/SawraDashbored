"use client";

import Image from "next/image";
import toast from "react-hot-toast";
import type { BranchQRCode } from "@/services/apiBranchQR";

interface BranchQRModalProps {
  qrCode: BranchQRCode;
  onClose: () => void;
  onDownload: (qrCode: BranchQRCode) => void;
}

export function BranchQRModal({
  qrCode,
  onClose,
  onDownload,
}: BranchQRModalProps) {
  const surveyUrl =
    qrCode.survey_url ||
    `https://cp.elsawra.net/feedback-survey/${qrCode.branch_id}`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-[#0c1427] p-6 rounded-lg w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-black dark:text-white">
            رمز QR للفرع
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <i className="material-symbols-outlined">close</i>
          </button>
        </div>

        <div className="text-center">
          <div className="mb-4">
            <Image
              src={qrCode.qr_code_url}
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

            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md mb-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                رابط الاستطلاع:
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={surveyUrl}
                  readOnly
                  className="flex-1 text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-gray-700 dark:text-gray-300"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(surveyUrl);
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
              {qrCode.created_at
                ? new Date(qrCode.created_at).toLocaleDateString("ar-EG")
                : "غير محدد"}
            </p>
          </div>

          <div className="flex gap-2 justify-center">
            <button
              onClick={() => onDownload(qrCode)}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              <i className="material-symbols-outlined !text-sm ml-1">
                download
              </i>
              تحميل
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
