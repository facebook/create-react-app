export interface AuditLog {
    id: number;
    tenant_id: number;
    user_id: number | null;
    action: string;
    auditable_type: string | null;
    auditable_id: number | null;
    auditable_label: string | null;
    old_values: Record<string, unknown> | null;
    new_values: Record<string, unknown> | null;
    ip_address: string | null;
    user_agent: string | null;
    url: string | null;
    module: string | null;
    change_summary: string;
    created_at: string;
    user?: { id: number; name: string; email: string };
}
