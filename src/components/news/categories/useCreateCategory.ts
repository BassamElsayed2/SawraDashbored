import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  createCategory,
  uploadCategoryImage,
} from "../../../../services/apiCategories";

export function useAddCategory() {
  const queryClient = useQueryClient();

  const { mutate: addCategory, isPending } = useMutation({
    mutationFn: async ({
      name_ar,
      name_en,
      image,
    }: {
      name_ar: string;
      name_en: string;
      image?: File;
    }) => {
      let image_url = undefined;

      if (image) {
        image_url = await uploadCategoryImage(image, "categories");
      }

      await createCategory({ name_ar, name_en, image_url });
    },
    onSuccess: () => {
      toast.success("تمت إضافة التصنيف بنجاح");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (error) => {
      toast.error("فشل في إضافة التصنيف: " + error.message);
    },
  });

  return { addCategory, isPending };
}
