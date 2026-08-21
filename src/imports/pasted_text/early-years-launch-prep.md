Audit and fix the Early Years Company website and `/admin` CMS for real launch readiness.

Goal:
Make the public website feel premium, trustworthy, conversion-focused, and ready to become the official website for both The Daycare and EduHub. At the same time, make sure every admin/CMS feature is functional and connected to the Supabase backend. Nothing in `/admin` should be cosmetic only.

Do not rebuild the website from scratch. Keep the current visual direction, but fix weak areas, backend connections, launch details, SEO, forms, media, documents, and content contradictions.

Core rule:
Every admin section should either control something real on the public website or be removed/simplified.

1. Simplify CMS Publishing
Remove or hide:
- Import
- Export
- Save Draft
- Prepare Publication

Replace with:
- One primary button: “Publish Changes”

Behavior:
- Clicking “Publish Changes” saves current admin data to Supabase.
- Public website should immediately read from the latest published Supabase CMS data.
- Show success message: “Published successfully. Public website updated.”
- No separate draft/publication staging for now.
- Keep backend flow simple and reliable.

2. Make Site Settings Functional
Site Settings must update the public website after publishing.

Fields that must work:
- Company name
- Main email
- Daycare email
- EduHub email
- Main phone
- Daycare phone
- EduHub phone
- WhatsApp number
- Address
- Google Maps link
- LinkedIn URL
- Instagram URL
- Footer copyright
- Brand statistics

Public website areas that must use Site Settings:
- Homepage footer
- Daycare footer
- EduHub footer
- Contact pages
- CTA phone links
- WhatsApp buttons
- Sticky mobile CTA
- Brand stat rows
- Google Maps links
- Social links

Remove hardcoded contact/social/map values that conflict with Site Settings.

3. Make CTA Settings Functional
CTA Settings must update public CTAs.

Connect admin CTA fields to:
- Homepage Daycare card CTA
- Homepage EduHub card CTA
- Daycare hero buttons
- EduHub hero buttons
- Daycare final CTA section
- EduHub final CTA section
- Mobile sticky CTA buttons
- Blog CTA blocks where relevant

If a CTA link is empty, show a Content Health warning.

4. Fix Forms and Email Delivery
Form Settings must control real form behavior.

Requirements:
- Daycare forms use Daycare destination email from Form Settings.
- EduHub forms use EduHub destination email from Form Settings.
- General contact forms use General destination email from Form Settings.
- All forms save submissions to Supabase `submissions`.
- Admin Submissions inbox shows all submissions.
- Forms show the correct thank-you message from Form Settings.
- WhatsApp redirect uses WhatsApp number from Site/Form Settings.
- No page reload on submit.

Important:
Frontend-only apps cannot safely send email directly unless connected to a real email/form endpoint.

If direct email sending is not possible:
- Add required field: “Email Delivery Endpoint / Webhook URL”
- Send form payload to that endpoint with `destinationEmail`
- Still save submission to Supabase
- Show warning if missing: “Submissions are saved in the CMS inbox, but email delivery is not configured.”
- Do not pretend emails are sent if no delivery mechanism exists.

5. Make Media Library Functional
Media Library must support real image/document records stored in Supabase CMS data.

Each media item:
- Title
- File URL
- File type: image, PDF, document, other
- Alt text
- Category: Daycare, EduHub, Campus, Educators, Blog, Testimonials, Documents, General
- Status: Published/Hidden
- Usage list

Features:
- Add/edit/delete media items
- Show image thumbnails
- Show file icon for PDFs/documents
- Show Missing Alt warning for images
- Show Unused filter
- Allow media selection from image fields across the CMS

CMS fields that should use Media Library:
- Blog featured images
- Educator portraits
- Gallery images
- Accreditation logos
- Hero images
- Testimonial images where applicable

6. Add Documents / Files Management
Add or improve a Documents / Portal Files section.

Each document:
- Title
- File URL
- File type
- Category:
  - Parent information pack
  - Program guide
  - Enrollment form
  - Policies
  - Calendar
  - Menu
  - EduHub course schedule
  - EduHub course guide
  - Accreditation document
