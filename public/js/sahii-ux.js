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
