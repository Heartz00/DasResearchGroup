import Link from 'next/link';
import { requireAdmin } from '@/lib/admin/auth';
import { wp, adminSite, type WPUser } from '@/lib/admin/wordpress';
import { canManageAccess, editableAccount } from '@/lib/admin/access';
import { AccessForm, NewAccountForm } from '@/components/admin/access-forms';
export default async function AccessPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>;
}) {
  const { session, user } = await requireAdmin();
  const query = await searchParams,
    search = (query.search || '').slice(0, 200),
    page = Math.max(1, Math.floor(Number(query.page) || 1));
  let users: WPUser[] = [],
    pages = 1,
    error = '';
  if (user.capabilities.list_users)
    try {
      const result = await wp<WPUser[]>(
        `users?context=edit&per_page=30&page=${page}&search=${encodeURIComponent(search)}`,
        session,
      );
      users = result.data;
      pages = result.pages;
    } catch (e) {
      error = e instanceof Error ? e.message : 'Accounts could not be loaded.';
    }
  return (
    <>
      <Link prefetch={false} className="text-link" href="/admin">
        ← Workspace
      </Link>
      <h2>Team access</h2>
      <p className="collection-note">
        Give each editor their own account and access level. Changes update
        account permissions, including its dashboard. These are standard role
        descriptions; institutional/custom permissions may differ.
      </p>
      <p className="collection-note">
        Choose Editor for someone who needs to maintain the lab’s pages and
        publications. Author and Contributor are intended for narrower
        post-writing duties.
      </p>
      {!canManageAccess(user.capabilities) && (
        <p className="admin-error">
          Your account can edit content but cannot manage other accounts. The
          website owner or SMU administrator must grant user-management
          permission.
        </p>
      )}
      {user.capabilities.list_users && (
        <>
          <form className="admin-search">
            <label htmlFor="team-search">Find an account</label>
            <input id="team-search" name="search" defaultValue={search} />
            <button className="button button-dark">Search</button>
          </form>
          {error && (
            <p role="alert" className="admin-error">
              {error}
            </p>
          )}
          <div className="admin-grid">
            {users.map((member) => {
              let editable = !!user.capabilities.promote_users;
              try {
                editableAccount(member.id, user.id, member.roles || []);
              } catch {
                editable = false;
              }
              return (
                <article key={member.id} className="admin-panel">
                  <h3>{member.name}</h3>
                  <p>
                    {member.email || member.username} ·{' '}
                    {(member.roles || []).join(', ')}
                  </p>
                  {editable ? (
                    <AccessForm
                      id={member.id}
                      role={member.roles?.[0] || 'subscriber'}
                    />
                  ) : (
                    <p className="muted">
                      {member.id === user.id
                        ? 'Your account'
                        : 'Managed by site or SMU administration'}
                    </p>
                  )}
                </article>
              );
            })}
          </div>
          <nav className="admin-pagination" aria-label="Team pagination">
            {page > 1 && (
              <Link
                prefetch={false}
                href={`?page=${page - 1}&search=${encodeURIComponent(search)}`}
              >
                Previous
              </Link>
            )}
            <span>
              Page {page} of {pages}
            </span>
            {page < pages && (
              <Link
                prefetch={false}
                href={`?page=${page + 1}&search=${encodeURIComponent(search)}`}
              >
                Next
              </Link>
            )}
          </nav>
        </>
      )}
      {user.capabilities.create_users && user.capabilities.promote_users && (
        <section className="content-section admin-panel">
          <h3>Add an editor</h3>
          <NewAccountForm />
        </section>
      )}
      <section className="content-section">
        <h3>How editors sign in</h3>
        <p>
          After account setup, each editor creates one Application Password in
          their account profile and uses it at this website’s admin sign-in.
          Everyday editing happens here.
        </p>
        <a className="text-link" href={`${adminSite()}/wp-admin/profile.php`}>
          Account setup ↗
        </a>
        <p className="muted">
          Removing editing access prevents this workspace from accepting the
          account’s session on its next authenticated request. It does not
          delete the person’s account or existing content. The content service
          controls any remaining subscriber access.
        </p>
      </section>
    </>
  );
}
