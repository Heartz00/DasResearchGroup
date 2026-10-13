import Link from 'next/link';
import { requireAdmin } from '@/lib/admin/auth';
import { contentModels } from '@/lib/admin/content-model';
export default async function Dashboard() {
  const { user } = await requireAdmin();
  return (
    <>
      <div className="admin-welcome">
        <p className="eyebrow">Content, kept simple</p>
        <h2>Welcome, {user.name.split(' ')[0]}.</h2>
        <p>
          Update the people, science and stories on your lab website. The design
          is already taken care of.
        </p>
      </div>
      <section className="editor-card">
        <h3>What would you like to do?</h3>
        <div className="admin-quick-actions">
          <Link className="button button-red" href="/admin/manage/profile">
            Edit PI information
          </Link>
          <Link
            className="button button-dark"
            href="/admin/manage/people?item=new"
          >
            Add a team member
          </Link>
          <Link
            className="button button-dark"
            href="/admin/manage/updates?item=new"
          >
            Write a lab update
          </Link>
          <Link
            className="text-link"
            href="/admin/manage/publications?item=new"
          >
            Add a publication →
          </Link>
        </div>
      </section>
      <div className="admin-task-grid">
        <Link className="admin-task-card" href="/admin/headers">
          <h3>Page header images</h3>
          <p>
            Upload or select backgrounds for Research, Publications, Group News
            and Instruments.
          </p>
          <span className="text-link">Edit headers →</span>
        </Link>
        {Object.entries(contentModels)
          .filter(([key]) => !key.endsWith('-header'))
          .map(([key, model]) => (
            <Link
              key={key}
              className="admin-task-card"
              href={`/admin/manage/${key}`}
            >
              <h3>{model.label}</h3>
              <p>
                {key === 'profile'
                  ? 'Biography, education, contact details and portrait.'
                  : key === 'people'
                    ? 'Member bios, photos, research interests and alumni.'
                    : key === 'updates'
                      ? 'News, awards, conferences and group milestones.'
                      : key === 'publications'
                        ? 'Individual papers, citations and graphical abstracts.'
                        : key === 'homepage'
                          ? 'Headlines, introductory text and main links.'
                          : key === 'photos'
                            ? 'Gallery images, captions and credits.'
                            : 'Keep this information accurate and up to date.'}
              </p>
              <span className="text-link">Manage content →</span>
            </Link>
          ))}
      </div>
      <section className="content-section">
        <h3>Your editing workspace</h3>
        <p>
          Save drafts while you work. Published updates refresh automatically,
          and your existing content stays in the backend.
        </p>
        <Link className="text-link" href="/admin/access">
          Manage editing access →
        </Link>
      </section>
    </>
  );
}
