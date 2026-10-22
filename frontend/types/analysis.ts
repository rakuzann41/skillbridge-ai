import type { SkillId, SkillLevel } from "@/lib/skills";
import type { ProfileInput } from "@/types/profile";

export type AnalysisResult = {
  analysis_id: string;
  analyzed_at: string;
  source_fetched_at: string | null;
  source_type: "csv_demo" | "live_api";
  is_demo: boolean;
  source_label: string;
  dataset_version: string;
  dataset_sha256: string;
  algorithm_version: string;
  extraction_version: string;
  sample_size: number;
  scorable_count: number;
  rows_examined: number;
  skipped_rows: number;
  profile_skills: ProfileInput["skills"];
  skill_demand: {
    skill_id: SkillId;
    skill_name: string;
    vacancy_count: number;
    percentage: number;
    user_level: SkillLevel;
  }[];
  strengths: SkillId[];
  developing_skills: SkillId[];
  missing_skills: SkillId[];
  matches: {
    job: {
      external_id: string;
      title: string;
      employer: string | null;
      location: string | null;
      experience?: string | null;
      description: string;
      published_at: string | null;
      url: string | null;
      source_type: "csv_demo" | "live_api";
      is_demo: boolean;
      skills: {
        skill_id: SkillId;
        skill_name: string;
        source_field: "structured_skills" | "description";
        matched_alias: string;
        requirement_status: "mentioned";
      }[];
    };
    score: number | null;
    recognized_skill_count: number;
    earned_credits: number;
    matching_skills: SkillId[];
    developing_skills: SkillId[];
    missing_skills: SkillId[];
    explanation: string;
  }[];
  warnings: string[];
  formula: string;
  score_meaning: string;
};
