import supabase from "./supabase";
import { Branch } from "@/types/feedback";

// Basic branch management service
export const apiBranches = {
  // Get all branches
  getBranches: async (): Promise<Branch[]> => {
    try {
      const { data, error } = await supabase
        .from("branches")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("خطأ في جلب الفروع:", error.message);
        throw new Error("تعذر تحميل الفروع");
      }

      return data || [];
    } catch (error) {
      console.error("خطأ في جلب الفروع:", error);
      throw error;
    }
  },

  // Get branch by ID
  getBranch: async (id: string): Promise<Branch> => {
    try {
      const { data, error } = await supabase
        .from("branches")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("خطأ في جلب الفرع:", error.message);
        throw new Error("تعذر جلب الفرع");
      }

      return data;
    } catch (error) {
      console.error("خطأ في جلب الفرع:", error);
      throw error;
    }
  },

  // Get public branch info (for survey validation)
  getPublicBranch: async (id: string): Promise<Branch | null> => {
    try {
      const { data, error } = await supabase
        .from("branches")
        .select("id, name_ar, name_en, address_ar, address_en")
        .eq("id", id)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 is "not found"
        console.error("خطأ في جلب معلومات الفرع:", error.message);
        throw new Error("تعذر جلب معلومات الفرع");
      }

      return data;
    } catch (error) {
      console.error("خطأ في جلب معلومات الفرع:", error);
      throw error;
    }
  },

  // Create new branch
  createBranch: async (
    branchData: Omit<Branch, "id" | "created_at" | "updated_at">
  ): Promise<Branch> => {
    try {
      const { data, error } = await supabase
        .from("branches")
        .insert([branchData])
        .select()
        .single();

      if (error) {
        console.error("خطأ في إنشاء الفرع:", error.message);
        throw new Error("تعذر إنشاء الفرع");
      }

      return data;
    } catch (error) {
      console.error("خطأ في إنشاء الفرع:", error);
      throw error;
    }
  },

  // Update branch
  updateBranch: async (
    id: string,
    branchData: Partial<Branch>
  ): Promise<Branch> => {
    try {
      const { data, error } = await supabase
        .from("branches")
        .update(branchData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("خطأ في تحديث الفرع:", error.message);
        throw new Error("تعذر تحديث الفرع");
      }

      return data;
    } catch (error) {
      console.error("خطأ في تحديث الفرع:", error);
      throw error;
    }
  },

  // Delete branch
  deleteBranch: async (id: string): Promise<void> => {
    try {
      const { error } = await supabase.from("branches").delete().eq("id", id);

      if (error) {
        console.error("خطأ في حذف الفرع:", error.message);
        throw new Error("تعذر حذف الفرع");
      }
    } catch (error) {
      console.error("خطأ في حذف الفرع:", error);
      throw error;
    }
  },
};

// Export individual functions for convenience
export const getBranches = apiBranches.getBranches;
export const getBranch = apiBranches.getBranch;
export const getPublicBranch = apiBranches.getPublicBranch;
export const createBranch = apiBranches.createBranch;
export const updateBranch = apiBranches.updateBranch;
export const deleteBranch = apiBranches.deleteBranch;
