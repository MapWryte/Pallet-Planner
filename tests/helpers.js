const path = require('path');

// index.html is expected to live at the repo root, one level up from tests/.
const APP_PATH = path.join(__dirname, '..', 'index.html');
const APP_URL = 'file://' + APP_PATH;

/** Navigate a Playwright page to the local Pallet Planner build. */
async function gotoApp(page) {
  await page.goto(APP_URL);
}

module.exports = { APP_PATH, APP_URL, gotoApp };
