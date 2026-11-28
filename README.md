# Pawpartout · Life Design & Legacy (ticketsntails.com)

Static site for GitHub Pages, served at https://ticketsntails.com/ (custom domain in `CNAME`).
Since 28 November 2026 this domain hosts Pawpartout's journal: **Life Design** (four design dossiers and the
3D Pet-Interior Studio) and **Legacy** (The Great Book, The Designer's Craft and the household's stories).
Tickets & Tails no longer exists as a separate travel blog; its old URLs are redirect stubs.

- No ads. Google Analytics `G-K45B2WNXMC` is the only tag.
- The 3D Studio (`/studio/`) uses a vendored three.js r187 (`/studio/vendor/`), no CDN.
- Never `git push --force`, never `--no-verify`. Publish only after Marc's OK.

## Redirects

GitHub Pages cannot send HTTP 301. Each old Tickets & Tails URL is a stub page (meta refresh 0, canonical,
`location.replace`, `noindex`) standing in for the planned Cloudflare 301 rules.

## TODO: retarget later

| Old URL | Points to now (live, HTTP 200 on 28 Nov 2026) | Retarget to |
| --- | --- | --- |
| /camping-with-your-dog/ | https://pawpartout.com/camping/ | the Pawpartout camping article URL (Marc 14:31 KST) |
| /camping-with-your-dog/six-foot-leash-closed-trails/ | https://pawpartout.com/camping/ | the Pawpartout camping article URL |
| /outdoors/ | https://pawpartout.com/camping/ | the Pawpartout camping article URL |
| /printable-checklists/ | https://petpolicycheck.com/pet-travel-checklist/ | https://petpolicycheck.com/countries/south-korea.html#leaving-korea-export (final, when live) |
| /printable-checklists/korea-to-us-pet-move-checklist/ | https://petpolicycheck.com/pet-travel-checklist/ | https://petpolicycheck.com/countries/south-korea.html#leaving-korea-export (final, when live) |
| /two-species-one-itinerary/ | https://petpolicycheck.com/field-guides/ | https://petpolicycheck.com/countries/usa.html#federal (final, when live) |
| /two-species-one-itinerary/flying-dogs-and-cats-on-the-same-itinerary/ | https://petpolicycheck.com/field-guides/ | https://petpolicycheck.com/countries/usa.html#federal (final, when live) |
| /drafts/what-to-check-before-you-fly/ | https://petpolicycheck.com/field-guides/ | https://petpolicycheck.com/countries/usa.html#federal (final, when live) |

The original texts of the checklist, the two-species article and the camping article are in git history
(`main` at 2096f81) and must be ported to their new homes before the stubs are retargeted.

## Local preview

```bash
python3 -m http.server 8871
```
