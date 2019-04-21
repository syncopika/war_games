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
	
	// there should be 11 enemies on the grid (10 regular + 1 boss)
	it('should have 10 enemies', () => {
		cy.get('.enemy').should('have.length', 11);
	});
	
	// there should be 1 player on the grid 
	it('should have 1 player', () => {
		cy.get('.player').should('have.length', 1);
	});

});