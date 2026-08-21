Create a lightweight CMS-style admin system for this website so non-technical users can edit the site content from an `/admin` dashboard.

Important:
- This is a prototype CMS using localStorage.
- Do not add a real backend.
- Do not change the public website design except where needed to make content dynamic.
- Refactor public pages to read from a shared content data object instead of hardcoded arrays/text.
- Include JSON import/export so content can be backed up and restored.

Admin access:
- Add `/admin`.
- Add simple password screen.
- Prototype password: admin123.
- Store admin unlocked state in sessionStorage.
- Add logout button.

CMS sections:

1. Site Settings
Editable fields:
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
- Footer copyright text
- Brand statistics, including label and value

2. Images / Media Library
Create a simple media manager:
- Allow adding image records with:
  - Image title
  - Image URL
  - Alt text
  - Category: Daycare, EduHub, Campus, Educators, Blog, Testimonials, General
- Allow editing/deleting image records.
- Allow selecting images from this media library in other CMS sections.
- Since this is localStorage only, do not upload real files. Use image URLs for now.
- Add helper text explaining: “Use hosted image URLs or Figma asset URLs.”

3. Daycare Hero
Editable fields:
- Eyebrow badge
- Headline
- Highlighted headline word/line
- Subtitle
- Primary CTA label/link
- Secondary CTA label/link
- Hero image selected from media library
- Trust badges

4. Educators
Editable list with add/edit/delete/reorder:
- Name
- Display order
- Role/title
- Qualification
- Years of experience
- Specialty badge
- Short bio
- Portrait image selected from media library
- Featured toggle
- Leadership toggle
- Active/hidden toggle

Default order:
1. Nesrin Hassanin
2. Lamia Hassanin
3. Sarah Al-Masri
4. Nadia Hassan
5. Reem Fouad

The public Educators carousel should read from this CMS data, sorted by display order, showing only active educators.

5. Parent Reviews / Testimonials
Editable list with add/edit/delete/reorder:
- Parent name
- Parent title/context, e.g. “Parent of Layla, Age 4”
- Review text
- Rating
- Child age/program
- Featured toggle
- Parent image optional from media library
- Active/hidden toggle

The public reviews section should read from CMS data and show active reviews only.

6. Campus Gallery
Editable gallery list with add/edit/delete/reorder:
- Image selected from media library
- Title
- Category: Classrooms, Activity Areas, Playground, Dining Area, Reading Corner, Campus
- Caption
- Featured toggle
- Active/hidden toggle

The public Campus Gallery section should read from this CMS data. Keep existing gallery tabs/categories but make them dynamic based on CMS categories.

7. Daycare Programs
Editable list:
- Program/class name
- Age range
- Stage label
- Icon/emoji
- Short description
- Ratio
- Max class size
- Key features list
- Active/hidden toggle
- Display order

8. Daily Schedule
Editable list:
- Time
- Activity title
- Icon/emoji
- Development areas/tags
- Description
- Why it matters
- Display order
- Active/hidden toggle

9. Meals / Weekly Menu
Editable fields:
- Week/menu title
- Day
- Meal title
- Sides/details
- Icon/emoji
- Snack list
- Dietary policy text

10. EduHub Courses
Editable list:
- Course level/name
- Status
- Course title
- Short description
- Duration
- Teaching hours
- Cost/pricing text
- Mode
- Who it is for list
- Entry requirements list
- Learning outcomes list
- CTA label/link
- Active/hidden toggle
- Display order

11. EduHub Trainers / Alumni
Editable lists:
- Trainers: name, role, qualification, experience, bio, portrait image, active/hidden
- Alumni: name, current role, completed course, quote, image optional, featured, active/hidden

12. Accreditation / Proof
Editable list:
- Partner/accreditation name
- Description
- Logo/image selected from media library
- External link
- Active/hidden toggle
- Display order

13. Blog CMS
Editable blog article list:
- Title
- Slug
- Audience: Parents or Educators
- Category
- Excerpt
- Body content as textarea
- Author name
- Author title
- Publish date
- Read time
- Featured image selected from media library
- Featured toggle
- Active/hidden toggle
- SEO title
- SEO description

The public blog listing and individual blog pages should read from CMS data. Blog filters/search should use the CMS article data.

14. FAQ
Editable FAQ groups:
- Group: Daycare, EduHub, General
- Question
- Answer
- Display order
- Active/hidden toggle

15. Form Settings
Editable fields:
- Daycare form destination email
- EduHub form destination email
- WhatsApp number
- Thank-you message for daycare
- Thank-you message for EduHub
- Optional external form action URL
- Optional redirect after submit

Do not build a real email backend. If no external form action URL is provided, show a clear success state and store submissions in localStorage under “Submissions”.

16. Submissions Inbox
Create an admin-only submissions inbox:
- Show daycare and EduHub form submissions saved in localStorage.
- Include submitted date/time, name, email, phone, message, source form.
- Allow marking as read/unread.
- Allow deleting submissions.
- Allow exporting submissions as JSON or CSV.

Admin UX:
- Use a clean professional dashboard layout with sidebar navigation.
- Use clear forms, section tabs, add/edit modals or inline editors.
- Add search/filter where lists may grow: educators, reviews, media, blog, submissions.
- Add drag/reorder buttons or up/down controls for ordered lists.
- Add save/cancel states.
- Add empty states.
- Add required-field validation.
- Add a “Preview Site” link back to the public website.
- Add “Reset to Default Content” button, but ask for confirmation first.

Technical requirements:
- Keep data in one shared content model.
- Seed localStorage with current website content on first load.
- Prevent crashes if content fields are missing.
- Use stable IDs for CMS records.
- Keep TypeScript types/interfaces for CMS content.
- Keep code organized into reusable admin components where possible.

Final requirement:
After implementation, make sure the following public sections are powered by CMS data:
- Educators carousel
- Parent reviews
- Campus gallery
- Blog listing and articles
- Daycare programs
- EduHub courses
- Contact details
- Brand stats