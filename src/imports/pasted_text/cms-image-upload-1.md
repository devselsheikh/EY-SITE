PHASE 0 — IMPLEMENT REAL CMS IMAGE UPLOAD, GLOBAL REPLACEMENT AND STATIC PUBLICATION

Work only on the image-management and publication system in this phase. Do not reorganize the public pages, rewrite content or perform unrelated design changes.

The current system is incomplete. It supports URLs and Supabase overrides, but a published CMS image is not reliably copied into the deployed website files. Fix that.

GOAL

An authorized CMS user must be able to:

1. Open Image Assets.
2. Select an existing semantic asset.
3. Upload an image file directly from their computer.
4. Preview and crop it.
5. Save it as a draft without changing the public website.
6. Publish the image.
7. Have the publishing system generate optimized image variants.
8. Copy those generated files into the deployable website assets.
9. Update the static asset manifest.
10. Build and redeploy the website.
11. Update every website location using that asset key.
12. Continue displaying the last successfully published image if Supabase becomes unavailable.
13. Restore an earlier image version.

Do not treat copying draft_url into published_url as website publication.

PERMANENT ASSET KEYS

Every replaceable image must use an immutable semantic asset key.

Examples:

- global.company-logo
- global.company-hero
- daycare.hero
- daycare.facility.classroom
- daycare.facility.playground
- daycare.educator.lamia
- daycare.testimonial.parent-01
- eduhub.hero
- eduhub.trainer.trainer-01
- eduhub.alumni.alumni-01
- eduhub.accreditation.cache-logo

Do not derive permanent keys from names, display labels, array positions or URLs.

Names can change. Asset keys must remain unchanged.

IMAGE INVENTORY

Audit every image currently displayed across all public routes.

For every image, record:

- Asset key
- Display name
- Category
- Current source
- Original bundled fallback
- Every route using it
- Every component using it
- Editable or protected
- Alt text
- Desktop aspect ratio
- Mobile aspect ratio
- Focal point

Do not claim migration is complete until every replaceable public image uses the asset-key system.

DIRECT FILE UPLOAD

The CMS must support real file selection and drag-and-drop upload.

Do not use a URL input as the primary upload mechanism.

Support:

- JPG
- JPEG
- PNG
- WebP
- AVIF where supported

Validate:

- MIME type
- File extension
- Maximum file size
- Minimum dimensions
- Corrupt files
- Duplicate upload
- Unsupported animated files
- Suspicious filenames

Sanitize filenames and never trust the browser-provided MIME type alone.

CMS IMAGE EDITOR

Show:

- Current published image
- New draft image
- Upload progress
- Original filename
- Dimensions
- Original file size
- Optimized file size
- Desktop crop
- Optional mobile crop
- Focal-point controls
- Alt-text input
- Usage locations
- Draft status
- Publication status
- Version history
- Restore control
- Discard Draft
- Save Draft
- Publish Image

Before publishing, display:

“This image is used in X locations. Publishing it will update all those locations.”

IMAGE STORAGE

Uploads may initially enter a private Supabase Storage draft bucket.

Use separate concepts for:

- Draft upload
- Published remote asset
- Bundled published static asset
- Original fallback asset

Suggested buckets:

- cms-image-drafts: private
- cms-image-published: public or securely delivered
- cms-documents: separate from images

Do not expose the Supabase service-role key in frontend code.

Use authenticated storage policies and Row Level Security.

DATABASE

Create and apply actual migrations for:

global_assets:
- id
- asset_key
- display_name
- category
- draft_original_url
- draft_mobile_url
- published_remote_url
- published_mobile_url
- published_static_path
- published_static_mobile_path
- original_fallback_path
- alt_text
- focal_x
- focal_y
- version
- status
- updated_at
- updated_by
- published_at

asset_versions:
- id
- asset_id
- version
- original_url
- mobile_url
- static_path
- static_mobile_path
- alt_text
- focal_x
- focal_y
- publication_id
- created_at
- created_by

asset_usages:
- id
- asset_id
- page_route
- component_name
- usage_label

publications:
- id
- status
- started_at
- completed_at
- initiated_by
- manifest_version
- deployment_reference
- error_message
- rollback_of

