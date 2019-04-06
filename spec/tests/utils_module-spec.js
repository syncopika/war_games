import { JSDOM } from "jsdom";
import * as Utils from "../../scripts/Utils.js";
import { Game } from "../../scripts/Game.js";

// when testing make sure to uncomment import react statements in the script files used 
describe("check functions from Utils.js", () => {
	
	let gameInstance;
	let jsdom;
	let document;
	
	beforeEach(() => {
		gameInstance = new Game();
		
		// create a mock of the DOM, add the grid. then select a cell of the grid and check paths
		jsdom = new JSDOM("<!doctype html><html><body><div></div><div></div></body></html>");
		document = jsdom.window.document;

		let dummyNode = document.getElementsByTagName('div')[0];
		dummyNode.id = "tableParent";
		
		let width = 36;
		let height = 15;
		gameInstance.createGrid(width, height, dummyNode);
	});
	
	it("test getPathsDefault", () => {
		expect(document.getElementsByTagName('table').length).toEqual(1);
		expect(document.getElementsByTagName('tr').length).toEqual(15); 
		expect(document.getElementsByTagName('td').length).toEqual(540); 		
		
		// select left corner cell (should only have right and bottom paths not null)
		let leftCornerCell = document.getElementsByTagName('td')[0];
		let paths = Utils.getPathsDefault(leftCornerCell);
		expect(paths.top).toBe(null);
		expect(paths.bottom).not.toBe(null);
		expect(paths.left).toBe(null);
		expect(paths.right).not.toBe(null);
		
		// select a center element (top, left, bottom and right should be non-null)
		
	});
	
	
});