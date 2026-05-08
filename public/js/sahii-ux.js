/* Sahii UX helpers
   - Lightweight client-side cache for nav cart count via sessionStorage
   - Hydrates the cart badge instantly on page load (before server-rendered value),
     and refreshes the cache when add/remove cart helpers update the input.
   Safe to load on every page; degrades silently if elements/APIs are missing.
*/
(function () {
  var KEY = "sahii.cartCount.v1";

  function readCachedCount() {
    try {
      var raw = sessionStorage.getItem(KEY);
      if (raw == null) return null;
      var n = parseInt(raw, 10);
      return isNaN(n) ? null : n;
    } catch (e) { return null; }
  }

  function writeCachedCount(n) {
    try { sessionStorage.setItem(KEY, String(n)); } catch (e) {}
  }

  function getInput() { return document.getElementById("cartCountInput"); }

  function applyToBadge(n) {
    var el = getInput();
    if (!el) return;
    el.value = n;
  }

  // 1) On DOM ready: if server rendered a value, trust + cache it.
  //    Otherwise, hydrate from cache for snappy navigation.
  document.addEventListener("DOMContentLoaded", function () {
    var el = getInput();
    if (!el) return;
    var serverVal = parseInt(el.value, 10);
    if (!isNaN(serverVal) && serverVal > 0) {
      writeCachedCount(serverVal);
    } else {
      var cached = readCachedCount();
      if (cached != null) applyToBadge(cached);
    }
  });

  // 2) Watch the badge for programmatic updates from product.js (add/remove)
  document.addEventListener("DOMContentLoaded", function () {
    var el = getInput();
    if (!el || !window.MutationObserver) return;
    var sync = function () {
      var v = parseInt(el.value, 10);
      if (!isNaN(v)) writeCachedCount(v);
    };
    new MutationObserver(sync).observe(el, { attributes: true, attributeFilter: ["value"] });
    el.addEventListener("change", sync);
    // product.js sets .value directly without firing events — poll briefly after clicks
    document.addEventListener("click", function () { setTimeout(sync, 350); }, true);
  });

  // 3) Public helper if anything wants to bust the cache (e.g. logout)
  window.SahiiUX = {
    clearCartCache: function () { try { sessionStorage.removeItem(KEY); } catch (e) {} },
  };
})();

/* ---------------------------------------------------------------
   Savings Badge Injector
   Reads .product-price (selling) and .product-price del (MRP),
   calculates % off + absolute savings, injects a .savings-badge
   into every .product-info .card-dets on the page automatically.
--------------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".product-info .card-dets, .card-dets").forEach(function (card) {
    // Avoid duplicates
    if (card.querySelector(".savings-badge")) return;

    var priceEls = card.querySelectorAll(".product-price");
    if (priceEls.length < 1) return;

    // First .product-price is the selling price (text node), second contains <del>
    var sellingEl = priceEls[0];
    var mrpEl = priceEls.length > 1 ? priceEls[1].querySelector("del") : null;

    // Extract numeric values
    var selling = parseFloat((sellingEl.textContent || "").replace(/[^0-9.]/g, ""));
    var mrp = mrpEl ? parseFloat((mrpEl.textContent || "").replace(/[^0-9.]/g, "")) : 0;

    if (!isNaN(selling) && !isNaN(mrp) && mrp > selling && mrp > 0) {
      var saved = Math.round(mrp - selling);
      var pct   = Math.round((mrp - selling) / mrp * 100);
      var badge = document.createElement("div");
      badge.className = "savings-badge";
      badge.innerHTML =
        '<span class="savings-pct">' + pct + '% OFF</span>' +
        '<span class="savings-amt">You save \u20B9' + saved + '</span>';

      // Insert after the price div
      var priceContainer = sellingEl.closest(".product-price") || sellingEl;
      var insertAfter = priceContainer.parentElement === card
        ? priceContainer
        : card.querySelector(".product-price");
      if (insertAfter && insertAfter.parentNode === card) {
        insertAfter.parentNode.insertBefore(badge, insertAfter.nextSibling);
      } else {
        card.appendChild(badge);
      }
    }
  });
});
