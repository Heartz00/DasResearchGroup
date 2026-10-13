import type { Metadata } from 'next';
import Link from 'next/link';
import './admin.css';
import { signedIn } from '@/lib/admin/auth';
import AdminNavigation from '@/components/admin/navigation';
import { logout } from './actions';
export const metadata: Metadata = {
  title: 'Content administration',
  robots: { index: false, follow: false },
};
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await signedIn();
  return (
    <main id="main" className="admin-shell container">
      <div className="admin-heading">
        <div>
          <p className="eyebrow">Das Research Group / Website manager</p>
          <h1>Your lab website.</h1>
        </div>
        <Link prefetch={false} className="text-link" href="/">
          View website <span aria-hidden="true">↗</span>
        </Link>
        {auth && (
          <form action={logout}>
            <button className="button button-dark">Sign out</button>
          </form>
        )}
      </div>
      <div className={auth ? 'admin-workspace' : ''}>
        {auth && <AdminNavigation />}
        <div className="admin-workspace-content">{children}</div>
      </div>
    </main>
  );
}
