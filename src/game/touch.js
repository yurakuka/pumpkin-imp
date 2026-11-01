import { sound } from './audio.js';

// DOM pointer capture supports holding movement + jump + fire simultaneously.
class TouchControls {
  constructor() {
    this.down = new Set();
    this.pressed = new Set();
    this.released = new Set();
    this.pointers = new Map();
    this.enabled = matchMedia('(pointer: coarse)').matches;
    this.portrait = matchMedia('(orientation: portrait)');
    this.interrupt = null;
  }
  init() {
    document.body.classList.toggle('touch-enabled', this.enabled);
    // The entire page is a game surface, including the empty canvas margins.
    // Safari gesture events need an explicit non-passive fallback in addition
    // to touch-action:none; ordinary touch/pointer handlers still receive input.
    const preventGesture = event => { if (event.cancelable) event.preventDefault(); };
    for (const type of ['gesturestart', 'gesturechange', 'gestureend', 'touchmove', 'dblclick']) {
      document.addEventListener(type, preventGesture, { passive: false });
    }
    let lastTap = -Infinity;
    document.addEventListener('touchend', event => {
      const now = performance.now();
      if (now - lastTap < 320) preventGesture(event);
      lastTap = now;
    }, { passive: false });
    document.addEventListener('wheel', event => {
      if (event.ctrlKey) preventGesture(event);
    }, { passive: false });
    const continueButton = document.getElementById('comic-continue');
    const continueComic = event => {
      if (event.type === 'pointerdown') event.preventDefault();
      this.continueAction?.();
    };
    continueButton.addEventListener('pointerdown', continueComic);
    continueButton.addEventListener('click', continueComic);
    document.querySelectorAll('[data-control]').forEach(button => {
      button.addEventListener('pointerdown', event => {
        event.preventDefault();
        if (button.disabled) return;
        sound.start();
        const action = button.dataset.control;
        button.setPointerCapture(event.pointerId);
        this.pointers.set(event.pointerId, action);
        this.down.add(action);
        this.pressed.add(action);
        button.classList.add('held');
      });
      const release = event => {
        const action = this.pointers.get(event.pointerId);
        this.pointers.delete(event.pointerId);
        if (action && ![...this.pointers.values()].includes(action)) {
          this.down.delete(action);
          this.released.add(action);
          button.classList.remove('held');
        }
      };
      button.addEventListener('pointerup', release);
      button.addEventListener('pointercancel', release);
      button.addEventListener('lostpointercapture', release);
      button.addEventListener('contextmenu', e => e.preventDefault());
    });
    const interrupt = () => {
      this.clear();
      if (document.hidden || this.blocked) this.interrupt?.();
    };
    window.addEventListener('blur', () => { this.clear(); this.interrupt?.(); });
    document.addEventListener('visibilitychange', interrupt);
    this.portrait.addEventListener('change', interrupt);
    window.addEventListener('pagehide', () => this.clear());
  }
  get blocked() { return this.enabled && this.portrait.matches; }
  held(action) { return this.down.has(action); }
  take(action) { const value = this.pressed.has(action); this.pressed.delete(action); return value; }
  takeRelease(action) { const value = this.released.has(action); this.released.delete(action); return value; }
  clear() {
    this.down.clear(); this.pressed.clear(); this.released.clear(); this.pointers.clear();
    document.querySelectorAll('.held').forEach(b => b.classList.remove('held'));
  }
  activate(interrupt) {
    this.clear();
    this.interrupt = interrupt;
    document.body.classList.add('controls-active');
    document.querySelector('[data-control="mute"]').textContent=sound.muted?'ТИША':'ЗВУК';
    window.dispatchEvent(new Event('resize'));
  }
  deactivate() {
    this.clear(); this.interrupt = null;
    this.mode('play');
    document.body.classList.remove('controls-active');
    window.dispatchEvent(new Event('resize'));
  }
  mode(mode) {
    const comic = mode === 'comic';
    document.body.classList.toggle('comic-active', comic);
    document.getElementById('comic-continue').hidden = !comic;
    if (!comic) this.continueAction = null;
    for (const button of document.querySelectorAll('[data-control]')) {
      const action = button.dataset.control;
      button.disabled = mode === 'comic' ? action !== 'mute' : mode === 'paused' && !['pause', 'mute'].includes(action);
      if (action === 'pause') button.textContent = mode === 'paused' ? 'ДАЛІ' : 'ПАУЗА';
    }
  }
}
export const touch = new TouchControls();
