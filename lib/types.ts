export type Plan = "starter" | "pro";

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
  plan: Plan;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  role: "owner" | "admin" | "member";
  created_at: string;
}

export interface Lead {
  id: string;
  workspace_id: string;
  property_id: string | null;
  owner_id: string | null;
  pipeline_stage: string;
  title: string | null;
  notes: string | null;
  score: number | null;
  breakdown_json: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface Owner {
  id: string;
  workspace_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company_number: string | null;
  consent_status: "unknown" | "consented" | "opted_out";
  created_at: string;
  updated_at: string;
}

export interface Property {
  id: string;
  workspace_id: string;
  address_line_1: string;
  address_line_2: string | null;
  city: string | null;
  postcode: string;
  created_at: string;
  updated_at: string;
}

export interface LandlordSubmission {
  id: string;
  public_token: string;
  address_line_1: string;
  address_line_2: string | null;
  city: string | null;
  postcode: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export const DAILY_LIMITS: Record<Plan, number> = {
  starter: 25,
  pro: 200,
};
