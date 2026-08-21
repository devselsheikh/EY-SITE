Perform a complete production-hardening pass on the Early Years Company website and CMS.

This is a correction and completion task. Preserve the current visual identity, but fix the architecture, content consistency, responsive behavior, SEO, accessibility, performance, CMS structure, and image publishing system.

IMPORTANT WORKING RULES

1. Inspect the existing implementation before changing anything.
2. Do not claim a feature is implemented unless working code exists and it is integrated.
3. Do not replace required features with comments, mock functions, URL-only inputs, placeholders, or “future implementation” notes.
4. Preserve all genuine existing content and images.
5. Do not invent statistics, reviews, alumni, educators, accreditations, dates, fees, or operational information.
6. Where business information conflicts, expose it as one editable global CMS value instead of hardcoding different versions.
7. Maintain the existing Daycare and EduHub branding.
8. Make all changes responsive for desktop, tablet, and phone.
9. Do not expose a Supabase service-role key in browser code.
10. Do not weaken Row Level Security to make frontend operations work.

PART 1 — FIX THE GLOBAL IMAGE SYSTEM

The current system is incomplete. Copying draft_url into published_url is not publishing the website and does not provide database-independent images.

The required system has three separate concepts:

- Draft CMS image
- Published remote image
- Last successfully published static image bundled with the website

Every editable image must have a permanent semantic key.

Examples:

- global.company-logo
- global.main-hero
- daycare.hero
- daycare.facility.classroom
- daycare.facility.playground
- daycare.educator.lamia
- daycare.testimonial.parent-01
- eduhub.hero
- eduhub.alumni.alumni-01
- eduhub.accreditation.cache-logo

Never derive permanent keys from editable names. Names can change. Keys must be stored as immutable identifiers.

IMAGE INVENTORY

Audit every image across:

- Main company landing page
- Daycare homepage
- Daycare programs
- Parent information
- Facilities and meals
- Daycare contact
- EduHub homepage
- EduHub programs
- EduHub about
- EduHub contact
- Blog index
- Blog articles
- Global contact page
- Header and footer
- Educators
- Testimonials
- Gallery
- Alumni
- Accreditation
- Logos and icons where editing is appropriate

Create an inventory containing:

- Semantic key
- Display name
- Category
- Current image
- All usage locations
- Whether it is editable or protected
- Alt text
- Desktop aspect ratio
- Mobile aspect ratio
- Focal point
- Draft status
- Published status

Do not say all images are migrated unless every relevant image component uses ManagedImage or an intentionally protected bundled asset.

DATABASE

Implement actual migrations for:

global_assets:
- id
- asset_key, unique and immutable
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
- draft_status
- published_at
- updated_at
- updated_by

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
- created_at
- created_by
- publication_id

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

Add indexes, foreign keys, constraints and timestamps.

Apply Row Level Security:

- Public users can read only published asset metadata.
- Authenticated CMS editors can create drafts.
- Only authorized publisher/admin roles can publish or roll back.
- Asset-version history cannot be modified by public clients.
- Storage uploads are restricted to authenticated CMS users.
- Validate file type and file size.

Do not use one shared “global administrator” permission for every operation.

UPLOAD EXPERIENCE

The Image Assets CMS must support real file upload, not only pasted URLs.

For each image:

- Upload by file
- Drag and drop
- Upload progress
- Current published preview
- New draft preview
- Desktop crop
- Optional mobile crop
- Focal-point control
- Alt-text editing
- File type
- Original dimensions
- Output dimensions
- Original size
- Optimized size
- Usage locations
- Missing-alt warning
- Oversized-file warning
- Replace
- Discard draft
- Publish individual image
- Restore previous version

Before replacing an image, show:

“This image is used in X locations. Publishing the replacement will update all of them.”

The public website must not change when a draft is merely uploaded.

MANAGEDIMAGE

Create one production-ready ManagedImage component.

It must:

- Receive an immutable assetKey.
- Render the last bundled published asset immediately.
- Use picture and srcset for mobile and desktop variants.
- Use AVIF when available, then WebP, then the original format.
- Include width and height to prevent layout shift.
- Use object-position from the focal point.
- Lazy-load below-the-fold images.
- Allow eager loading and fetch priority only for important hero images.
- Use meaningful alt text.
- Fall back when an image request fails.
- Avoid infinite onError loops.
- Never display a broken-image icon.
- Respect the bundled manifest when Supabase is unavailable.
- Avoid delaying first render while waiting for Supabase.

