export default function Loading() {
  return (
    <main id="main" className="container page-content" aria-busy="true">
      <div className="loading-shell loading-shell--refined">
        <p role="status">Loading lab content…</p>
        <div className="loading-placeholder" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <div className="loading-content-grid" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </div>
    </main>
  );
}
