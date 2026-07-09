import type { FieldErrors, Path, UseFormClearErrors, UseFormSetError } from "react-hook-form";
import toast from "react-hot-toast";
import type { ProductSize, ProductType } from "@/services/apiProducts";

function findFirstErrorField(
  errors: Record<string, unknown>,
  path = ""
): string | null {
  for (const key in errors) {
    const currentPath = path ? `${path}.${key}` : key;
    const error = errors[key];

    if (
      error &&
      typeof error === "object" &&
      "message" in error &&
      error.message
    ) {
      return currentPath;
    }

    if (error && typeof error === "object" && !("message" in error)) {
      const nestedError = findFirstErrorField(
        error as Record<string, unknown>,
        currentPath
      );
      if (nestedError) return nestedError;
    }
  }
  return null;
}

function errorPathToSelector(path: string): string {
  const pathParts = path.split(".");

  if (pathParts[0] === "title_ar") {
    return 'input[data-field="title_ar"], input[name="title_ar"], input[id="title_ar"]';
  }
  if (pathParts[0] === "title_en") {
    return 'input[data-field="title_en"], input[name="title_en"], input[id="title_en"]';
  }
  if (pathParts[0] === "category_id") {
    return 'select[data-field="category_id"], select[name="category_id"], select[id="category_id"]';
  }
  if (pathParts[0] === "types") {
    const typeIndex = pathParts[1] ? parseInt(pathParts[1], 10) : 0;
    if (pathParts[2] === "name_ar") {
      return `input[data-type-index="${typeIndex}"][data-field="name_ar"]`;
    }
    if (pathParts[2] === "name_en") {
      return `input[data-type-index="${typeIndex}"][data-field="name_en"]`;
    }
    if (pathParts[2] === "sizes") {
      const sizeIndex = pathParts[3] ? parseInt(pathParts[3], 10) : 0;
      if (pathParts[4] === "size_ar") {
        return `input[data-type-index="${typeIndex}"][data-size-index="${sizeIndex}"][data-field="size_ar"]`;
      }
      if (pathParts[4] === "size_en") {
        return `input[data-type-index="${typeIndex}"][data-size-index="${sizeIndex}"][data-field="size_en"]`;
      }
      if (pathParts[4] === "price") {
        return `input[data-type-index="${typeIndex}"][data-size-index="${sizeIndex}"][data-field="price"]`;
      }
    }
  }

  return "";
}

/** Scroll to the first form field with a validation error */
export function scrollToFirstProductFormError<T extends Record<string, unknown>>(
  errors: FieldErrors<T>
): void {
  const firstErrorPath = findFirstErrorField(errors as Record<string, unknown>);
  if (!firstErrorPath) return;

  const selector = errorPathToSelector(firstErrorPath);

  setTimeout(() => {
    let element: HTMLElement | null = selector
      ? (document.querySelector(selector) as HTMLElement)
      : null;

    if (!element) {
      const allInputs = document.querySelectorAll("input, select, textarea");
      for (const input of Array.from(allInputs)) {
        const inputElement = input as HTMLElement;
        const errorMessage =
          inputElement.parentElement?.querySelector(".text-red-700");
        if (errorMessage) {
          element = inputElement;
          break;
        }
      }
    }

    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      if (
        element instanceof HTMLInputElement ||
        element instanceof HTMLSelectElement ||
        element instanceof HTMLTextAreaElement
      ) {
        element.focus();
      }
    }
  }, 100);
}

interface ValidationErrorItem {
  field: string;
  message: string;
}

/** Map API validation errors onto react-hook-form fields */
export function applyProductValidationErrors<T extends Record<string, unknown>>(
  error: unknown,
  setError: UseFormSetError<T>,
  clearErrors: UseFormClearErrors<T>
): boolean {
  if (
    !(error instanceof Error) ||
    !("validationErrors" in error) ||
    !Array.isArray(
      (error as Error & { validationErrors: unknown[] }).validationErrors
    )
  ) {
    return false;
  }

  clearErrors();

  const validationErrors = (
    error as Error & { validationErrors: ValidationErrorItem[] }
  ).validationErrors;

  const errorMessages: string[] = [];
  validationErrors.forEach((err) => {
    setError(err.field as Path<T>, {
      type: "server",
      message: err.message,
    });
    errorMessages.push(err.message);
  });

  const uniqueMessages = [...new Set(errorMessages)];
  toast.error(
    uniqueMessages.length > 0
      ? uniqueMessages.join(" - ")
      : "حدث خطأ في التحقق من البيانات"
  );

  return true;
}

