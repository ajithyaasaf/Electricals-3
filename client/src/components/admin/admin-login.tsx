import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Shield, Eye, EyeOff, ArrowLeft } from "lucide-react";
import logoUrl from "@assets/Logo_1763402801870.png";

const adminLoginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type AdminLoginFormData = z.infer<typeof adminLoginSchema>;

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

export function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<AdminLoginFormData>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: AdminLoginFormData) => {
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;

      // Check if this user has admin privileges
      if (user.email === 'admin@godiva.com') {
        toast({
          title: "Welcome, Admin",
          description: "Successfully logged into admin dashboard.",
        });
        onLoginSuccess();
      } else {
        // Sign out the user if they're not admin
        await auth.signOut();
        toast({
          title: "Access Denied",
          description: "These credentials don't have admin access.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      let errorMessage = "Login failed. Please check your credentials.";

      if (error.code === 'auth/user-not-found') {
        errorMessage = "No admin account found with this email.";
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = "Incorrect password. Please try again.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Please enter a valid email address.";
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = "Too many failed attempts. Please try again later.";
      }

      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-copper-50 to-copper-100">
      {/* Header with back navigation */}
      <div className="absolute top-0 left-0 right-0 p-6">
        <Button
          variant="ghost"
          onClick={() => window.location.href = '/'}
          className="flex items-center space-x-2 text-copper-700 hover:text-copper-800 hover:bg-copper-100/50"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to CopperBear</span>
        </Button>
      </div>

      {/* Login Form */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md shadow-2xl border-0">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto mb-4">
              <img
                src={logoUrl}
                alt="CopperBear Logo"
                className="h-16 w-auto object-contain mx-auto"
              />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">Admin Access</CardTitle>
            <p className="text-gray-600 mt-2">
              Enter your admin credentials to access the CopperBear dashboard
            </p>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Admin Email</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder="admin@copperbear.com"
                          className="h-11"
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
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
                        <div className="relative">
                          <Input
                            {...field}
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter admin password"
                            className="h-11 pr-10"
                            disabled={isLoading}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            disabled={isLoading}
                          >
                            {showPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full h-11 bg-gradient-to-r from-copper-600 to-copper-700 hover:from-copper-700 hover:to-copper-800"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Signing In...
                    </div>
                  ) : (
                    "Access Admin Dashboard"
                  )}
                </Button>
              </form>
            </Form>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Security Notice:</strong> This is a secure admin area. Only authorized personnel with valid credentials can access the dashboard.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}