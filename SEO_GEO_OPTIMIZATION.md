# INZRA SEO & GEO Optimization Report
**Last Updated:** August 25, 2026
**Status:** Catalog: 40 products (backlink-focused; a prior pass removed ~65 off-niche listings). Technical SEO/GEO pass complete on all 86 live pages.

---

## What's actually live right now

- **40 product pages** (`products/`) — backlink and SEO-service listings only. A broader catalog (website design, hosting, POS software, email lists, etc.) existed earlier and was intentionally trimmed to keep the site topically focused on backlinks/SEO.
- **40 blog articles** (`blog/`) — one educational article per surviving product, cross-linked back to the product page.
- **6 core pages** — `index.html`, `marketplace.html`, `categories.html`, `pricing.html`, `blog.html`, `contact.html`.
- Brand is **INZRA** everywhere (no leftover "Anchorbase" text). Canonical domain is **inzra.com** (matches the real support email `support@inzra.com`) — the old `anchorbase.example` placeholder is gone from every canonical/OG/schema URL, `robots.txt`, and `sitemap.xml`.
- URLs are extension-less (`/marketplace`, `/products/slug`) via `.htaccess` `mod_rewrite`. **This requires Apache with `mod_rewrite` enabled on the live host** — confirm that before/after deploy, since clean URLs will 404 without it.

## This pass (2026-08-25)

1. **Brand/domain consistency** — every `Anchorbase` → `INZRA`, every `anchorbase.example` → `inzra.com`, across all 86 HTML pages plus `robots.txt`, `sitemap.xml`, `style.css`, `script.js`.
2. **Fixed real bugs found in the existing markup**:
   - `pricing.html` had an unclosed `<meta name="twitter:title">` tag (missing `>`) that was swallowing the following favicon `<link>` — fixed.
   - 5 pages (`blog.html`, `categories.html`, `contact.html`, `marketplace.html`, `pricing.html`) had a literal `` `n `` string (a botched PowerShell escape) sitting as visible stray text between two `<head>` tags — removed.
   - `robots.txt` pointed at `sitemap-blog.xml` and `sitemap-products.xml`, neither of which exists — removed those dead references.
3. **`sitemap.xml` rebuilt from scratch** — was previously 6 URLs (the main pages only). Now lists all **86** live URLs (6 main + 40 products + 40 blog posts), with blog `lastmod` dates pulled from each article's real publish date.
4. **Image `alt` text** — every product/listing/article-cover image had `alt=""`. Filled in on all ~86 pages using the real product/article title next to each image (accessibility + image search).
5. **Structured data (JSON-LD) added, page-type by page-type** — all fields pulled from content already on the page, nothing fabricated:
   - **Products (40):** `Product` schema (name, sku, price, availability, brand, image) + `BreadcrumbList` + `FAQPage` (built from the existing Delivery/Returns/Buyer-protection bullets).
   - **Blog posts (40):** `BlogPosting` schema (headline, dates, author/publisher) + `BreadcrumbList` + `FAQPage` on the 36 articles that already have a "Frequently asked…" section.
   - **Marketplace:** `CollectionPage` with an `ItemList` of all 40 product URLs + `BreadcrumbList`.
   - **Categories:** `ItemList` of the 8 categories + `BreadcrumbList`.
   - **Pricing:** `Service`/`OfferCatalog` schema for the 3 plans (Essential/Growth/Authority) + `BreadcrumbList`.
   - **Blog index:** `Blog` schema listing all 40 posts + `BreadcrumbList`.
   - **Contact:** `BreadcrumbList` added (its `FAQPage`/`Organization` schema already existed and was correct — only needed the domain fix).
   - **Homepage:** already had `LocalBusiness` + `BreadcrumbList` from a prior pass — domain fixed, left otherwise as-is.

None of this pass touched visible page copy, pricing, or the product/blog catalog itself — it's meta tags, structured data, alt text, and the two technical files (`robots.txt`, `sitemap.xml`).

---

## Known caveat worth flagging

The homepage's `LocalBusiness` schema and the on-page testimonials carry specific numbers (4.9/5, "2,841 reviews") that were already present before this pass and were left untouched. If those figures aren't from a real review platform, that's worth fixing before it's treated as a ranking asset — Google's structured-data guidelines penalize `AggregateRating`/`Review` markup that doesn't reflect genuine reviews. Flagging it here rather than silently leaving it as an unstated assumption.

---

## Recommended next steps

1. **Deploy and verify `.htaccess` is actually honored** — the clean-URL scheme this whole site depends on only works if the host runs Apache with `mod_rewrite`. Test `/marketplace` (no `.html`) resolves before considering this done.
2. **Submit `sitemap.xml` in Google Search Console / Bing Webmaster Tools** once live at `inzra.com`.
3. **Decide on the trimmed catalog** — if any of the ~65 removed listings (POS software, website design, email lists, resume writing, etc.) were still generating revenue, they're recoverable from git history; they were deliberately left out of this SEO pass since the working assumption is that the niche-down was intentional.
4. **Real reviews** — replace or substantiate the aggregate rating numbers before they're leaned on further for SEO/GEO purposes.
