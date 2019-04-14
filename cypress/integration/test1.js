describe("test initial page", () => {

	it('should have a grid', () => {
		cy.visit('localhost:3000');
		cy.get('#grid').should('be.visible');
		cy.get('#grid').find('table').should('have.length', 1);
	});

});