export interface AuditLog {
    id: number;
    tenant_id: number | null;
    user_id: number | null;
    event: string;
    auditable_type: string | null;
    auditable_id: number | null;
    old_values: Record<string, unknown> | null;
    new_values: Record<string, unknown> | null;
    ip_address: string | null;
    user_agent: string | null;
    created_at: string;
    user?: { id: number; name: string } | null;
}