- Audience: Public, Parents, EduHub, Internal
- Status: Published/Hidden
- Optional description

Public website behavior:
- Download Parent Information Pack uses relevant published document URL.
- Download Program Guide uses relevant published document URL.
- EduHub course downloads use relevant document URLs.
- If a document URL is missing, hide the CTA or show Content Health warning.

If actual upload is not possible:
- Use hosted file URLs for now.
- Add helper text: “Upload files to Supabase Storage, Google Drive public link, or another host, then paste the URL here.”
- Do not show fake upload behavior.

7. Complete Blog Backend
All existing public blog articles must exist in the CMS backend.

Blog CMS fields:
- Title
- Slug
- Audience: Parents/Educators
- Category
- Excerpt
- Full body
- Author
- Publish date
- Read time
- Featured image from Media Library
- SEO title
- SEO description
- Status: Published/Hidden
- Featured toggle

Requirements:
- Public blog listing reads from Supabase CMS data.
- Public article pages read from Supabase CMS data.
- Ability to add/edit/delete blog articles.
- Ability to add optional image per blog.
- If no image is selected, use a polished fallback layout.
- Blog internal links must work.

8. Make Daycare Fully Backend-Driven
The following Daycare content must be editable from admin and reflected publicly:
- Hero text and image
- Trust badges
- Programme age cards
- Daily schedule
- Meals/nutrition copy
- Calendar events
- Parent reviews/testimonials
- Educators
- Campus gallery
- FAQ
- Parent portal/download links
- Contact details
- Final CTA

Remove hardcoded Daycare content that contradicts admin data.

9. Make EduHub Fully Backend-Driven
The following EduHub content must be editable from admin and reflected publicly:
- Hero text and image
- Course cards
- Course detail pages if they exist
- Trainer/alumni info
- Accreditation cards/logos
- Blog/resource links
- FAQ
- Course document downloads
- Contact details
- Register Interest CTAs
- Final CTA

Remove hardcoded EduHub content that contradicts admin data.

10. Improve Public Website Positioning
Homepage:
- Clearly explain that Early Years Company includes two branches:
  - The Daycare: EYFS nursery and childcare at AUC New Cairo
  - EduHub: UK-accredited CACHE teacher training in Egypt
- Add one concise line under the hero explaining this relationship.
- Make both homepage cards premium, balanced, and visually distinct.
- Keep homepage simple and decisive.

Daycare:
- Make “Book a Tour” the dominant CTA.
- Add/improve proof:
  - Real campus/daycare photos
  - Educator credentials
  - Real parent testimonials
  - Safety/security details
  - AUC location advantage
  - Nutritionist-designed meals
- Add section: “What happens after you book?”
  1. We confirm your visit
  2. You tour the campus
  3. We recommend the right class
  4. You receive enrolment steps

EduHub:
- Make “Register Interest” the dominant CTA.
- Strengthen credibility:
  - CACHE / NCFE / BriteThink accreditation explanation
  - External accreditation link
  - Trainer/team section
  - Alumni outcomes
  - Course structure
  - Certificate/qualification recognition
- Improve Level 2, Level 3, Level 5 course cards:
  - Duration
  - Mode
  - Who it is for
  - Entry requirements
  - Pricing or “Request fees”
  - Next cohort date or “Ask about next intake”
- Add section: “What happens after you register?”
  1. We contact you
  2. We recommend the right level
  3. You receive schedule and fees
  4. You begin enrolment

11. Fix Content Contradictions
Run a full content consistency pass.

Check and fix:
- Daycare age range:
  - Nursery/preschool: 1–5
  - Older ages only in after-school/camps sections
- Years:
  - Use consistent wording for 25+ years overall
  - Use accurate wording for years at AUC
- British English consistency:
  - Centre
  - Programme
  - Enrolment
  - Child-centred
- Phone number formatting
- WhatsApp number placeholders
- Claims:
  - 98% satisfaction
  - 200+ families
  - 500+ EduHub graduates
  - First CACHE-approved centre
- Footer links
- Parent Portal:
  - If not ready, label “Coming Soon” or remove from primary navigation

