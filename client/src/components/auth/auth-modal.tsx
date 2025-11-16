import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { signInWithEmail, signUpWithEmail, signInWithGoogle, resetPassword } from "@/lib/firebase";
import { Mail, Lock, User, Eye, EyeOff, Zap, Shield, ArrowLeft } from "lucide-react";
import { FcGoogle } from "react-icons/fc";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signUpSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const resetSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type SignInForm = z.infer<typeof signInSchema>;
type SignUpForm = z.infer<typeof signUpSchema>;
type ResetForm = z.infer<typeof resetSchema>;

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<"signin" | "signup" | "reset">("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const signInForm = useForm<SignInForm>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const signUpForm = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { firstName: "", lastName: "", email: "", password: "", confirmPassword: "" },
  });

  const resetForm = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
    defaultValues: { email: "" },
  });

  const handleSignIn = async (data: SignInForm) => {
    setLoading(true);
    try {
      await signInWithEmail(data.email, data.password);
      toast({
        title: "Welcome back!",
        description: "You've successfully signed in to your account.",
      });
      onOpenChange(false);
      signInForm.reset();
    } catch (error: any) {
      toast({
        title: "Sign-in failed",
        description: getErrorMessage(error.code),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (data: SignUpForm) => {
    setLoading(true);
    try {
      await signUpWithEmail(data.email, data.password, data.firstName, data.lastName);
      toast({
        title: "Account created!",
        description: "Welcome to CopperBear! Your account has been created successfully.",
      });
      onOpenChange(false);
      signUpForm.reset();
    } catch (error: any) {
      toast({
        title: "Sign-up failed",
        description: getErrorMessage(error.code),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      toast({
        title: "Welcome!",
        description: "You've successfully signed in with Google.",
      });
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Google sign-in failed",
        description: getErrorMessage(error.code),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (data: ResetForm) => {
    setLoading(true);
    try {
      await resetPassword(data.email);
      toast({
        title: "Reset email sent",
        description: "Check your email for password reset instructions.",
      });
      setActiveTab("signin");
      resetForm.reset();
    } catch (error: any) {
      toast({
        title: "Reset failed",
        description: getErrorMessage(error.code),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (errorCode: string) => {
    switch (errorCode) {
      case "auth/user-not-found":
        return "No account found with this email address.";
      case "auth/wrong-password":
        return "Incorrect password. Please try again.";
      case "auth/email-already-in-use":
        return "An account with this email already exists.";
      case "auth/weak-password":
        return "Password should be at least 6 characters.";
      case "auth/invalid-email":
        return "Please enter a valid email address.";
      case "auth/too-many-requests":
        return "Too many failed attempts. Please try again later.";
      default:
        return "An error occurred. Please try again.";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-md mx-auto p-0 gap-0 bg-white max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="sr-only">
          <DialogTitle>Authentication</DialogTitle>
          <DialogDescription>Sign in or create an account to continue</DialogDescription>
        </DialogHeader>
        
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 border-b bg-gradient-to-r from-copper-50 to-copper-100 flex-shrink-0">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-8 h-8 from-copper-600 to-copper-700 rounded-lg flex items-center justify-center shadow-lg bg-teal-900">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-copper-800">CopperBear</h1>
              <p className="text-xs text-copper-600">Electrical Solutions</p>
            </div>
          </div>
          <div className="text-center">
            <h2 className="text-base font-semibold text-gray-900">
              {activeTab === "signin" && "Welcome back"}
              {activeTab === "signup" && "Create your account"}
              {activeTab === "reset" && "Reset your password"}
            </h2>
            <p className="text-xs text-gray-600 mt-1">
              {activeTab === "signin" && "Sign in to continue shopping"}
              {activeTab === "signup" && "Join CopperBear professionals"}
              {activeTab === "reset" && "Enter your email for reset"}
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
          {activeTab !== "reset" ? (
          <div className="space-y-4">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "signin" | "signup")}>
              <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-lg">
                <TabsTrigger 
                  value="signin" 
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm font-medium text-sm"
                >
                  Sign In
                </TabsTrigger>
                <TabsTrigger 
                  value="signup"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm font-medium text-sm"
                >
                  Create Account
                </TabsTrigger>
              </TabsList>

            <TabsContent value="signin" className="space-y-4 mt-4">
              <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email" className="text-sm font-medium text-gray-700">
                    Email address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="you@example.com"
                      className="pl-10 h-10 border-gray-200 focus:border-gray-300 focus:ring-0 focus:outline-none rounded-lg"
                      {...signInForm.register("email")}
                    />
                  </div>
                  {signInForm.formState.errors.email && (
                    <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                      <div className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center">
                        <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                      </div>
                      {signInForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signin-password" className="text-sm font-medium text-gray-700">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="signin-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      className="pl-10 pr-12 h-10 border-gray-200 focus:border-gray-300 focus:ring-0 focus:outline-none rounded-lg"
                      {...signInForm.register("password")}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100 rounded-md"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4 text-gray-500" /> : <Eye className="h-4 w-4 text-gray-500" />}
                    </Button>
                  </div>
                  {signInForm.formState.errors.password && (
                    <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                      <div className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center">
                        <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                      </div>
                      {signInForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <input
                      id="remember"
                      type="checkbox"
                      className="w-4 h-4 text-copper-600 bg-gray-100 border-gray-300 rounded focus:ring-copper-500"
                    />
                    <Label htmlFor="remember" className="text-sm text-gray-600">
                      Remember me
                    </Label>
                  </div>
                  <Button
                    type="button"
                    variant="link"
                    className="text-sm text-copper-600 hover:text-copper-700 p-0 h-auto"
                    onClick={() => setActiveTab("reset")}
                  >
                    Forgot password?
                  </Button>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-10 bg-gradient-to-r from-copper-600 to-copper-700 hover:from-copper-700 hover:to-copper-800 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200" 
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Signing in...
                    </div>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4 mt-4">
              <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">First Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="firstName"
                        placeholder="First name"
                        className="pl-10 h-10 border-gray-200 focus:border-gray-300 focus:ring-0 focus:outline-none rounded-lg"
                        {...signUpForm.register("firstName")}
                      />
                    </div>
                    {signUpForm.formState.errors.firstName && (
                      <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                        <div className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center">
                          <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                        </div>
                        {signUpForm.formState.errors.firstName.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">Last Name</Label>
                    <Input
                      id="lastName"
                      placeholder="Last name"
                      className="h-10 border-gray-200 focus:border-gray-300 focus:ring-0 focus:outline-none rounded-lg"
                      {...signUpForm.register("lastName")}
                    />
                    {signUpForm.formState.errors.lastName && (
                      <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                        <div className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center">
                          <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                        </div>
                        {signUpForm.formState.errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-sm font-medium text-gray-700">Email address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@example.com"
                      className="pl-10 h-10 border-gray-200 focus:border-gray-300 focus:ring-0 focus:outline-none rounded-lg"
                      {...signUpForm.register("email")}
                    />
                  </div>
                  {signUpForm.formState.errors.email && (
                    <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                      <div className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center">
                        <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                      </div>
                      {signUpForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-sm font-medium text-gray-700">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      className="pl-10 pr-12 h-10 border-gray-200 focus:border-gray-300 focus:ring-0 focus:outline-none rounded-lg"
                      {...signUpForm.register("password")}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100 rounded-md"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4 text-gray-500" /> : <Eye className="h-4 w-4 text-gray-500" />}
                    </Button>
                  </div>
                  {signUpForm.formState.errors.password && (
                    <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                      <div className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center">
                        <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                      </div>
                      {signUpForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      className="pl-10 h-10 border-gray-200 focus:border-gray-300 focus:ring-0 focus:outline-none rounded-lg"
                      {...signUpForm.register("confirmPassword")}
                    />
                  </div>
                  {signUpForm.formState.errors.confirmPassword && (
                    <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                      <div className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center">
                        <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                      </div>
                      {signUpForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-10 bg-gradient-to-r from-copper-600 to-copper-700 hover:from-copper-700 hover:to-copper-800 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200" 
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creating account...
                    </div>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>
            </TabsContent>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-4 text-gray-500 font-medium">Or continue with</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full h-10 border-gray-300 hover:bg-gray-50 rounded-lg font-medium transition-colors duration-200"
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              <FcGoogle className="mr-3 h-5 w-5" />
              Continue with Google
            </Button>

            <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
              <div className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-copper-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-gray-600">
                  <p className="font-medium text-gray-900 mb-1">Your data is secure</p>
                  <p>Industry-standard encryption protects your information.</p>
                </div>
              </div>
            </div>
            </Tabs>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="p-1 hover:bg-gray-100 rounded-md"
                onClick={() => setActiveTab("signin")}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-gray-600">Back to sign in</span>
            </div>
            
            <div className="text-center mb-4">
              <h3 className="text-base font-semibold text-gray-900 mb-2">Reset your password</h3>
              <p className="text-sm text-gray-600">
                Enter your email for a reset link.
              </p>
            </div>
            
            <form onSubmit={resetForm.handleSubmit(handlePasswordReset)} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="reset-email" className="text-sm font-medium text-gray-700">Email address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="you@example.com"
                    className="pl-10 h-10 border-gray-200 focus:border-gray-300 focus:ring-0 focus:outline-none rounded-lg"
                    {...resetForm.register("email")}
                  />
                </div>
                {resetForm.formState.errors.email && (
                  <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                    <div className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center">
                      <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                    </div>
                    {resetForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-copper-600 to-copper-700 hover:from-copper-700 hover:to-copper-800 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200" 
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sending reset email...
                  </div>
                ) : (
                  "Send Reset Email"
                )}
              </Button>
            </form>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Check your email</p>
                  <p>If an account with that email exists, you'll receive a password reset link within a few minutes.</p>
                </div>
              </div>
            </div>
          </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="px-4 sm:px-6 py-3 border-t bg-gray-50 text-center flex-shrink-0">
          <p className="text-xs text-gray-500">
            By continuing, you agree to CopperBear's{" "}
            <a href="/terms" className="text-copper-600 hover:text-copper-700 underline">
              Terms
            </a>{" "}
            and{" "}
            <a href="/privacy" className="text-copper-600 hover:text-copper-700 underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}