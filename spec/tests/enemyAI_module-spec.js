import { JSDOM } from "jsdom";
import { Game } from "../../scripts/Game.js";
import { dfs, aStar } from "../../scripts/enemyAI.js";


// coords = map where key = row, value = array of col numbers
// can't use the same key more than once, so can't have key-value pairs for every coord pair  
function placeObstacles(coords, table){
	let rows = table.childNodes;
	for(let x in coords){
		let yCoords = coords[x];
		let row = rows[x];
		yCoords.forEach((y) => {
			let obstacle = row.childNodes[y];
			obstacle.className = "obstacle";
		});
	}
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
		
		// set obstacles 
		expect(document.getElementsByTagName('table').length).toEqual(1);
		//expect(document.getElementsByTagName('table')[0]).not.toBeNull();
		
		let table = document.getElementsByTagName('table')[0];
		let obstacles = {
			0: [3],
			1: [0,1,3]
		};
		placeObstacles(obstacles, table);
		
		let path = dfs(start, toFind, new Set());
		expect(path.length).toEqual(4);
		expect(path[0]).toEqual("row0column1");
		expect(path[1]).toEqual("row0column2");
		expect(path[2]).toEqual("row1column2");
		expect(path[3]).toEqual("row2column2");
	});
	
	
	/*
		test A* algorithm
		
		x to y -> row0col0 to row2col2
		
		x - - - - 
		- - - - -
	    - - y - -
		- - - - -
		- - - - -
	
	*/
	it('test A* 1', () => {
		let start = document.getElementById('row0').childNodes[0];
		let toFind = document.getElementById('row2').childNodes[2];
		let path = aStar(start, toFind, new Set());
		//console.log(path);
		
		expect(path[path.length-1]).toEqual(toFind.id);
	});
	
});