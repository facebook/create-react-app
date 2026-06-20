import { usePage } from '@inertiajs/react';
import type { PageProps, User } from '@/types';

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
}

export function useAuth(): AuthState {
    const { auth } = usePage<PageProps>().props;

    return {
        user: auth.user,
        isAuthenticated: auth.user !== null,
    };
}
