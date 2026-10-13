# Native WordPress setup pack

Use [ADMIN_GUIDE.md](../docs/ADMIN_GUIDE.md) for nontechnical editing and [WORDPRESS_CONTENT_MODEL.md](../docs/WORDPRESS_CONTENT_MODEL.md) for capability evidence, limitations and safe activation. Field help is in [NATIVE_FIELD_REFERENCE.md](../docs/NATIVE_FIELD_REFERENCE.md).

The eleven `native-templates/*.html` files are **developer-only setup assets** containing blank native Heading/Paragraph blocks. Normal editors use visual draft templates or WordPress’s Visual editor; they must never copy source markup. Templates do not install plugins, create content types, alter accounts or connect to WordPress. They contain no invented research/member/publication data. Do not publish empty templates. Use unsynced block copies; the adapter does not resolve synced pattern references.

For developers only: `node wordpress/build-templates.mjs` regenerates these files and the field-reference guide from `content-model.mjs`. This is a template generator, not a CMS-content export/import or a routine editor task. The public content remains in WordPress, with native revision support where enabled.

Activation in the SMU dashboard requires an authorized owner/editor. No production records or source flags have been changed by this implementation.
