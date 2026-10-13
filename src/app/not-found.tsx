import Link from 'next/link';
export default function NotFound() {
  return (
    <main id="main" className="container page-content">
      <p className="eyebrow">404 / Page not found</p>
      <h1>A different direction.</h1>
      <p>The page you’re looking for could not be found.</p>
      <Link className="button button-dark" href="/">
        Return to the homepage →
      </Link>
    </main>
  );
}
