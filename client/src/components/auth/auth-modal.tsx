import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { signInWithEmail, signUpWithEmail, signInWithGoogle, resetPassword } from "@/lib/firebase";
import { Mail, Lock, User, Eye, EyeOff, Zap } from "lucide-react";
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-copper-600 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            {activeTab === "signin" && "Sign in to CopperBear"}
            {activeTab === "signup" && "Create your account"}
            {activeTab === "reset" && "Reset your password"}
          </DialogTitle>
        </DialogHeader>

        {activeTab !== "reset" ? (
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "signin" | "signup")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Create Account</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="space-y-4">
              <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="Enter your email"
                      className="pl-10"
                      {...signInForm.register("email")}
                    />
                  </div>
                  {signInForm.formState.errors.email && (
                    <p className="text-sm text-red-600">{signInForm.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signin-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      className="pl-10 pr-10"
                      {...signInForm.register("password")}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {signInForm.formState.errors.password && (
                    <p className="text-sm text-red-600">{signInForm.formState.errors.password.message}</p>
                  )}
                </div>

                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="link"
                    className="text-sm text-copper-600 hover:text-copper-700 p-0"
                    onClick={() => setActiveTab("reset")}
                  >
                    Forgot your password?
                  </Button>
                </div>

                <Button type="submit" className="w-full bg-copper-600 hover:bg-copper-700" disabled={loading}>
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4">
              <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="firstName"
                        placeholder="First name"
                        className="pl-10"
                        {...signUpForm.register("firstName")}
                      />
                    </div>
                    {signUpForm.formState.errors.firstName && (
                      <p className="text-sm text-red-600">{signUpForm.formState.errors.firstName.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      placeholder="Last name"
                      {...signUpForm.register("lastName")}
                    />
                    {signUpForm.formState.errors.lastName && (
                      <p className="text-sm text-red-600">{signUpForm.formState.errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      className="pl-10"
                      {...signUpForm.register("email")}
                    />
                  </div>
                  {signUpForm.formState.errors.email && (
                    <p className="text-sm text-red-600">{signUpForm.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      className="pl-10 pr-10"
                      {...signUpForm.register("password")}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {signUpForm.formState.errors.password && (
                    <p className="text-sm text-red-600">{signUpForm.formState.errors.password.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      className="pl-10"
                      {...signUpForm.register("confirmPassword")}
                    />
                  </div>
                  {signUpForm.formState.errors.confirmPassword && (
                    <p className="text-sm text-red-600">{signUpForm.formState.errors.confirmPassword.message}</p>
                  )}
                </div>

                <Button type="submit" className="w-full bg-copper-600 hover:bg-copper-700" disabled={loading}>
                  {loading ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              <FcGoogle className="mr-2 h-4 w-4" />
              Google
            </Button>
          </Tabs>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Enter your email address and we'll send you a link to reset your password.
            </p>
            <form onSubmit={resetForm.handleSubmit(handlePasswordReset)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10"
                    {...resetForm.register("email")}
                  />
                </div>
                {resetForm.formState.errors.email && (
                  <p className="text-sm text-red-600">{resetForm.formState.errors.email.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full bg-copper-600 hover:bg-copper-700" disabled={loading}>
                {loading ? "Sending..." : "Send Reset Email"}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setActiveTab("signin")}
              >
                Back to Sign In
              </Button>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}