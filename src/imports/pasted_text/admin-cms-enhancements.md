Upgrade the `/admin` CMS into a more functional branded admin portal. This is not only a visual redesign. Implement the actual CMS behavior described below and make sure changes reflect on the public website.

Core rule:
- Keep the CMS localStorage-based for now.
- Do not add a real backend.
- Do not remove existing CMS features.
- Preserve existing content/localStorage as much as possible.
- Public website sections must read from CMS data, not hardcoded duplicate data.

1. Branded admin design
Redesign the admin UI as a premium Early Years Company control center.

Use:
- Early Years logo in sidebar/header.
- Warm white background.
- Soft peach/coral/pink accents.
- Gentle blue accents for EduHub/admin actions.
- Clean cards, subtle shadows, professional spacing.

Sidebar:
- Replace generic gear header with:
  - Early Years logo
  - “Early Years CMS”
  - “Website Control Center”
- Add sidebar groups:
  - Overview
  - Global: Site Settings, Media Library, SEO, CTA Settings, Form Settings, Submissions
  - Daycare: Educators, Testimonials, Gallery, Programs, Daily Schedule, Meals & Menu, FAQ
  - EduHub: EduHub Courses, Alumni, Accreditation
  - Content: Blog
- Active nav should use branded styling, not default blue.

Top bar:
- Show current section title.
- Show section description.
- Add pill: “Local CMS Prototype”.
- Buttons:
  - Preview Site
  - Import JSON
  - Export JSON
  - Export Submissions CSV
  - Save Changes
- Save button must show saved/saving/unsaved states.

2. Overview dashboard with real data
Add a new Overview page that calculates real stats from CMS data:
- Total educators
- Published educators
- Active/published testimonials
- Gallery images
- Blog articles
- Published blog articles
- New/unread submissions
- Missing image alt text
- Placeholder links using "#"
- Draft/hidden content count

Add quick action cards:
- Add Educator
- Add Parent Review
- Add Gallery Image
- Add Blog Article
- View Submissions
- Preview Website

Clicking each quick action should navigate to the correct CMS section and open/create a new item where possible.

3. Add publishing status everywhere
For all editable content records, add a `status` field:
- Draft
- Published
- Hidden

Apply to:
- Educators
- Testimonials
- Gallery items
- Daycare programs
- Daily schedule items
- Meals/menu items where applicable
- EduHub courses
- Alumni
- Accreditation items
- Blog articles
- FAQ items
- Media items

Public website behavior:
- Only show records with `status: "published"`.
- Hidden and Draft records must not appear publicly.
- Admin should show all records with visible status pills.

Migration:
- If existing records use `active: true`, convert them to `status: "published"`.
- If `active: false`, convert to `status: "hidden"`.
- Do this without deleting old fields, to avoid breaking older data.

4. Featured controls that affect the website
Add `featured` toggles where useful:
- Educators
- Testimonials
- Gallery items
- Blog articles
- Alumni
- EduHub courses if relevant

Public behavior:
- Featured testimonials appear first.
- Featured educator cards appear first after respecting the required educator order:
  Nesrin Hassanin, Lamia Hassanin, then everybody else by display order.
- Featured gallery images appear first in their category.
- Featured blog article appears in the featured blog slot.
- If no featured item exists, use the first published item.

5. SEO controls
Add a new SEO admin section.

Editable SEO fields:
- Homepage SEO title
- Homepage SEO description
- Daycare SEO title
- Daycare SEO description
- EduHub SEO title
- EduHub SEO description
- Default Open Graph image from media library
- Blog article SEO title and SEO description inside each blog editor
- Blog article Open Graph image from media library

Functional behavior:
- Update document.title based on current page.
- Add/update meta description dynamically.
- Add/update og:title, og:description, and og:image dynamically.
- Use page-specific SEO first, then fallback to default SEO.

6. CTA Settings that reflect on public pages
Add a new CTA Settings admin section.

Editable fields:
Daycare:
- Primary CTA label
- Primary CTA link
- Secondary CTA label
- Secondary CTA link
- Mobile sticky CTA primary label/link
- Mobile sticky CTA secondary label/link

EduHub:
- Primary CTA label
- Primary CTA link
- Secondary CTA label
- Secondary CTA link
- Mobile sticky CTA primary label/link
- Mobile sticky CTA secondary label/link

Homepage:
- Daycare card CTA label/link
- EduHub card CTA label/link

