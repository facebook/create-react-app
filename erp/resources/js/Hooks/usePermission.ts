import { useAuth } from '@/Hooks/useAuth';

interface PermissionState {
    hasRole: (role: string) => boolean;
    hasAnyRole: (roles: string[]) => boolean;
    can: (permission: string) => boolean;
    canAny: (permissions: string[]) => boolean;
}

export function usePermission(): PermissionState {
    const { user } = useAuth();

    const hasRole = (role: string): boolean =>
        user?.roles.includes(role) ?? false;

    const hasAnyRole = (roles: string[]): boolean =>
        roles.some((role) => hasRole(role));

    const can = (permission: string): boolean =>
        user?.permissions.includes(permission) ?? false;

    const canAny = (permissions: string[]): boolean =>
        permissions.some((perm) => can(perm));

    return { hasRole, hasAnyRole, can, canAny };
}
