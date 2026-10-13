# WordPress-connected administration

Open `/admin` on the frontend. The workspace edits the existing WordPress installation; it is not a second CMS. It supports Pages, Posts, media metadata/uploads, Categories and Tags. WordPress account permissions remain authoritative. No live WordPress records were created or edited during implementation.

## Local setup

1. In **DasResearchGroup/.env.local**, set `ADMIN_ENABLED=true`.
2. Generate a fresh key with `node -e "console.log(require('node:crypto').randomBytes(32).toString('base64'))"` and set `ADMIN_SESSION_SECRET` to that value. Do not reuse keys from other projects or paste them into chat.
3. Set `SITE_URL` to the exact frontend origin, such as `http://localhost:3000`, and retain `WORDPRESS_URL=https://people.smu.edu/daslab`.
4. Restart the development server if it has not picked up the environment change.
5. Sign into the existing WordPress dashboard with your own authorized SMU account. Open your Profile and locate **Application Passwords**. Create a named password for this frontend.
6. Visit `/admin/login` and enter your WordPress username and the generated Application Password. Your normal SMU/SSO password is not accepted by this form.

If Application Passwords are unavailable or authenticated REST requests are blocked, the SMU WordPress administrator must enable an approved authentication method. This cannot be confirmed from the unauthenticated public API. Continue using the existing WordPress dashboard until it is resolved. Do not disable TLS verification or install an unapproved plugin.

Application Password reference: <https://developer.wordpress.org/rest-api/using-the-rest-api/authentication/>.

## Working with content

The workspace links directly to the correct legacy source pages, including Research, People, Publications, Group News, Instrumentation, Gallery, About Dr. Das and Teaching. Their WordPress slugs do not always match the public route names.

Use collection search and pagination to find any other supported record. The workspace shows safe plain-text fields and preserves existing formatting internally. For rich formatting, galleries, captions, categories and revision restoration, choose **Open WordPress visual editor**. Raw source editing is no longer exposed in the workspace. Normal editors never need to edit markup.

- Pages/Posts: title, slug, content, excerpt, publication status and featured image ID; page parent or post Categories/Tags.
- Media: upload JPEG, PNG or WebP under 3 MB; edit title, slug, description, caption and alt text. Copy the media ID into a record’s featured image field, or insert its URL through WordPress for inline images.
- Categories/Tags: create and edit names, slugs and descriptions; Categories also support a parent.
- Revisions: links to recent revisions when the account/API exposes them; compare/restore in WordPress.
- Removal, scheduling, site settings, menus, user permissions and plugins: use the WordPress dashboard. Permanent media deletion is not exposed here.

New Pages/Posts start as Draft. A Published selection saves publicly to WordPress; Pending review and Draft are available for review. Media and taxonomy changes take effect immediately according to WordPress. Explicitly review a record before saving it as Published.

Errors keep typed editor values available. Before an existing record is saved, the latest WordPress modification timestamp is compared with the timestamp loaded by the form. A changed timestamp blocks the save and asks you to compare changes. This check reduces stale-editor overwrites but is not an atomic WordPress transaction; two writes in the same instant can still race. Term records do not provide this modification timestamp.

Successful saves invalidate frontend routes for refresh. Actual appearance still depends on published status, supported source conventions, image caching and which source has been selected. Reload and verify the public page. New records are not guaranteed to appear solely because they were saved.

## Templates and source migrations

The workspace offers drafts for Homepage settings, member profiles, research areas, instruments, publications, news, recruitment and contact. They use the conventions already described in [CONTENT_MANAGEMENT.md](CONTENT_MANAGEMENT.md).

Creating structured member/publication drafts does not switch the public collection. Prepare and review the complete roster/bibliography before changing People Source or Publication Source on the Homepage settings Page. News Posts require the `news` category; publication Posts require `publications`, and curated featured papers use the `featured` tag. Templates do not create taxonomy or switch sources automatically.

Existing singleton settings/recruitment/contact Pages should be edited rather than duplicated. Verify the exact slugs and parent IDs before publishing. The form looks up supported parent slugs when preparing a draft.

## Security and deployment

Credentials travel from the form to this server and then to WordPress over HTTPS in production. They are sealed in an authenticated AES-256-GCM, HttpOnly session cookie, bound to the configured WordPress site, lasting four hours. The production cookie is Secure and SameSite Strict. A valid session is rechecked against WordPress before authenticated reads and writes. Credentials never appear in page props, URLs or logs, and are not stored in a repository database or environment variable.

Every mutation validates the request Origin against SITE_URL in addition to Next.js Server Action origin protection. Authenticated fetches use no-store, a timeout and no redirects. Admin pages have noindex directives and private/no-store headers. The REST route/field allowlists prevent a form from choosing arbitrary WordPress endpoints or setting account capabilities.

