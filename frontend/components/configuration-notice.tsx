import Link from "next/link";
import { Info } from "lucide-react";

export function ConfigurationNotice() {
  return (
    <div className="configuration-notice" role="status">
      <Info size={22} />
      <h2>Accounts are ready to connect.</h2>
      <p>
        The owner needs to connect the Supabase project before you can create an
        account or save your profile.
      </p>
      <Link className="text-link" href="/">
        Back to overview
      </Link>
    </div>
  );
}
