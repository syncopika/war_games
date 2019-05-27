import { Deck } from '../../scripts/Deck.js';

describe('test Deck class for correctness', () => {
	
	it('should have an empty deck initially', () => {
		const deck = new Deck();
		expect(deck.theDeck.length).toBe(0);
		expect(deck.size()).toBe(0);
	});
	
	it('check add, size and remove', () => {
		const deck = new Deck();
		deck.add(1);
		deck.add(2);
		expect(deck.size()).toBe(2);
		deck.remove();
		expect(deck.size()).toBe(1);
		deck.remove();
		expect(deck.size()).toBe(0);
		expect(deck.remove()).toBe(null);
		expect(deck.size()).toBe(0);
	});
})