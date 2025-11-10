// src/pages/RegisterPage.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { registerSchema, type RegisterForm } from "@/lib/schemas/authValidation";
import { AccountService, type RegisterRequestDto } from "@/api/generated";
import { BrainCircuit } from "lucide-react";

export default function RegisterPage() {
  const navigate = useNavigate();
  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      displayName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onTouched"
  });

  const { mutate: registerUser, isPending } = useMutation({
    mutationFn: (data: RegisterRequestDto) => AccountService.register(data),
    onSuccess: () => {
      toast.success("Account Created!", {
        description: "You have successfully registered. Please log in.",
      });
      // Redirect to the login page after successful registration
      navigate("/login");
    },
    // onError: (error: any) => {
    //   // Handle validation errors from the backend (e.g., duplicate email)
    //   if (error.response?.status === 400) {
    //     // You can parse the backend errors and set them on the form fields
    //     const errorData = error.response.data;
    //     if (errorData.errors) {
    //         for (const key in errorData.errors) {
    //             form.setError(key.toLowerCase() as any, { message: errorData.errors[key][0] });
    //         }
    //     } else {
    //         toast.error("Registration Failed", { description: "An unknown validation error occurred." });
    //     }
    //   } else {
    //     // Global interceptor will handle other errors (500, etc.)
    //   }
    // },
  });

  const onSubmit = (data: RegisterForm) => {
    // The Zod schema doesn't include 'confirmPassword' in the final data
    // because it's only for validation. We pass the rest to the API.
    registerUser(data);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-secondary">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center mb-4">
            <BrainCircuit className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Create Your Studyland Account</CardTitle>
          <CardDescription>Join the community and start tracking your progress</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your Name" {...field} />
                    </FormControl>
                    <div className="h-5"><FormMessage /></div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="name@example.com" {...field} />
                    </FormControl>
                    <div className="h-5"><FormMessage /></div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <div className="h-5"><FormMessage /></div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <div className="h-5"><FormMessage /></div>
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Creating Account..." : "Create Account"}
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link to="/login" className="underline text-primary">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}