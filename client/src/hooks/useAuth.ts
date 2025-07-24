// DEPRECATED: Use useFirebaseAuth instead
// This hook is replaced by Firebase authentication
// Keeping for backwards compatibility during transition

import { useFirebaseAuth } from './useFirebaseAuth';

export function useAuth() {
  const { user, loading, isAuthenticated } = useFirebaseAuth();
  
  return {
    user: user ? {
      id: user.uid,
      firstName: user.displayName?.split(' ')[0] || 'User',
      lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
      email: user.email || '',
      profileImageUrl: user.photoURL || '',
      isAdmin: user.email === 'admin@copperbear.com'
    } : null,
    isLoading: loading,
    error: null,
    isAuthenticated,
    isAdmin: user?.email === 'admin@copperbear.com' || false,
  };
}
