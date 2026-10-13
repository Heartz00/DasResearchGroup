import Link from 'next/link';
import { requireAdmin } from '@/lib/admin/auth';
export default async function HelpPage() {
  await requireAdmin();
  return (
    <section className="editor-card">
      <h2>Editing your lab website</h2>
      <p>
        You manage the content. The website handles its layout, cards, colours
        and responsive design.
      </p>
      <h3>Make a change</h3>
      <ol>
        <li>Choose the person, paper or section you want to update.</li>
        <li>Fill in the labeled fields and choose or upload a photo.</li>
        <li>Use Preview content to review your text.</li>
        <li>
          Save a draft while you work, or choose Published when it is ready.
        </li>
        <li>
          Look for the save confirmation, then check the website after its
          automatic refresh.
        </li>
      </ol>
      <h3>Keep your content accurate</h3>
      <p>
        Use verified bios, citations, equipment descriptions and dates. Leave an
        openings notice empty unless the PI confirms it.
      </p>
      <h3>Recover an earlier version</h3>
      <p>
        Open Version history, review a saved version and restore its text. The
        current photo and visibility remain in place. History availability
        depends on your editing access and the content service.
      </p>
      <h3>Need help?</h3>
      <p>
        Ask the website manager about access or a missing field. New website
        sections and changes to the design need a developer; routine content
        changes do not.
      </p>
      <div className="admin-template-links">
        <Link className="text-link" href="/admin/manage/profile">
          Edit PI information →
        </Link>
        <Link className="text-link" href="/admin/manage/people">
          Manage team members →
        </Link>
        <Link className="text-link" href="/admin/manage/updates">
          Manage lab updates →
        </Link>
      </div>
    </section>
  );
}
