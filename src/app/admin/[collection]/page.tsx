import Link from 'next/link';
import Image from 'next/image';
import { safeUrl } from '@/lib/wordpress/adapters';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/admin/auth';
import { wp } from '@/lib/admin/wordpress';
import { collection, rawTitle, type WPRecord } from '@/lib/admin/records';
export default async function CollectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ collection: string }>;
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const { session } = await requireAdmin();
  const value = (await params).collection;
  let kind;
  try {
    kind = collection(value);
  } catch {
    notFound();
  }
  const query = await searchParams;
  const page = Math.max(1, Math.min(10000, Number(query.page) || 1));
  const search = (query.search || '').slice(0, 200);
  let records: WPRecord[] = [],
    pages = 1,
    error = '';
  try {
    const result = await wp<WPRecord[]>(
      `${kind}?context=edit&per_page=30&page=${page}&search=${encodeURIComponent(search)}`,
      session,
    );
    records = result.data;
    pages = result.pages;
  } catch (e) {
    error = e instanceof Error ? e.message : 'Content could not be loaded.';
  }
  const href = (next: number) =>
    `/admin/${kind}?page=${next}&search=${encodeURIComponent(search)}`;
  return (
    <>
      {kind !== 'media' && (
        <nav className="admin-tabs" aria-label="Workspace navigation">
          <Link prefetch={false} href="/admin">
            Workspace
          </Link>
          {['pages', 'posts', 'media', 'categories', 'tags'].map((c) => (
            <Link
              prefetch={false}
              key={c}
              aria-current={kind === c ? 'page' : undefined}
              href={`/admin/${c}`}
            >
              {c}
            </Link>
          ))}
        </nav>
      )}
      <div className="admin-toolbar">
        <h2>
          {kind === 'media'
            ? 'Your photo library'
            : kind.charAt(0).toUpperCase() + kind.slice(1)}
        </h2>
        <Link
          prefetch={false}
          className="button button-red"
          href={`/admin/${kind}/new`}
        >
          {kind === 'media' ? 'Upload a photo' : 'Create draft / record'}
        </Link>
      </div>
      <form className="admin-search">
        <label htmlFor="content-search">
          Search {kind === 'media' ? 'photos' : kind}
        </label>
        <input
          id="content-search"
          name="search"
          defaultValue={search}
          maxLength={200}
        />
        <button className="button button-dark">Search</button>
      </form>
      {error ? (
        <p role="alert" className="admin-error">
          {error}
        </p>
      ) : records.length ? (
        <div
          className={kind === 'media' ? 'admin-photo-library' : 'admin-records'}
        >
          {records.map((record) => (
            <article key={record.id}>
              {kind === 'media' &&
                record.source_url &&
                safeUrl(record.source_url) && (
                  <Link
                    prefetch={false}
                    href={`/admin/media/${record.id}`}
                    aria-label={`Edit photo: ${rawTitle(record)}`}
                  >
                    <Image
                      unoptimized
                      src={safeUrl(record.source_url)!}
                      width={320}
                      height={220}
                      alt={record.alt_text || ''}
                    />
                  </Link>
                )}
              <div>
                <h3>
                  <Link prefetch={false} href={`/admin/${kind}/${record.id}`}>
                    {rawTitle(record)}
                  </Link>
                </h3>
                {kind !== 'media' && (
                  <p>
                    ID {record.id} · {record.status || kind}{' '}
                    {record.slug && `· ${record.slug}`}
                  </p>
                )}
              </div>
              <Link
                prefetch={false}
                className="text-link"
                href={`/admin/${kind}/${record.id}`}
                aria-label={`Edit ${rawTitle(record)}`}
              >
                Edit →
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h3>No matching records</h3>
          <p>Try another search or create a record using the action above.</p>
        </div>
      )}
      <nav className="admin-pagination" aria-label="Content pagination">
        {page > 1 && (
          <Link prefetch={false} className="text-link" href={href(page - 1)}>
            ← Previous
          </Link>
        )}
        <span>
          Page {page} of {pages}
        </span>
        {page < pages && (
          <Link prefetch={false} className="text-link" href={href(page + 1)}>
            Next →
          </Link>
        )}
      </nav>
    </>
  );
}
