# Cypress → Playwright: the same 5 tests, twice

One small task-list app (`app/index.html`), covered by an identical suite of five
scenarios written twice — once in Cypress, once in Playwright — so the migration
differences are visible line by line.

    cypress/e2e/tasks.cy.js     5 passing (913ms)
    tests/tasks.spec.ts         5 passed  (2.6s)

## Run them

    npm install
    npx playwright install chromium

    npm run test:playwright     # starts the app itself via webServer config
    npm run serve &             # Cypress needs the app served separately
    npm run test:cypress

## The five scenarios

1. starts empty
2. adds a task
3. rejects an empty task
4. marks a task done and decrements the counter
5. deletes a task

## Line-by-line mapping

| Intent | Cypress | Playwright |
|---|---|---|
| visit | `cy.visit('/')` | `await page.goto('/')` |
| by test id | `cy.get('[data-testid=x]')` | `page.getByTestId('x')` |
| type | `cy.get(sel).type('text')` | `await page.locator(sel).fill('text')` |
| press key | `.type('text{enter}')` | `.press('Enter')` |
| click | `.click()` | `await ....click()` |
| check a box | `.check()` | `await ....check()` |
| count | `.should('have.length', 1)` | `await expect(loc).toHaveCount(1)` |
| exact text | `.should('have.text', 'x')` | `await expect(loc).toHaveText('x')` |
| partial text | `.should('contain.text', 'x')` | `await expect(loc).toContainText('x')` |
| visible | `.should('be.visible')` | `await expect(loc).toBeVisible()` |
| hidden | `.should('not.be.visible')` | `await expect(loc).toBeHidden()` |
| class | `.should('have.class', 'done')` | `await expect(loc).toHaveClass(/done/)` |
| first match | `.first()` | `.first()` |
| hook | `beforeEach(() => {})` | `test.beforeEach(async ({ page }) => {})` |
| group | `describe()` / `it()` | `test.describe()` / `test()` |

## What does NOT map mechanically

- **The async model.** Cypress commands are enqueued, not awaited — `cy.get()`
  returns a chainable, not a promise. Playwright is real `async/await`. A
  find-and-replace migration produces code that looks right and races.
- **Custom commands.** `Cypress.Commands.add()` has no direct equivalent;
  the Playwright idiom is a fixture or a page object.
- **`cy.intercept()` → `page.route()`**, with a different handler signature.
- **Config.** `baseUrl` → `use.baseURL`; Playwright's `webServer` block starts
  the app under test, which Cypress has no built-in equivalent for.
