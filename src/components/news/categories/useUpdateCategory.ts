import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  updateCategory as updateCategoryApi,
  uploadCategoryImage,
} from "../../../../services/apiCategories";

interface UpdateCategoryPayload {
  id: string;
  name_ar: string;
  name_en: string;
  image?: File;
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  const { mutate: updateCategory, isPending } = useMutation({
    mutationFn: async ({
      id,
      name_ar,
      name_en,
      image,
    }: UpdateCategoryPayload) => {
      let image_url = undefined;

      if (image) {
        image_url = await uploadCategoryImage(image, "categories");
      }

      await updateCategoryApi(id, { name_ar, name_en, image_url });
    },
    onSuccess: () => {
      toast.success("تم تحديث التصنيف بنجاح");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (error) => {
      toast.error("فشل في تحديث التصنيف: " + error.message);
    },
  });

  return { updateCategory, isPending };
}
