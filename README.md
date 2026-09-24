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

## Shadow DOM: where the migration stops being mechanical

`app/shadow.html` adds three web components — one with an open shadow root, one
nesting a component inside another component, and one with a closed root — plus
a light-DOM node for contrast. `cypress/e2e/shadow.cy.js` and
`tests/shadow.spec.ts` cover them.

    cypress/e2e/shadow.cy.js   7 passing (327ms)
    tests/shadow.spec.ts       5 passed  (1.1s)

**Playwright pierces open shadow roots automatically.** Its `css=` and `text=`
engines cross shadow boundaries at any depth, so a selector for a node inside a
component is written exactly like a selector for anything else:

```typescript
await expect(page.getByTestId('card-title').first()).toHaveText('buy milk');
```

**Cypress does not, by default.** Each boundary needs an explicit `.shadow()`:

```javascript
cy.get('task-card').shadow().find('[data-testid=card-title]').should('have.text', 'buy milk');
```

The gap widens with nesting — Cypress needs one `.shadow()` per level, while the
Playwright selector is unchanged:

```javascript
// Cypress: one hop per boundary
cy.get('task-panel').shadow().find('task-card').shadow().find('[data-testid=card-title]')
```
```typescript
// Playwright: no shadow-specific syntax at all
page.locator('task-panel').getByTestId('card-title')
```

| | Cypress | Playwright |
|---|---|---|
| Open shadow root | `.shadow()`, or `includeShadowDom` | automatic |
| Nested roots | one `.shadow()` per boundary | automatic, any depth |
| Opt in globally | `includeShadowDom: true` in config | not applicable |
| Closed shadow root | unreachable | unreachable |

### Two things worth being precise about

**A closed root is unreachable from these two tools - but not from every
tool.** `attachShadow({ mode: 'closed' })` exposes no `shadowRoot` handle to
in-page JavaScript, so neither Cypress nor Playwright can reach in, and both
suites assert that. Selenium *can*: its `getShadowRoot()` goes over the WebDriver
protocol rather than the DOM API, and returns a queryable root anyway. That is
verified in the companion Java repository, not assumed. So the accurate claim is
"closed is opaque to the DOM API", not "closed is unreachable by any tool".

**Cypress can opt in globally**, with `includeShadowDom: true` in the config, so
this is a difference in default and ergonomics rather than a hard capability
gap. It is worth knowing which one you are arguing: "Cypress cannot do it" is
wrong, and an interviewer who has used Cypress will know it.
