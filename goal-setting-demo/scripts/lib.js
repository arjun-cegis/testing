// Shared helpers: headed Chromium on an Xvfb display, captured with ffmpeg x11grab.
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs');
const sleep = ms => new Promise(r => setTimeout(r, ms));

const CURSOR_JS = `
(() => {
  if (window.__demoCursor) return; window.__demoCursor = 1;
  const add = () => {
    if (window.top !== window) { const st0=document.createElement('style'); st0.textContent='.__ripple{position:fixed;width:34px;height:34px;margin:-17px 0 0 -17px;border-radius:50%;background:rgba(255,193,7,.55);border:2px solid rgba(255,152,0,.9);pointer-events:none;z-index:2147483646;animation:__rp .6s ease-out forwards}@keyframes __rp{from{transform:scale(.3);opacity:1}to{transform:scale(1.6);opacity:0}} .__hl{outline:3px solid rgba(255,152,0,.9)!important;outline-offset:2px;border-radius:4px}'; (document.head||document.documentElement).appendChild(st0); return; }
    const c = document.createElement('div'); c.id = '__cur';
    c.innerHTML = '<svg width="26" height="26" viewBox="0 0 24 24"><path d="M4 2l16 9.5-7 1.6 4 7.4-3 1.5-4-7.5L4 19z" fill="#111" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/></svg>';
    Object.assign(c.style, {position:'fixed', left:(window.__cx||-50)+'px', top:(window.__cy||-50)+'px', zIndex:2147483647, pointerEvents:'none', transform:'translate(-4px,-2px)'});
    document.documentElement.appendChild(c);
    const st = document.createElement('style');
    st.textContent = '.__ripple{position:fixed;width:34px;height:34px;margin:-17px 0 0 -17px;border-radius:50%;background:rgba(255,193,7,.55);border:2px solid rgba(255,152,0,.9);pointer-events:none;z-index:2147483646;animation:__rp .6s ease-out forwards}@keyframes __rp{from{transform:scale(.3);opacity:1}to{transform:scale(1.6);opacity:0}} .__hl{outline:3px solid rgba(255,152,0,.9)!important;outline-offset:2px;border-radius:4px;transition:outline .2s}';
    document.documentElement.appendChild(st);
  };
  if (document.documentElement) add(); else document.addEventListener('DOMContentLoaded', add);
  window.__moveCur = (x, y) => { window.__cx=x; window.__cy=y; const c=document.getElementById('__cur'); if(c){c.style.left=x+'px'; c.style.top=y+'px';} };
  document.addEventListener('mousemove', e => {
    window.__cx=e.clientX; window.__cy=e.clientY;
    if (window.top !== window && window.frameElement) { const r = window.frameElement.getBoundingClientRect(); window.parent.__moveCur(e.clientX + r.left, e.clientY + r.top); }
    else window.__moveCur(e.clientX, e.clientY);
  }, true);
  document.addEventListener('mousedown', e => { const r=document.createElement('div'); r.className='__ripple'; r.style.left=e.clientX+'px'; r.style.top=e.clientY+'px'; document.documentElement.appendChild(r); setTimeout(()=>r.remove(),700); }, true);
})();`;

