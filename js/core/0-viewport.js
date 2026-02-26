// =============================================================================
// 0-viewport.js  —  Centralised viewport & DPR scaling utility
//
// Problems this file solves:
//  1. iOS Safari 100vh bug  — 100vh = viewport WITH chrome hidden, so the
//     layout is taller than the visible area when the address bar is showing.
//     Fix: expose --vh (1% of true innerHeight) so CSS can use it.
//
//  2. Stale popup coords after resize / monitor change  — element‑matchup
//     and family popups are positioned with fixed coords at open-time.
//     Fix: close them whenever layout dimensions change.
//
//  3. DPR changes when dragging between monitors  — moving the window from a
//     96-DPI external display to a 192-DPI laptop screen changes
//     window.devicePixelRatio and the CSS-pixel dimensions of the viewport.
//     Fix: watch the DPR with matchMedia and react on change.
//
//  4. Orientation changes (mobile)  — innerHeight lags the real value for
//     ~300 ms after the orientationchange event.
//     Fix: re-measure after a short delay.
// =============================================================================

(function () {
    'use strict';

    // -------------------------------------------------------------------------
    // 1.  --vh  custom property
    //
    // Usage in CSS:
    //   height: calc(var(--vh, 1vh) * 100);
    //
    // Modern browsers also support 100svh / 100dvh directly; the CSS uses both
    // as a progressive-enhancement stack. This JS variable is the last-resort
    // fallback for older mobile Safari and WebView environments.
    // -------------------------------------------------------------------------
    function updateVH() {
        var vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', vh + 'px');
    }

    // -------------------------------------------------------------------------
    // 2.  Close open popups whose fixed coords are now stale
    //
    // Matchup/family popups use position:fixed with coords calculated at open
    // time.  Any resize, DPR change, or orientation change invalidates those
    // coords.  Closing them is simpler and safer than trying to reposition.
    // -------------------------------------------------------------------------
    function closeOpenPopups() {
        var selectors = [
            '.element-matchup-collapsible.open',
            '.element-guide-collapsible.open',
            '.family-matchup-collapsible.open',
            '.family-guide-collapsible.open'
        ];
        document.querySelectorAll(selectors.join(',')).forEach(function (el) {
            el.classList.remove('open');
        });

        // Clear inline fixed-position styles set by positionPopupForCombatCard()
        document.querySelectorAll(
            '.combatant-panel .matchup-details,' +
            '.combatant-panel .family-description-popup'
        ).forEach(function (popup) {
            popup.style.cssText = '';
        });
    }

    // -------------------------------------------------------------------------
    // 3.  Debounce helper — prevents handler from running on every pixel of a
    //     drag, which would cause janky layout work.
    // -------------------------------------------------------------------------
    function debounce(fn, ms) {
        var timer;
        return function () {
            clearTimeout(timer);
            timer = setTimeout(fn, ms);
        };
    }

    // -------------------------------------------------------------------------
    // 4.  Combined resize handler
    // -------------------------------------------------------------------------
    var onResize = debounce(function () {
        updateVH();
        closeOpenPopups();
    }, 120);

    window.addEventListener('resize', onResize);

    // -------------------------------------------------------------------------
    // 5.  Orientation change
    //
    // window.innerHeight is NOT yet updated at the moment orientationchange
    // fires — the browser hasn't committed to the new layout yet.  Reading it
    // 350 ms later is reliable on all tested platforms (iOS, Android).
    // -------------------------------------------------------------------------
    window.addEventListener('orientationchange', function () {
        setTimeout(function () {
            updateVH();
            closeOpenPopups();
        }, 350);
    });

    // -------------------------------------------------------------------------
    // 6.  DPR change watch
    //
    // When the user drags the browser window from a 96-DPI monitor to a 192-DPI
    // display (or vice-versa), window.devicePixelRatio changes.  The browser
    // fires a resize event in Chromium but NOT always in Safari.  We use a
    // matchMedia watch on the current DPR value as a belt-and-suspenders
    // mechanism so we catch the transition even when resize is silent.
    //
    // How it works:
    //   The media query `(resolution: Xdppx)` only matches when the current
    //   DPR equals X.  When the window moves to a different DPI screen, the
    //   DPR changes and the query's `matches` flips to false, firing 'change'.
    //   We then unregister the old query and register a fresh one at the new
    //   DPR value, creating a self-replacing chain.
    // -------------------------------------------------------------------------
    function watchDPR() {
        if (typeof window.matchMedia !== 'function') return;

        var dpr = window.devicePixelRatio || 1;
        var query = '(resolution: ' + dpr + 'dppx)';

        try {
            var mq = window.matchMedia(query);

            function onDPRChange() {
                mq.removeEventListener('change', onDPRChange);
                // A resize event will likely follow; give it 150 ms to settle
                setTimeout(function () {
                    updateVH();
                    closeOpenPopups();
                    watchDPR(); // Re-register for the new DPR value
                }, 150);
            }

            // Use addEventListener with fallback to deprecated addListener
            if (mq.addEventListener) {
                mq.addEventListener('change', onDPRChange);
            } else if (mq.addListener) {
                mq.addListener(onDPRChange);
            }
        } catch (e) {
            // matchMedia with 'dppx' resolution not supported — silently ignore
        }
    }

    // -------------------------------------------------------------------------
    // 7.  Boot — run immediately, before DOMContentLoaded, so the CSS variable
    //     is set before the first paint and avoids any layout flash.
    // -------------------------------------------------------------------------
    updateVH();
    watchDPR();

    // Also update once the DOM is ready in case any early render happened
    // before the variable was propagated (rare, but possible in some WebViews).
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', updateVH);
    }

}());
