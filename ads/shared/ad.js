// Shared helpers for the Habi ads. Everything is built on one paused GSAP timeline,
// with no callbacks that depend on play order, so HyperFrames can render any frame on
// its own (it seeks the timeline frame by frame, possibly across several workers).
/* global gsap */

const LOGO = `<svg viewBox="0 0 32 32" aria-hidden="true">
  <rect width="32" height="32" rx="8" fill="rgb(247 239 217)"></rect>
  <rect x="7" y="7" width="8" height="8" rx="2" fill="rgb(35 32 92)"></rect>
  <rect x="17" y="7" width="8" height="8" rx="2" fill="rgb(35 32 92)"></rect>
  <rect x="7" y="17" width="8" height="8" rx="2" fill="rgb(35 32 92)"></rect>
  <rect x="17" y="17" width="8" height="8" rx="2" fill="rgb(245 179 1)"></rect>
  <path d="M19 21l1.6 1.6 2.9-3.1" stroke="rgb(35 32 92)" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"></path>
</svg>`;

const ICON = {
  check: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5 9-10"/></svg>',
  bell: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0"/></svg>',
  lock: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="11" width="16" height="10" rx="2"/><path class="shk" d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>',
  copy: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>',
  arrow: '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
};

const peso = new Intl.NumberFormat('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const whole = new Intl.NumberFormat('en-PH', { maximumFractionDigits: 0 });
const fmt = {
  peso: (n) => `₱${peso.format(n)}`,
  pesoWhole: (n) => `₱${whole.format(Math.round(n))}`,
  km: (n) => `${whole.format(Math.round(n))} km`,
  int: (n) => whole.format(Math.round(n)),
};

function Ad(id) {
  const tl = gsap.timeline({ paused: true });
  window.__timelines = window.__timelines || {};
  window.__timelines[id] = tl;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // The end card is the same in every ad; only its headline changes.
  document.querySelectorAll('[data-endline]').forEach((el) => {
    el.innerHTML = `
      <div class="end-logo"><span data-logo></span>Habi</div>
      <p class="end-line">${el.dataset.endline}</p>
      <div class="cta">Make your own copy <span data-icon="arrow"></span></div>
      <div class="facts"><span class="fact">Open source</span><span class="fact">Android first</span><span class="fact">₱0 a month</span></div>
      <p class="url">github.com/charlitomecarez/my-app</p>
      <p class="fine">Example data. You build the APK from your own fork. Not on the Play Store.</p>
      <div class="strip strip--bottom"></div>`;
  });
  document.querySelectorAll('[data-logo]').forEach((el) => (el.innerHTML = LOGO));
  document.querySelectorAll('[data-icon]').forEach((el) => (el.innerHTML = ICON[el.dataset.icon]));

  // Wrap each word of a hook in a mask so it can rise into place.
  function split(el) {
    const walk = (node) => {
      Array.from(node.childNodes).forEach((child) => {
        if (child.nodeType === 3) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) return frag.append(document.createTextNode(' '));
            const m = document.createElement('span');
            m.className = 'm';
            const w = document.createElement('span');
            w.className = 'w';
            w.textContent = part;
            m.append(w);
            frag.append(m);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === 1) {
          walk(child);
        }
      });
    };
    walk(el);
    return $$('.w', el);
  }

  const api = {
    tl,
    $,
    $$,
    fmt,

    // The weave drifts the whole time, so no frame is ever completely still.
    drift(dur) {
      $$('.bg').forEach((bg) => tl.fromTo(bg, { x: 0, y: 0 }, { x: -80, y: -80, duration: dur, ease: 'none' }, 0));
    },

    // Headlines: each word sits below its mask from the start, then rises in.
    hookHide(sel) {
      const el = $(sel);
      if (!el.dataset.split) {
        el.dataset.split = '1';
        split(el);
      }
      const words = $$('.w', el);
      tl.set(words, { yPercent: 115, rotation: 6 }, 0);
      return words;
    },

    hookIn(sel, at) {
      const words = api.hookHide(sel);
      tl.fromTo(words, { yPercent: 115, rotation: 6 }, { yPercent: 0, rotation: 0, duration: 0.75, ease: 'power4.out', stagger: 0.07, immediateRender: false }, at);
      return at + 0.75 + words.length * 0.07;
    },

    hookOut(sel, at) {
      tl.to($$(`${sel} .w`), { yPercent: -115, duration: 0.45, ease: 'power3.in', stagger: 0.03 }, at);
    },

    brandIn(at) {
      tl.from('.brandline', { y: -40, opacity: 0, duration: 0.6, ease: 'power3.out' }, at);
    },

    phoneIn(at, scale = 1.95) {
      tl.set('.stage', { scale }, 0);
      tl.from('.stage', { y: 1400, rotation: -9, duration: 1.15, ease: 'expo.out' }, at);
      this._scale = scale;
      return at + 1.15;
    },

    // A slow float and camera push-in while the story plays.
    float(from, to) {
      tl.to('.stage', { scale: (this._scale || 1.95) * 1.05, duration: to - from, ease: 'none' }, from);
      const n = Math.max(1, Math.round((to - from) / 2.4));
      tl.to('.stage', { y: -16, rotation: 0.6, duration: (to - from) / (n * 2), ease: 'sine.inOut', yoyo: true, repeat: n * 2 - 1 }, from);
    },

    phoneOut(at) {
      tl.to('.stage', { y: 1400, rotation: 6, duration: 0.6, ease: 'power3.in' }, at);
    },

    sticker(sel, at, out, rot = -4) {
      tl.fromTo(sel, { scale: 0.2, rotation: rot - 14, opacity: 0 }, { scale: 1, rotation: rot, opacity: 1, duration: 0.55, ease: 'back.out(2.2)' }, at);
      if (out) tl.to(sel, { scale: 0.85, opacity: 0, duration: 0.25, ease: 'power2.in' }, out);
    },

    // Typing: every character is its own span, switched on at its moment.
    type(sel, text, at, speed = 0.034) {
      const el = $(sel);
      el.innerHTML = '';
      const chars = Array.from(text).map((c) => {
        const s = document.createElement('span');
        s.textContent = c;
        el.append(s);
        return s;
      });
      tl.set(chars, { opacity: 0 }, 0);
      chars.forEach((c, i) => tl.set(c, { opacity: 1 }, at + i * speed));
      return at + chars.length * speed;
    },

    erase(sel, at, speed = 0.012) {
      const chars = $$(`${sel} > span`).reverse();
      chars.forEach((c, i) => tl.set(c, { opacity: 0 }, at + i * speed));
      tl.set(sel, { display: 'none' }, at + chars.length * speed);
      return at + chars.length * speed;
    },

    count(sel, from, to, at, dur, format) {
      const el = $(sel);
      const o = { v: from };
      // The first count on an element writes its opening value at time 0, so frames before
      // any count starts show it (later counts take over once the playhead reaches them).
      if (!el.dataset.counted) {
        el.dataset.counted = '1';
        el.textContent = format(from);
        const o0 = { v: from };
        tl.fromTo(o0, { v: from }, { v: from, duration: 0.01, onUpdate: () => (el.textContent = format(o0.v)) }, 0);
      }
      tl.fromTo(o, { v: from }, { v: to, duration: dur, ease: 'power2.inOut', onUpdate: () => (el.textContent = format(o.v)) }, at);
    },

    // Crossfade two stacked states in a .swap.
    swap(outSel, inSel, at, dur = 0.25) {
      tl.to(outSel, { opacity: 0, y: -6, duration: dur, ease: 'power2.in' }, at);
      tl.fromTo(inSel, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: dur + 0.1, ease: 'power2.out' }, at + dur * 0.6);
    },

    pop(sel, at) {
      tl.fromTo(sel, { scale: 1 }, { scale: 1.18, duration: 0.14, ease: 'power2.out', yoyo: true, repeat: 1 }, at);
    },

    tap(x, y, at) {
      const t = $('.tap');
      tl.set(t, { left: x, top: y }, at);
      tl.fromTo(t, { scale: 1.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.18, ease: 'power2.out' }, at);
      tl.to(t, { scale: 0.8, duration: 0.1, ease: 'power2.in' }, at + 0.2);
      tl.to(t, { scale: 1.5, opacity: 0, duration: 0.35, ease: 'power2.out' }, at + 0.32);
    },

    // Tap the middle of an element. Layout offsets ignore the stage's scale and tilt.
    tapOn(sel, at, dx = 0) {
      const el = $(sel);
      const screen = $('.screen');
      let x = el.offsetWidth / 2 + dx;
      let y = el.offsetHeight / 2;
      for (let n = el; n && n !== screen; n = n.offsetParent) {
        x += n.offsetLeft;
        y += n.offsetTop;
      }
      api.tap(x, y, at);
    },

    // Banig strips sweep up to cover the frame, then sweep away to show what's next.
    wipe(at, onCover) {
      const strips = $$('.wipe span');
      tl.set(strips, { transformOrigin: '50% 100%' }, at);
      tl.to(strips, { scaleY: 1, duration: 0.42, ease: 'power3.in', stagger: 0.045 }, at);
      const covered = at + 0.42 + strips.length * 0.045;
      if (onCover) onCover(covered);
      tl.set(strips, { transformOrigin: '50% 0%' }, covered);
      tl.to(strips, { scaleY: 0, duration: 0.5, ease: 'power3.out', stagger: 0.045 }, covered + 0.05);
      return covered;
    },

    endCard(at) {
      tl.set('.end', { opacity: 1 }, at);
      tl.from('.end > *', { y: 70, opacity: 0, duration: 0.7, ease: 'power3.out', stagger: 0.1 }, at + 0.25);
      tl.from('.end .strip', { scaleX: 0, transformOrigin: '0 50%', duration: 1, ease: 'power2.inOut' }, at + 0.2);
      // The button keeps a gentle pulse so the last seconds aren't a still frame.
      tl.to('.end .cta', { scale: 1.045, duration: 0.55, ease: 'sine.inOut', yoyo: true, repeat: 3 }, at + 1.4);
      tl.to('.end .cta svg', { x: 10, duration: 0.55, ease: 'sine.inOut', yoyo: true, repeat: 3 }, at + 1.4);
    },
  };
  return api;
}
