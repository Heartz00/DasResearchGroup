import Link from 'next/link';
import { redirect } from 'next/navigation';
import { configured, signedIn } from '@/lib/admin/auth';
import { LoginForm } from '@/components/admin/forms';
export default async function LoginPage() {
  if (await signedIn()) redirect('/admin');
  return (
    <section className="admin-panel admin-login">
      <h2>Sign in to manage content</h2>
      <p>
        Update the people, research and news on your lab website in one place.
      </p>
      {configured() ? (
        <LoginForm />
      ) : (
        <>
          <p>
            Editing access is not enabled yet. Ask the website manager to
            complete the connection setup.
          </p>
          <Link className="text-link" href="/">
            Return to the website →
          </Link>
        </>
      )}
    </section>
  );
}
