SIMPLIFY PUBLIC IMAGE MANAGEMENT FOR FIGMA MAKE

The Supabase-hosted global image override system is no longer needed.

The intended workflow is:

1. Public website images are embedded directly in the Figma Make project.
2. Images are replaced manually from inside the Figma Make editor.
3. The administrator republishes the Figma Make site after replacing images.
4. The published replacement remains visible until it is manually replaced and republished again.
5. Public images must not depend on Supabase Database or Supabase Storage.

Do not redesign the website.

IMPORTANT FIGMA MAKE CONSTRAINT

Use the image-embedding and image-replacement capabilities actually supported by Figma Make.

Do not claim that the published /admin page can rewrite Figma Make project assets.

Do not assume a traditional /public filesystem exists unless it is actually visible and supported in this Make project.

PHASE 1 — PRESERVE THE CURRENT VISIBLE IMAGES

Before removing any existing image system:

- Audit every public image.
- Record its current visible source.
- Record its usage locations.
- Record its asset key.
- Record alt text and focal position.
- Preserve the currently visible image.

Do not remove ManagedImage, useAssets or Supabase image resolution until a local embedded replacement is confirmed for every public image.

If Figma Make cannot automatically fetch a remote source because of CORS:

- Do not replace it with a placeholder.
- Do not delete the existing working reference.
- Mark it as “Manual upload required.”
- List the exact asset key and current URL.
- Wait for the administrator to attach the original image to the Make conversation.

PHASE 2 — CREATE A LOCAL IMAGE REGISTRY

Create one code-level local image registry for all public images.

Example structure:

const localImages = {
  "daycare.hero": {
    desktop: embeddedDaycareHero,
    mobile: embeddedDaycareHeroMobile,
    alt: "Children learning at Early Years Daycare",
    focalX: 0.5,
    focalY: 0.5
  }
};

Every public component must access images through this registry.

Do not create unrelated duplicate image references in multiple components.

If the same asset key is intentionally used in multiple locations, every location must resolve through the same registry entry.

Changing that registry entry must change every usage after republishing.

PHASE 3 — EMBED IMAGES

For each image supplied as a Figma Make attachment:

- Embed it directly in the Make project.
- Connect it to the correct local registry key.
- Preserve its aspect ratio.
- Preserve or update its alt text.
- Configure desktop/mobile sources where separate images are provided.
- Verify every usage location.

Do not upload these public images to Supabase.

Do not leave remote Supabase URLs as local fallbacks.

PHASE 4 — SIMPLIFY THE IMAGE COMPONENT

Convert ManagedImage into a local-only component.

It may support:

- assetKey
- Local embedded desktop image
- Local embedded mobile image
- Alt text
- Width and height
- Object-fit
- Focal position
- Lazy loading
- Eager loading for hero images
- Local fallback image

It must not:

- Query Supabase
- Read global_assets
- Use signed URLs
- Use published_remote_url
- Fetch remote asset manifests
- Wait for database requests
- Subscribe to database changes

PHASE 5 — REMOVE PUBLIC DATABASE IMAGE DELIVERY

After every public image has a confirmed embedded replacement, remove public runtime use of:

- useAssets Supabase overlay
- fetchGlobalAssets
- published_remote_url
- published_mobile_url
- Supabase image subscriptions
- Image cache broadcasts
- Signed preview URLs
- Runtime Storage downloads
- Remote publication manifests

Do not remove Supabase from non-image CMS features.

PHASE 6 — REPURPOSE THE CMS IMAGE SECTION

Rename “Image Assets” to:

“Image Replacement Guide”

For every asset show:

- Asset key
- Image name
- Current embedded preview
- Usage locations
- Recommended desktop dimensions
- Recommended mobile dimensions
- Alt text
- Required aspect ratio
- Focal-position guidance
- Manual replacement instructions

Display:

“To replace this image, open the Figma Make project, select the image in the relevant preview or attach the replacement image in the Make conversation, update the shared local image registry, verify all usage locations, and publish an update.”

Remove from the CMS interface:

- Upload to Supabase Storage
- Save image draft
- Approve image publication
- Generate publication ZIP
- Remote image status
- Supabase image version history

Do not delete existing Supabase tables, buckets or stored files automatically.

PHASE 7 — PRESERVE NON-IMAGE CMS FEATURES

Keep Supabase functionality for:

- CMS authentication
- Site settings
- Programs
- Educator text
- Testimonials
- Courses
- Alumni text
- Accreditation text
- Blog
- Calendar
- Daily schedule
- Meals
- FAQs
- Forms
- Submissions
- SEO settings
- Claims verification
- Audit logging

Only remove public image delivery through Supabase.

REQUIRED VERIFICATION

Test every public route after conversion.

Confirm:

- Every image displays from an embedded/local Figma Make asset.
- No public image depends on Supabase.
- No broken images appear.
- Blocking Supabase does not remove public images.
- Every shared asset key uses one registry entry.
- Replacing one registry entry updates all intended locations.
- Images remain after refreshing.
- Images remain after publishing an update.
- Desktop and mobile layouts remain correct.

REQUIRED REPORT

Provide:

- Every image asset key
- Current embedded source
- Every usage location
- Images successfully embedded
- Images requiring manual attachment
- Images still using external URLs
- Images still using Supabase
- Code removed
- CMS behavior removed
- Non-image CMS functionality preserved
- Manual replacement instructions
- Confirmation that the deployed site was updated