export type ProductExtendedFieldErrors = {
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

type SetProductFormError = (
  field: string,
  error: { type: string; message: string }
) => void;

/** Client-side validation for types/sizes before submit */
export function validateProductTypesAndSizes(
  types: ProductType[],
  sizesByType: Record<number, ProductSize[]>,
  setError: SetProductFormError
): boolean {
  if (types.length === 0) {
    const errorMsg = "يجب إضافة نوع واحد على الأقل للمنتج";
    setError("types", { type: "manual", message: errorMsg });
    toast.error(errorMsg);
    return false;
  }

  for (let i = 0; i < types.length; i++) {
    const typeSizes = sizesByType[i] || [];
    if (typeSizes.length === 0) {
      const errorMsg = `يجب إضافة حجم واحد على الأقل للنوع ${
        types[i].name_ar || `النوع ${i + 1}`
      }`;
      setError(`types.${i}.sizes`, { type: "manual", message: errorMsg });
      toast.error(errorMsg);
      return false;
    }

    if (!types[i].name_ar?.trim()) {
      const errorMsg = "اسم النوع بالعربية مطلوب";
      setError(`types.${i}.name_ar`, { type: "manual", message: errorMsg });
      toast.error(errorMsg);
      return false;
    }
    if (!types[i].name_en?.trim()) {
      const errorMsg = "اسم النوع بالإنجليزية مطلوب";
      setError(`types.${i}.name_en`, { type: "manual", message: errorMsg });
      toast.error(errorMsg);
      return false;
    }

    for (let j = 0; j < typeSizes.length; j++) {
      const size = typeSizes[j];
      if (!size.size_ar?.trim()) {
        const errorMsg = "اسم الحجم بالعربية مطلوب";
        setError(`types.${i}.sizes.${j}.size_ar`, {
          type: "manual",
          message: errorMsg,
        });
        toast.error(errorMsg);
        return false;
      }
      if (!size.size_en?.trim()) {
        const errorMsg = "اسم الحجم بالإنجليزية مطلوب";
        setError(`types.${i}.sizes.${j}.size_en`, {
          type: "manual",
          message: errorMsg,
        });
        toast.error(errorMsg);
        return false;
      }

      const priceValue = Number(size.price);
      if (
        size.price === undefined ||
        size.price === null ||
        isNaN(priceValue) ||
        priceValue <= 0
      ) {
        const errorMsg = "السعر مطلوب";
        setError(`types.${i}.sizes.${j}.price`, {
          type: "manual",
          message: errorMsg,
        });
        toast.error(errorMsg);
        return false;
      }

      if (
        size.offer_price !== undefined &&
        size.offer_price !== null &&
        (isNaN(Number(size.offer_price)) || Number(size.offer_price) <= 0)
      ) {
        const errorMsg = "سعر العرض يجب أن يكون رقم موجب";
        setError(`types.${i}.sizes.${j}.offer_price`, {
          type: "manual",
          message: errorMsg,
        });
        toast.error(errorMsg);
        return false;
      }
    }
  }

  return true;
}

/** Strip server IDs when creating a new product */
export function buildTypesWithSizesForCreate(
  types: ProductType[],
  sizesByType: Record<number, ProductSize[]>
) {
  return types.map((type, typeIndex) => {
    const { id, product_id, ...typeData } = type;
    void id;
    void product_id;

    const cleanSizes = (sizesByType[typeIndex] || []).map((size) => {
      const { id: sizeId, type_id, ...sizeData } = size;
      void sizeId;
      void type_id;
      return sizeData;
    });

    return { ...typeData, sizes: cleanSizes };
  });
}

/** Keep IDs when updating an existing product */
export function buildTypesWithSizesForUpdate(
  types: ProductType[],
  sizesByType: Record<number, ProductSize[]>
) {
  return types.map((type, typeIndex) => ({
    ...type,
    sizes: sizesByType[typeIndex] || [],
  }));
}
