AUTOCONNECT HOMEPAGE - STITCH TO NEXT.JS

Copy the contents of this package into the ROOT of your existing Next.js project folder (the folder named "autocorrect").
When prompted, replace the existing src/app/page.js and src/app/globals.css files.

Files included:
- src/app/page.js                   Converted Stitch homepage (React/Next.js)
- src/app/globals.css                Stitch colour, font and Tailwind theme
- public/images/autoconnect-hero.png Extracted homepage hero image

Then:
1. Make sure the files are in the paths above.
2. Save all files.
3. Keep the Next.js terminal running. If it is stopped, run: npm run dev
4. Open http://localhost:3000

Homepage interactions implemented:
- Search by driver name, vehicle registration or area
- Filter by area
- Clear filters
- Call Now tel: links
- WhatsApp links
- Fictional sample driver data saved in browser localStorage
- Driver registration CTA toast message

IMPORTANT:
The driver names, vehicle numbers, ratings and phone numbers are fictional demo data copied from the supplied Stitch homepage. Replace them with consented, accurate driver information before publishing. The Call and WhatsApp buttons use those sample numbers in this demo.

The About and Admin pages are linked to /about and /admin, but will be converted in later steps. They may show a 404 until those pages are added.
