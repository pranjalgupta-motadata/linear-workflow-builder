// trigger-rule.test.cjs — proves the sentence-view trigger rule (approved 2026-09-23):
//   one record per rule; "+ add trigger" never re-asks the event or the record — it opens a
//   field list for THAT record (record shown in the read-only source card), greys out fields
//   already watched, and a pick adds an OR line. Add is disabled until the first line has a
//   record, and for schedule triggers.
//
// Runs the real build in headless Chrome and drives it like a person (hover → click → read).
//
// Setup (once, in the project dir):  npm i -D playwright-core
// Usage:
//   node tests/trigger-rule.test.cjs                      → tests index.html (the live root)
//   node tests/trigger-rule.test.cjs index-v5.17.html     → tests another build
//   SRC=path/to/build.html node tests/trigger-rule.test.cjs
//   CHROME="C:/path/to/chrome.exe" … to point at a different Chrome
// Exit code 0 = every case passed, 1 = something failed (details printed).

const path = require('path'), fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const SRC = path.resolve(ROOT, process.argv[2] || process.env.SRC || 'index.html');
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

if (!fs.existsSync(SRC)) { console.error('NO FILE:', SRC); process.exit(1); }

let chromium;
try { chromium = require('playwright-core').chromium; }
catch { try { chromium = require('playwright').chromium; } catch { console.error('Install playwright-core first:  npm i -D playwright-core'); process.exit(1); } }

const failures = [];
let current = '';
const check = (ok, what, got) => {
  const line = `${ok ? '  ok  ' : '  FAIL'} ${what}${ok ? '' : '  → got ' + JSON.stringify(got)}`;
  console.log(line);
  if (!ok) failures.push(`${current}: ${what} → ${JSON.stringify(got)}`);
};

