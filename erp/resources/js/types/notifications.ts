export interface NotificationRule {
    id: number;
    user_id: number;
    name: string;
    event_type: string;
    conditions: Record<string, unknown> | null;
    is_active: boolean;
    created_at: string;
}

export interface NotificationInbox {
    id: number;
    user_id: number;
    title: string;
    body: string | null;
    type: string;
    link: string | null;
    is_read: boolean;
    read_at: string | null;
    created_at: string;
}
