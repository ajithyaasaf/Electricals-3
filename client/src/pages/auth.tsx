import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { signInWithEmail, signUpWithEmail, signInWithGoogle, resetPassword } from "@/lib/firebase";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import { Link } from "wouter";
import { FcGoogle } from "react-icons/fc";

const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signUpSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type SignInForm = z.infer<typeof signInSchema>;
type SignUpForm = z.infer<typeof signUpSchema>;
type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

const getErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case "auth/user-not-found":
      return "No account found with this email address.";
    case "auth/wrong-password":
      return "Incorrect password. Please try again.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/user-disabled":
      return "This account has been disabled.";
    case "auth/too-many-requests":
      return "Too many failed attempts. Please try again later.";
    case "auth/invalid-credential":
      return "Invalid email or password. Please check your credentials.";
    case "auth/email-already-in-use":
      return "An account with this email already exists.";
    case "auth/weak-password":
      return "Password is too weak. Please choose a stronger password.";
    default:
      return "An error occurred. Please try again.";
  }
};

export default function Auth() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, loading: authLoading } = useFirebaseAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const signInForm = useForm<SignInForm>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const signUpForm = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { firstName: "", lastName: "", email: "", password: "" },
  });

  const forgotPasswordForm = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      setLocation("/");
    }
  }, [isAuthenticated, authLoading, setLocation]);

  const handleSignIn = async (data: SignInForm) => {
    setLoading(true);
    try {
      await signInWithEmail(data.email, data.password);
      toast({
        title: "Welcome back!",
        description: "You've successfully signed in to your account.",
      });
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

  const handleForgotPassword = async (data: ForgotPasswordForm) => {
    setLoading(true);
    try {
      await resetPassword(data.email);
      toast({
        title: "Password reset email sent!",
        description: "Please check your email for password reset instructions.",
      });
      setIsForgotPassword(false);
      forgotPasswordForm.reset();
    } catch (error: any) {
      toast({
        title: "Password reset failed",
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
    } catch (error: any) {
      if (error.message === "DOMAIN_NOT_AUTHORIZED") {
        toast({
          title: "Domain Authorization Required",
          description: "Please add this domain to Firebase authorized domains.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Google sign-in failed",
          description: "Please try again or use email/password sign-in.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const resetToSignIn = () => {
    setIsForgotPassword(false);
    setIsSignUp(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-copper-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Back to Home Button */}
        <div className="mb-6">
          <Link href="/" data-testid="link-back-home">
            <Button 
              variant="ghost" 
              className="p-0 h-auto text-copper-600 hover:text-copper-700"
              data-testid="button-back-home"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Main Container */}
        <div className={`auth-container ${isSignUp ? 'active' : ''} ${isForgotPassword ? 'forgot-mode' : ''}`}>
          {/* Sign Up Form */}
          <div className="form-container sign-up">
            <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="auth-form">
              <h1 className="text-3xl font-bold text-gray-800 mb-6">Create Account</h1>
              
              {/* Social Icons */}
              <div className="social-icons">
                <Button
                  type="button"
                  variant="outline"
                  className="social-icon"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  data-testid="button-google-signup"
                >
                  <FcGoogle className="w-4 h-4" />
                </Button>
              </div>
              
              <span className="text-sm text-gray-600 mb-4 block">or use your email for registration</span>
              
              <div className="space-y-3 w-full">
                <Input
                  {...signUpForm.register("firstName")}
                  placeholder="Name"
                  className="auth-input"
                  data-testid="input-first-name"
                />
                <Input
                  {...signUpForm.register("email")}
                  type="email"
                  placeholder="Email"
                  className="auth-input"
                  data-testid="input-signup-email"
                />
                <div className="relative">
                  <Input
                    {...signUpForm.register("password")}
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    className="auth-input pr-10"
                    data-testid="input-signup-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowPassword(!showPassword)}
                    data-testid="button-toggle-signup-password"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </form>
          </div>

          {/* Sign In Form */}
          <div className="form-container sign-in">
            <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="auth-form">
              <h1 className="text-3xl font-bold text-gray-800 mb-6">Sign In</h1>
              
              {/* Social Icons */}
              <div className="social-icons">
                <Button
                  type="button"
                  variant="outline"
                  className="social-icon"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  data-testid="button-google-signin"
                >
                  <FcGoogle className="w-4 h-4" />
                </Button>
              </div>
              
              <span className="text-sm text-gray-600 mb-4 block">or use your email password</span>
              
              <div className="space-y-3 w-full">
                <Input
                  {...signInForm.register("email")}
                  type="email"
                  placeholder="Email"
                  className="auth-input"
                  data-testid="input-signin-email"
                />
                <div className="relative">
                  <Input
                    {...signInForm.register("password")}
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    className="auth-input pr-10"
                    data-testid="input-signin-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowPassword(!showPassword)}
                    data-testid="button-toggle-signin-password"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              <Button 
                variant="link" 
                className="text-sm text-gray-600 hover:text-gray-700 mt-3 mb-2 p-0 h-auto"
                onClick={() => setIsForgotPassword(true)}
                type="button"
                data-testid="button-forgot-password"
              >
                Forgot Your Password?
              </Button>
            </form>
          </div>

          {/* Forgot Password Form */}
          <div className="form-container forgot-password">
            <form onSubmit={forgotPasswordForm.handleSubmit(handleForgotPassword)} className="auth-form">
              <h1 className="text-3xl font-bold text-gray-800 mb-6">Reset Password</h1>
              
              <p className="text-sm text-gray-600 mb-6 text-center">
                Enter your email address and we'll send you a link to reset your password.
              </p>
              
              <div className="space-y-4 w-full">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    {...forgotPasswordForm.register("email")}
                    type="email"
                    placeholder="Email"
                    className="auth-input pl-10"
                    data-testid="input-forgot-email"
                  />
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="auth-button"
                disabled={loading}
                data-testid="button-reset-password-submit"
              >
                {loading ? "Sending Reset Email..." : "SEND RESET EMAIL"}
              </Button>

              <Button 
                variant="link" 
                className="text-sm text-gray-600 hover:text-gray-700 mt-3 p-0 h-auto"
                onClick={resetToSignIn}
                type="button"
                data-testid="button-back-to-signin"
              >
                Back to Sign In
              </Button>
            </form>
          </div>

          {/* Toggle Container */}
          <div className="toggle-container">
            <div className="toggle">
              <div className="toggle-panel toggle-left">
                <h1>Welcome Back!</h1>
                <p>
                  Enter your personal details to access all CopperBear features
                </p>
                <Button 
                  variant="outline" 
                  className="toggle-button"
                  onClick={() => setIsSignUp(false)}
                  data-testid="button-switch-signin"
                >
                  Sign In
                </Button>
                <Button 
                  type="submit" 
                  className="toggle-button auth-submit-button"
                  onClick={(e) => {
                    e.preventDefault();
                    signUpForm.handleSubmit(handleSignUp)();
                  }}
                  disabled={loading}
                  data-testid="button-signup-submit"
                >
                  {loading ? "Creating Account..." : "SIGN UP"}
                </Button>
              </div>
              <div className="toggle-panel toggle-right">
                <h1>Hello, Friend!</h1>
                <p>
                  Register with your personal details to access all CopperBear features
                </p>
                <Button 
                  variant="outline" 
                  className="toggle-button"
                  onClick={() => setIsSignUp(true)}
                  data-testid="button-switch-signup"
                >
                  Sign Up
                </Button>
                <Button 
                  type="submit" 
                  className="toggle-button auth-submit-button"
                  onClick={(e) => {
                    e.preventDefault();
                    signInForm.handleSubmit(handleSignIn)();
                  }}
                  disabled={loading}
                  data-testid="button-signin-submit"
                >
                  {loading ? "Signing In..." : "SIGN IN"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}