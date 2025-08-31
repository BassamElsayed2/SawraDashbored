import supabase from "./supabase";
import {
  CustomerFeedback,
  FeedbackSubmission,
  FeedbackWithRatings,
  FeedbackFilters,
  FeedbackAnalytics,
} from "../src/types/feedback";

interface BranchData {
  id: number;
  name_ar?: string;
  name_en?: string;
  address_ar?: string;
  address_en?: string;
}

export const apiCustomerFeedback = {
  // Submit new feedback
  submitFeedback: async (
    feedbackData: FeedbackSubmission
  ): Promise<CustomerFeedback> => {
    try {
      // Validate branch_id format - branches table uses bigint, not UUID
      if (!feedbackData.branch_id || isNaN(Number(feedbackData.branch_id))) {
        console.error("Invalid branch ID format:", feedbackData.branch_id);
        throw new Error("معرف الفرع غير صحيح");
      }

      // Insert feedback with all available columns
      const { data: feedback, error: feedbackError } = await supabase
        .from("customer_feedback")
        .insert([
          {
            branch_id: feedbackData.branch_id,
            customer_name: feedbackData.customer_name,
            phone_number: feedbackData.phone_number,
            email: feedbackData.email,
            overall_rating: feedbackData.overall_rating,
            opinion: feedbackData.opinion,
            reception_rating: feedbackData.reception_rating,
            speed_service_rating: feedbackData.service_speed_rating,
            quality_rating: feedbackData.quality_rating,
            cleanliness_rating: feedbackData.cleanliness_rating,
            catering_rating: feedbackData.catering_rating,
          },
        ])
        .select()
        .single();

      if (feedbackError) {
        console.error("خطأ في إرسال التقييم:", feedbackError.message);
        throw new Error("تعذر إرسال التقييم");
      }

      return feedback;
    } catch (error) {
      console.error("خطأ في إرسال التقييم:", error);
      throw error;
    }
  },

  // Get all feedback with optional filters
  getFeedback: async (
    filters?: FeedbackFilters
  ): Promise<{ feedback: FeedbackWithRatings[]; total: number }> => {
    try {
      let query = supabase
        .from("customer_feedback")
        .select(
          `
          *,
          branch:branches(id, name_ar, name_en, address_ar, address_en)
        `
        )
        .order("created_at", { ascending: false });

      // Apply filters
      if (filters?.branchId) {
        query = query.eq("branch_id", filters.branchId);
      }

      if (filters?.startDate) {
        query = query.gte("created_at", filters.startDate);
      }

      if (filters?.endDate) {
        query = query.lte("created_at", filters.endDate);
      }

      if (filters?.rating) {
        query = query.eq("overall_rating", filters.rating);
      }

      if (filters?.search) {
        query = query.or(
          `customer_name.ilike.%${filters.search}%,phone_number.ilike.%${filters.search}%`
        );
      }

      // Apply pagination
      if (filters?.page && filters?.limit) {
        const from = (filters.page - 1) * filters.limit;
        const to = from + filters.limit - 1;
        query = query.range(from, to);
      }

      const { data, error } = await query;

      if (error) {
        console.error("خطأ في جلب التقييمات:", error.message);
        throw new Error("تعذر تحميل التقييمات");
      }

      // Transform data to include ratings from the main table columns
      const feedbackWithRatings = (data || []).map((item: any) => {
        const ratings = [];

        if (item.reception_rating) {
          ratings.push({
            id: `reception_${item.id}`,
            feedback_id: item.id,
            category: "reception",
            rating: item.reception_rating,
            created_at: item.created_at,
          });
        }

        if (item.speed_service_rating) {
          ratings.push({
            id: `service_speed_${item.id}`,
            feedback_id: item.id,
            category: "service_speed",
            rating: item.speed_service_rating,
            created_at: item.created_at,
          });
        }

        if (item.quality_rating) {
          ratings.push({
            id: `food_quality_${item.id}`,
            feedback_id: item.id,
            category: "food_quality",
            rating: item.quality_rating,
            created_at: item.created_at,
          });
        }

        if (item.cleanliness_rating) {
          ratings.push({
            id: `cleanliness_${item.id}`,
            feedback_id: item.id,
            category: "cleanliness",
            rating: item.cleanliness_rating,
            created_at: item.created_at,
          });
        }

        if (item.catering_rating) {
          ratings.push({
            id: `order_delivery_${item.id}`,
            feedback_id: item.id,
            category: "order_delivery",
            rating: item.catering_rating,
            created_at: item.created_at,
          });
        }

        return {
          ...item,
          ratings,
        };
      });

      // Get total count for pagination
      let countQuery = supabase
        .from("customer_feedback")
        .select("id", { count: "exact" });

      // Apply the same filters to count query
      if (filters?.branchId) {
        countQuery = countQuery.eq("branch_id", filters.branchId);
      }

      if (filters?.startDate) {
        countQuery = countQuery.gte("created_at", filters.startDate);
      }

      if (filters?.endDate) {
        countQuery = countQuery.lte("created_at", filters.endDate);
      }

      if (filters?.rating) {
        countQuery = countQuery.eq("overall_rating", filters.rating);
      }

      if (filters?.search) {
        countQuery = countQuery.or(
          `customer_name.ilike.%${filters.search}%,phone_number.ilike.%${filters.search}%`
        );
      }

      const { count } = await countQuery;

      return {
        feedback: feedbackWithRatings,
        total: count || 0,
      };
    } catch (error) {
      console.error("خطأ في جلب التقييمات:", error);
      throw error;
    }
  },

  // Get feedback by ID
  getFeedbackById: async (id: string): Promise<FeedbackWithRatings> => {
    try {
      const { data, error } = await supabase
        .from("customer_feedback")
        .select(
          `
          *,
          branch:branches(id, name_ar, name_en, address_ar, address_en)
        `
        )
        .eq("id", id)
        .single();

      if (error) {
        console.error("خطأ في جلب التقييم:", error.message);
        throw new Error("تعذر جلب التقييم");
      }

      // Transform data to include ratings from the main table columns
      const ratings = [];

      if (data.reception_rating) {
        ratings.push({
          id: `reception_${data.id}`,
          feedback_id: data.id,
          category: "reception",
          rating: data.reception_rating,
          created_at: data.created_at,
        });
      }

      if (data.speed_service_rating) {
        ratings.push({
          id: `service_speed_${data.id}`,
          feedback_id: data.id,
          category: "service_speed",
          rating: data.speed_service_rating,
          created_at: data.created_at,
        });
      }

      if (data.quality_rating) {
        ratings.push({
          id: `food_quality_${data.id}`,
          feedback_id: data.id,
          category: "food_quality",
          rating: data.quality_rating,
          created_at: data.created_at,
        });
      }

      if (data.cleanliness_rating) {
        ratings.push({
          id: `cleanliness_${data.id}`,
          feedback_id: data.id,
          category: "cleanliness",
          rating: data.cleanliness_rating,
          created_at: data.created_at,
        });
      }

      if (data.catering_rating) {
        ratings.push({
          id: `order_delivery_${data.id}`,
          feedback_id: data.id,
          category: "order_delivery",
          rating: data.catering_rating,
          created_at: data.created_at,
        });
      }

      return {
        ...data,
        ratings,
      };
    } catch (error) {
      console.error("خطأ في جلب التقييم:", error);
      throw error;
    }
  },

  // Get feedback analytics
  getFeedbackAnalytics: async (
    filters?: FeedbackFilters
  ): Promise<FeedbackAnalytics> => {
    try {
      // Get total feedback count
      let countQuery = supabase
        .from("customer_feedback")
        .select("id", { count: "exact" });

      if (filters?.branchId) {
        countQuery = countQuery.eq("branch_id", filters.branchId);
      }

      const { count: total_feedback } = await countQuery;

      // Get average rating
      let avgQuery = supabase
        .from("customer_feedback")
        .select("overall_rating");

      if (filters?.branchId) {
        avgQuery = avgQuery.eq("branch_id", filters.branchId);
      }

      const { data: ratings } = await avgQuery;

      const average_rating =
        ratings && ratings.length > 0
          ? ratings.reduce(
              (sum: number, item: any) => sum + item.overall_rating,
              0
            ) / ratings.length
          : 0;

      // Get rating distribution
      const { data: distribution } = await supabase
        .from("customer_feedback")
        .select("overall_rating");

      const rating_distribution = [1, 2, 3, 4].map((rating) => {
        const count =
          distribution?.filter((d: any) => d.overall_rating === rating)
            .length || 0;
        return {
          rating,
          count,
          percentage: total_feedback ? (count / total_feedback) * 100 : 0,
        };
      });

      // Get category averages from main table columns
      const { data: categoryData } = await supabase
        .from("customer_feedback")
        .select(
          "reception_rating, speed_service_rating, quality_rating, cleanliness_rating, catering_rating"
        );

      const receptionRatings =
        categoryData
          ?.filter((d: any) => d.reception_rating)
          .map((d: any) => d.reception_rating) || [];
      const serviceSpeedRatings =
        categoryData
          ?.filter((d: any) => d.speed_service_rating)
          .map((d: any) => d.speed_service_rating) || [];
      const qualityRatings =
        categoryData
          ?.filter((d: any) => d.quality_rating)
          .map((d: any) => d.quality_rating) || [];
      const cleanlinessRatings =
        categoryData
          ?.filter((d: any) => d.cleanliness_rating)
          .map((d: any) => d.cleanliness_rating) || [];
      const cateringRatings =
        categoryData
          ?.filter((d: any) => d.catering_rating)
          .map((d: any) => d.catering_rating) || [];

      const category_averages = [
        {
          category: "reception",
          average_rating:
            receptionRatings.length > 0
              ? receptionRatings.reduce((sum, rating) => sum + rating, 0) /
                receptionRatings.length
              : 0,
          total_ratings: receptionRatings.length,
        },
        {
          category: "service_speed",
          average_rating:
            serviceSpeedRatings.length > 0
              ? serviceSpeedRatings.reduce((sum, rating) => sum + rating, 0) /
                serviceSpeedRatings.length
              : 0,
          total_ratings: serviceSpeedRatings.length,
        },
        {
          category: "food_quality",
          average_rating:
            qualityRatings.length > 0
              ? qualityRatings.reduce((sum, rating) => sum + rating, 0) /
                qualityRatings.length
              : 0,
          total_ratings: qualityRatings.length,
        },
        {
          category: "cleanliness",
          average_rating:
            cleanlinessRatings.length > 0
              ? cleanlinessRatings.reduce((sum, rating) => sum + rating, 0) /
                cleanlinessRatings.length
              : 0,
          total_ratings: cleanlinessRatings.length,
        },
        {
          category: "order_delivery",
          average_rating:
            cateringRatings.length > 0
              ? cateringRatings.reduce((sum, rating) => sum + rating, 0) /
                cateringRatings.length
              : 0,
          total_ratings: cateringRatings.length,
        },
      ];

      // Get branch performance
      const { data: branchPerformance } = await supabase.from(
        "customer_feedback"
      ).select(`
          branch_id,
          overall_rating,
          branch:branches(id, name_ar, name_en)
        `);

      const branch_performance = branchPerformance
        ? Object.values(
            branchPerformance.reduce(
              (acc, item) => {
                const branchId = item.branch_id;
                const branchData = item.branch as unknown as BranchData;
                if (!acc[branchId]) {
                  acc[branchId] = {
                    branch_id: branchId,
                    branch_name:
                      branchData?.name_ar || branchData?.name_en || "Unknown",
                    total_feedback: 0,
                    total_rating: 0,
                  };
                }
                acc[branchId].total_feedback += 1;
                acc[branchId].total_rating += item.overall_rating;
                return acc;
              },
              {} as Record<
                string,
                {
                  branch_id: string;
                  branch_name: string;
                  total_feedback: number;
                  total_rating: number;
                }
              >
            )
          ).map((branch) => ({
            ...branch,
            average_rating:
              branch.total_feedback > 0
                ? branch.total_rating / branch.total_feedback
                : 0,
          }))
        : [];

      return {
        total_feedback: total_feedback || 0,
        average_rating,
        rating_distribution,
        category_averages,
        branch_performance,
      };
    } catch (error) {
      console.error("خطأ في جلب إحصائيات التقييمات:", error);
      throw error;
    }
  },

  // Delete feedback
  deleteFeedback: async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from("customer_feedback")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("خطأ في حذف التقييم:", error.message);
        throw new Error("تعذر حذف التقييم");
      }
    } catch (error) {
      console.error("خطأ في حذف التقييم:", error);
      throw error;
    }
  },
};
