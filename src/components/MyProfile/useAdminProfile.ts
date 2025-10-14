// hooks/useAdminProfile.ts
import { useQuery } from "@tanstack/react-query";
import { useUser } from "@/components/Authentication/useUser";
import apiClient from "@/services/api-client";

interface AdminProfile {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  phone: number | string;
  role?: string;
  job_title?: string;
  address?: string;
  about?: string;
  image_url?: string;
  joined_at: string | Date | number;
}

export function useAdminProfile() {
  const { user } = useUser();

  return useQuery({
    queryKey: ["adminProfile", user?.id],
    queryFn: async () => {
      const response = await apiClient.get<{ profile: AdminProfile }>(
        "/admin/profile"
      );
      return response.data.profile;
    },
    enabled: !!user?.id, // ما يشتغلش غير لما يكون فيه user
  });
}
