const express = require("express");
const router = express.Router();
const Product = require("../models/productModel");
const Brand = require("../models/brandModel");

const BASE_URL = "https://sahii.in";

// ──────────────────────────────────────────────
// robots.txt
// ──────────────────────────────────────────────
router.get("/robots.txt", (req, res) => {
  res.type("text/plain");
  res.send(
    `User-agent: *
Allow: /
Disallow: /admin
Disallow: /user/
Disallow: /checkout/
Disallow: /myacc
Disallow: /viewAccount
Disallow: /cart

Sitemap: ${BASE_URL}/sitemap.xml`
  );
});

// ──────────────────────────────────────────────
// sitemap.xml  –  generated dynamically from DB
// ──────────────────────────────────────────────
router.get("/sitemap.xml", async (req, res) => {
  try {
    // ── 1. Static pages ───────────────────────
    const staticUrls = [
      { loc: `${BASE_URL}/`,                   priority: "1.0", changefreq: "weekly"  },
      { loc: `${BASE_URL}/sale`,               priority: "0.8", changefreq: "daily"   },
      { loc: `${BASE_URL}/aboutUs`,            priority: "0.5", changefreq: "monthly" },
      { loc: `${BASE_URL}/returnPolicy`,       priority: "0.4", changefreq: "monthly" },
      { loc: `${BASE_URL}/shipping`,           priority: "0.4", changefreq: "monthly" },
      { loc: `${BASE_URL}/terms&conditions`,   priority: "0.3", changefreq: "yearly"  },
    ];

    // ── 2. Brand pages ────────────────────────
    const brands = await Brand.find({}).select("name models").lean();
    const categories = ["spare_parts", "accessories", "tools"];

    const brandUrls = [];
    brands.forEach((brand) => {
      const slug = encodeURIComponent(brand.name.toLowerCase());
      categories.forEach((cat) => {
        brandUrls.push({
          loc: `${BASE_URL}/brand/?category=${cat}&brand=${slug}`,
          priority: "0.7",
          changefreq: "weekly",
        });
        // Model pages
        (brand.models || []).forEach((model) => {
          if (!model.name) return;
          const mSlug = encodeURIComponent(model.name.toLowerCase());
          brandUrls.push({
            loc: `${BASE_URL}/brand/models?brand=${slug}&category=${cat}`,
            priority: "0.7",
            changefreq: "weekly",
          });
          brandUrls.push({
            loc: `${BASE_URL}/product/?brand=${slug}&model=${mSlug}&category=${cat}`,
            priority: "0.6",
            changefreq: "weekly",
          });
        });
      });
    });

    // ── 3. Individual product pages ───────────
    const products = await Product.find({})
      .select("slug updatedAt")
      .lean();

    const productUrls = products
      .filter((p) => p.slug && p.slug.trim() !== "")
      .map((p) => ({
        loc: `${BASE_URL}/product/${encodeURIComponent(p.slug)}`,
        lastmod: p.updatedAt
          ? new Date(p.updatedAt).toISOString().split("T")[0]
          : undefined,
        priority: "0.9",
        changefreq: "weekly",
      }));

    // ── 4. Build XML ──────────────────────────
    const allUrls = [...staticUrls, ...brandUrls, ...productUrls];

    const urlEntries = allUrls
      .map((u) => {
        const lastmodTag = u.lastmod
          ? `\n    <lastmod>${u.lastmod}</lastmod>`
          : "";
        return `  <url>
    <loc>${u.loc}</loc>${lastmodTag}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`;
      })
      .join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;

    res.type("application/xml");
    res.send(xml);
  } catch (err) {
    console.error("Sitemap generation error:", err);
    res.status(500).send("<!-- Sitemap generation failed -->");
  }
});

module.exports = router;
