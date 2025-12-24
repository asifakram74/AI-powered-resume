export interface PageProps {
  user: {
    id: string | number;
    role?: string;
    name?: string;
    email?: string;
    source?: string;
    plan?: string;
    profile?: {
      cvs_count?: number;
    };
  } | null;
}
