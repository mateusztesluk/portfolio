export interface Monitor {
    id: number;
    name: string;
    url: string;
    status: string;
    last_status_code: number | null;
    response_time_ms: number | null;
    last_checked_at: string | null;
    error_message: string | null;
    created_at: string;
    updated_at: string;
}

export interface CreateMonitorPayload {
    name: string;
    url: string;
}