(async () => {
  const launch = { headless: true };
  if (fs.existsSync(CHROME)) launch.executablePath = CHROME;
  const browser = await chromium.launch(launch);
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errs = []; page.on('pageerror', e => errs.push(String(e).slice(0, 200)));

  const boot = async () => {
    await page.goto('file:///' + SRC.replace(/\\/g, '/'));
    await sleep(2300);
    await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => x.textContent.trim() === 'Maybe later'); b && b.click(); });
    await sleep(300);
    await page.keyboard.press('t'); // light theme → stable screenshots
    await sleep(200);
  };

  // Click an element by its visible text, the way a person would: move there, pause, click.
  const clickText = async (t) => {
    const r = await page.evaluate((t) => {
      const els = [...document.querySelectorAll('button,span,div')].filter(e => (e.textContent || '').trim() === t && e.getBoundingClientRect().width > 0);
      const e = els[els.length - 1]; if (!e) return null;
      const b = e.getBoundingClientRect(); return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
    }, t);
    if (!r) { check(false, `find "${t}" on screen`, 'not visible'); return false; }
    await page.mouse.move(r.x, r.y); await sleep(120); await page.mouse.click(r.x, r.y); await sleep(500);
    return true;
  };

  // Hover the "When …" row so its hover actions (+ add trigger) appear.
  const hoverWhen = async () => {
    const r = await page.evaluate(() => {
      const el = [...document.querySelectorAll('[data-canvas] *')].find(e => /^When/i.test((e.textContent || '').trim()) && e.getBoundingClientRect().height < 80 && e.getBoundingClientRect().height > 20);
      if (!el) return null; const b = el.getBoundingClientRect(); return { x: b.x + 60, y: b.y + b.height / 2 };
    });
    if (!r) { check(false, 'find the When row', 'missing'); return; }
    await page.mouse.move(r.x, r.y); await sleep(350);
  };

  // What the open popover shows: title, source card text, search placeholder, rows (with disabled flags).
  const popState = () => page.evaluate(() => {
    const p = document.querySelector('[data-pop-root]'); if (!p) return null;
    const title = (p.querySelector('span.font-semibold') || {}).textContent || null;
    const card = [...p.querySelectorAll('div.cursor-default')].map(d => d.textContent.trim())[0] || null;
    const rows = [...p.querySelectorAll('button')].filter(b => /pl-3/.test(b.className))
      .map(b => ({ t: b.textContent.trim().replace(/Already a trigger$/, ''), dis: b.classList.contains('cursor-default') }));
    const ph = (p.querySelector('input') || {}).placeholder || null;
    return { title, card, ph, rows: rows.map(r => r.t), disabled: rows.filter(r => r.dis).map(r => r.t) };
  });
  const lines = () => page.evaluate(() => [...document.querySelectorAll('[data-canvas] .inline.align-top')].map(e => e.textContent).filter(t => !/^do this/.test(t))); // trigger lines only (the "do this…" action slot sits in the same row style)
  const addState = () => page.evaluate(() => {
    const b = [...document.querySelectorAll('[data-canvas] button')].find(b => /add trigger/.test(b.textContent));
    return b ? { present: true, disabled: b.getAttribute('aria-disabled') === 'true' || b.disabled } : { present: false };
  });

  // ---------------------------------------------------------------------------------------------
  current = 'CASE 1'; console.log('CASE 1: updated → Change → priority → "+ add trigger" lists Change fields only');
  await boot();
  await clickText('when this happens…'); await clickText('When a record is updated'); await clickText('Change'); await clickText('priority');
  await page.keyboard.press('Escape'); await sleep(300);
  await hoverWhen();
  let add = await addState();
  check(add.present && !add.disabled, 'add trigger is enabled once a record is chosen', add);
  await clickText('add trigger');
  let m = await popState();
  check(!!m, 'a popover opens', m);
  if (m) {
    check(m.title === 'Add trigger', 'title is "Add trigger"', m.title);
    check(/Record/i.test(m.card || '') && /Change/.test(m.card || ''), 'source card shows "Record · Change"', m.card);
    check(!m.rows.some(r => /When a record is/i.test(r)), 'the event (created / updated / archived) is NOT asked again', m.rows);
    check(!m.rows.some(r => /^(Request|Problem|Change|Release|Asset|User)$/.test(r)), 'the record is NOT asked again', m.rows);
    check(m.rows.length > 1 && m.rows.includes('status'), 'rows are that record\'s fields (has "status")', m.rows);
    check(m.disabled.includes('priority'), 'the field already in use ("priority") is greyed out', m.disabled);
    check(/field/i.test(m.ph || ''), 'search hint asks for a field', m.ph);
  }
  await page.screenshot({ path: path.join(OUT, 'case1-add-menu.png') });
  await clickText('status'); await sleep(400);
  let ls = await lines();
  check(ls.length === 2, 'picking a field adds a second trigger line', ls);
  check(/status/.test(ls[1] || ''), 'the new line watches "status"', ls[1]);
  check(!/Request/.test(ls[1] || '') && /Change/i.test(ls.join(' ')), 'the new line stays on the same record', ls);
  await page.keyboard.press('Escape'); await sleep(200); await page.mouse.move(20, 20); await sleep(200);
  await page.screenshot({ path: path.join(OUT, 'case1-two-lines.png') });

  // ---------------------------------------------------------------------------------------------
  current = 'CASE 2'; console.log('CASE 2: created → Request → "+ add trigger" lists Request fields, nothing greyed');
  await boot();
  await clickText('when this happens…'); await clickText('When a record is created'); await clickText('Request');
  await page.keyboard.press('Escape'); await sleep(300);
  await hoverWhen(); await clickText('add trigger');
  m = await popState();
  check(!!m && m.title === 'Add trigger', 'title is "Add trigger"', m && m.title);
  check(!!m && /Request/.test(m.card || ''), 'source card shows the Request record', m && m.card);
  check(!!m && m.disabled.length === 0, 'no field is greyed out (none in use yet)', m && m.disabled);
  check(!!m && m.rows.includes('impact'), 'Request fields are listed (has "impact")', m && m.rows);
  await clickText('impact'); await sleep(400);
  ls = await lines();
  check(ls.length === 2 && /impact/.test(ls[1] || ''), 'second line watches "impact"', ls);

  // ---------------------------------------------------------------------------------------------
  current = 'CASE 3'; console.log('CASE 3: empty rule → "+ add trigger" opens the full first-trigger menu');
  await boot(); await hoverWhen(); await clickText('add trigger');
  m = await popState();
  check(!!m, 'a popover opens', m);
  check(!!m && m.title !== 'Add trigger', 'it is the first-trigger menu, not the field list', m && m.title);
  check(!!m && m.rows.some(r => /When a record is updated/i.test(r)), 'events are offered', m && m.rows);
  check(!!m && !m.card, 'no source card (no record yet)', m && m.card);

  // ---------------------------------------------------------------------------------------------
  current = 'CASE 4'; console.log('CASE 4: event picked but no record yet → "+ add trigger" disabled');
  await boot();
  await clickText('when this happens…'); await clickText('When a record is updated');
  await page.keyboard.press('Escape'); await sleep(300);
  await hoverWhen(); add = await addState();
  check(add.present && add.disabled, 'add trigger is disabled ("Pick a record first")', add);

  // ---------------------------------------------------------------------------------------------
  current = 'CASE 5'; console.log('CASE 5: schedule trigger → "+ add trigger" disabled');
  await boot();
  await clickText('when this happens…'); await clickText('Every time period'); await clickText('Daily');
  await page.keyboard.press('Escape'); await sleep(300);
  await hoverWhen(); add = await addState();
  check(add.present && add.disabled, 'add trigger is disabled for periodic workflows', add);

  // ---------------------------------------------------------------------------------------------
  current = 'PAGE'; check(errs.length === 0, 'no page errors', errs);
  await browser.close();

  console.log('');
  console.log(`${path.basename(SRC)}: ${failures.length ? failures.length + ' FAILED' : 'ALL PASSED'}  (screenshots in tests/out/)`);
  failures.forEach(f => console.log('  - ' + f));
  process.exit(failures.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
