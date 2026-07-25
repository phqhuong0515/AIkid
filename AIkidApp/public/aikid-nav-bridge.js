/**
 * Shared navigation for prototype HTML pages under Expo public/.
 * - Fixes clean URLs (/art/style → /art/style.html)
 * - When embedded in Expo iframe, routes hub surfaces to parent SPA
 * - Hides "Đăng Nhập" when JWT already in localStorage (session sync)
 * Load this script LAST on each HTML page.
 */
(function () {
  var TOKEN_KEY = 'storymee.access_token';

  function isEmbed() {
    try {
      if (/[?&]embed=1(?:&|$)/.test(String(window.location.search || ''))) {
        return true;
      }
    } catch (e0) {
      /* ignore */
    }
    try {
      return !!(window.parent && window.parent !== window);
    } catch (e) {
      // cross-origin parent ⇒ inside iframe
      return true;
    }
  }

  function isLoggedIn() {
    try {
      var t =
        (window.localStorage && window.localStorage.getItem(TOKEN_KEY)) ||
        (window.parent &&
          window.parent.localStorage &&
          window.parent.localStorage.getItem(TOKEN_KEY));
      return !!(t && String(t).length > 20);
    } catch (e) {
      try {
        return !!(
          window.localStorage && window.localStorage.getItem(TOKEN_KEY)
        );
      } catch (e2) {
        return false;
      }
    }
  }

  /**
   * Expo web omits route groups: /(app)/lobby → /lobby, /(auth)/login → /login
   */
  function resolveAikidUrl(url) {
    var u = String(url || '').trim();

    // Tokens / home → lobby (authenticated shell)
    if (
      u === '__HOME__' ||
      u === '/' ||
      u === '' ||
      u === 'http://localhost:8000' ||
      u === 'http://localhost:8000/'
    ) {
      if (!isEmbed() && u.includes('8000')) {
        return { target: 'self', href: '/' }; // Testing hub
      }
      return isEmbed()
        ? { target: 'parent', href: '/lobby' }
        : { target: 'self', href: '/lobby' };
    }

    // Standalone HTML testing mode maps (Port 8000)
    if (!isEmbed()) {
      if (u.indexOf('/character/generate') === 0) return { target: 'self', href: '/_character_backup_html/generate.html' };
      if (u.indexOf('/character/storage') === 0) return { target: 'self', href: '/_character_backup_html/storage.html' };
      if (u === '/character' || u === '/character.html') return { target: 'self', href: '/character.html' };
      
      if (u.indexOf('/art/style') === 0) return { target: 'self', href: '/_art_backup_html/style.html' };
      if (u.indexOf('/art/image-generate') === 0) return { target: 'self', href: '/_art_backup_html/image-generate.html' };
      
      if (u.indexOf('/art/story/genre') === 0) return { target: 'self', href: '/_art_backup_html/story/genre.html' };
      if (u.indexOf('/art/story/idea') === 0) return { target: 'self', href: '/_art_backup_html/story/idea.html' };
      if (u.indexOf('/art/story/library') === 0) return { target: 'self', href: '/_art_backup_html/story/library.html' };
      if (u.indexOf('/art/story') === 0) return { target: 'self', href: '/_art_backup_html/comic.html' };
      
      if (u.indexOf('/art/comic') === 0 || u.indexOf('/comic') === 0) return { target: 'self', href: '/_art_backup_html/comic.html' };
      
      if (u === '/art' || u === '/art/' || u === '/art/index.html' || u === '/art/hub-legacy.html') return { target: 'self', href: '/_art_backup_html/index.html' };
      
      if (u === '/mee' || u === '/mee/') return { target: 'self', href: '/_mee_backup_html/index.html' };

    }

    // Auth — if already logged in, send to account/lobby (not login form)
    if (
      u === '__LOGIN__' ||
      /\/login\/?$/.test(u) ||
      u.indexOf('/login') !== -1
    ) {
      if (isLoggedIn()) {
        return isEmbed()
          ? { target: 'parent', href: '/account' }
          : { target: 'self', href: '/account' };
      }
      return isEmbed()
        ? { target: 'parent', href: '/login' }
        : { target: 'self', href: '/login' };
    }

    // Account / family (RN)
    if (u.indexOf('/account') === 0) {
      return isEmbed()
        ? { target: 'parent', href: '/account' }
        : { target: 'self', href: '/account' };
    }
    if (u.indexOf('/family') === 0) {
      return isEmbed()
        ? { target: 'parent', href: '/family' }
        : { target: 'self', href: '/family' };
    }
    if (u === '/lobby' || u.indexOf('/lobby') === 0) {
      return isEmbed()
        ? { target: 'parent', href: '/lobby' }
        : { target: 'self', href: '/lobby' };
    }

    // Mee customizer
    if (u === '/mee' || u === '/mee/' || u.indexOf('/mee') === 0) {
      return isEmbed()
        ? { target: 'parent', href: '/mee' }
        : { target: 'self', href: '/mee' };
    }

    // Character (Expo RN)
    if (u.indexOf('/character') === 0) {
      return isEmbed()
        ? { target: 'parent', href: '/character' }
        : { target: 'self', href: '/character' };
    }

    // Diary not ported
    if (u.indexOf('/diary') === 0) {
      return isEmbed()
        ? { target: 'parent', href: '/lobby' }
        : { target: 'self', href: '/lobby' };
    }

    // Art hub — Expo RN only (public/art/index.html removed; no /art/ static loop)
    if (
      u === '/art' ||
      u === '/art/' ||
      u === '/art/index.html' ||
      u === '/art/hub-legacy.html' ||
      u.indexOf('/art/index') === 0
    ) {
      return isEmbed()
        ? { target: 'parent', href: '/art' }
        : { target: 'self', href: '/art' };
    }
    // Style picker — NOW Expo RN screen (/art/style-v2). Redirect parent, not self.
    if (
      u === '/art/style' ||
      u === '/art/style.html' ||
      u.indexOf('/art/style') === 0
    ) {
      return isEmbed()
        ? { target: 'parent', href: '/art/style-v2' }
        : { target: 'self', href: '/art/style-v2' };
    }
    // Canvas — NOW Expo RN screen (/art/canvas). Redirect parent, not self.
    if (
      u === '/art/image-generate' ||
      u.indexOf('/art/image-generate') === 0
    ) {
      return isEmbed()
        ? { target: 'parent', href: '/art/canvas' }
        : { target: 'self', href: '/art/canvas' };
    }
    // Comic hub (Expo RN)
    if (
      u === '/art/comic' ||
      u === '/art/comic.html' ||
      u.indexOf('/art/comic') === 0
    ) {
      return isEmbed()
        ? { target: 'parent', href: '/comic' }
        : { target: 'self', href: '/comic' };
    }
    if (u === '/comic' || u === '/comic/' || u.indexOf('/comic') === 0) {
      if (isEmbed()) {
        var path = u.indexOf('/comic/') === 0 ? u : '/comic';
        return { target: 'parent', href: path };
      }
      return { target: 'self', href: u.indexOf('/comic') === 0 ? u : '/comic' };
    }

    // Story creation back button -> goes to Comic hub
    if (u === '/art/story' || u === '/art/story/') {
      return isEmbed()
        ? { target: 'parent', href: '/comic' }
        : { target: 'self', href: '/comic' };
    }

    // mee next.html → route to Expo /mee/next
    if (u === 'next.html' || u.indexOf('next.html') !== -1) {
      return isEmbed()
        ? { target: 'parent', href: '/mee/next' }
        : { target: 'self', href: u };
    }

    // Story creation static HTML steps (genre -> idea -> library etc.)
    if (u.indexOf('/art/story/') === 0 && u.indexOf('.html') === -1) {
      return { target: 'self', href: u + '.html' };
    }

    if (u.indexOf('.html') !== -1) {
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
        if (window.parent && window.parent !== window) {
          window.parent.postMessage(JSON.stringify({ type: 'NAVIGATE', payload: nav.href }), '*');
        } else {
          window.location.href = nav.href;
        }
        return;
      } catch (e) {
        console.warn('[aikid-nav] parent navigate failed', e);
      }
    }
    window.location.href = nav.href;
  }

  /**
   * When session exists: hide login CTAs that confuse authenticated embeds.
   * Optionally show small "Đã vào app" chip.
   */
  function applySessionChrome() {
    if (!isLoggedIn()) return;

    var selectors = [
      '.auth-btn',
      '.universe-signup-btn',
      'button.auth-btn',
      'a.auth-btn',
    ];
    selectors.forEach(function (sel) {
      try {
        document.querySelectorAll(sel).forEach(function (el) {
          // Replace login → account (parent SPA)
          if (
            el.tagName === 'BUTTON' ||
            el.tagName === 'A' ||
            el.getAttribute('onclick')
          ) {
            el.textContent = 'Tài khoản';
            el.setAttribute('aria-label', 'Tài khoản');
            el.onclick = function (ev) {
              if (ev && ev.preventDefault) ev.preventDefault();
              go('/account');
              return false;
            };
            el.classList.add('aikid-session-account');
            // keep visible but rebranded
            el.style.display = '';
          }
        });
      } catch (e) {
        /* ignore */
      }
    });

    document.documentElement.classList.add('aikid-session-ready');
  }

  /**
   * Expo iframe: hide HTML logo/account header (App shell owns chrome).
   * One back control only (Trở Về) — same form on art hub / style / generate / mee.
   */
  function applyEmbedChrome() {
    if (!isEmbed()) return;
    document.documentElement.classList.add('mee-embed', 'aikid-embed');
    if (document.body) {
      document.body.classList.add('mee-embed', 'aikid-embed');
    }
    if (document.getElementById('aikid-embed-chrome-style')) return;
    var style = document.createElement('style');
    style.id = 'aikid-embed-chrome-style';
    style.textContent = [
      /* Hide HTML logo/account bar — Expo shell or single Trở Về only */
      'html.mee-embed .art-header,',
      'body.mee-embed .art-header,',
      'html.aikid-embed .art-header,',
      'body.aikid-embed .art-header,',
      'html.mee-embed .universe-header,',
      'body.mee-embed .universe-header,',
      'html.aikid-embed .universe-header,',
      'body.aikid-embed .universe-header {',
      '  display: none !important;',
      '}',
      /* Drop design-lock 1927px scale so cards fill real viewport (responsive) */
      'html.mee-embed .scaler-wrapper,',
      'body.mee-embed .scaler-wrapper,',
      'html.aikid-embed .scaler-wrapper,',
      'body.aikid-embed .scaler-wrapper {',
      '  position: relative !important;',
      '  top: auto !important;',
      '  left: auto !important;',
      '  width: 100% !important;',
      '  max-width: 100% !important;',
      '  height: auto !important;',
      '  min-height: 100% !important;',
      '  transform: none !important;',
      '  transform-origin: top center !important;',
      '  pointer-events: auto !important;',
      '}',
      'html.mee-embed body,',
      'body.mee-embed,',
      'html.aikid-embed body {',
      '  overflow-x: hidden !important;',
      '  overflow-y: auto !important;',
      '}',
      /* Single pink Trở Về — same form on art / style / comic / generate */
      'html.mee-embed .back-btn-container,',
      'body.mee-embed .back-btn-container,',
      'html.aikid-embed .back-btn-container,',
      'body.aikid-embed .back-btn-container {',
      '  position: fixed !important;',
      '  top: 16px !important;',
      '  left: 16px !important;',
      '  transform: none !important;',
      '  z-index: 1000 !important;',
      '}',
      'html.mee-embed .art-content,',
      'body.mee-embed .art-content {',
      '  margin-top: 56px !important;',
      '  max-width: 1100px !important;',
      '  padding: 0 16px !important;',
      '}',
      'html.mee-embed .cards-grid,',
      'body.mee-embed .cards-grid {',
      '  transform: none !important;',
      '  margin-top: 20px !important;',
      '  gap: 16px !important;',
      '  grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr)) !important;',
      '}',
      'html.mee-embed .card,',
      'body.mee-embed .card {',
      '  min-height: 0 !important;',
      '}',
      'html.mee-embed .card-image-wrapper,',
      'body.mee-embed .card-image-wrapper {',
      '  height: clamp(140px, 22vw, 220px) !important;',
      '  margin-bottom: 14px !important;',
      '}',
      'html.mee-embed .card-title,',
      'body.mee-embed .card-title {',
      '  font-size: clamp(1.15rem, 2.5vw, 1.6rem) !important;',
      '}',
      'html.mee-embed .card-desc,',
      'body.mee-embed .card-desc {',
      '  font-size: clamp(0.8rem, 1.6vw, 0.95rem) !important;',
      '  margin-bottom: 16px !important;',
      '}',
      /* Comic hub 2 cards */
      'html.mee-embed .lobby-cards-container,',
      'body.mee-embed .lobby-cards-container {',
      '  transform: none !important;',
      '  width: min(920px, 94vw) !important;',
      '  gap: 20px !important;',
      '  display: flex !important;',
      '  flex-wrap: wrap !important;',
      '  justify-content: center !important;',
      '}',
      'html.mee-embed .lobby-card-item,',
      'body.mee-embed .lobby-card-item {',
      '  width: min(400px, 100%) !important;',
      '  min-height: 220px !important;',
      '  flex: 1 1 260px !important;',
      '}',
      'html.mee-embed .style-selection-wrapper,',
      'body.mee-embed .style-selection-wrapper {',
      '  position: absolute !important;',
      '  top: 50% !important;',
      '  left: 0 !important;',
      '  right: 0 !important;',
      '  transform: translateY(-50%) !important;',
      '  margin-top: 0 !important;',
      '  width: 100% !important;',
      '}',
      'html.mee-embed .continue-btn-container,',
      'body.mee-embed .continue-btn-container {',
      '  position: relative !important;',
      '  bottom: auto !important;',
      '  left: auto !important;',
      '  transform: none !important;',
      '  margin-top: 12px !important;',
      '}',
      'html.mee-embed .page-title-img-container,',
      'body.mee-embed .page-title-img-container {',
      '  transform: none !important;',
      '}',
      'html.mee-embed .page-title-img,',
      'body.mee-embed .page-title-img {',
      '  max-width: min(420px, 70vw) !important;',
      '  height: auto !important;',
      '}',
    ].join('\n');
    document.head.appendChild(style);
  }

  function hideLoader() {
    var loader = document.getElementById('page-loader-overlay');
    if (!loader) return;
    loader.style.opacity = '0';
    loader.style.display = 'none';
  }

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
      var nav = resolveAikidUrl(url);
      // Parent SPA navigate: never leave HTML loader stuck (infinity "Bé đợi…")
      if (nav.target === 'parent') {
        hideLoader();
        go(url);
        return;
      }
      showLoader();
      setTimeout(function () {
        go(url);
      }, 180);
    };

    document.documentElement.classList.add('aikid-embed-ready');
    if (isEmbed()) {
      document.documentElement.classList.add('mee-embed');
      if (document.body) document.body.classList.add('mee-embed');
    }
    applyEmbedChrome();
    // Safety: never keep loader if page already interactive
    if (document.readyState === 'complete') {
      hideLoader();
    } else {
      window.addEventListener('load', hideLoader);
    }

    applySessionChrome();

    if (typeof prev === 'function') {
      console.info('[aikid-nav] playPopAndNavigate wrapped for Expo hub');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install);
  } else {
    install();
  }
  setTimeout(install, 0);
  setTimeout(install, 100);
  setTimeout(applySessionChrome, 300);
})();
