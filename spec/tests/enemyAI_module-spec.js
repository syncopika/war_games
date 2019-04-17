import { JSDOM } from "jsdom";
import { Game } from "../../scripts/Game.js";
import { dfs } from "../../scripts/enemyAI.js";


function makeGridSmall(gridDiv){
}


describe("check functions from enemyAI.js", () => {
	
	let gameInstance;
	let jsdom;
	let document;
	
	beforeEach(() => {
		gameInstance = new Game();
		
		// create a mock of the DOM, add the grid. then select a cell of the grid and check paths
		jsdom = new JSDOM("<!doctype html><html><body><div></div></body></html>");
		document = jsdom.window.document;

		let dummyNode = document.getElementsByTagName('div')[0];
		dummyNode.id = "tableParent";
		
		let width = 5;
		let height = 5;
		gameInstance.createGrid(width, height, dummyNode);
	});
	
	/*
		x to y -> row0col0 to row2col2
		
		x - - - - 
		- - - - -
	    - - y - -
		- - - - -
		- - - - -
	*/
	it('test dfs with no obstacles', () => {
		let start = document.getElementById('row0').childNodes[0];
		let toFind = document.getElementById('row2').childNodes[2];
		let path = dfs(start, toFind, new Set());
		//console.log(path.map((node) => { return node.id }));
		expect(path[path.length-1]).toEqual(toFind.id);
	});
	
	/*
		x to y, o = obstacle 
		
		x - - o - 
		o o - o -
	    - - y - -
		- - - - -
		- - - - -
	*/
	it('test dfs with only one possible path', () => {
		let start = document.getElementById('row0').childNodes[0];
		let toFind = document.getElementById('row2').childNodes[2];
	});
	
});