Set a distinct production session key and an exact HTTPS SITE_URL in the hosting environment. Revoking an Application Password in WordPress or changing the session key invalidates access. Sign out on shared machines. The built-in username-based login throttle is in-memory per server process; for a multi-instance deployment, configure a durable hosting/WAF rate limit as well. No durable audit database or cross-instance session revocation service has been added; WordPress identity, permissions and available revisions are retained.

## Extending future website sections

The admin is extensible rather than a tool that generates or deploys arbitrary website code.

1. Define the audience, content source and editing permissions for the new section.
2. Add its public presentation using the existing content layer.
3. Add a template in `src/lib/admin/templates.ts` and a workspace link for the supported WordPress source.
4. For a genuinely new content type, explicitly extend the collection/field allowlists, editor and normalization. Confirm its authenticated REST schema and permissions first; do not expose arbitrary endpoints.
5. Reuse authentication, server-side saving and error handling; add meaningful tests for the new contract.
6. Review mobile accessibility, draft/published visibility, source selection and deployment.

## Validation

`npm test` checks adapters plus session encryption/tampering/expiry, identity/site binding, route/ID/field validation, upload signatures and login throttling. `npm run test:admin` starts an isolated frontend and a local mock WordPress service on ports 3018/3019. It uses a fixed test-only key and mock credentials, never live WordPress writes. The isolated build directory is ignored.

The HTTP exception used by those tests is restricted to loopback, explicit test opt-in and nonproduction execution. Do not set ADMIN_ALLOW_LOCAL_TEST_SERVER or ADMIN_TEST_DIST_DIR in production. Live authenticated end-to-end publishing needs a permitted SMU account and a separately reviewed test draft; it has not been performed.

Local Windows test-runner note: all five mock-backed browser checks passed their assertions (login/accessibility, editing/sign-out, stale-edit protection, permission rejection/mobile layout and upload validation). In this restricted environment, managed test-server cleanup waited indefinitely after the checks, so the test command was interrupted after results were printed. This is a test-runner teardown limitation, not a live WordPress publishing test or a clean full-command exit. Stop the test servers with Ctrl+C after results if the same limitation occurs locally.

## Easier editing and team access

Team access at /admin/access lets authorized WordPress owners list accounts, create content-editor accounts, and change content roles. Listing requires list_users; changing roles requires promote_users; creation requires create_users and promote_users. The WordPress REST API remains authoritative and can deny operations under SMU or multisite policy. Editor is appropriate for maintaining site pages and all posts; Author manages own posts; Contributor drafts posts; Subscriber removes standard editing access. Institutional/custom permissions may differ. Owner/administrator accounts, unfamiliar institutional roles and the signed-in account are protected from changes in this workspace. Administrator role escalation and user deletion are not exposed.

Account creation does not send a sign-in link from this frontend. WordPress may have its own notifications. Give the member their username and the admin URL through your approved channel. They must initialize the WordPress/SMU sign-in method and create their own Application Password. Standard WordPress password reset can be used only where the installation permits it. The frontend never displays or shares the server-generated account password. SMU may require accounts to be provisioned by its administrator instead.

Simple supported template content is shown as labeled fields. Emails, URLs and numeric year/order fields use appropriate inputs; featured flags use a selection. Text is escaped internally before storage. Complex formatting remains preserved and is edited through WordPress’s visual controls. Numeric parent/category/tag/media IDs and raw excerpts/captions remain hidden and unchanged. No raw HTML editor is exposed.

## CGC-style website manager

The workspace is now organized around Homepage, Your research, Your people, Publications, Lab updates, Lab photos, Facilities, About Dr. Das and Teaching. It has its own navigation and does not display the public site header/footer. Pages, Posts and taxonomy maintenance remain under Advanced content tools. Private navigation does not prefetch every authenticated WordPress screen.

Supported templates show labeled fields. Legacy plain paragraphs can also be edited without markup; only those text ranges change. Formatting and embedded-image changes use WordPress’s visual editor. Featured photos can be chosen by name with a preview where the library is available, and the Photo library shows thumbnails. Choosing a featured photo does not replace an inline photograph or migrate legacy collections. Save changes retain the existing permission and conflict checks. No production content or accounts were modified.

> The custom website workspace at `/admin` is now the primary editorial interface. WordPress remains the backend. See [ADMIN_GUIDE.md](ADMIN_GUIDE.md) for everyday tasks. `/admin/manage/[area]` provides lab-specific forms, media selection/upload, drafts, previews and text revision restoration. Generic collection editors remain compatibility tools. Live SMU authentication and publishing still require an authorized account; no production migration was performed.
