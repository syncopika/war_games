import { JSDOM } from "jsdom";
import { Game } from "../../scripts/Game.js";

describe("check Game class for correctness", () => {
	
	let gameInstance;
	beforeEach(() => {
		gameInstance = new Game();
	});
	
	it("has a default hand size of 4", () => {
		//const g = new Game();
		expect(gameInstance.handSize).toEqual(4);
	});
	
	it("check clearEnemyUnits", () => {
		gameInstance.enemyUnits = [1,2,3,4,5];
		expect(gameInstance.enemyUnits.length).toEqual(5); 
		gameInstance.clearEnemyUnits();
		expect(gameInstance.enemyUnits.length).toEqual(0); // this actually helped find a bug in my code! :D
	});
	
	it("check clearPlayerUnits", () => {
		gameInstance.playerUnits = [1,2,3];
		expect(gameInstance.playerUnits.length).toEqual(3);
		gameInstance.clearPlayerUnits();
		expect(gameInstance.playerUnits.length).toEqual(0);
	});
	
	it("createGrid works properly", () => {
		// create a mock of the DOM
		const jsdom = new JSDOM("<!doctype html><html><body><div></div></body></html>");
		let document = jsdom.window.document;
		
		// https://stackoverflow.com/questions/39691486/document-is-not-defined-es6-import-with-jasmine-with-external-library-dependic
		// https://github.com/jsdom/jsdom/issues/2120
		let dummyNode = document.getElementsByTagName('div')[0];
		dummyNode.id = "tableParent";
		//console.log(`CONSTRUCTED DOM: ${jsdom.serialize()}`);
		
		// https://stackoverflow.com/questions/23495325/mock-object-for-document-element
		//document.getElementById = jasmine.createSpy('HTML Element').and.returnValue('dummyNode');
		
		// if innerHeight = 820 and innerWIdth = 1920 
		// then height = 40, width = 50
		// for testing purposes, set a dummy window variable with these inner dimension values 
		//let window = {'innerHeight': 820, 'innerWidth': 1920};
		let width = 36;
		let height = 15;
		gameInstance.createGrid(width, height, dummyNode);

		// now check dummyNode's children to make sure all the right elements were created		
		expect(document.getElementsByTagName('table').length).toEqual(1); // there should be 1 table only
		//console.log(`CONSTRUCTED DOM: ${jsdom.serialize()}`);

		
	});
});