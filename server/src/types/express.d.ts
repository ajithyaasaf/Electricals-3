// Extend Express Request type to include user property added by Firebase authentication middleware
declare namespace Express {
    export interface Request {
        user?: {
            uid: string;
            email?: string;
            emailVerified?: boolean;
            displayName?: string;
            photoURL?: string;
        };
    }
}
