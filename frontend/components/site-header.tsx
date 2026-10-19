import Link from "next/link";
import { ArrowUpRight, Layers2 } from "lucide-react";
import { AccountNav } from "@/components/account-nav";

export function SiteHeader({ setup = false }: { setup?: boolean }) {
  return (
    <header className="site-header">
      <Link href="/" className="wordmark" aria-label="SkillBridge AI home">
        <span className="brand-symbol">
          <Layers2 size={22} strokeWidth={1.7} />
        </span>
        SkillBridge<span className="brand-ai">AI</span>
      </Link>
      <nav aria-label="Main navigation" className="main-nav">
        <Link href="/#how-it-works">How it works</Link>
        <Link href="/#learning-path">The learning path</Link>
      </nav>
      <div className="header-actions">
        {setup && (
          <Link className="header-link overview-link" href="/">
            Overview <ArrowUpRight size={16} />
          </Link>
        )}
        <AccountNav />
      </div>
    </header>
  );
}
