describe("test initial page", () => {

	beforeEach(() => {
		cy.visit('localhost:3000');
	});

	it('should have a grid', () => {
		//cy.visit('localhost:3000');
		cy.get('#grid').should('be.visible');
		cy.get('#grid').find('table').should('have.length', 1);
	});
	
	it('should have a console', () => {
		cy.get('#console').should('be.visible');
	});

});