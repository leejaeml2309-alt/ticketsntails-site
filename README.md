# Tickets & Tails

A travel journal for dogs and cats, published at [ticketsntails.com](https://ticketsntails.com/). The brand name is **Tickets & Tails**; the domain is **ticketsntails.com**.

This repository is a static site for GitHub Pages. It was built from the approved mock-up (home, article, category, about, linocut art of Future, Lili and Lilou). Mock-up-only ribbons, “sample” labels and placeholder lorem have been removed.

## Deploy (GitHub Pages + Porkbun)

The domain is registered at Porkbun. Do not start on a petpolicycheck.com subdomain.

1. Create a public GitHub repository named `ticketsntails-site` under `leejaeml2309-alt` (public is required for GitHub Pages on a free account).
2. Push the `main` branch (this repository, including the `CNAME` file).
3. In the repository, enable GitHub Pages: source **main** branch, folder **/ (root)**.
4. Set the custom domain to `ticketsntails.com` and, once the HTTPS certificate is issued, enforce HTTPS.
5. At Porkbun, **delete the default parking records first**, then add:

   | Type | Host | Answer |
   | --- | --- | --- |
   | A | `@` | `185.199.108.153` |
   | A | `@` | `185.199.109.153` |
   | A | `@` | `185.199.110.153` |
   | A | `@` | `185.199.111.153` |
   | AAAA (optional) | `@` | `2606:50c0:8000::153` |
   | AAAA (optional) | `@` | `2606:50c0:8001::153` |
   | AAAA (optional) | `@` | `2606:50c0:8002::153` |
   | AAAA (optional) | `@` | `2606:50c0:8003::153` |
   | CNAME | `www` | `leejaeml2309-alt.github.io` |

   DNS can take some minutes to propagate. After it resolves, GitHub can finish the certificate and HTTPS enforcement.

Do not use `git push --force`.

## What is in the launch site

- Public pages: Home, six category indexes (Airlines, Trains & taxis, Hotels, Destinations, Nutrition & gear, Adoption), About, Contact, Privacy & Cookies, 404.
- Canonical URLs on `https://ticketsntails.com/`, `sitemap.xml`, `robots.txt`, RSS `feed.xml`, favicon set from the ticket-stub brand mark, and an Open Graph image.
- Home and category pages launch in a clean **First stories coming soon** / **Stories coming soon** state. Category navigation and the linocut cover are the approved design.
- A draft article lives at `/drafts/what-to-check-before-you-fly/` (`noindex`, not linked from Home, categories, the sitemap or the RSS feed).

## Content still needed (3–5 launch articles)

No published story is live, because the mock-up text was placeholder only and was not accurate finished journalism. To launch the journal with stories (rather than only About), PPC Manager / the editorial side should supply **3 to 5** real articles, checked against official sources, for example:

1. **Airlines** — “What to check before you fly with a dog or a cat” (a draft layout already exists).
2. **Trains & taxis** — a first note on trains, stations or booking a ride, pointing to the operator’s own rules.
3. **Hotels** — a first note on confirming a stay with a dog or a cat, without quoting fees or limits as if they were settled here.
4. **Destinations** — a first note on using official entry pages before a journey (no country rules invented on the page).
5. **Nutrition & gear** or **Adoption** — a packing or post-adoption travel note, with no veterinary or legal advice.

Each published article should name official sources and dates where rules are discussed, use affiliate links only with `rel="sponsored nofollow noopener"` (the Amazon tag is in `assets/js/config.js`), and repeat the Amazon Associate disclosure on the page.

Also needed when ready: a public contact mailbox for the Contact page (currently it points readers to PetPolicyCheck until that address exists).

## Monetisation

This site is on its own domain, so advertising is allowed here. **Never add AdSense or other ad code to the PetPolicyCheck site.**

- **Google AdSense** auto ads, publisher `ca-pub-7693501377730690`, in the document `<head>`. `ads.txt` at the site root: `google.com, pub-7693501377730690, DIRECT, f08c47fec0942fa0`.
- **Amazon Associates** tracking tag is in **one** place, `assets/js/config.js`, currently `petpolicychec-20`. A `TODO` in that file notes that PPC Manager may replace it with a dedicated Tickets & Tails tracking ID. Links generated from `data-amazon-asin` get `rel="sponsored nofollow noopener"`. The required disclosure, “As an Amazon Associate I earn from qualifying purchases,” is in the footer of every page (and should also appear on any page that has affiliate links).

## Cookies and Consent Mode v2

The cookie banner is on-brand and keyboard-accessible, with **Accept**, **Reject** and **Settings**. The choice is stored in the browser. Google Consent Mode v2 defaults are **denied** until consent for `ad_storage`, `ad_user_data`, `ad_personalization` and `analytics_storage`. Ads are requested in non-personalised mode until the reader accepts advertising cookies. Privacy details are on `/privacy/`.

**Account action (Marc / PPC Manager):** Google requires a Google-certified CMP for traffic from the EEA, the UK and Switzerland. The simplest path is to enable the AdSense **Privacy & messaging** GDPR message on the AdSense account for this site. The first-party banner implements Consent Mode v2 but is not itself a Google-certified CMP.

Other account actions for launch:

- Add `ticketsntails.com` (and `www.ticketsntails.com` if needed) as a site in the AdSense account `ca-pub-7693501377730690`, so ads are allowed to serve.
- Optionally create a dedicated Amazon Associates tracking ID for Tickets & Tails and put it in `assets/js/config.js` in place of `petpolicychec-20`.
- Set up a contact mailbox and add it to `/contact/`.

## Local preview

Serve the repository root (not a parent folder) so root-relative paths resolve:

```bash
python3 -m http.server 8080
```

Then open `http://127.0.0.1:8080/`.
