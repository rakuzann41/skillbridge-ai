"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, Info, PencilLine } from "lucide-react";
import Link from "next/link";
import type { SupabaseClient } from "@supabase/supabase-js";
import { levels, skills, type SkillId, type SkillLevel } from "@/lib/skills";
import { saveProfile } from "@/lib/api";
import type { Profile, ProfileInput } from "@/types/profile";

type SkillValues = Record<SkillId, SkillLevel>;
const groups = [...new Set(skills.map((skill) => skill.group))];

export function ProfileForm({ initialProfile, client }: { initialProfile: Profile; client: SupabaseClient }) {
  const [values, setValues] = useState<SkillValues>(() =>
    Object.fromEntries(skills.map((skill) => [
      skill.id,
      initialProfile.skills.find((saved) => saved.skill_id === skill.id)?.level || "not-yet",
    ])) as SkillValues,
  );
  const [displayName, setDisplayName] = useState(initialProfile.display_name);
  const [education, setEducation] = useState(initialProfile.education);
  const [experience, setExperience] = useState(initialProfile.experience);
  const [review, setReview] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const selected = skills.filter((skill) => values[skill.id] !== "not-yet");

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  function changed() {
    setDirty(true);
    setSaved(false);
    setError("");
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setReview(true);
    requestAnimationFrame(() => heading.current?.focus());
  }
  async function save() {
    if (busy) return;
    setBusy(true);
    setError("");
    setSaved(false);
    const profile: ProfileInput = {
      display_name: displayName,
      education,
      experience,
      target_role: "Junior Data Analyst",
      skills: skills.map((skill) => ({ skill_id: skill.id, level: values[skill.id] })),
    };
    try {
      const result = await saveProfile(client, profile);
      setDisplayName(result.display_name);
      setEducation(result.education);
      setExperience(result.experience);
      setDirty(false);
      setSaved(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Your profile could not be saved. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="setup-grid">
      <aside className="setup-aside">
        <p className="eyebrow">YOUR STARTING POINT</p>
        <h1>A little about <br /><span className="serif-accent">what you know.</span></h1>
        <p>You don’t need to be an expert. An honest starting point is all you need.</p>
        <div className="target-role">
          <span className="meta-label">YOUR TARGET ROLE</span>
          <strong>Junior Data Analyst</strong>
          <span>One focused path, from the beginning.</span>
        </div>
        <div className="preview-notice">
          <Info size={18} />
          <p><strong>Your profile, saved to your account</strong>Review and save when you’re ready. You can return later and update your skills. Confidence is self-reported.</p>
        </div>
        {dirty && <p className="draft-status" role="status">You have unsaved changes.</p>}
        {!dirty && (saved || initialProfile.updated_at) && (
          <Link className="button button-outline profile-analysis-link" href="/analysis">
            Try demo skill analysis <ArrowRight size={17} />
          </Link>
        )}
      </aside>
      <section className="skill-form-panel" aria-labelledby="skills-heading">
        {review ? (
          <>
            <div className="form-heading">
              <span className="eyebrow">YOUR SKILL SNAPSHOT</span>
              <h2 id="skills-heading" tabIndex={-1} ref={heading}>Here’s your starting point.</h2>
              <p>Check your details, then save them to your account.</p>
            </div>
            <dl className="profile-review">
              <div><dt>Display name</dt><dd>{displayName.trim() || "Not added"}</dd></div>
              <div><dt>Education</dt><dd>{education.trim() || "Not added"}</dd></div>
              <div><dt>Experience</dt><dd>{experience.trim() || "Not added"}</dd></div>
            </dl>
            {selected.length ? (
              <ul className="review-list">
                {selected.map((skill) => (
                  <li key={skill.id}>
                    <span>{skill.name}</span>
                    <span className="skill-level">{levels.find((level) => level.value === values[skill.id])?.label}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="empty-skills">Starting from scratch is welcome. All skills are marked “Not yet.”</p>
            )}
            <div className="review-next">
              <h3>A foundation to build on.</h3>
              <p>Save your profile to compare your skills with vacancy requirements and find a practical learning priority.</p>
            </div>
            {error && <p className="form-error" role="alert">{error}</p>}
            {saved && <p className="save-success" role="status">Profile and skills saved. They’ll be here when you return.</p>}
            <div className="review-actions">
              <button className="button button-outline" disabled={busy} onClick={() => setReview(false)}>
                <ArrowLeft size={17} /> Edit profile
              </button>
              <button className="button button-primary" disabled={busy || saved} onClick={save}>
                {busy ? "Saving…" : saved ? "Saved" : "Save profile & skills"} <ArrowRight size={17} />
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={submit}>
            <div className="form-heading">
              <span className="eyebrow">YOUR PROFILE & SKILLS</span>
              <h2 id="skills-heading">Let’s map your starting point.</h2>
              <p>Share a little context, then choose how familiar each skill feels.</p>
            </div>
            <fieldset className="profile-fields" disabled={busy}>
              <legend>About you</legend>
              <label htmlFor="display-name">Display name <span>(optional)</span></label>
              <input id="display-name" name="display_name" autoComplete="nickname" maxLength={80} value={displayName} onChange={(event) => { setDisplayName(event.target.value); changed(); }} />
              <label htmlFor="education">Education <span>(optional)</span></label>
              <input id="education" name="education" maxLength={200} value={education} placeholder="For example, studying economics" onChange={(event) => { setEducation(event.target.value); changed(); }} />
              <label htmlFor="experience">Experience <span>(optional)</span></label>
              <textarea id="experience" name="experience" rows={3} maxLength={500} value={experience} placeholder="A course, internship, or small project you’ve tried" onChange={(event) => { setExperience(event.target.value); changed(); }} />
            </fieldset>
            <div className="level-guide">
              <PencilLine size={17} />
              <p><strong>Learning:</strong> you’ve tried the basics. <strong>Comfortable:</strong> you can use it independently. Leave anything new as “Not yet.”</p>
            </div>
            {groups.map((group) => (
              <fieldset className="skill-group" key={group}>
                <legend>{group}</legend>
                {skills.filter((skill) => skill.group === group).map((skill) => (
                  <div className="skill-row" key={skill.id}>
                    <div><label htmlFor={skill.id}>{skill.name}</label><p id={`${skill.id}-description`}>{skill.description}</p></div>
                    <select id={skill.id} name={skill.id} aria-describedby={`${skill.id}-description`} value={values[skill.id]} onChange={(event) => { setValues({ ...values, [skill.id]: event.target.value as SkillLevel }); changed(); }}>
                      {levels.map((level) => <option key={level.value} value={level.value}>{level.label}</option>)}
                    </select>
                  </div>
                ))}
              </fieldset>
            ))}
            <div className="form-bottom">
              <span aria-live="polite">{selected.length} of {skills.length} skills explored</span>
              <button className="button button-primary" type="submit">Review your profile <ArrowRight size={17} /></button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
