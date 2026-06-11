import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { onAuthStateChanged, isAdmin, auth } from '../firebase/auth';

interface AuthState {
    user: User | null;
    isAdmin: boolean;
    loading: boolean;
}

export const useAuth = (): AuthState => {
    const [state, setState] = useState<AuthState>({
        user: null,
        isAdmin: false,
        loading: true,
    });

    useEffect(() => {
        // Safety timeout: if Firebase never fires (bad config / network), stop spinning
        const timeout = setTimeout(() => {
            setState((prev) => (prev.loading ? { user: null, isAdmin: false, loading: false } : prev));
        }, 5000);

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            clearTimeout(timeout);
            if (user) {
                try {
                    const adminStatus = await isAdmin(user);
                    setState({ user, isAdmin: adminStatus, loading: false });
                } catch {
                    setState({ user: null, isAdmin: false, loading: false });
                }
            } else {
                setState({ user: null, isAdmin: false, loading: false });
            }
        });

        return () => {
            clearTimeout(timeout);
            unsubscribe();
        };
    }, []);

    return state;
};