class Recorder {
  constructor(name, durations) { this.name = name; this.dur = durations; this.segs = []; this.scope = null; this.mx = 700; this.my = 400; }
  async start({ storageState } = {}) {
    const W = 1920, H = 1080; this.display = ':' + (90 + Math.floor(Math.random() * 9));
    this.xvfb = spawn('Xvfb', [this.display, '-screen', '0', `${W}x${H}x24`, '-nolisten', 'tcp'], { stdio: 'ignore' });
    await sleep(1500);
    const prof = __dirname + '/profile-' + this.name + '-' + Date.now();
    fs.mkdirSync(prof + '/Default', { recursive: true });
    fs.writeFileSync(prof + '/Default/Preferences', JSON.stringify({ credentials_enable_service: false, profile: { password_manager_enabled: false } }));
    this.browser = await chromium.launchPersistentContext(prof, {
      executablePath: '/opt/pw-browsers/chromium', headless: false, viewport: null,
      env: { ...process.env, DISPLAY: this.display },
      args: ['--kiosk', "--window-size=1440,810", '--window-position=0,0', '--force-device-scale-factor=1.333333',
             '--disable-infobars', '--no-first-run', '--hide-scrollbars', '--disable-features=Translate,PasswordManagerOnboarding', '--password-store=basic'],
      ignoreDefaultArgs: ['--enable-automation'],
    });
    this.browser.setDefaultTimeout(45000);
    await this.browser.addInitScript(CURSOR_JS);
    this.page = this.browser.pages()[0] || await this.browser.newPage();
    this.page.on('dialog', d => { console.log('DIALOG', d.message()); d.accept(); });
    await this.page.goto('about:blank');
    await this.page.evaluate(() => { document.body.style.background = '#ecf0f5'; });
  }
  async rec() {
    this.out = `${__dirname}/raw_${this.name}.mp4`;
    this.ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'x11grab', '-draw_mouse', '0', '-framerate', '30', '-video_size', '1920x1080', '-i', this.display,
      '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '16', '-pix_fmt', 'yuv420p', this.out], { stdio: ['pipe', 'inherit', 'inherit'] });
    this.t0 = Date.now(); await sleep(800);
  }
  t() { return (Date.now() - this.t0) / 1000; }
  // Run actions while the narration clip plays; never let the next clip start before this one ends.
  async seg(key, fn, { pad = 0.6 } = {}) {
    const start = this.t(); this.segs.push({ key, start }); console.log(`[${start.toFixed(1)}] ${key}`);
    if (fn) await fn();
    const left = start + this.dur[key] + pad - this.t();
    if (left > 0) await sleep(left * 1000);
  }
  async stop() {
    await sleep(1200);
    this.ff.stdin.write('q'); await new Promise(r => this.ff.on('exit', r));
    fs.writeFileSync(`${__dirname}/segs_${this.name}.json`, JSON.stringify(this.segs, null, 1));
    await this.browser.close(); this.xvfb.kill();
  }
  async moveTo(sel, { steps = 25 } = {}) {
    const loc = typeof sel === 'string' ? (this.scope || this.page).locator(sel).first() : sel;
    await loc.scrollIntoViewIfNeeded(); await sleep(150);
    const b = await loc.boundingBox();
    const x = b.x + Math.min(b.width / 2, 60), y = b.y + b.height / 2;
    const n = steps;
    for (let i = 1; i <= n; i++) { const k = i / n, e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      await this.page.mouse.move(this.mx + (x - this.mx) * e, this.my + (y - this.my) * e); await sleep(12); }
    this.mx = x; this.my = y; return loc;
  }
  async click(sel, opts = {}) { const loc = await this.moveTo(sel); await sleep(200); await this.page.mouse.down(); await sleep(60); await this.page.mouse.up(); await sleep(opts.after ?? 400); return loc; }
  async type(sel, text, { delay = 28 } = {}) { const loc = await this.click(sel, { after: 150 }); await loc.pressSequentially(text, { delay }); await sleep(300); }
  async select(sel, value) {
    // Show the pointer and click ripple on the dropdown, but pick the value programmatically so no native popup lingers.
    const loc = await this.moveTo(sel); await sleep(150);
    await loc.evaluate(e => { const r = e.getBoundingClientRect(); const d = document.createElement('div'); d.className='__ripple'; d.style.left=(window.__cx)+'px'; d.style.top=(window.__cy)+'px'; document.documentElement.appendChild(d); setTimeout(()=>d.remove(),700); e.focus(); e.classList.add('__hl'); });
    await sleep(350); await loc.selectOption(value); await sleep(250);
    await loc.evaluate(e => e.classList.remove('__hl')); await sleep(250);
  }
  async scrollTo(sel, block = 'center') { await (this.scope || this.page).locator(sel).first().evaluate((e, b) => e.scrollIntoView({ behavior: 'smooth', block: b }), block); await sleep(900); }
  async scrollBy(y) { await (this.scope || this.page).evaluate(y => window.scrollBy({ top: y, behavior: 'smooth' }), y); await sleep(900); }
}
module.exports = { Recorder, sleep };
