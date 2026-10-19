import type { SkillId, SkillLevel } from "@/lib/skills";

export type ProfileInput = {
  display_name: string;
  education: string;
  experience: string;
  target_role: "Junior Data Analyst";
  skills: { skill_id: SkillId; level: SkillLevel }[];
};
export type Profile = ProfileInput & { updated_at: string | null };
