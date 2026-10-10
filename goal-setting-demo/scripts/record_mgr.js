const { Recorder, sleep } = require('./lib');
const DRY = process.argv[2] !== 'real';
const dur = require('./audio/durations_narration_mgr.json');
const BASE = 'https://betaworkstation.cegis.org';
let r_;
(async () => {
  const r = new Recorder(DRY ? 'mgr_dry' : 'mgr', dur); await r.start(); r_ = r;
  const p = r.page;
  await p.goto(BASE + '/user/login', { waitUntil: 'networkidle' });
  await r.rec();
  await r.seg('m_login', async () => {
    await sleep(500);
    await r.type('input[name=name]', process.env.WS_MGR_USER, { delay: 45 });
    await r.type('input[name=pass]', process.env.WS_MGR_PASS, { delay: 80 });
    await r.click('button[name=op]', { after: 0 });
    await p.waitForLoadState('networkidle');
  });
  await r.seg('m_menu', async () => {
    await sleep(400);
    await r.click('aside a:has-text("PMS")', { after: 700 });
    await r.click('aside a[href="/goal-setting"]', { after: 0 });
    await p.waitForLoadState('networkidle');
  });
  await r.seg('m_list', async () => {
    await sleep(800);
    await r.click('a:has-text("To be Review")', { after: 1500 });
    await r.moveTo('#qt-goal_setting-ui-tabs2 td.views-field-field-last-name >> nth=0'); await sleep(2000);
    await r.moveTo('#qt-goal_setting-ui-tabs2 td.views-field-field-gs-approval >> nth=0'); await sleep(2000);
    await r.moveTo('#qt-goal_setting-ui-tabs2 a:has-text("View Details")');
  }, { pad: 0 });
  await r.click('#qt-goal_setting-ui-tabs2 a:has-text("View Details")', { after: 0 });
  await p.waitForLoadState('networkidle');
  await r.seg('m_view', async () => {
    await sleep(800);
    await r.moveTo('.gsv-info-strip'); await sleep(600);
    await r.scrollTo('.gsv-section >> nth=0', 'start'); await sleep(1500);
    await r.scrollTo('.gsv-section >> nth=1', 'start'); await sleep(1500);
    await r.scrollBy(500); await sleep(1200);
    await p.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' })); await sleep(1000);
  }, { pad: 0.2 });
  await r.seg('m_update', async () => {
    await r.click('a:has-text("Update Status")', { after: 0 });
    let fr; for (let i = 0; i < 40 && !fr; i++) { fr = p.frames().find(f => f !== p.mainFrame() && /workflow/.test(f.url())); if (!fr) await sleep(250); }
    if (fr) { r.scope = fr; console.log('workflow in overlay', fr.url()); } else { await p.waitForLoadState('networkidle'); console.log('workflow page', p.url()); }
    await (r.scope || p).waitForSelector('#edit-workflow-sid', { state: 'visible' });
  }, { pad: 0.3 });
  const S = r.scope || p;
  await r.seg('m_options', async () => {
    await sleep(600);
    await r.moveTo('#edit-workflow-sid'); await sleep(800);
    await r.select('#edit-workflow-sid', '98'); await sleep(3500);
    await r.moveTo('#edit-workflow-comment'); await sleep(2000);
    await r.moveTo('table >> nth=-1'); await sleep(1500);
  });
  await r.seg('m_approve', async () => {
    await r.select('#edit-workflow-sid', '96'); await sleep(600);
    await r.type('#edit-workflow-comment', 'Goals look good. Approved.', { delay: 40 });
    await r.moveTo('#edit-submit');
  }, { pad: 0 });
  if (DRY) { await r.stop(); return; }
  await r.click('#edit-submit', { after: 0 });
  await sleep(3000); await p.waitForLoadState('networkidle'); await sleep(1000);
  console.log('AFTER UPDATE', p.url(), p.frames().map(f => f.url()));
  await p.screenshot({ path: __dirname + '/shots/after_update.png', fullPage: true });
  try {
    await r.seg('m_done', async () => { await sleep(1500); });
  } catch (e) { console.log('POST ERROR', e.message); }
  await sleep(1500);
  await r.stop();
})().catch(async e => { console.error(e); try { await r_.stop(); } catch {} process.exit(1); });
