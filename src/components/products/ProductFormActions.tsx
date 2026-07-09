"use client";

interface ProductFormActionsProps {
  submitLabel: string;
  pendingLabel: string;
  isPending: boolean;
  isUploadingImage?: boolean;
  isCompressing?: boolean;
  showCancel?: boolean;
}

export function ProductFormActions({
  submitLabel,
  pendingLabel,
  isPending,
  isUploadingImage = false,
  isCompressing = false,
  showCancel = true,
}: ProductFormActionsProps) {
  const disabled = isPending || isUploadingImage || isCompressing;

  return (
    <div className="app-card mb-[25px]">
      <div className="app-card-content">
        {showCancel && (
          <button
            type="reset"
            className="font-medium inline-block transition-all rounded-md md:text-md ltr:mr-[15px] rtl:ml-[15px] py-[10px] md:py-[12px] px-[20px] md:px-[22px] bg-danger-500 text-white hover:bg-danger-400"
          >
            ألغاء
          </button>
        )}

        <button
          type="submit"
          disabled={disabled}
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
                {pendingLabel}
              </>
            ) : (
              <>
                <i className="material-symbols-outlined ltr:left-0 rtl:right-0 absolute top-1/2 -translate-y-1/2">
                  {submitLabel.includes("تعديل") ? "save" : "add"}
                </i>
                {submitLabel}
              </>
            )}
          </span>
        </button>
      </div>
    </div>
  );
}
