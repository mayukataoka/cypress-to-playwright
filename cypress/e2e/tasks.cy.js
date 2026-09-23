/// <reference types="cypress" />

describe('Task list', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('starts empty', () => {
    cy.get('[data-testid=empty-state]').should('be.visible');
    cy.get('[data-testid=task-item]').should('have.length', 0);
    cy.get('[data-testid=counter]').should('contain.text', '0 remaining');
  });

  it('adds a task', () => {
    cy.get('#new-task-input').type('buy milk');
    cy.get('[data-testid=add-button]').click();

    cy.get('[data-testid=task-item]').should('have.length', 1);
    cy.get('[data-testid=task-title]').should('have.text', 'buy milk');
    cy.get('[data-testid=empty-state]').should('not.be.visible');
    cy.get('[data-testid=counter]').should('contain.text', '1 remaining');
  });

  it('rejects an empty task', () => {
    cy.get('[data-testid=add-button]').click();
    cy.get('[data-testid=task-item]').should('have.length', 0);
  });

  it('marks a task done and decrements the counter', () => {
    cy.get('#new-task-input').type('write tests{enter}');

    cy.get('[data-testid=toggle]').check();

    cy.get('[data-testid=task-item]').first().should('have.class', 'done');
    cy.get('[data-testid=counter]').should('contain.text', '0 remaining');
  });

  it('deletes a task', () => {
    cy.get('#new-task-input').type('temporary{enter}');
    cy.get('[data-testid=task-item]').should('have.length', 1);

    cy.get('[data-testid=delete]').click();

    cy.get('[data-testid=task-item]').should('have.length', 0);
    cy.get('[data-testid=empty-state]').should('be.visible');
  });
});
