import supabase from "./supabase";
import { BranchQRCode, Branch } from "../src/types/feedback";
import { isFeatureEnabled } from "../src/lib/feature-flags";
import {
  qrCodeUtils,
  QRCodeOptions,
  QRCodeMetadata,
} from "../src/lib/qr-code-generator";

// QR Code generation service for branches
export const apiBranchQR = {
  // Generate QR code for a specific branch
  generateQRCode: async (
    branchId: string,
    options?: Partial<QRCodeOptions>
  ): Promise<BranchQRCode> => {
    if (!isFeatureEnabled("ENABLE_QR_CODE_GENERATION")) {
      throw new Error("QR code generation feature is disabled");
    }

    try {
      // First, get the branch information
      const { data: branch, error: branchError } = await supabase
        .from("branches")
        .select("*")
        .eq("id", branchId)
        .single();

      if (branchError) {
        console.error("خطأ في جلب بيانات الفرع:", branchError.message);
        throw new Error(`Branch not found: ${branchError.message}`);
      }

      if (!branch) {
        throw new Error("Branch not found");
      }

      // Generate QR code using the utility
      const { dataURL, metadata } = await qrCodeUtils.generateBranchQRCode(
        branch,
        options
      );

      // Check if QR code already exists for this branch
      const { data: existingQR, error: checkError } = await supabase
        .from("branch_qr_codes")
        .select("*")
        .eq("branch_id", branchId)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        // PGRST116 is "not found" - this is expected if no QR code exists
        console.error("خطأ في التحقق من وجود رمز QR:", checkError.message);
        throw new Error("تعذر التحقق من وجود رمز QR");
      }

      if (existingQR) {
        // Update existing QR code
        const { data: updatedQR, error: updateError } = await supabase
          .from("branch_qr_codes")
          .update({
            qr_code_url: dataURL,
            qr_code_metadata: metadata,
            updated_at: new Date().toISOString(),
          })
          .eq("branch_id", branchId)
          .select()
          .single();

        if (updateError) {
          console.error("خطأ في تحديث رمز QR:", updateError.message);
          throw new Error("تعذر تحديث رمز QR");
        }

        return updatedQR;
      } else {
        // Create new QR code
        const { data: newQR, error: createError } = await supabase
          .from("branch_qr_codes")
          .insert({
            branch_id: branchId,
            qr_code_url: dataURL,
            qr_code_metadata: metadata,
          })
          .select()
          .single();

        if (createError) {
          console.error("خطأ في إنشاء رمز QR:", createError.message);
          throw new Error(`تعذر إنشاء رمز QR: ${createError.message}`);
        }

        return newQR;
      }
    } catch (error) {
      console.error("خطأ في إنشاء رمز QR:", error);
      throw error;
    }
  },

  // Get QR code for a specific branch
  getBranchQRCode: async (branchId: string): Promise<BranchQRCode | null> => {
    if (!isFeatureEnabled("ENABLE_QR_CODE_GENERATION")) {
      return null;
    }

    try {
      const { data, error } = await supabase
        .from("branch_qr_codes")
        .select("*")
        .eq("branch_id", branchId)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 is "not found"
        console.error("خطأ في جلب رمز QR:", error.message);
        throw new Error("تعذر جلب رمز QR");
      }

      return data;
    } catch (error) {
      console.error("خطأ في جلب رمز QR:", error);
      throw error;
    }
  },

  // Get all QR codes with branch information
  getBranchQRCodes: async (): Promise<
    (BranchQRCode & { branch?: Branch })[]
  > => {
    if (!isFeatureEnabled("ENABLE_QR_CODE_GENERATION")) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from("branch_qr_codes")
        .select(
          `
          *,
          branch:branches (
            id,
            name_ar,
            name_en,
            location_ar,
            location_en
          )
        `
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.error("خطأ في جلب رموز QR:", error.message);
        throw new Error("تعذر تحميل رموز QR");
      }

      return data || [];
    } catch (error) {
      console.error("خطأ في جلب رموز QR:", error);
      throw error;
    }
  },

  // Delete QR code for a branch
  deleteBranchQRCode: async (branchId: string): Promise<void> => {
    if (!isFeatureEnabled("ENABLE_QR_CODE_GENERATION")) {
      throw new Error("QR code generation feature is disabled");
    }

    try {
      const { error } = await supabase
        .from("branch_qr_codes")
        .delete()
        .eq("branch_id", branchId);

      if (error) {
        console.error("خطأ في حذف رمز QR:", error.message);
        throw new Error("تعذر حذف رمز QR");
      }
    } catch (error) {
      console.error("خطأ في حذف رمز QR:", error);
      throw error;
    }
  },

  // Get QR codes for multiple branches
  getQRCodesForBranches: async (
    branchIds: string[]
  ): Promise<BranchQRCode[]> => {
    if (!isFeatureEnabled("ENABLE_QR_CODE_GENERATION")) {
      return [];
    }

    try {
      if (!branchIds || branchIds.length === 0) {
        return [];
      }

      const { data, error } = await supabase
        .from("branch_qr_codes")
        .select("*")
        .in("branch_id", branchIds);

      if (error) {
        console.error("خطأ في جلب رموز QR للفروع:", error.message);
        throw new Error("تعذر تحميل رموز QR للفروع");
      }

      return data || [];
    } catch (error) {
      console.error("خطأ في جلب رموز QR للفروع:", error);
      throw error;
    }
  },

  // Generate QR code as SVG
  generateQRCodeSVG: async (
    branchId: string,
    options?: Partial<QRCodeOptions>
  ): Promise<{
    svg: string;
    metadata: QRCodeMetadata;
  }> => {
    if (!isFeatureEnabled("ENABLE_QR_CODE_GENERATION")) {
      throw new Error("QR code generation feature is disabled");
    }

    try {
      const { data: branch, error: branchError } = await supabase
        .from("branches")
        .select("*")
        .eq("id", branchId)
        .single();

      if (branchError || !branch) {
        throw new Error("Branch not found");
      }

      const { svg, metadata } = await qrCodeUtils.generateBranchQRCodeSVG(
        branch,
        options
      );
      return { svg, metadata };
    } catch (error) {
      console.error("خطأ في إنشاء رمز QR كـ SVG:", error);
      throw error;
    }
  },

  // Generate QR code as Buffer for download
  generateQRCodeBuffer: async (
    branchId: string,
    options?: Partial<QRCodeOptions>
  ): Promise<{
    buffer: Buffer;
    metadata: QRCodeMetadata;
  }> => {
    if (!isFeatureEnabled("ENABLE_QR_CODE_GENERATION")) {
      throw new Error("QR code generation feature is disabled");
    }

    try {
      const { data: branch, error: branchError } = await supabase
        .from("branches")
        .select("*")
        .eq("id", branchId)
        .single();

      if (branchError || !branch) {
        throw new Error("Branch not found");
      }

      const { buffer, metadata } = await qrCodeUtils.generateBranchQRCodeBuffer(
        branch,
        options
      );
      return { buffer, metadata };
    } catch (error) {
      console.error("خطأ في إنشاء رمز QR كـ Buffer:", error);
      throw error;
    }
  },

  // Bulk generate QR codes for multiple branches
  bulkGenerateQRCodes: async (
    branchIds: string[],
    options?: Partial<QRCodeOptions>
  ): Promise<BranchQRCode[]> => {
    if (!isFeatureEnabled("ENABLE_QR_CODE_GENERATION")) {
      throw new Error("QR code generation feature is disabled");
    }

    try {
      const results: BranchQRCode[] = [];

      for (const branchId of branchIds) {
        try {
          const qrCode = await apiBranchQR.generateQRCode(branchId, options);
          results.push(qrCode);
        } catch (error) {
          console.error(`خطأ في إنشاء رمز QR للفرع ${branchId}:`, error);
          // Continue with other branches even if one fails
        }
      }

      return results;
    } catch (error) {
      console.error("خطأ في إنشاء رموز QR للفروع:", error);
      throw error;
    }
  },

  // Regenerate QR code for a branch
  regenerateQRCode: async (
    branchId: string,
    options?: Partial<QRCodeOptions>
  ): Promise<BranchQRCode> => {
    if (!isFeatureEnabled("ENABLE_QR_CODE_GENERATION")) {
      throw new Error("QR code generation feature is disabled");
    }

    try {
      // Delete existing QR code first
      await apiBranchQR.deleteBranchQRCode(branchId);

      // Generate new QR code
      return await apiBranchQR.generateQRCode(branchId, options);
    } catch (error) {
      console.error("خطأ في إعادة إنشاء رمز QR:", error);
      throw error;
    }
  },

  // Get QR code analytics
  getQRCodeAnalytics: async (): Promise<{
    total_qr_codes: number;
    branches_with_qr: number;
    total_branches: number;
    qr_generation_stats: {
      today: number;
      this_week: number;
      this_month: number;
    };
  }> => {
    if (!isFeatureEnabled("ENABLE_QR_CODE_GENERATION")) {
      return {
        total_qr_codes: 0,
        branches_with_qr: 0,
        total_branches: 0,
        qr_generation_stats: { today: 0, this_week: 0, this_month: 0 },
      };
    }

    try {
      // Get total branches
      const { count: totalBranches } = await supabase
        .from("branches")
        .select("*", { count: "exact", head: true });

      // Get branches with QR codes
      const { count: branchesWithQR } = await supabase
        .from("branch_qr_codes")
        .select("*", { count: "exact", head: true });

      // Get QR code generation stats
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const { count: todayCount } = await supabase
        .from("branch_qr_codes")
        .select("*", { count: "exact", head: true })
        .gte("created_at", today.toISOString());

      const { count: weekCount } = await supabase
        .from("branch_qr_codes")
        .select("*", { count: "exact", head: true })
        .gte("created_at", thisWeek.toISOString());

      const { count: monthCount } = await supabase
        .from("branch_qr_codes")
        .select("*", { count: "exact", head: true })
        .gte("created_at", thisMonth.toISOString());

      return {
        total_qr_codes: branchesWithQR || 0,
        branches_with_qr: branchesWithQR || 0,
        total_branches: totalBranches || 0,
        qr_generation_stats: {
          today: todayCount || 0,
          this_week: weekCount || 0,
          this_month: monthCount || 0,
        },
      };
    } catch (error) {
      console.error("خطأ في جلب إحصائيات رموز QR:", error);
      throw error;
    }
  },
};
