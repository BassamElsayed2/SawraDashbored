import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signOut } from "@/services/apiAuth";
import { useRouter } from "next/navigation";

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { mutate: logout, isPending: isLoggingOut } = useMutation({
    mutationFn: signOut,
    onSuccess: () => {
      queryClient.removeQueries();
      router.replace("/");
    },
    onError: () => {
      // Logout failed
    },
  });

  return {
    logout,
    isLoggingOut,
  };
}
