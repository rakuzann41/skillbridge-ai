import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  ChartNoAxesColumnIncreasing,
  FileSearch,
  Route,
  SlidersHorizontal,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";

const stages = [
  [
    "01",
    "Python fundamentals",
    "Build a foundation",
    "Variables, functions, and working with data.",
  ],
  [
    "02",
    "SQL & relational databases",
    "Ask better questions",
    "Query, join, and summarize structured data.",
  ],
  [
    "03",
    "Excel & data cleaning",
    "Make data usable",
    "Organize messy data and work with spreadsheets.",
  ],
  [
    "04",
    "pandas & exploration",
    "Find the story",
    "Explore datasets and investigate patterns.",
  ],
  [
    "05",
    "Visualization & Power BI",
    "Communicate clearly",
    "Turn your findings into useful visual explanations.",
  ],
  [
    "06",
    "A portfolio analysis",
    "Put it into practice",
    "Bring your skills together in one small project.",
  ],
];

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <section className="hero page-width" aria-labelledby="hero-heading">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="small-line" /> YOUR FIRST STEP INTO DATA
            </div>
            <h1 id="hero-heading">
              You have a goal.
              <br />
              Let’s find your
              <br />
              <span className="serif-accent">next step.</span>
            </h1>
            <p className="hero-description">
              A clearer path from the skills you have to the skills a Junior
              Data Analyst needs.
            </p>
            <div className="hero-actions">
              <Link href="/setup" className="button button-primary">
                Start with your skills <ArrowRight size={18} />
              </Link>
              <a className="text-link" href="#how-it-works">
                See how it works <ArrowUpRight size={16} />
              </a>
            </div>
            <p className="hero-note">
              One career path. A practical place to begin.
            </p>
          </div>

          <div
            className="path-preview"
            aria-label="Illustration of the skill-to-learning workflow"
          >
            <div className="preview-top">
              <span className="eyebrow">YOUR PATH, MADE CLEARER</span>
              <span className="preview-label">Illustrative preview</span>
            </div>
            <div className="preview-role">
              <span className="role-icon">
                <ChartNoAxesColumnIncreasing size={24} strokeWidth={1.5} />
              </span>
              <div>
                <span className="meta-label">THE GOAL</span>
                <h2>Junior Data Analyst</h2>
              </div>
              <ArrowUpRight size={20} className="muted" />
            </div>
            <div className="path-step">
              <div className="path-number">1</div>
              <div>
                <h3>Start where you are</h3>
                <p>Make your current skills visible.</p>
                <div className="skill-tags">
                  <span>Excel</span>
                  <span>Python</span>
                  <span>SQL</span>
                </div>
              </div>
            </div>
            <div className="path-step">
              <div className="path-number">2</div>
              <div>
                <h3>Understand what’s needed</h3>
                <p>Compare your skills with vacancy requirements.</p>
                <div className="requirement-line">
                  <FileSearch size={15} /> Job requirements → skill gaps
                </div>
              </div>
            </div>
            <div className="path-step last">
              <div className="path-number active">3</div>
              <div>
                <h3>Know what to learn next</h3>
                <p>Follow one practical learning roadmap.</p>
              </div>
            </div>
            <div className="preview-bottom">
              <Route size={17} />
              <span>A direction you can act on.</span>
              <ArrowRight size={16} />
            </div>
          </div>
        </section>

        <div className="principles-strip page-width">
          <span>BUILT AROUND YOUR NEXT STEP</span>
          <p>Focused on junior roles</p>
          <span className="strip-divider" />
          <p>Explainable by design</p>
          <span className="strip-divider" />
          <p>Learning with a purpose</p>
        </div>

        <section
          className="workflow-section section-space page-width"
          id="how-it-works"
          aria-labelledby="workflow-heading"
        >
          <div className="section-heading">
            <div>
              <p className="eyebrow">FROM UNCERTAINTY TO DIRECTION</p>
              <h2 id="workflow-heading">A little clarity goes a long way.</h2>
            </div>
            <p>
              Connect what you know
              <br className="desktop-break" /> with what to learn next.
            </p>
          </div>
          <div className="workflow-grid">
            <article className="workflow-item">
              <div className="workflow-top">
                <SlidersHorizontal size={23} strokeWidth={1.5} />
                <span>01</span>
              </div>
              <h3>Map your starting point</h3>
              <p>
                Tell us which skills you’ve explored and how confident you feel
                using them.
              </p>
              <Link href="/setup" className="text-link">
                Set up your profile <ArrowUpRight size={15} />
              </Link>
            </article>
            <article className="workflow-item">
              <div className="workflow-top">
                <FileSearch size={23} strokeWidth={1.5} />
                <span>02</span>
              </div>
              <h3>See the requirements</h3>
              <p>
                Compare against a small vacancy sample, with clear explanations
                of matching and missing skills.
              </p>
              <Link href="/analysis" className="text-link">
                Try the demo comparison <ArrowUpRight size={15} />
              </Link>
            </article>
            <article className="workflow-item">
              <div className="workflow-top">
                <Route size={23} strokeWidth={1.5} />
                <span>03</span>
              </div>
              <h3>Take a practical next step</h3>
              <p>
                Choose a skill to practice, guided by the gaps in your
                comparison.
              </p>
              <Link href="/roadmap" className="text-link">
                Open your roadmap <ArrowUpRight size={15} />
              </Link>
            </article>
          </div>
        </section>

        <section
          className="learning-section"
          id="learning-path"
          aria-labelledby="learning-heading"
        >
          <div className="learning-inner page-width">
            <div className="learning-intro">
              <p className="eyebrow">ONE ROLE. A FOCUSED FOUNDATION.</p>
              <h2 id="learning-heading">
                Less guesswork.
                <br />
                <span className="serif-accent">More direction.</span>
              </h2>
              <p>
                The Junior Data Analyst learning path brings the essentials into
                one readable sequence.
              </p>
              <p className="learning-note">
                Start with the fundamentals, practice on real questions, and
                bring the skills together in a small analysis project.
              </p>
              <span className="learning-caption">
                <BookOpen size={17} /> Learn. Practice. Build on it.
              </span>
            </div>
            <ol className="stage-list">
              {stages.map(([number, title, subtitle, description]) => (
                <li key={number}>
                  <span className="stage-number">{number}</span>
                  <div>
                    <h3>{title}</h3>
                    <p>{description}</p>
                  </div>
                  <span className="stage-subtitle">{subtitle}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="closing-section page-width">
          <div>
            <p className="eyebrow">YOU DON’T NEED TO KNOW EVERYTHING YET.</p>
            <h2>Start with what you know.</h2>
            <p>Take a moment to reflect on your skills. Build from there.</p>
          </div>
          <Link href="/setup" className="button button-primary">
            Explore your starting point <ArrowRight size={18} />
          </Link>
        </section>
      </main>
      <footer className="site-footer page-width">
        <span>SkillBridge AI</span>
        <p>A clearer path into data.</p>
        <span className="footer-status">
          Junior Data Analyst · Demo vacancy analysis
        </span>
      </footer>
    </>
  );
}
