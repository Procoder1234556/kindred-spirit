(function () {
  'use strict';

  function init() {
    var metaEl = document.querySelector('meta[name="user-id"]');
    if (!metaEl) return;

    var userId = metaEl.content;
    var storageKey = 'sahii_scratch_v1_' + userId;
    if (localStorage.getItem(storageKey)) return;

    setTimeout(function () {
      fetch('/coupon/all_coupons')
        .then(function (r) { return r.json(); })
        .then(function (data) {
          var coupons = Array.isArray(data) ? data : (data.coupons || []);
          var now = new Date();
          var valid = coupons.filter(function (c) {
            return !c.expiry || new Date(c.expiry) > now;
          });
          if (!valid.length) return;
          var coupon = valid[Math.floor(Math.random() * valid.length)];
          showModal(coupon, storageKey);
        })
        .catch(function () {});
    }, 1800);
  }

  function showModal(coupon, storageKey) {
    var modal = document.getElementById('scratchCardModal');
    if (!modal) return;

    document.getElementById('sc-discount').textContent = coupon.discount + '% OFF';
    document.getElementById('sc-code').textContent = coupon.name;
    var minEl = document.getElementById('sc-min');
    minEl.textContent = coupon.minValue
      ? 'On orders above \u20b9' + coupon.minValue
      : 'On your next order!';

    modal.style.display = 'flex';
    requestAnimationFrame(function () {
      modal.classList.add('sc-visible');
    });
    document.body.classList.add('sc-open');

    setupCanvas();

    document.getElementById('sc-close').addEventListener('click', function () { closeModal(storageKey); });
    document.getElementById('sc-later-btn').addEventListener('click', function () { closeModal(storageKey); });
    document.getElementById('sc-copy-btn').addEventListener('click', copyCode);
    modal.addEventListener('click', function (e) {
      if (e.target === modal) closeModal(storageKey);
    });
  }

  function setupCanvas() {
    var canvas = document.getElementById('scratchCanvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var W = canvas.width = canvas.offsetWidth || 300;
    var H = canvas.height = canvas.offsetHeight || 120;

    var grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, '#c0c0c0');
    grad.addColorStop(0.2, '#efefef');
    grad.addColorStop(0.45, '#d8d8d8');
    grad.addColorStop(0.7, '#e4e4e4');
    grad.addColorStop(1, '#b0b0b0');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    for (var i = 0; i < 400; i++) {
      ctx.fillStyle = 'rgba(' + (Math.random() > 0.5 ? '0,0,0' : '255,255,255') + ',' + (Math.random() * 0.07) + ')';
      ctx.beginPath();
      ctx.arc(Math.random() * W, Math.random() * H, Math.random() * 2.5 + 0.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalCompositeOperation = 'source-over';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(55,55,55,0.45)';
    ctx.fillText('\u2756  SCRATCH TO REVEAL  \u2756', W / 2, H / 2);

    var isDown = false;
    var revealed = false;
    var lastCheck = 0;

    function getXY(e) {
      var r = canvas.getBoundingClientRect();
      var sx = W / r.width, sy = H / r.height;
      var cx = e.touches ? e.touches[0].clientX : e.clientX;
      var cy = e.touches ? e.touches[0].clientY : e.clientY;
      return { x: (cx - r.left) * sx, y: (cy - r.top) * sy };
    }

    function doScratch(e) {
      if (!isDown || revealed) return;
      e.preventDefault();
      var pos = getXY(e);
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 32, 0, Math.PI * 2);
      ctx.fill();

      var now = Date.now();
      if (now - lastCheck > 80) {
        lastCheck = now;
        var d = ctx.getImageData(0, 0, W, H).data;
        var cleared = 0;
        for (var j = 3; j < d.length; j += 4) {
          if (d[j] < 128) cleared++;
        }
        if (cleared / (W * H) > 0.55) {
          revealed = true;
          revealAll(ctx, W, H, canvas);
        }
      }
    }

    canvas.addEventListener('mousedown', function (e) { isDown = true; doScratch(e); });
    canvas.addEventListener('mousemove', doScratch);
    document.addEventListener('mouseup', function () { isDown = false; });
    canvas.addEventListener('touchstart', function (e) { isDown = true; doScratch(e); }, { passive: false });
    canvas.addEventListener('touchmove', doScratch, { passive: false });
    document.addEventListener('touchend', function () { isDown = false; });
  }

  function revealAll(ctx, W, H, canvas) {
    ctx.clearRect(0, 0, W, H);
    canvas.style.transition = 'opacity 0.5s ease';
    canvas.style.opacity = '0';
    canvas.style.pointerEvents = 'none';
    document.getElementById('sc-reveal-row').style.display = 'flex';
    document.getElementById('sc-hint').style.display = 'none';
    spawnConfetti();
  }

  function spawnConfetti() {
    var container = document.getElementById('sc-confetti');
    if (!container) return;
    var colors = ['#fbbf24', '#f43f5e', '#3b82f6', '#22c55e', '#a855f7', '#fb923c'];
    for (var i = 0; i < 36; i++) {
      var p = document.createElement('div');
      p.className = 'sc-confetti-piece';
      p.style.cssText = 'left:' + Math.random() * 100 + '%;background:' + colors[i % colors.length]
        + ';width:' + (6 + Math.random() * 6) + 'px;height:' + (6 + Math.random() * 6) + 'px;'
        + 'animation-delay:' + (Math.random() * 0.4) + 's;animation-duration:' + (0.7 + Math.random() * 0.7) + 's;'
        + 'border-radius:' + (Math.random() > 0.5 ? '50%' : '2px') + ';';
      container.appendChild(p);
    }
    setTimeout(function () { container.innerHTML = ''; }, 2500);
  }

  function copyCode() {
    var code = document.getElementById('sc-code').textContent;
    var btn = document.getElementById('sc-copy-btn');
    function onCopied() {
      btn.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
      btn.classList.add('sc-copied');
      setTimeout(function () {
        btn.innerHTML = '<i class="fa-regular fa-copy"></i> Copy Code';
        btn.classList.remove('sc-copied');
      }, 2500);
    }
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code).then(onCopied).catch(function () { fallbackCopy(code); onCopied(); });
    } else {
      fallbackCopy(code); onCopied();
    }
  }

  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;opacity:0';
    document.body.appendChild(ta);
    ta.focus(); ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
  }

  function closeModal(storageKey) {
    var modal = document.getElementById('scratchCardModal');
    modal.classList.remove('sc-visible');
    modal.classList.add('sc-hiding');
    setTimeout(function () {
      modal.style.display = 'none';
      modal.classList.remove('sc-hiding');
      document.body.classList.remove('sc-open');
    }, 380);
    if (storageKey) localStorage.setItem(storageKey, '1');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

function sahiiTogglePw(btn) {
  var field = btn.closest('.pw-field');
  if (!field) return;
  var input = field.querySelector('input');
  var icon = btn.querySelector('i');
  if (!input) return;
  if (input.type === 'password') {
    input.type = 'text';
    icon.className = 'fa-regular fa-eye-slash';
    btn.setAttribute('aria-label', 'Hide password');
  } else {
    input.type = 'password';
    icon.className = 'fa-regular fa-eye';
    btn.setAttribute('aria-label', 'Show password');
  }
}