The correct resolution behavior is:

1. Immediately render the last successfully bundled published static asset.
2. Optionally check for a newer valid remote published asset.
3. If the remote asset fails or times out, retain the static asset.
4. If the static published asset is unavailable, use the original bundled fallback.
5. Use a final local placeholder only if all approved sources fail.

PUBLISHING

Do not label a database update as “Publish Website.”

The Publish Website action must call an authenticated server-side publishing endpoint or Edge Function.

The server-side workflow must:

1. Validate all pending content and image drafts.
2. Reject missing required alt text.
3. Download approved draft assets.
4. Verify MIME type and file integrity.
5. Generate optimized desktop and mobile variants.
6. Generate AVIF and WebP outputs where supported.
7. Create stable versioned filenames.
8. Create a new static asset manifest.
9. Copy or commit the generated assets into the deployable website source or approved static hosting source.
10. Trigger a production build and deployment through a securely stored deployment webhook or supported hosting integration.
11. Wait for deployment success.
12. Only after deployment succeeds, mark the assets and CMS content as published.
13. Preserve the previous successful publication.
14. Support rollback to the previous publication.
15. Store publication errors and display them in the CMS.
16. Never store deployment secrets in frontend code.

If Figma Make hosting cannot support an authenticated build/deployment pipeline, do not pretend this step is complete.

In that case:

- Implement the complete draft/published asset system.
- Implement a downloadable static publication package containing the manifest and optimized assets.
- Rename the action accurately to “Prepare Publication Package.”
- Clearly identify the external build/deployment integration that remains required.
- Do not claim database-independent publication until the generated assets are deployed.

PART 2 — GLOBAL CONTENT CONSISTENCY

Create a Global Site Settings CMS record as the single source of truth for:

- Company founding year
- Years of experience
- Daycare operating days
- Daycare opening and closing times
- Tour days
- Tour times
- Tour advance-notice requirement
- Daycare phone numbers
- EduHub phone number
- Daycare email
- EduHub email
- General email
- AUC address
- Google Maps URL
- Preschool ages
- After-school ages
- Camp ages
- Class ratios
- Class capacities
- Current academic year
- Total families
- Total graduates
- Parent-satisfaction figure
- Accreditation wording
- Social-media links

Replace duplicated hardcoded values across the website with these settings.

Resolve or flag the following current contradictions:

- Daycare schedule starts at 7:30 AM, but the footer says 8:15 AM.
- Tours are described as Monday–Friday, while operating days are Sunday–Thursday.
- The site references both 1999 and 2001.
- Age and ratio information varies between sections.
- The main preschool positioning is ages 1–5, while the FAQ mentions ages 1–10 without clearly distinguishing after-school care.
- The calendar still refers to 2025–26 and must be manageable for 2026–27.

Do not guess the correct answers. Add a Content Health warning for every unresolved conflict.

PART 3 — VERIFY CLAIMS AND CONTENT HEALTH

Create CMS verification controls for claims such as:

- Egypt’s Most Trusted Nursery
- First CACHE-approved centre in Egypt
- First and only CACHE-approved centre in Egypt
- 500+ graduates
- 98% parent satisfaction
- 200+ surveyed families
- 4.9/5 rating
- 100% UK accredited

Every claim needs:

- Claim text
- Verified toggle
- Evidence/source URL
- Evidence date
- Internal note
- Display permission

Do not publicly render unverified claims.

Add content-health warnings for:

- Missing images
- Missing alt text
- Broken external links
- Unverified claims
- Expired calendar content
- Inconsistent global information
- Draft content
- Missing SEO metadata
- Testimonials without consent/verification
- Alumni without consent/verification
- Educator records missing portraits or biographies

Fix Lamia Hassanin’s broken educator image using the global asset system, but do not invent a replacement photograph.

PART 4 — MAIN COMPANY LANDING PAGE

Preserve the parent-versus-educator split.

Improve it by:

