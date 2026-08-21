# Replaceable image slots

Public website images live in `public/images/slots` and use semantic filenames.

Examples:

- `daycare.hero.jpg`
- `daycare.gallery.classroom.jpg`
- `eduhub.hero.jpg`
- `eduhub.about.team.jpg`

Replace a file while keeping its filename, then rebuild the site. Static page imagery
always uses these local files and never depends on Supabase.

Teacher, testimonial, and alumni portraits are dynamic-profile slots. They may use a
profile URL supplied by the CMS, but retain the local file as an offline fallback.

Run `npm run images:sync` to repopulate the slots from the fallback URLs in
`public/asset-manifest.json`.

