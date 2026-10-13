import Link from 'next/link';
import { requireAdmin } from '@/lib/admin/auth';
import { headerSections } from '@/lib/content/page-headers';

export default async function HeaderImages() {
  await requireAdmin();
  return (
    <>
      <p className="eyebrow">Site settings</p>
      <h2>Page header images</h2>
      <p>
        Choose an existing photo or upload a JPEG, PNG or WebP under 3 MB.
        Select a readable text style, then save as Published to update the
        website. Header photos are separate from group-gallery photos.
      </p>
      <div className="admin-task-grid">
        {headerSections.map((section) => (
          <Link
            key={section}
            className="admin-task-card"
            href={`/admin/manage/${section}-header`}
          >
            <h3>
              {section === 'facilities'
                ? 'Instruments'
                : section === 'news'
                  ? 'Group News'
                  : section[0].toUpperCase() + section.slice(1)}{' '}
              header
            </h3>
            <p>Change the background photo and optional header text.</p>
            <span className="text-link">Edit header →</span>
          </Link>
        ))}
      </div>
      <p className="collection-note">
        The Team header is managed in{' '}
        <Link href="/admin/manage/photos">Gallery</Link> using the Team Header
        setting.
      </p>
    </>
  );
}