- Replacing “What are you looking for?” with “How can we support your next step?”
- Making both pathways visually equal and unmistakably branded.
- Keeping each complete card clickable.
- Adding a visible CTA inside each card.
- Adding a small “Not sure who to contact?” option.
- Replacing emoji statistics with consistent icons.
- Showing only verified credibility statistics.
- Adding a mobile-friendly WhatsApp action.
- Ensuring the Daycare logo links to /daycare.
- Ensuring the EduHub logo links to /eduhub.
- Providing a separate company/home switcher.

PART 5 — DAYCARE DESKTOP EXPERIENCE

The Daycare homepage is too long. Restructure it into:

1. Hero
2. Verified trust indicators
3. Programs by age
4. Why Early Years
5. Facility/gallery preview
6. Two or three verified reviews
7. Enrollment process
8. FAQ preview
9. Final tour CTA

Move detailed content to dedicated pages:

- Full daily schedule
- Full meal menus
- Full curriculum
- Full educator biographies
- Complete parent policies
- Full gallery
- Complete FAQ

Use one conversion vocabulary:

Primary CTA: Book a Tour
Secondary CTA: View Programs
Later-stage CTA: Apply for Enrollment

Replace inconsistent phrases such as Book a Visit, Book a Campus Tour, Free Consultation and Start Enrollment where they refer to the same action.

Clarify:

- Whether AUC affiliation is required
- Gate and access information
- Parking information
- Tour availability
- Fees or a clear method to request current fees

Reduce decorative emojis and use a coherent icon system.

Use genuine daycare photography consistently.

PART 6 — DAYCARE PHONE EXPERIENCE

Implement:

- Sticky bottom action bar with WhatsApp and Book a Tour.
- Full-width stacked CTAs on narrow screens.
- 44–48 px minimum tap targets.
- Program cards as accessible accordions or swipeable cards.
- Collapsed daily schedule by default.
- Limited gallery preview followed by View Gallery.
- One testimonial at a time.
- Short educator preview instead of full biographies.
- Readable 16 px minimum body text.
- No horizontal overflow.
- Lazy-loaded below-the-fold images.
- Tap-to-load map instead of immediate map loading.
- Accessible accordion states.
- Correct focus handling in the mobile menu.
- Body scroll locking while the menu is open.
- Respect for reduced-motion preferences.

PART 7 — EDUHUB DESKTOP EXPERIENCE

Add decision-making information for every CACHE course:

- Full official title
- Qualification number if verified
- Level
- Who it is for
- Entry requirements
- Required workplace experience
- Placement requirements
- Whether placement support is provided
- Duration
- Weekly teaching hours
- In-person versus online structure
- Teaching language
- Assessment method
- Price
- Instalment options
- Next intake
- Application deadline
- Documents required
- Certificate issuer
- Recognition information
- Downloadable specification
- Register-interest CTA

Do not display invented information. Missing fields should show a CMS warning and remain hidden publicly.

Create:

- A Level 2/3/5 comparison interface.
- A “Which level is right for me?” selector.
- Separate individual and institutional inquiry paths.
- Corporate training information for schools and nurseries.
- Verified accreditation links.
- Real trainer and assessor profiles.
- Verified employer or partner logos only.
- Direct course detail routes rather than three identical generic links.

Use British English consistently throughout EduHub:

- Centre
- Recognised
- Enrolment
- Programme, where appropriate

PART 8 — EDUHUB PHONE EXPERIENCE

Implement:

- Sticky Register Interest action.
- Vertically stacked course cards.
- Duration, entry requirement, delivery format, next intake and price visible without opening details.
- Compact four-stage course journey.
- Tappable phone, WhatsApp and email controls.
- Concise accreditation explanations.
- Proper form success state and expected response time.
- No wide desktop comparison table forced into a phone viewport.

PART 9 — FORMS

Improve all forms:

- Separate Book a Tour from Apply for Enrollment.
- Ask for preferred contact method.
- Add WhatsApp-contact consent.
- Use an international phone field with Egypt selected by default.
- Prevent dates in the past.
- Disable unavailable tour days and times.
- Display field-level validation.
- Preserve values after validation errors.
- Include loading, success and failure states.
- Prevent duplicate submission.
- Provide a dedicated confirmation state or page.
- Send acknowledgement email only through a secure server-side function.
- Store UTM source, medium and campaign.
- Track form_start, form_error, form_submit and form_success.
- Add spam protection.
- Include privacy consent.
- Avoid collecting unnecessary sensitive information about children.

