"use client";

interface BranchDeleteDialogProps {
  branchName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function BranchDeleteDialog({
  branchName,
  onConfirm,
  onCancel,
}: BranchDeleteDialogProps) {
  return (
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
            &ldquo;{branchName}&rdquo;
          </span>
          ؟
          <br />
          <span className="text-red-600 dark:text-red-400 text-sm">
            هذا الإجراء لا يمكن التراجع عنه.
          </span>
        </p>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
          >
            إلغاء
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition-all flex items-center gap-2"
          >
            <i className="material-symbols-outlined text-sm">delete</i>
            حذف الفرع
          </button>
        </div>
      </div>
    </div>
  );
}
