let r_;
const { Recorder, sleep } = require('./lib');
const DRY = process.argv[2] !== 'real';
const dur = require('./audio/durations_narration_emp.json');
const BASE = 'https://betaworkstation.cegis.org';
const G = (i, f, v = true) => `[name="field_goals[und][${i}][field_${f}][und]${v ? '[0][value]' : ''}"]`;
const C = (j, f, v = true) => `[name="field_collaboration[und][${j}][field_${f}][und]${v ? '[0][value]' : ''}"]`;
(async () => {
  const r = new Recorder(DRY ? 'emp_dry' : 'emp', dur); await r.start();
  const p = r.page; r_ = r;
  await p.goto(BASE + '/user/login', { waitUntil: 'networkidle' });
  await r.rec();
  await r.seg('login', async () => {
    await sleep(800);
    await r.type('input[name=name]', process.env.WS_EMP_USER, { delay: 55 });
    await r.type('input[name=pass]', process.env.WS_EMP_PASS, { delay: 80 });
    await r.click('button[name=op]', { after: 0 });
    await p.waitForLoadState('networkidle');
  });
  await r.seg('menu', async () => {
    await sleep(500);
    await r.click('aside a:has-text("PMS")', { after: 700 });
    await r.click('aside a[href="/goal-setting"]', { after: 0 });
    await p.waitForLoadState('networkidle');
  });
  await r.seg('list', async () => {
    await sleep(1200);
    await r.moveTo('td.views-field-field-gs-approval >> nth=0'); await sleep(2500);
    await r.moveTo('#qt-goal_setting-ui-tabs1 a:has-text("View/ Add Goals")'); await sleep(2500);
  }, { pad: 0 });
  await r.click('#qt-goal_setting-ui-tabs1 a:has-text("View/ Add Goals")', { after: 0 });
  await p.waitForLoadState('networkidle');
  await r.seg('view', async () => {
    await sleep(1000);
    await r.moveTo('.gsv-info-strip'); await sleep(1500);
    await r.moveTo('.gsv-section'); await sleep(1200);
    await r.moveTo('a:has-text("Edit or Submit Goals")');
  }, { pad: 0 });
  await r.click('a:has-text("Edit or Submit Goals")', { after: 0 });
  // The edit form opens in Drupal's overlay iframe.
  let fr; for (let i = 0; i < 60 && !fr; i++) { fr = p.frames().find(f => f !== p.mainFrame() && /\/edit/.test(f.url())); if (!fr) await sleep(250); }
  if (!fr) throw new Error('no overlay frame; url=' + p.url());
  await fr.waitForSelector('#edit-submit', { state: 'visible' }); await sleep(500);
  r.scope = fr; const F = fr; console.log('frame', fr.url());
  await r.seg('form', async () => {
    await sleep(1500);
    await r.moveTo('a[href^=\"#bootstrap-panel--\"] >> nth=0'); await sleep(1300);
    await r.moveTo('a[href^=\"#bootstrap-panel--\"] >> nth=1'); await sleep(1300);
    await r.moveTo('.gs-bar-goals .gs-weight-bar-num'); await sleep(1300);
    await r.moveTo('.gs-bar-collab .gs-weight-bar-num'); await sleep(800);
  });
  await r.seg('goal1', async () => {
    await r.select(G(0, 'category', false), 'projects');
    await r.select(G(0, 'kr_type', false), 'lpg');
    await r.select(G(0, 'pgf_element', false), 'outcomes');
    await r.type(G(0, 'weight'), '40', { delay: 120 });
    await r.type(G(0, 'key_result'), 'Roll out the WorkStation PMS module across all teams by Q3, with at least 95% of employees completing goal setting online.', { delay: 22 });
  }, { pad: 0.3 });
  await r.seg('goal2', async () => {
    await r.click('[name=field_goals_add_more]', { after: 0 });
    await F.waitForSelector(G(1, 'category', false), { state: 'visible' }); await sleep(600);
    await r.scrollTo(G(1, 'key_result'));
    await r.select(G(1, 'category', false), 'initiatives');
    await r.select(G(1, 'kr_type', false), 'tm');
    await r.select(G(1, 'pgf_element', false), 'key_activities');
    await r.type(G(1, 'weight'), '40', { delay: 120 });
    await r.type(G(1, 'key_result'), 'Run monthly knowledge-sharing sessions for the tech team and onboard new members within 30 days of joining.', { delay: 22 });
    await r.scrollTo('.gs-weight-bar-item', 'start'); await r.scrollBy(-200);
    await r.moveTo('.gs-bar-goals .gs-weight-bar-num'); await sleep(800);
  }, { pad: 0.3 });
  await r.seg('collab', async () => {
    await r.click('a[href^=\"#bootstrap-panel--\"] >> nth=1', { after: 800 });
    await r.select(C(0, 'coll_category', false), '2'); await sleep(500);
    await r.select(C(0, 'coll_sub_category', false), '2');
    await r.type(C(0, 'coll_weight'), '10', { delay: 120 });
  }, { pad: 0.3 });
  await r.seg('collab_details', async () => {
    await r.click(C(0, 'collaborator_name', false) + ' + .chosen-container a.chosen-single', { after: 300 });
    await p.keyboard.type('Pranay', { delay: 90 }); await sleep(500); await p.keyboard.press('Enter'); await sleep(400);
    await r.type(C(0, 'team_function'), 'HR & Operations', { delay: 35 });
    await r.type(C(0, 'regular_cadence'), 'Fortnightly check-in calls and a monthly progress review.', { delay: 22 });
  }, { pad: 0.3 });
  await r.seg('collab_nature', async () => {
    await r.scrollTo(C(0, 'joint_work'));
    await r.type(C(0, 'projects_to_be_collaborate'), 'WorkStation PMS rollout', { delay: 30 });
    await r.type(C(0, 'joint_work'), 'Finalise the goal-setting workflow with HR, test the forms, and train employees on the new module.', { delay: 18 });
    await r.type(C(0, 'lived_experience'), 'HR owns the appraisal policy, so their input ensures the tool matches policy and is adopted by every team.', { delay: 18 });
  }, { pad: 0.3 });
  const goalsSel = j => `[name="field_collaboration[und][${j}][field_collab_goals_sel][]"] + .chosen-container`;
  await r.seg('collab_goals', async () => {
    await r.click(goalsSel(0) + ' input', { after: 700 });
    await r.click(goalsSel(0) + ' li.active-result >> nth=0', { after: 500 });
    await r.click('h3:has-text("Nature of Intended Collaboration") >> nth=0', { after: 300 }); // close the dropdown
  }, { pad: 0.3 });
  await r.seg('collab2', async () => {
    await r.click('[name=field_collaboration_add_more]', { after: 0 });
    await F.waitForSelector(C(1, 'coll_category', false), { state: 'attached' }); await sleep(800);
    await r.scrollTo(C(1, 'coll_category', false), 'start'); await r.scrollBy(-120);
    await r.select(C(1, 'coll_category', false), '1'); await sleep(500);
    await r.select(C(1, 'coll_sub_category', false), '3');
    await r.type(C(1, 'coll_weight'), '10', { delay: 120 });
    await r.scrollTo('.gs-weight-bar-item', 'start'); await r.scrollBy(-200);
    await r.moveTo('.gs-bar-collab .gs-weight-bar-num'); await sleep(1000);
  }, { pad: 0.3 });
  await r.seg('collab2_fill', async () => {
    await r.scrollTo(C(1, 'team_function'));
    await r.click(C(1, 'collaborator_name', false) + ' + .chosen-container a.chosen-single', { after: 300 });
    await p.keyboard.type('Vijay', { delay: 90 }); await sleep(500); await p.keyboard.press('Enter'); await sleep(400);
    await r.type(C(1, 'team_function'), 'Tech', { delay: 40 });
    await r.type(C(1, 'regular_cadence'), 'Weekly stand-up and sprint review.', { delay: 18 });
    await r.scrollTo(C(1, 'joint_work'));
    await r.type(C(1, 'projects_to_be_collaborate'), 'WorkStation PMS rollout', { delay: 18 });
    await r.type(C(1, 'joint_work'), 'Build and test the goal-setting and review forms, and fix issues reported by users.', { delay: 14 });
    await r.type(C(1, 'lived_experience'), 'The tech team builds the module, so close coordination keeps the rollout on schedule.', { delay: 14 });
    await r.click(goalsSel(1) + ' input', { after: 600 });
    await r.click(goalsSel(1) + ' li.active-result >> nth=0', { after: 400 });
    await r.click(goalsSel(1) + ' input', { after: 600 });
    await r.click(goalsSel(1) + ' li.active-result >> nth=0', { after: 400 });
    await r.click('h3:has-text("Nature of Intended Collaboration") >> nth=1', { after: 300 });
  }, { pad: 0.3 });
  await r.seg('submit', async () => {
    await r.scrollTo('#edit-submit');
    await r.moveTo('#edit-draft'); await sleep(1500);
    await r.scrollTo('.gs-weight-bar-item', 'start'); await r.scrollBy(-200);
    await r.moveTo('.gs-weight-bar-num >> nth=0'); await sleep(900);
    await r.moveTo('.gs-weight-bar-num >> nth=1'); await sleep(900);
    await r.scrollTo('#edit-submit');
    await r.moveTo('#edit-submit');
  }, { pad: 0 });
  if (DRY) { await p.screenshot({ path: __dirname + '/shots/dry_before_submit.png', fullPage: true }); await r.stop(); return; }
  await r.click('#edit-submit', { after: 0 });
  await sleep(3000); await p.waitForLoadState('networkidle'); await sleep(1000);
  r.scope = null;
  console.log('AFTER SUBMIT URL', p.url(), p.frames().map(f => f.url()));
  await p.screenshot({ path: __dirname + '/shots/after_submit.png', fullPage: true });
  try {
  await r.seg('submitted', async () => { await sleep(1500); await r.moveTo('.panel-heading, h1').catch(e => console.log('submitted move', e.message)); });
  await r.seg('logout', async () => {
    await r.click('.user-menu > a', { after: 900 });
    await r.click('a:has-text("Sign out")', { after: 0 });
    await p.waitForLoadState('networkidle');
  });
  } catch (e) { console.log('POST-SUBMIT ERROR', e.message); await p.screenshot({ path: __dirname + '/shots/post_err.png' }); }
  await r.stop();
})().catch(async e => { console.error(e); try { await r_.stop(); } catch {} process.exit(1); });
