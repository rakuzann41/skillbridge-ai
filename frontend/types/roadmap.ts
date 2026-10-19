import type { ProfileInput } from "@/types/profile";

export type Roadmap = {
  id: string;
  target_role: "Junior Data Analyst";
  template_version: "junior-da-v1";
  created_at: string;
  updated_at: string;
  source_analysis_id: string | null;
  source_type: "csv_demo" | "live_api" | null;
  analyzed_at: string | null;
  profile_skills: ProfileInput["skills"];
  completed_count: number;
  total_count: number;
  progress_percentage: number;
  next_item_id: string | null;
  items: {
    id: string;
    stage_key: string;
    position: number;
    title: string;
    description: string;
    outcome: string;
    completed: boolean;
    completed_at: string | null;
    focus_skills: string[];
    resources: { label: string; url: string; note: string }[];
  }[];
};
