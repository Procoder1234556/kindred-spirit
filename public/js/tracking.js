// tracking.js — Sprint 3: Minimal event tracking
(function () {
  'use strict';

  function getSessionId() {
    let sid = sessionStorage.getItem('_sahii_sid');
    if (!sid) {
      sid = 'sid_' + Math.random().toString(36).slice(2) + Date.now();
      sessionStorage.setItem('_sahii_sid', sid);
    }
    return sid;
  }

  async function sendEvent(eventName, data) {
    try {
      await fetch('/track/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: eventName,
          sessionId: getSessionId(),
          timestamp: new Date().toISOString(),
          ...data,
        }),
      });
    } catch (e) {
      // silent fail — tracking must never break the page
    }
  }

  // Expose globally
  window.trackProductView = function (productId, title) {
    sendEvent('product_view', { productId, title });
  };

  window.trackAddToCart = function (productId, title, price) {
    sendEvent('add_to_cart', { productId, title, price });
  };
})();