On /contact, do not display two long forms simultaneously on mobile.

First ask:

- Contact the Daycare
- Contact EduHub

Then display the appropriate form.

PART 10 — CMS STRUCTURE

Ensure the CMS contains:

GLOBAL
- Site Settings
- Media Library
- Global Image Assets
- SEO
- CTA Settings
- Form Settings
- Submissions
- Claims and Verification
- Publications
- Content Health
- Audit Log

DAYCARE
- Programs
- Educators
- Testimonials
- Gallery
- Daily Schedule
- Meals and Menus
- Academic Calendar
- FAQ
- Parent Documents

EDUHUB
- Courses
- Trainers and Assessors
- Alumni
- Accreditation
- Intake Dates
- Institutional Training
- Course Downloads

CONTENT
- Blog
- Categories
- Authors

Every editable item should support:

- Draft
- Published
- Scheduled
- Archived
- Preview
- Last updated
- Updated by
- Validation status
- SEO metadata where applicable
- Version history
- Restore
- Safe deletion or archive
- Usage relationships

Do not combine Save Draft with Publish.

PART 11 — SEO

Give every route a unique SEO title and meta description.

Examples:

- Nursery Programs in New Cairo | Early Years Daycare
- CACHE Level 2, 3 & 5 Courses in Egypt | EduHub
- Daycare Parent Guide, Hours & Policies | Early Years
- Book an AUC New Cairo Nursery Tour | Early Years
- Academic Calendar & Meal Menu | Early Years Daycare

Implement:

- Canonical URLs
- Open Graph metadata
- Social share images
- Organization schema
- ChildCare or appropriate LocalBusiness schema
- Course schema
- FAQ schema
- Breadcrumb schema
- Sitemap
- robots.txt
- Semantic headings
- Descriptive alt text
- Correct index/noindex rules for admin and preview routes

The /admin route must be noindex.

PART 12 — PERFORMANCE AND ACCESSIBILITY

Performance:

- AVIF/WebP responsive images
- Correct image dimensions
- Lazy loading
- Hero-image preload only where justified
- Minimal font families and weights
- Tap-to-load map
- Reduced animation on mobile
- Cached published content
- Loading skeletons only where useful
- No Supabase request blocking first contentful render
- No database dependency for last successfully published static images

Accessibility:

- Keyboard-accessible navigation
- Visible focus indicators
- Correct labels
- Correct heading hierarchy
- Accessible carousels
- Accessible accordions
- Sufficient color contrast
- Reduced-motion support
- Screen-reader form errors
- Descriptive link names
- No important information communicated by color alone

PART 13 — SECURITY

- Do not place the service-role key in frontend code.
- Keep only the anonymous public key in browser code.
- Apply RLS to every CMS table.
- Use authenticated server-side functions for publishing and privileged storage actions.
- Require individual administrator accounts.
- Prepare support for MFA.
- Implement admin, publisher, editor and submission-viewer roles.
- Add an audit log.
- Add session expiry.
- Restrict upload types and sizes.
- Sanitize rich text.
- Rate-limit login and public submissions.
- Protect submission data.
- Do not reveal whether a CMS email exists through overly specific authentication errors.

PART 14 — REQUIRED COMPLETION REPORT

At the end, provide an honest implementation report containing:

1. Files changed.
2. Database migrations created and whether they were applied.
3. Supabase Storage buckets and policies created.
4. RLS policies created.
5. Every image key migrated.
6. Images intentionally excluded and why.
7. Routes changed.
8. Desktop improvements completed.
9. Mobile improvements completed.
10. SEO changes completed.
11. Accessibility changes completed.
12. Performance changes completed.
13. Content contradictions still requiring business confirmation.
14. Features fully working.
15. Features only scaffolded.
16. External infrastructure still required.
17. Exact manual steps required from the administrator.
18. Tests performed.
19. Known failures.
20. Confirmation that the public website still displays the last successfully published images when Supabase database and storage requests are blocked.

Do not use phrases such as “fully implemented” unless the database migrations, uploads, static publication, deployment integration, rollback, public fallback behavior and CMS interfaces are all actually functional.