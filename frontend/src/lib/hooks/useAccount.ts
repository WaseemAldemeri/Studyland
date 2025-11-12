import {
  AccountService,
  type LoginRequestDto,
  type RegisterRequestDto,
} from "@/api/generated";
import { router } from "@/app/router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useAccount = () => {
  const queryClient = useQueryClient();

  const loginUserMtn = useMutation({
    mutationFn: (data: LoginRequestDto) => AccountService.loginUser(data),
    onSuccess: (data) => {
      localStorage.setItem("access-token", data.accessToken);
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });

  const logoutUser = () => {
    localStorage.removeItem("access-token");
    queryClient.setQueryData(["user"], null);
    router.navigate("/login");
  };

  const registerUserMtn = useMutation({
    mutationFn: (data: RegisterRequestDto) => AccountService.registerUser(data),
    onSuccess: (_, request) => {
      loginUserMtn.mutate({ ...request });
    },
    onError: (error: string[]) => {
      toast.error(error.join("\n - "), {
        duration: 6000,
        closeButton: true,
        position: "top-center",
      });
    },
  });

  const { data: currentUser, isFetching: currentUserLoading } = useQuery({
    queryKey: ["user"],
    queryFn: () => AccountService.getCurrentUser(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    registerUserMtn,
    loginUserMtn,
    logoutUser,
    currentUser,
    currentUserLoading
  };
};
