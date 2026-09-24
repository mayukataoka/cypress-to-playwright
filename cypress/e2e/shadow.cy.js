/// <reference types="cypress" />

/**
 * Cypress and shadow DOM.
 *
 * Cypress does NOT pierce shadow roots by default. Every query that crosses a
 * boundary needs .shadow(), or the suite has to opt in globally with
 * includeShadowDom: true in the config. Both are shown below.
 */
describe('shadow DOM', () => {
  beforeEach(() => {
    cy.visit('/shadow.html');
  });

  it('needs .shadow() to read into an open shadow root', () => {
    // This is the line that has no Playwright counterpart:
    cy.get('task-card').shadow().find('[data-testid=card-title]').should('have.text', 'buy milk');
    cy.get('task-card').shadow().find('[data-testid=card-status]').should('have.text', 'active');
  });

  it('fails without .shadow()', () => {
    // Proof, not commentary: the element is invisible to an ordinary query.
    cy.get('[data-testid=card-title]').should('not.exist');
  });

  it('interacts with a control inside a shadow root', () => {
    cy.get('task-card').shadow().find('[data-testid=card-action]').click();
    cy.get('task-card').shadow().find('[data-testid=card-status]').should('have.text', 'archived');
  });

  it('needs a .shadow() call per boundary when roots are nested', () => {
    // One .shadow() per level. Playwright needs none.
    cy.get('task-panel')
      .shadow()
      .find('task-card')
      .shadow()
      .find('[data-testid=card-title]')
      .should('have.text', 'nested task');
  });

  it('sees light DOM the same way', () => {
    cy.get('[data-testid=light-dom-text]').should('contain.text', 'main document');
  });

  it('can opt in globally, per query', () => {
    // includeShadowDom can also be set once in cypress.config.js for the suite.
    cy.get('[data-testid=card-title]', { includeShadowDom: true })
      .first()
      .should('have.text', 'buy milk');
  });

  it('cannot reach into a CLOSED shadow root - and neither can any tool', () => {
    cy.get('[data-testid=secret]', { includeShadowDom: true }).should('not.exist');
  });
});
