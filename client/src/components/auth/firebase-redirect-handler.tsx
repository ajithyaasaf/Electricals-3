import { useEffect } from 'react';
import { getRedirectResult, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

export function FirebaseRedirectHandler() {
  const { toast } = useToast();

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          // User successfully signed in
          const credential = GoogleAuthProvider.credentialFromResult(result);
          const user = result.user;
          
          toast({
            title: "Welcome!",
            description: `Successfully signed in as ${user.displayName || user.email}`,
          });
        }
      } catch (error: any) {
        console.error('Firebase redirect error:', error);
        if (error.code === 'auth/unauthorized-domain') {
          toast({
            title: "Domain Authorization Required",
            description: "Please add this domain to Firebase authorized domains in the console.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Sign-in Error",
            description: error.message || "Failed to sign in. Please try again.",
            variant: "destructive",
          });
        }
      }
    };

    handleRedirect();
  }, [toast]);

  return null; // This component doesn't render anything
}