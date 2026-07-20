/**
 * Shared navigation for prototype HTML pages hosted under Expo public/.
 * - Fixes clean URLs (/art/style → /art/style.html)
 * - When embedded in Expo iframe, routes hub surfaces to parent SPA
 * Load this script LAST on each HTML page.
 */
(function () {
  function isEmbed() {
    try {
      return window.parent && window.parent !== window;
    } catch (e) {
      return false;
    }
  }

  function resolveAikidUrl(url) {
    var u = String(url || '').trim();

    // Tokens / home
    if (
      u === '__HOME__' ||
      u === '/' ||
      u === '' ||
      u === 'http://localhost:8000' ||
      u === 'http://localhost:8000/'
    ) {
      return isEmbed()
        ? { target: 'parent', href: '/lobby' }
        : { target: 'self', href: '/lobby' };
    }

    // Auth
    if (u === '__LOGIN__' || /\/login\/?$/.test(u) || u.indexOf('/login') !== -1) {
      return isEmbed()
        ? { target: 'parent', href: '/login' }
        : { target: 'self', href: '/login' };
    }

    // Mee customizer (Expo route = iframe to /mee-html)
    if (u === '/mee' || u === '/mee/' || u.indexOf('/mee') === 0) {
      return isEmbed()
        ? { target: 'parent', href: '/mee' }
        : { target: 'self', href: '/mee' };
    }

    // Character (Expo RN screens)
    if (u.indexOf('/character') === 0) {
      return isEmbed()
        ? { target: 'parent', href: '/character' }
        : { target: 'self', href: '/character' };
    }

    // Diary not ported yet
    if (u.indexOf('/diary') === 0) {
      return isEmbed()
        ? { target: 'parent', href: '/lobby' }
        : { target: 'self', href: '/lobby' };
    }

    // Art hub & subpages — stay in iframe / static tree
    if (u === '/art' || u === '/art/') {
      return { target: 'self', href: '/art/index.html' };
    }
    if (u === '/art/style' || u.indexOf('/art/style?') === 0) {
      return { target: 'self', href: '/art/style.html' };
    }
    if (
      u === '/art/image-generate' ||
      u.indexOf('/art/image-generate') === 0
    ) {
      return { target: 'self', href: '/art/image-generate.html' };
    }
    if (u === '/art/story' || u === '/art/story.html' || u === '/art/comic' || u === '/art/comic.html') {
      return { target: 'self', href: '/art/story.html' };
    }

    // Relative next/html within mee
    if (u.indexOf('next.html') !== -1 || u.indexOf('.html') !== -1) {
      return { target: 'self', href: u };
    }

    return { target: 'self', href: u };
  }

  function showLoader() {
    var loader = document.getElementById('page-loader-overlay');
    if (loader) {
      loader.style.display = 'flex';
      void loader.offsetHeight;
      loader.style.opacity = '1';
    }
  }

  function go(url) {
    var nav = resolveAikidUrl(url);
    if (nav.target === 'parent') {
      try {
        window.parent.location.href = nav.href;
        return;
      } catch (e) {
        console.warn('[aikid-nav] parent navigate failed', e);
      }
    }
    window.location.href = nav.href;
  }

  /** Override after page scripts define playPopAndNavigate / playPopSound */
  function install() {
    var prev = window.playPopAndNavigate;
    window.playPopAndNavigate = function (url) {
      try {
        if (typeof window.playPopSound === 'function') {
          window.playPopSound();
        }
      } catch (e) {
        /* ignore */
      }
      showLoader();
      setTimeout(function () {
        go(url);
      }, 280);
    };

    // Also fix bare location assignments from logo onclick="window.location.href='/'"
    document.documentElement.classList.add('aikid-embed-ready');
    if (isEmbed()) {
      document.documentElement.classList.add('mee-embed');
      document.body && document.body.classList.add('mee-embed');
    }

    if (typeof prev === 'function') {
      console.info('[aikid-nav] playPopAndNavigate wrapped for Expo hub');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install);
  } else {
    install();
  }
  // Re-install after delayed scripts
  setTimeout(install, 0);
  setTimeout(install, 100);
})();
