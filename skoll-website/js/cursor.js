/**
 * cursor.js – Custom cursor (dot + ring, magnetic, click, view)
 * Hides default cursor; dot follows mouse, ring follows with lerp.
 * Magnetic on a/button/.magnetic; click shrink/spring; "View" on images/cards.
 * Disabled on touch devices. Uses GSAP for spring if available.
 */

(function () {
  var CURSOR_GOLD = '#C9A84C';
  var DOT_SIZE = 8;
  var RING_SIZE = 40;
  var RING_SHRINK = 20;
  var RING_VIEW_SIZE = 80;
  var LERP = 0.16;
  var MAGNETIC_RADIUS = 120;
  var MAGNETIC_STRENGTH = 0.4;

  function hasTouch() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  function init() {
    if (hasTouch()) return;

    var wrapper = document.createElement('div');
    wrapper.className = 'skoll-cursor';
    wrapper.setAttribute('aria-hidden', 'true');
    wrapper.innerHTML =
      '<span class="skoll-cursor-dot"></span>' +
      '<span class="skoll-cursor-ring">' +
        '<span class="skoll-cursor-view-text">View</span>' +
      '</span>';
    document.body.appendChild(wrapper);
    document.documentElement.classList.add('skoll-cursor-active');

    var dot = wrapper.querySelector('.skoll-cursor-dot');
    var ring = wrapper.querySelector('.skoll-cursor-ring');

    var mouse = { x: -100, y: -100 };
    var ringPos = { x: -100, y: -100 };
    var magneticTarget = null;
    var isDown = false;
    var hoverLink = false;
    var hoverView = false;
    var ringScale = 1;
    var scaleObj = { s: 1 };
    var gsap = window.gsap;

    var magneticSelector = 'a, button, .magnetic';
    var viewSelector = 'img, [data-cursor-view], .skoll-work-card, .skoll-about-card, .skoll-pillars-card';

    function getTarget(el) {
      if (!el) return null;
      return el.closest(magneticSelector) || null;
    }

    function getViewTarget(el) {
      if (!el) return null;
      return el.closest(viewSelector) || null;
    }

    document.addEventListener('mousemove', function (e) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      var under = document.elementFromPoint(e.clientX, e.clientY);
      magneticTarget = getTarget(under);
      hoverLink = !!magneticTarget;
      hoverView = !!getViewTarget(under) && !magneticTarget;
    }, { passive: true });

    document.addEventListener('mousedown', function () {
      isDown = true;
      ringScale = RING_SHRINK / RING_SIZE;
      scaleObj.s = ringScale;
      wrapper.classList.add('skoll-cursor-down');
    });

    document.addEventListener('mouseup', function () {
      isDown = false;
      wrapper.classList.remove('skoll-cursor-down');
      if (gsap) {
        gsap.to(scaleObj, {
          s: 1,
          duration: 0.45,
          ease: 'back.out(1.4)',
          onUpdate: function () {
            ringScale = scaleObj.s;
          }
        });
      } else {
        ringScale = 1;
        scaleObj.s = 1;
      }
    });

    document.addEventListener('mouseleave', function () {
      mouse.x = -100;
      mouse.y = -100;
      magneticTarget = null;
      hoverLink = false;
      hoverView = false;
    });

    wrapper.classList.add('skoll-cursor-visible');

    var dotHalf = DOT_SIZE / 2;

    function tick() {
      var tx = mouse.x;
      var ty = mouse.y;

      if (magneticTarget) {
        var rect = magneticTarget.getBoundingClientRect();
        var cx = rect.left + rect.width / 2;
        var cy = rect.top + rect.height / 2;
        var dx = cx - mouse.x;
        var dy = cy - mouse.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAGNETIC_RADIUS) {
          var pull = (1 - dist / MAGNETIC_RADIUS) * MAGNETIC_STRENGTH;
          tx = mouse.x + dx * pull;
          ty = mouse.y + dy * pull;
        }
      }

      ringPos.x += (tx - ringPos.x) * LERP;
      ringPos.y += (ty - ringPos.y) * LERP;

      var scale = isDown
        ? RING_SHRINK / RING_SIZE
        : (hoverView ? RING_VIEW_SIZE / RING_SIZE : (magneticTarget ? 1.5 : ringScale));

      dot.style.transform = 'translate(' + (mouse.x - dotHalf) + 'px, ' + (mouse.y - dotHalf) + 'px)';
      ring.style.transform = 'translate(' + ringPos.x + 'px, ' + ringPos.y + 'px) scale(' + scale + ')';

      wrapper.classList.toggle('skoll-cursor-link', hoverLink);
      wrapper.classList.toggle('skoll-cursor-view', hoverView);
      wrapper.classList.toggle('skoll-cursor-magnetic', !!magneticTarget);

      requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
