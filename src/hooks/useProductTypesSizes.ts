"use client";

import { useCallback, useState } from "react";
import type { ProductSize, ProductType, ProductTypeWithSizes } from "@/services/apiProducts";

export function useProductTypesSizes(initialTypes: ProductType[] = []) {
  const [types, setTypes] = useState<ProductType[]>(initialTypes);
  const [sizesByType, setSizesByType] = useState<Record<number, ProductSize[]>>(
    {}
  );

  const initializeFromProduct = useCallback(
    (productTypes: ProductTypeWithSizes[] | undefined) => {
      if (!productTypes?.length) {
        setTypes([]);
        setSizesByType({});
        return;
      }

      setTypes(
        productTypes.map((type) => ({
          id: type.id,
          product_id: type.product_id,
          name_ar: type.name_ar,
          name_en: type.name_en,
        }))
      );

      const sizesMap: Record<number, ProductSize[]> = {};
      productTypes.forEach((type, index) => {
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
    },
    []
  );

  const addType = useCallback(() => {
    setTypes((prev) => [
      ...prev,
      { name_ar: "", name_en: "" },
    ]);
  }, []);

  const removeType = useCallback((index: number) => {
    setTypes((prev) => prev.filter((_, i) => i !== index));
    setSizesByType((prev) => {
      const newSizes = { ...prev };
      delete newSizes[index];
      const shiftedSizes: Record<number, ProductSize[]> = {};
      Object.keys(newSizes).forEach((key) => {
        const numKey = parseInt(key, 10);
        if (numKey > index) {
          shiftedSizes[numKey - 1] = newSizes[numKey];
        } else {
          shiftedSizes[numKey] = newSizes[numKey];
        }
      });
      return shiftedSizes;
    });
  }, []);

  const updateType = useCallback(
    (index: number, field: keyof ProductType, value: string) => {
      setTypes((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], [field]: value };
        return updated;
      });
    },
    []
  );

  const addSize = useCallback((typeIndex: number) => {
    const newSize: ProductSize = {
      size_ar: "",
      size_en: "",
      price: 0.01,
      offer_price: undefined,
    };
    setSizesByType((prev) => ({
      ...prev,
      [typeIndex]: [...(prev[typeIndex] || []), newSize],
    }));
  }, []);

  const removeSize = useCallback((typeIndex: number, sizeIndex: number) => {
    setSizesByType((prev) => ({
      ...prev,
      [typeIndex]: prev[typeIndex]?.filter((_, i) => i !== sizeIndex) || [],
    }));
  }, []);

  const updateSize = useCallback(
    (
      typeIndex: number,
      sizeIndex: number,
      field: keyof ProductSize,
      value: string | number | undefined
    ) => {
      setSizesByType((prev) => {
        const updatedSizes = [...(prev[typeIndex] || [])];
        if (field === "price") {
          if (
            value === "" ||
            value === null ||
            value === undefined ||
            isNaN(Number(value))
          ) {
            updatedSizes[sizeIndex] = { ...updatedSizes[sizeIndex], price: 0 };
          } else {
            updatedSizes[sizeIndex] = {
              ...updatedSizes[sizeIndex],
              price: Number(value),
            };
          }
        } else {
          updatedSizes[sizeIndex] = {
            ...updatedSizes[sizeIndex],
            [field]: value,
          };
        }
        return { ...prev, [typeIndex]: updatedSizes };
      });
    },
    []
  );

  return {
    types,
    sizesByType,
    setTypes,
    setSizesByType,
    initializeFromProduct,
    addType,
    removeType,
    updateType,
    addSize,
    removeSize,
    updateSize,
  };
}
