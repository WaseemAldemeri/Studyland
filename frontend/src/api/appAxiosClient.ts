import { router } from "@/app/router";
import axios, { type AxiosError } from "axios";
import { toast } from "sonner";

const appAxiosClient = axios.create();

appAxiosClient.interceptors.response.use(
  (response) => {
    const method = response.config.method?.toUpperCase();
    if (method === "POST" || method === "PUT" || method === "DELETE") {
      toast.success("Success!", {
        description: "Your action was completed successfully.",
      });
    }
    return response;
  },

  (error: AxiosError) => {

    console.log({title: "API Error", ...error})
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const {status, data}: {status: number, data: any} = error.response! ?? null;

    // For validation errors, we just re-throw the error after formatting so react-query's 'onError' can catch it.
    if (status === 400) {
      if (data?.errors) {
        const modelStateErros: string[] = [];
        for (const key in data.errors) {
          modelStateErros.push(data.errors[key]);
        }
        throw modelStateErros.flat();
      }
      toast.error("Validation Failed", data);
      return Promise.reject(error);
    }
    
    // This matches the 'RestException.ExceptionResponse' record from backend.
    const errorData = error.response?.data as {
      message: string;
      details?: string;
      status: number;
    };

    // --- Show a toast or redirect to page for all other errors ---
    switch (error.response?.status) {
      case 401:
        router.navigate("/login")
        break;
      case 403:
        toast.error("Unauthorized", {
          description: errorData?.message || "You are not authorized to perform this action.",
        });
        break;
      case 404:
        toast.error("Not Found", {
          description: errorData?.message || "The requested resource could not be found.",
        });
        break;
      case 500:
      default:
        router.navigate("/server-error", {state: {error: errorData}})
        break;
    }

    // We still reject the promise so that the calling code (react-query) knows the request failed.
    return Promise.reject(error);
  }
);

export default appAxiosClient;
