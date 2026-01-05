export interface PageProps {
  user: {
    id: string | number;
    role?: string;
    name?: string;
    email?: string;
    source?: string;
    plan?: string;
    otp: string | null
    otp_expiry: string | null
    otp_count: number | null
    status: string
    first_login: boolean | string | number
    email_verified_at: string
    plan_type: string
    created_at: string
    updated_at: string
    provider_id: string | null
    provider_name: string | null
    dark_mode: number
    language: string
    push_notifications: number
    email_updates: number
    trial_ends_at: string
    is_verified?: boolean
    set_password?: string | boolean
    profile?: {
      cvs_count?: number;
    };
  } | null;
}