Apply and test RLS.

MANAGED IMAGE COMPONENT

All replaceable public images must use one ManagedImage component.

It must:

- Accept assetKey.
- Immediately render the last bundled published image.
- Never wait for Supabase before rendering the bundled image.
- Use picture and srcset.
- Support desktop and mobile variants.
- Prefer AVIF, then WebP, then the original format.
- Include width and height.
- Apply the stored focal point.
- Lazy-load below-the-fold images.
- Eager-load only important hero images.
- Use meaningful alt text.
- Prevent infinite onError loops.
- Never display a broken-image icon.
- Use the original bundled fallback only if the last published static image fails.

Resolution order:

1. Last successfully published static asset bundled with the website.
2. A newer verified published remote asset, when appropriate.
3. Original bundled fallback.
4. Final local placeholder.

The latest successful static publication must remain visible if both Supabase Database and Supabase Storage are unavailable.

PUBLISHING PIPELINE

The public Publish Image and Publish Website actions must use an authenticated server-side workflow.

The server-side workflow must:

1. Validate the draft and alt text.
2. Download the draft image.
3. Verify file integrity.
4. Generate desktop and mobile crops.
5. Generate AVIF and WebP variants.
6. Generate appropriate widths for srcset.
7. Create stable versioned filenames.
8. Generate a new static asset-manifest.json.
9. Place or commit generated images into the deployable website asset source.
10. Trigger a production build.
11. Trigger deployment.
12. Wait for successful deployment.
13. Only then mark the asset as published.
14. Preserve the previous successful version.
15. Store publication logs and errors.
16. Allow rollback.

Never store deployment credentials or webhooks in browser code.

FIGMA MAKE LIMITATION

First determine whether this project can programmatically update deployable source assets and trigger a new Figma Make deployment.

If it can, implement and test the real pipeline.

If it cannot:

1. Do not pretend that static publication is complete.
2. Implement real authenticated file upload and draft management.
3. Implement a server-side image optimization function where supported.
4. Add a “Generate Publication Package” action.
5. Generate a downloadable ZIP containing:
   - asset-manifest.json
   - optimized AVIF images
   - optimized WebP images
   - original-format fallbacks
   - desktop variants
   - mobile variants
   - migration metadata
   - publication instructions
6. Clearly state that an external deployment integration is still required.
7. Do not label this workflow “Publish Website.”

GLOBAL REPLACEMENT

When an image is replaced, every component using the same asset key must update.

Do not duplicate image URLs across records.

Example:

daycare.hero

must resolve through the same global asset record wherever it is used.

Changing one asset must not require manually editing several pages.

DRAFT BEHAVIOR

Uploading or saving a draft must not affect the public website.

CMS preview may show the draft.

Public routes must continue using the currently published static asset until publication succeeds.

A failed publication must not remove or overwrite the last working public image.

REQUIRED TESTS

Perform and report these tests:

1. Upload a valid JPG.
2. Upload a valid PNG.
3. Reject an oversized image.
4. Reject an unsupported file.
5. Save a draft and confirm the public website is unchanged.
6. Publish an image and confirm every usage updates.
7. Confirm desktop and mobile variants work.
8. Block Supabase Database requests and confirm the image remains.
9. Block Supabase Storage requests and confirm the image remains.
10. Block both and confirm the image remains.
11. Simulate failed publication and confirm the previous image remains.
12. Restore the previous version.
13. Confirm unauthorized public upload fails.
14. Confirm an editor cannot perform an admin-only publication.
15. Confirm no service-role key appears in the frontend bundle.

REQUIRED COMPLETION REPORT

At the end, report:

- Every file changed
- Every database migration created
- Whether each migration was actually applied
- Storage buckets created
- Storage policies created
- RLS policies created and tested
- Server-side functions created
- Whether those functions were deployed
- Every migrated asset key
- Every intentionally protected/non-editable image
- Images not migrated and why
- Publication workflow actually implemented
- External infrastructure still required
- Tests passed
- Tests failed
- Manual steps required
- Exact evidence that the website retains the latest published images when Supabase is unavailable

Do not use “fully implemented” unless direct upload, optimization, static asset generation, deployment, global replacement, fallback and rollback all pass.