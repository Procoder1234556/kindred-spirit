const express = require("express");
const router = express.Router();

const BASE_URL = "https://sahiirepairs.in";

// ──────────────────────────────────────────────
// robots.txt for the repairs subdomain
// ──────────────────────────────────────────────
router.get("/robots.txt", (req, res) => {
  res.type("text/plain");
  res.send(`User-agent: *
Allow: /

Sitemap: ${BASE_URL}/sitemap.xml`);
});

// ──────────────────────────────────────────────
// sitemap.xml for repairs subdomain
// ──────────────────────────────────────────────
router.get("/sitemap.xml", (req, res) => {
  // Hardcoded for repairs subdomain example
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${BASE_URL}/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${BASE_URL}/guides</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${BASE_URL}/guides/iphone-battery-replacement</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${BASE_URL}/brands/apple</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`;

  res.type("application/xml");
  res.send(xml);
});

// ──────────────────────────────────────────────
// Page Routes
// ──────────────────────────────────────────────

router.get("/", (req, res) => {
  res.render("repairs/home", {
    pageTitle: "Sahii Repairs - DIY Mobile Repair Guides & Resources",
    pageDesc: "Expert DIY mobile repair guides for iPhone, Samsung, Xiaomi. Learn how to fix screens, batteries, and more with Sahii.",
    canonicalUrl: `${BASE_URL}/`,
  });
});

router.get("/guides", (req, res) => {
  res.render("repairs/guides", {
    pageTitle: "All Repair Guides - Sahii Repairs",
    pageDesc: "Browse our comprehensive list of mobile repair step-by-step guides.",
    canonicalUrl: `${BASE_URL}/guides`,
  });
});

router.get("/guides/:slug", (req, res) => {
  res.render("repairs/guide", {
    pageTitle: "How to Repair " + req.params.slug.replace(/-/g, ' ') + " - Sahii Repairs",
    pageDesc: "Step-by-step instructions to successfully repair your " + req.params.slug.replace(/-/g, ' '),
    canonicalUrl: `${BASE_URL}/guides/${req.params.slug}`,
    guideTitle: req.params.slug.replace(/-/g, ' ').toUpperCase(),
  });
});

router.get("/brands/:brand", (req, res) => {
  res.render("repairs/brand", {
    pageTitle: req.params.brand.toUpperCase() + " Repair Guides - Sahii Repairs",
    pageDesc: "Find all repair guides and resources specifically for " + req.params.brand + " devices.",
    canonicalUrl: `${BASE_URL}/brands/${req.params.brand}`,
    brand: req.params.brand,
  });
});

module.exports = router;