Functional behavior:
- Public hero CTAs and homepage cards must read from these settings.
- Mobile sticky CTA bars must use these settings if sticky CTAs already exist.
- Validate that links are not empty.

7. Form behavior controls
Enhance Form Settings.

Editable fields:
- Daycare external form endpoint URL
- EduHub external form endpoint URL
- General contact external form endpoint URL
- Daycare thank-you message
- EduHub thank-you message
- General thank-you message
- WhatsApp redirect number
- Toggle: redirect to WhatsApp after submission
- Toggle: store local submission copy
- Toggle: email endpoint enabled

Public form behavior:
- On submit, validate required fields.
- Save submission to localStorage if local copy is enabled or no endpoint is configured.
- If endpoint URL exists, submit form data to that endpoint with POST fetch.
- Show success message from CMS after successful local save or endpoint response.
- If WhatsApp redirect is enabled, open WhatsApp link with a prefilled message after submit.
- Auto-tag submissions as Daycare, EduHub, or General.
- Do not reload the page after submission.

8. Submissions inbox
Improve Submissions admin section.

Features:
- List submissions from localStorage.
- Fields:
  - Date/time
  - Source: Daycare, EduHub, General
  - Name
  - Email
  - Phone
  - Message
  - Read/unread status
- Filters:
  - All
  - Daycare
  - EduHub
  - General
  - Unread
- Actions:
  - Mark read/unread
  - Delete
  - Export CSV
  - Search by name/email/phone/message

9. Media library usage tracking
Improve Media Library.

Each media record:
- Title
- URL
- Alt text
- Category
- Status
- Usage count
- Used in list

Functional behavior:
- Scan CMS content and show where each media item is used:
  - Daycare hero
  - Educator portrait
  - Testimonial image
  - Campus gallery
  - Blog featured image
  - EduHub accreditation logo
  - Alumni image
- Show warning badge if alt text is missing.
- Add filters:
  - All
  - Missing alt text
  - Unused
  - Daycare
  - EduHub
  - Blog
  - Gallery

10. Content Health panel
Add a Content Health section inside Overview.

Calculate real warnings:
- Missing educator photos
- Missing testimonial names
- Missing gallery alt text
- Missing blog SEO descriptions
- Blog articles without featured images
- Hidden/draft records
- Placeholder links using "#"
- Empty CTA links
- Forms without endpoint and without local storage enabled

Each warning should include:
- Warning title
- Count
- Button to jump to relevant admin section

11. Backup tools
Improve backup behavior.

Export JSON:
- Export the full CMS content object as downloadable JSON.
- Include version and exportedAt timestamp.

Import JSON:
- Let user select/paste JSON.
- Validate basic shape before applying.
- Ask for confirmation before replacing current CMS content.
- Preserve a backup copy in localStorage before import.

Export Submissions CSV:
- Download local submissions as CSV.
- Include headers.

Reset:
- Reset to default content only after confirmation modal.
- Before reset, save current content as backup in localStorage.

12. Admin form UX improvements
For all list editors:
- Add search/filter where relevant.
- Add status filter.
- Add Add/Edit/Delete.
- Add duplicate item action.
- Add up/down reorder buttons or drag handle.
- Show status pill and featured pill on item cards.
- Use confirmation for deletes.
- Use empty states.
- Validate required fields.
- Prevent text overflow.
- Keep responsive layout excellent on 390px mobile and laptop screens.

13. Required public website connections
After implementation, verify these public sections read from CMS:
- Site contact details
- Brand statistics
- Homepage CTAs
- Daycare hero CTAs
- EduHub hero CTAs
- Educators carousel
- Parent testimonials
- Campus gallery
- Daycare programs
- Daily schedule
- Meals/menu
- EduHub courses
- Alumni
- Accreditation cards
- Blog listing
- Blog article pages
- FAQ sections
- Public forms and success messages

14. Technical quality
- Keep TypeScript types/interfaces for CMS content.
- Add migration helpers for older localStorage data.
- Avoid crashes when optional fields are missing.
- Keep components organized.
- Respect existing routing.
- Avoid large unrelated rewrites.
- Do not hardcode duplicate public content after CMS migration.
- Do not break the website if localStorage is empty.

Final result:
The admin should look branded and premium, but more importantly it should behave like a real local CMS prototype where publishing status, featured content, SEO, CTAs, media, forms, and submissions all affect the public website.