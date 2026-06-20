export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
    avatar: string | null;
    initials: string;
    roles: string[];
    permissions: string[];
    tenant_id?: number | null;
}

export interface Tenant {
    id: number;
    name: string;
    slug: string;
}

export interface Breadcrumb {
    label: string;
    href?: string;
}

export interface Flash {
    success?: string | null;
    error?: string | null;
}

export interface ZiggyConfig {
    location: string;
    [key: string]: unknown;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User | null;
        tenant: Tenant | null;
    };
    ziggy: ZiggyConfig;
    flash: Flash;
    breadcrumbs?: Breadcrumb[];
};
