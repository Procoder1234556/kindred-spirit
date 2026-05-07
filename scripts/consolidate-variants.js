/**
 * scripts/consolidate-variants.js
 *
 * Finds products that share the same (title + model) but differ only by color,
 * then merges them into a single product document with a populated `variants` array.
 *
 * ⚠️  DESTRUCTIVE — take a DB backup before running in production.
 *
 * Usage:
 *   node scripts/consolidate-variants.js          # dry-run (no writes)
 *   node scripts/consolidate-variants.js --commit  # actually writes to DB
 */

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Product = require("../models/productModel");

dotenv.config();

// ── Helper: attempt color-namer, fall back gracefully ──────────────────────
let namer;
try {
  namer = require("color-namer");
} catch (_) {
  namer = null;
}

function resolveColorName(hex) {
  if (!hex || typeof hex !== "string" || hex.trim() === "") return "Default";
  const h = hex.trim();
  if (namer) {
    try {
      const result = namer(h);
      return result && result.html && result.html[0] ? result.html[0].name : h;
    } catch (_) {
      return h;
    }
  }
  return h; // return raw hex/name if library not available
}

// ── Main ───────────────────────────────────────────────────────────────────
const DRY_RUN = !process.argv.includes("--commit");

async function main() {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  console.log(`\n🔍  Mode: ${DRY_RUN ? "DRY RUN (pass --commit to write)" : "COMMIT"}\n`);

  const products = await Product.find({}).lean();

  // ── Group by normalised title + model ─────────────────────────────────
  const groups = {};
  for (const p of products) {
    const title = (p.title || "").trim().toLowerCase();
    const model = (p.model || "").trim().toLowerCase();
    const key = `${title}||${model}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(p);
  }

  let mergeCount = 0;
  let deleteCount = 0;

  for (const [key, group] of Object.entries(groups)) {
    // Only process groups that actually have more than one product
    if (group.length < 2) continue;

    // Sort deterministically (by first color entry or _id string)
    group.sort((a, b) => {
      const ca = (Array.isArray(a.color) ? a.color[0] : a.color) || "";
      const cb = (Array.isArray(b.color) ? b.color[0] : b.color) || "";
      return ca.localeCompare(cb);
    });

    const primary = group[0];
    const toDelete = group.slice(1).map((p) => p._id);

    // Build variants array from ALL members of the group
    const variants = group.map((p) => {
      const rawColor = Array.isArray(p.color)
        ? p.color[0]
        : typeof p.color === "string"
        ? p.color
        : "";
      return {
        color: resolveColorName(rawColor),
        colorHex: rawColor || "#cccccc",
        stockQuantity: typeof p.quantity === "number" ? p.quantity : 0,
        actualPrice: p.sellingPrice || p.price || 0,
      };
    });

    // Aggregate total stock across variants
    const totalStock = variants.reduce((s, v) => s + v.stockQuantity, 0);

    console.log(`\n📦  Group: "${primary.title}" / model: "${primary.model}"`);
    console.log(`    → Keeping  : ${primary._id}  (${variants[0].color})`);
    toDelete.forEach((id, i) =>
      console.log(`    → Deleting : ${id}  (${variants[i + 1].color})`)
    );
    console.log(`    → Variants : ${JSON.stringify(variants)}`);

    if (!DRY_RUN) {
      // Update the primary product
      await Product.findByIdAndUpdate(primary._id, {
        $set: {
          variants,
          quantity: totalStock,
        },
      });

      // Remove the duplicates
      if (toDelete.length > 0) {
        await Product.deleteMany({ _id: { $in: toDelete } });
      }
    }

    mergeCount++;
    deleteCount += toDelete.length;
  }

  console.log(`\n✅  Summary:`);
  console.log(`    Groups merged : ${mergeCount}`);
  console.log(`    Docs deleted  : ${deleteCount}`);
  if (DRY_RUN) {
    console.log(`\n    ⚠️  DRY RUN — nothing was written. Re-run with --commit to apply.`);
  }

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error("❌  Migration failed:", err);
  process.exit(1);
});
