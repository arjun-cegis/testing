const { chromium } = require('playwright');
const cards = {
  intro: ['WorkStation', 'Goal Setting: Submission &amp; Approval', 'A step-by-step walkthrough for employees and reporting managers'],
  part1: ['Part 1', 'Employee: Fill in &amp; submit goals', 'PMS → Goal Setting → Edit or Submit Goals'],
  part2: ['Part 2', 'Reporting manager: Review &amp; approve', 'PMS → Goal Setting → To be Review → Update Status'],
  outro: ['That’s it!', 'Goal setting, start to finish', 'Employee submits  →  Manager approves or asks for resubmission'],
};
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  for (const [k, [a, t, s]] of Object.entries(cards)) {
    await p.setContent(`<html><body style="margin:0;width:1920px;height:1080px;display:flex;align-items:center;justify-content:center;
      background:linear-gradient(135deg,#1f2d33 0%,#22343c 55%,#2b6c8f 100%);font-family:Inter,sans-serif;color:#fff">
      <div style="text-align:center;max-width:1500px">
        <img src="https://betaworkstation.cegis.org/sites/default/files/CEGIS_logo.png" style="height:120px;margin-bottom:36px">
        <div style="font-size:44px;font-weight:600;letter-spacing:6px;text-transform:uppercase;color:#4fc3f7">${a}</div>
        <div style="font-size:84px;font-weight:700;margin:22px 0 28px">${t}</div>
        <div style="height:6px;width:160px;background:#00a65a;margin:0 auto 34px;border-radius:3px"></div>
        <div style="font-size:38px;color:#cfd8dc">${s}</div>
      </div></body></html>`, { waitUntil: 'networkidle' });
    await p.screenshot({ path: `${__dirname}/${k}.png` });
  }
  await b.close();
})();
