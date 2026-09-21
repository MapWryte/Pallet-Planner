const { test, expect } = require('@playwright/test');
const { gotoApp } = require('./helpers');

test.describe('Pallet Planner — load and defaults', () => {
  test('loads with default pallet dimensions', async ({ page }) => {
    await gotoApp(page);
    await expect(page).toHaveTitle(/Pallet Layer Planner/);
    // Seeded from state.pallet in the app's initial state object.
    await expect(page.locator('#palletLength')).toHaveValue('48');
    await expect(page.locator('#palletWidth')).toHaveValue('40');
    await expect(page.locator('#palletMaxH')).toHaveValue('60');
  });

  test('loads with two seeded layers, displayed top-of-stack first', async ({ page }) => {
    await gotoApp(page);
    const rows = page.locator('#layerList .layer-row');
    await expect(rows).toHaveCount(2);
    // renderLayerList() displays rows in the REVERSE of state.layers array
    // order on purpose ("Displayed top-to-bottom = physically top-to-bottom,
    // i.e. reverse of the underlying array" — array order is base-first).
    // state.layers is seeded [L1 Roll layer, L2 Case layer], so the Case
    // layer (stacked on top) renders first, Roll layer (the base) second.
    await expect(rows.nth(0)).toContainText('Case layer');
    await expect(rows.nth(1)).toContainText('Roll layer');
  });

  test('the default-selected layer (L1, the base Roll layer) is marked active', async ({ page }) => {
    await gotoApp(page);
    const rows = page.locator('#layerList .layer-row');
    // L1 is state.selectedId by default, and since the list is reversed for
    // display, L1 ("Roll layer") is the SECOND row, not the first.
    await expect(rows.nth(1)).toContainText('Roll layer');
    await expect(rows.nth(1)).toHaveClass(/active/);
    await expect(rows.nth(0)).not.toHaveClass(/active/);
  });
});

test.describe('Pallet Planner — layer list actions', () => {
  test('Add layer increases the layer count', async ({ page }) => {
    await gotoApp(page);
    const rows = page.locator('#layerList .layer-row');
    await expect(rows).toHaveCount(2);

    await page.locator('#btnAddLayer').click();
    await expect(rows).toHaveCount(3);
  });

  test('Duplicate adds a copy and Delete removes a layer', async ({ page }) => {
    await gotoApp(page);
    const rows = page.locator('#layerList .layer-row');

    await page.locator('#btnDupLayer').click();
    await expect(rows).toHaveCount(3);

    await page.locator('#btnDelLayer').click();
    await expect(rows).toHaveCount(2);
  });

  test('clicking a layer row makes it active', async ({ page }) => {
    await gotoApp(page);
    const rows = page.locator('#layerList .layer-row');

    await rows.nth(1).click();
    await expect(rows.nth(1)).toHaveClass(/active/);
    await expect(rows.nth(0)).not.toHaveClass(/active/);
  });
});

test.describe('Pallet Planner — pallet dimension edits', () => {
  test('changing pallet length updates state and persists on blur', async ({ page }) => {
    await gotoApp(page);
    const lengthField = page.locator('#palletLength');

    await lengthField.fill('52');
    await lengthField.blur();

    await expect(lengthField).toHaveValue('52');
  });

  test('an invalid (non-numeric) edit reverts to the last valid value on blur', async ({ page }) => {
    await gotoApp(page);
    const lengthField = page.locator('#palletLength');

    // numField's blur handler falls back to get() when the field can't parse
    // to a finite number >= its configured minimum.
    await lengthField.fill('');
    await lengthField.blur();

    await expect(lengthField).toHaveValue('48');
  });
});

test.describe('Pallet Planner — layer views', () => {
  for (const view of ['single', 'all', 'unique']) {
    test(`"${view}" view tab activates on click`, async ({ page }) => {
      await gotoApp(page);
      const tabBtn = page.locator(`.view-tabs button[data-view="${view}"]`);
      await tabBtn.click();
      await expect(tabBtn).toHaveClass(/on/);
    });
  }

  test('"Single layer" view is active by default', async ({ page }) => {
    await gotoApp(page);
    await expect(page.locator('.view-tabs button[data-view="single"]')).toHaveClass(/on/);
  });
});