12. Improve Visual Polish
- Replace remaining stock-looking photos with real Early Years/AUC/classroom/training photos where available.
- Keep image treatment consistent: radius, crop, shadow, brightness.
- Reduce excessive emoji usage where it feels less premium.
- Use icons consistently.
- Make cards, buttons, badges, shadows, and spacing consistent across Daycare and EduHub.
- Tighten section spacing where pages feel too long.

13. Improve Mobile
Audit at 390px mobile width.

Ensure:
- No horizontal overflow
- No clipped carousel cards
- Sticky CTA does not cover content
- Buttons are easy to tap
- Header navigation is clear
- Text does not overflow
- Images crop well
- Mobile CTAs are persistent but not intrusive

14. SEO and Google Readiness
Make SEO technically ready.

Add/fix:
- Unique page titles
- Unique meta descriptions
- Open Graph title/description/image
- Canonical URLs
- Image alt text
- Proper H1 structure
- Local keywords naturally included:
  - nursery in New Cairo
  - EYFS nursery Cairo
  - daycare at AUC New Cairo
  - CACHE courses Egypt
  - early years teacher training Egypt
- Blog internal links to relevant Daycare/EduHub pages
- JSON-LD structured data:
  - Organization
  - LocalBusiness / ChildCare
  - EducationalOrganization
  - BreadcrumbList
  - Article schema
- robots.txt content
- sitemap.xml generation or static sitemap list including all public pages and published blog articles

Admin SEO section should control:
- Homepage SEO
- Daycare SEO
- EduHub SEO
- Blog SEO
- Default OG image
- Per-article SEO

If sitemap.xml or robots.txt cannot be served directly:
- Add admin SEO checklist with exact content to copy into hosting/domain setup.
- Add “Generate Sitemap” button that displays/downloads sitemap XML.

15. Improve Footer
Footer should be clean and useful.

Structure:
- Early Years Company
- Daycare
- EduHub
- Contact

Include:
- Phone
- Email
- WhatsApp
- Location
- LinkedIn
- Instagram

Remove:
- Dead links
- Placeholder links
- Unnecessary “Back to main site” links except where useful

16. Content Health Must Be Real
Content Health should detect actual issues:
- Missing Site Settings values
- Placeholder WhatsApp numbers
- Empty CTA links
- Forms with no email endpoint configured
- Blog posts missing SEO descriptions
- Blog posts missing images
- Images missing alt text
- Documents missing URLs
- Hidden items expected to be public
- Dead links or "#"
- Age range contradictions
- Missing accreditation proof links
- Missing Google Maps link

Each issue should include a button to jump to the relevant admin section.

17. Claims & Verification
Make Claims & Verification functional.

Track:
- 25+ years
- 98% parent satisfaction
- 200+ families
- 500+ EduHub graduates
- First CACHE-approved centre in Egypt
- AUC campus location

Each claim:
- Claim text
- Where it appears
- Verification/source note
- Supporting document or URL
- Status: Verified / Needs Proof / Hide from public

If “Hide from public,” remove or soften that claim publicly.

18. Launch Checklist
Add a Launch Checklist section in admin:
- Domain connected
- Supabase connected
- Forms tested
- Submissions inbox tested
- Email delivery configured
- WhatsApp links verified
- All public CTAs tested
- SEO titles/descriptions complete
- Sitemap generated
- Google Search Console pending/connected
- Real photos added
- Documents linked
- No placeholder links
- Mobile reviewed
- Owner approved

19. Final Verification
After implementation, verify:
- Site Settings update public website after Publish Changes.
- CTA Settings update public CTAs.
- Form Settings affect real form behavior.
- Submissions save to Supabase and appear in admin.
- Media Library items can be selected and displayed publicly.
- Documents power download CTAs.
- Adding/editing blog articles updates public blog pages.
- Daycare and EduHub pages read from backend data.
- Public content updates globally, not just current browser.
- No contradictions remain.
- No fake backend controls remain.
- All CTAs, forms, external links, mobile layouts, footer links, placeholder text, placeholder numbers, and locked/coming-soon pages are checked.

Final result:
The website should feel like a polished official business website worth paying for, not a Figma prototype. It should help parents book tours and educators register interest with confidence, with a functional Supabase-backed CMS where every admin feature controls real public website behavior.