import { Game } from "../../scripts/Game.js";

describe("check Game class for correctness", () => {
	it("has a default hand size of 4", () => {
		const g = new Game();
		expect(g.handSize).toEqual(4);
	});
	it("check clearEnemyUnits", () => {
		const g = new Game();
		g.enemyUnits = [1,2,3,4,5];
		expect(g.enemyUnits.length).toEqual(5); 
		g.clearEnemyUnits();
		expect(g.enemyUnits.length).toEqual(0); // this actually helped find a bug in my code! :D
	});
	it("check clearPlayerUnits", () => {
		const g = new Game();
		g.playerUnits = [1,2,3];
		expect(g.playerUnits.length).toEqual(3);
		g.clearPlayerUnits();
		expect(g.playerUnits.length).toEqual(0);
	});
});